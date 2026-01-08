import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";

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

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch active packs and balance
  const [packsResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select(`
        id,
        name,
        image_url,
        rip_cost,
        game_code
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    getUserRipBalance(user.id),
  ]);

  if (packsResult.error) {
    console.error("Error fetching packs:", packsResult.error);
    return {
      packs: [],
      balance: balance || 0,
    };
  }

  const packsData = packsResult.data || [];

  // Fetch top 3 cards for each pack
  const packsWithCards = await Promise.all(
    packsData.map(async (pack: any) => {
      const packData: any = {
        id: pack.id,
        name: pack.name,
        image: pack.image_url || null,
        price: pack.rip_cost,
        topCards: [],
      };

      // Only fetch cards if pack has a game_code
      if (pack.game_code) {
        try {
          // Fetch top 3 most expensive cards from pack_cards
          const { data: packCardsResult } = await adminClient
            .from("pack_cards")
            .select("card_uuid, market_value")
            .eq("pack_id", pack.id)
            .order("market_value", { ascending: false })
            .limit(3);

          if (packCardsResult && packCardsResult.length > 0) {
            const cardTable = `${pack.game_code}_cards`;
            const cardUuids = packCardsResult.map((pc: any) => pc.card_uuid);

            // Fetch card data from game-specific table
            const { data: cardsData } = await adminClient
              .from(cardTable)
              .select("id, name, image_uri")
              .in("id", cardUuids);

            if (cardsData) {
              // Create a map of card data by UUID
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

              // Build topCards array matching packCardsResult order
              packData.topCards = packCardsResult
                .map((pc: any) => {
                  const cardData = cardDataMap.get(pc.card_uuid);
                  if (!cardData) return null;

                  return {
                    id: cardData.id,
                    name: cardData.name || "Unknown Card",
                    image_url: extractCardImageUrl(cardData.image_uri),
                    market_value: pc.market_value,
                  };
                })
                .filter((card: any) => card !== null);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching cards for pack ${pack.id}:`,
            error
          );
          // Continue with empty topCards array
        }
      }

      return packData;
    })
  );

  return {
    packs: packsWithCards,
    balance: balance || 0,
  };
};
