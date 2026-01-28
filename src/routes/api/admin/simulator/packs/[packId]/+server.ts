import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";
import { calculatePackCardProbabilities } from "$lib/server/card-draw";

/**
 * Extracts a usable image URL from the card's image_uri field
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

export const GET: RequestHandler = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requireAdmin(user.id);
  } catch (error) {
    return json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  const packId = params.packId;
  if (!packId) {
    return json({ error: "packId is required" }, { status: 400 });
  }

  const { data: pack, error: packError } = await adminClient
    .from("packs")
    .select("id, game_code, is_active")
    .eq("id", packId)
    .single();

  if (packError || !pack) {
    return json({ error: "Pack not found" }, { status: 404 });
  }

  if (!pack.is_active) {
    return json(
      { error: "Pack is not active" },
      { status: 400 }
    );
  }

  const { data: packCards, error: packCardsError } = await adminClient
    .from("pack_cards")
    .select(
      "card_uuid, market_value, is_foil, condition"
    )
    .eq("pack_id", packId);

  if (packCardsError) {
    console.error("Error fetching pack cards for simulator:", packCardsError);
    return json(
      { error: "Failed to fetch pack cards" },
      { status: 500 }
    );
  }

  const cardTable = `${pack.game_code || "mtg"}_cards`;
  const cardUuids = packCards?.map((card: any) => card.card_uuid) || [];

  let cardMetadata: any[] = [];
  if (cardUuids.length > 0) {
    const { data: cardData } = await adminClient
      .from(cardTable)
      .select("id, name, image_uri, rarity, set_name, set_code")
      .in("id", cardUuids);

    if (cardData) {
      cardMetadata = cardData;
    }
  }

  const probabilityData = await calculatePackCardProbabilities(packId);
  const probabilityMap = new Map<string, number>();
  probabilityData.forEach((entry) => {
    probabilityMap.set(entry.card_uuid, entry.probability);
  });

  const cardMetadataMap = new Map<string, any>();
  cardMetadata.forEach((card) => {
    cardMetadataMap.set(card.id, card);
  });

  const cards = (packCards || []).map((packCard: any) => {
    const metadata = cardMetadataMap.get(packCard.card_uuid);

    return {
      id: packCard.card_uuid,
      name: metadata?.name || "Unknown Card",
      image_url: extractCardImageUrl(metadata?.image_uri),
      market_value: packCard.market_value || 0,
      probability: probabilityMap.get(packCard.card_uuid) || 0,
      rarity: metadata?.rarity || null,
      set_name: metadata?.set_name || null,
      set_code: metadata?.set_code || null,
      is_foil: packCard.is_foil || false,
      condition: packCard.condition || null,
    };
  });

  return json({ cards });
};
