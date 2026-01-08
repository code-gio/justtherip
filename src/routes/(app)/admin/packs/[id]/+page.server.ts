import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const packId = params.id;

  // Fetch pack data and pack cards in parallel
  const [packResult, packCardsResult] = await Promise.all([
    adminClient
      .from("packs")
      .select("*")
      .eq("id", packId)
      .single(),
    adminClient
      .from("pack_cards")
      .select("*")
      .eq("pack_id", packId),
  ]);

  if (packResult.error) {
    console.error("Error fetching pack:", packResult.error);
    throw error(404, "Pack not found");
  }

  if (packCardsResult.error) {
    console.error("Error fetching pack cards:", packCardsResult.error);
  }

  const pack = packResult.data;
  const packCards = packCardsResult.data || [];

  // Fetch card data for assigned cards
  const cardDataMap = new Map<string, any>();
  if (packCards.length > 0 && pack?.game_code) {
    // Group pack cards by card_table (in case there are multiple game types)
    const cardsByTable = new Map<string, string[]>();
    packCards.forEach((pc: any) => {
      const table = pc.card_table || `${pack.game_code}_cards`;
      if (!cardsByTable.has(table)) {
        cardsByTable.set(table, []);
      }
      cardsByTable.get(table)!.push(pc.card_uuid);
    });

    // Fetch card data for each table
    for (const [table, cardUuids] of cardsByTable.entries()) {
      if (cardUuids.length === 0) continue;

      try {
        const { data: cards, error: cardsError } = await adminClient
          .from(table)
          .select("id, name, image_uri, prices, set_code, set_name, rarity")
          .in("id", cardUuids);

        if (cardsError) {
          console.error(`Error fetching cards from ${table}:`, cardsError);
        } else if (cards) {
          cards.forEach((card: any) => {
            // Ensure image_uri is properly parsed if it's a JSONB string
            if (card.image_uri && typeof card.image_uri === "string") {
              try {
                card.image_uri = JSON.parse(card.image_uri);
              } catch {
                // If it's not JSON, keep it as a string
              }
            }
            cardDataMap.set(card.id, card);
          });
        }
      } catch (error) {
        console.error(`Error fetching cards from ${table}:`, error);
      }
    }
  }

  // Enrich pack cards with card data
  const packCardsWithData = packCards.map((pc: any) => {
    const cardData = cardDataMap.get(pc.card_uuid);
    // Return plain object, ensure no functions or reactive values
    return {
      card_uuid: pc.card_uuid,
      market_value: pc.market_value,
      is_foil: pc.is_foil,
      condition: pc.condition,
      card_table: pc.card_table,
      game_code: pc.game_code,
      cardData: cardData ? {
        id: cardData.id,
        name: cardData.name,
        image_uri: cardData.image_uri,
        prices: cardData.prices,
        set_code: cardData.set_code,
        set_name: cardData.set_name,
        rarity: cardData.rarity,
      } : null,
    };
  });

  return {
    pack,
    packCards: packCardsWithData,
  };
};

export const actions = {
  save: async ({ params, request, locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const packId = params.id;
    const formData = await request.formData();

    // Parse form data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const image_url = formData.get("image_url") as string;
    const game_code = formData.get("game_code") as string;
    const rip_cost = parseInt(formData.get("rip_cost") as string) || 1;

    // Update pack
    const { error: packError } = await adminClient
      .from("packs")
      .update({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        game_code,
        rip_cost,
      })
      .eq("id", packId);

    if (packError) {
      console.error("Error updating pack:", packError);
      return { success: false, error: packError.message };
    }

    // Parse pack cards (JSON array)
    const packCardsJson = formData.get("pack_cards") as string;
    if (packCardsJson) {
      const packCards = JSON.parse(packCardsJson) as Array<{
        card_uuid: string;
        market_value: number;
        is_foil: boolean;
        condition: string;
      }>;

      // Delete existing pack cards
      await adminClient.from("pack_cards").delete().eq("pack_id", packId);

      // Insert new pack cards
      if (packCards.length > 0) {
        // Determine card_table based on game_code
        const cardTable = `${game_code}_cards`;
        
        const { error: cardsError } = await adminClient
          .from("pack_cards")
          .insert(
            packCards.map((pc) => ({
              pack_id: packId,
              game_code: game_code,
              card_table: cardTable,
              card_uuid: pc.card_uuid,
              market_value: pc.market_value,
              is_foil: pc.is_foil,
              condition: pc.condition,
            }))
          );

        if (cardsError) {
          console.error("Error updating pack cards:", cardsError);
          return { success: false, error: cardsError.message };
        }
      }
    }

    return { success: true };
  },

  publish: async ({ params, request, locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const packId = params.id;
    const formData = await request.formData();

    // Parse form data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const image_url = formData.get("image_url") as string;
    const game_code = formData.get("game_code") as string;
    const rip_cost = parseInt(formData.get("rip_cost") as string) || 1;

    // Update pack (including setting is_active to true)
    const { error: packError } = await adminClient
      .from("packs")
      .update({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        game_code,
        rip_cost,
        is_active: true,
      })
      .eq("id", packId);

    if (packError) {
      console.error("Error updating pack:", packError);
      return { success: false, error: packError.message };
    }

    // Parse pack cards (JSON array)
    const packCardsJson = formData.get("pack_cards") as string;
    if (packCardsJson) {
      const packCards = JSON.parse(packCardsJson) as Array<{
        card_uuid: string;
        market_value: number;
        is_foil: boolean;
        condition: string;
      }>;

      // Delete existing pack cards
      await adminClient.from("pack_cards").delete().eq("pack_id", packId);

      // Insert new pack cards
      if (packCards.length > 0) {
        // Determine card_table based on game_code
        const cardTable = `${game_code}_cards`;
        
        const { error: cardsError } = await adminClient
          .from("pack_cards")
          .insert(
            packCards.map((pc) => ({
              pack_id: packId,
              game_code: game_code,
              card_table: cardTable,
              card_uuid: pc.card_uuid,
              market_value: pc.market_value,
              is_foil: pc.is_foil,
              condition: pc.condition,
            }))
          );

        if (cardsError) {
          console.error("Error updating pack cards:", cardsError);
          return { success: false, error: cardsError.message };
        }
      }
    }

    return { success: true };
  },

  unpublish: async ({ params, locals }) => {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const packId = params.id;

    // Update pack to inactive
    const { error } = await adminClient
      .from("packs")
      .update({ is_active: false })
      .eq("id", packId);

    if (error) {
      console.error("Error unpublishing pack:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },
} satisfies Actions;

