import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const packId = params.packId;

  // Fetch pack data, pack tiers, and card tiers in parallel
  const [packResult, packTiersResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .single(),
    adminClient
      .from("pack_tiers")
      .select("*, card_tiers!inner(*)")
      .eq("pack_id", packId)
      .order("display_order", { ascending: true }),
    getUserRipBalance(user.id),
  ]);

  if (packResult.error || !packResult.data) {
    throw error(404, "Pack not found");
  }

  const pack = packResult.data;
  const packTiers = packTiersResult.data || [];

  // Build odds array from pack_tiers
  const odds = packTiers
    .filter((pt) => pt.probability > 0 && pt.card_tiers)
    .map((pt: any) => {
      const tier = pt.card_tiers;
      if (!tier) return null;

      return {
        tier_id: tier.id,
        tier_name: tier.name,
        chance: pt.probability * 100,
        min_value: tier.min_value_cents / 100,
        max_value: tier.max_value_cents / 100,
        value_range: `$${(tier.min_value_cents / 100).toFixed(2)} - $${(tier.max_value_cents / 100).toFixed(2)}`,
      };
    })
    .filter((o) => o !== null);

  // Create a map of tier probabilities
  const tierProbabilityMap = new Map<string, number>();
  packTiers.forEach((pt: any) => {
    if (pt.card_tiers && pt.probability > 0) {
      tierProbabilityMap.set(pt.card_tiers.id, pt.probability);
    }
  });

  // Fetch all pack cards with their probabilities
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

          // Calculate probability for each card and create flat array
          // First, group cards by tier to calculate normalized odds
          const tierCardsMap = new Map<string, any[]>();
          packCardsResult.forEach((pc: any) => {
            if (!tierCardsMap.has(pc.tier_id)) {
              tierCardsMap.set(pc.tier_id, []);
            }
            tierCardsMap.get(pc.tier_id)!.push(pc);
          });

          // Calculate total odds per tier
          const tierTotalOddsMap = new Map<string, number>();
          tierCardsMap.forEach((cards, tierId) => {
            const totalOdds = cards.reduce((sum: number, c: any) => sum + (c.odds || 1), 0);
            tierTotalOddsMap.set(tierId, totalOdds);
          });

          // Now create flat array with calculated probabilities
          packCardsResult.forEach((pc: any) => {
            const cardData = cardDataMap.get(pc.card_uuid);
            if (cardData) {
              const tierProbability = tierProbabilityMap.get(pc.tier_id) || 0;
              const totalTierOdds = tierTotalOddsMap.get(pc.tier_id) || 1;
              const cardOdds = pc.odds || 1;
              // Card probability = tier probability * (card odds / total tier odds)
              const cardProbability = tierProbability * (cardOdds / totalTierOdds);

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
                probability: cardProbability,
                tier_id: pc.tier_id,
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
      odds,
      cards: allCards,
    },
    balance: balance || 0,
  };
};

