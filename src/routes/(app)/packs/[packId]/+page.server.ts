import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";
import { calculatePackCardProbabilities } from "$lib/server/card-draw";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const packId = params.packId;

  // Fetch pack data and balance in parallel
  const [packResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .single(),
    getUserRipBalance(user.id),
  ]);

  if (packResult.error || !packResult.data) {
    throw error(404, "Pack not found");
  }

  const pack = packResult.data;

  // Fetch all pack cards
  let allCards: any[] = [];
  if (pack.game_code) {
    const { data: packCardsResult } = await adminClient
      .from("pack_cards")
      .select("*")
      .eq("pack_id", packId);

    if (packCardsResult && packCardsResult.length > 0) {
      const cardTable = `${pack.game_code}_cards`;
      const cardUuids = packCardsResult.map((pc: any) => pc.card_uuid);

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
          packCardsResult.forEach((pc: any) => {
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
    },
    balance: balance || 0,
  };
};
