import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient, getSystemConfig, getUserRipBalance } from "$lib/server/rips";
import { calculatePackCardProbabilities } from "$lib/server/card-draw";

/**
 * Extract card image URL from image_uri field
 */
function extractCardImageUrl(imageUri: any): string | null {
  if (!imageUri) return null;

  if (typeof imageUri === "string") {
    // Try to parse as JSON if it's a string
    try {
      const parsed = JSON.parse(imageUri);
      if (typeof parsed === "object") {
        return (
          parsed.normal ||
          parsed.large ||
          parsed.png ||
          parsed.small ||
          null
        );
      }
      return imageUri;
    } catch {
      return imageUri;
    }
  }

  if (typeof imageUri === "object") {
    return (
      imageUri.normal ||
      imageUri.large ||
      imageUri.png ||
      imageUri.small ||
      null
    );
  }

  return null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const packId = params.packId;

  // Fetch pack data, balance, and sellback rate in parallel
  const [packResult, balance, sellbackRateRaw] = await Promise.all([
    adminClient
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .single(),
    getUserRipBalance(user.id),
    getSystemConfig("sellback_rate"),
  ]);

  const sellbackRate =
    sellbackRateRaw != null && Number.isFinite(Number(sellbackRateRaw))
      ? Number(sellbackRateRaw)
      : 85;

  if (packResult.error || !packResult.data) {
    throw error(404, "Pack not found");
  }

  const pack = packResult.data;

  // Fetch all pack cards
  let allCards: any[] = [];
  let topCards: any[] = [];
  let floor = 0;
  let ev = 0;
  let ceiling = 0;

  if (pack.game_code) {
    const packCardsResult = await adminClient
      .from("pack_cards")
      .select("*")
      .eq("pack_id", packId);

    if (packCardsResult.data && packCardsResult.data.length > 0) {
      const cardTable = `${pack.game_code}_cards`;
      const cardUuids = packCardsResult.data.map((pc: any) => pc.card_uuid);

      if (cardUuids.length > 0) {
        const { data: cardsData } = await adminClient
          .from(cardTable)
          .select("id, name, image_uri, prices, set_code, set_name, rarity")
          .in("id", cardUuids);

        if (cardsData) {
          // Create a map of card data
          const cardDataMap = new Map<string, any>();
          cardsData.forEach((card: any) => {
            // Parse image_uri if it's a string
            if (card.image_uri && typeof card.image_uri === "string") {
              try {
                card.image_uri = JSON.parse(card.image_uri);
              } catch {
                // Keep as string if not JSON
              }
            }
            cardDataMap.set(card.id, card);
          });

          // Calculate probabilities for all cards
          const probabilities = await calculatePackCardProbabilities(packId);
          const probabilityMap = new Map<string, number>();
          probabilities.forEach((p) => {
            probabilityMap.set(p.card_uuid, p.probability);
          });

          // Create flat array with calculated probabilities
          packCardsResult.data.forEach((pc: any) => {
            const cardData = cardDataMap.get(pc.card_uuid);
            if (cardData) {
              const probability = probabilityMap.get(pc.card_uuid) || 0;

              allCards.push({
                id: cardData.id,
                name: cardData.name,
                image_uri: cardData.image_uri,
                prices: cardData.prices,
                set_code: cardData.set_code,
                set_name: cardData.set_name,
                rarity: cardData.rarity,
                is_foil: pc.is_foil,
                market_value: pc.market_value,
                probability: probability,
              });
            }
          });

          // Calculate Floor, EV, and Ceiling
          if (allCards.length > 0) {
            // Floor: minimum market value
            floor = Math.min(...allCards.map((c: any) => c.market_value || 0));
            
            // EV: sum of (probability * market_value)
            ev = allCards.reduce((sum: number, c: any) => {
              return sum + ((c.probability || 0) * (c.market_value || 0));
            }, 0);
            
            // Ceiling: maximum market value
            ceiling = Math.max(...allCards.map((c: any) => c.market_value || 0));

            // Calculate top 3 cards from allCards
            topCards = allCards
              .sort((a, b) => (b.market_value || 0) - (a.market_value || 0))
              .slice(0, 3)
              .map((card: any) => ({
                id: card.id,
                name: card.name || "Unknown Card",
                image_url: extractCardImageUrl(card.image_uri),
                market_value: card.market_value,
              }));
          }
        }
      }
    }
  }

  return {
    pack: {
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      image_url: pack.image_url,
      game_code: pack.game_code,
      rip_cost: pack.rip_cost,
      total_openings: pack.total_openings || 0,
      cards: allCards,
      topCards: topCards,
      floor: floor,
      ev: ev,
      ceiling: ceiling,
      totalCards: allCards.length,
    },
    balance: balance || 0,
    sellbackRate,
  };
};
