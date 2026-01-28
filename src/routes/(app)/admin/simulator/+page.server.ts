import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * Extract card image URL from a serialized image_uri field
 */
function extractCardImageUrl(imageUri: any): string | null {
  if (!imageUri) return null;

  if (typeof imageUri === "string") {
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

  const packsResult = await adminClient
    .from("packs")
    .select("id, name, image_url, rip_cost, game_code")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (packsResult.error) {
    console.error("Error fetching packs for simulator:", packsResult.error);
    return {
      packs: [],
    };
  }

  const packsData = packsResult.data || [];

  const packsWithCards = await Promise.all(
    packsData.map(async (pack: any) => {
      const packData: any = {
        id: pack.id,
        name: pack.name,
        image: pack.image_url || null,
        price: pack.rip_cost,
        game_code: pack.game_code,
        topCards: [],
      };

      if (!pack.game_code) {
        return packData;
      }

      try {
        const { data: packCards } = await adminClient
          .from("pack_cards")
          .select("card_uuid, market_value")
          .eq("pack_id", pack.id)
          .order("market_value", { ascending: false })
          .limit(3);

        if (packCards && packCards.length > 0) {
          const cardTable = `${pack.game_code}_cards`;
          const cardUuids = packCards.map((pc: any) => pc.card_uuid);

          const { data: cardsData } = await adminClient
            .from(cardTable)
            .select("id, name, image_uri")
            .in("id", cardUuids);

          if (cardsData) {
            const cardDataMap = new Map<string, any>();
            cardsData.forEach((card: any) => {
              if (card.image_uri && typeof card.image_uri === "string") {
                try {
                  card.image_uri = JSON.parse(card.image_uri);
                } catch {
                  // keep as string
                }
              }
              cardDataMap.set(card.id, card);
            });

            packData.topCards = packCards
              .map((pc: any) => {
                const card = cardDataMap.get(pc.card_uuid);
                if (!card) return null;
                return {
                  id: card.id,
                  name: card.name || "Unknown Card",
                  image_url: extractCardImageUrl(card.image_uri),
                  market_value: pc.market_value,
                };
              })
              .filter((card: any) => card !== null);
          }
        }
      } catch (error) {
        console.error(`Error loading cards for pack ${pack.id}:`, error);
      }

      return packData;
    })
  );

  return {
    packs: packsWithCards,
  };
};
