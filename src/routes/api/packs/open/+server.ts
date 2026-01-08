import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { spendRips, getUserRipBalance } from "$lib/server/rips";
import { drawCardFromPack } from "$lib/server/card-draw";
import { adminClient } from "$lib/server/rips";

/**
 * Pack Opening API Endpoint
 *
 * POST /api/packs/open
 *
 * Opens a pack for the authenticated user:
 * 1. Verifies user has sufficient Rips
 * 2. Deducts Rips from user's balance
 * 3. Draws a card using inverse-power probability distribution
 * 4. Records pack opening in database
 * 5. Adds card to user's inventory
 * 6. Returns the drawn card
 */

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pack_id from request body
    const body = await request.json();
    const packId = body.pack_id;

    if (!packId) {
      return json({ error: "pack_id is required" }, { status: 400 });
    }

    // Fetch pack details from database
    const { data: pack, error: packFetchError } = await adminClient
      .from("packs")
      .select("id, rip_cost, game_code, is_active")
      .eq("id", packId)
      .single();

    if (packFetchError || !pack) {
      return json({ error: "Pack not found" }, { status: 404 });
    }

    if (!pack.is_active) {
      return json({ error: "Pack is not active" }, { status: 400 });
    }

    const packCostRips = pack.rip_cost;
    const gameCode = pack.game_code || "mtg";

    // Check user has sufficient balance
    const currentBalance = await getUserRipBalance(user.id);

    if (currentBalance === null) {
      return json(
        { error: "Failed to fetch balance" },
        { status: 500 }
      );
    }

    if (currentBalance < packCostRips) {
      return json(
        {
          error: "Insufficient Rips",
          balance: currentBalance,
          required: packCostRips,
        },
        { status: 400 }
      );
    }

    // Spend Rips
    const spendResult = await spendRips(user.id, packCostRips, {
      pack_id: packId,
      reason: "pack_opening",
    });

    if (!spendResult.success) {
      return json(
        {
          error: spendResult.error || "Failed to spend Rips",
        },
        { status: 500 }
      );
    }

    // Draw a card from the pack
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+server.ts:92',message:'Calling drawCardFromPack',data:{packId,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const drawResult = await drawCardFromPack(packId, user.id);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e77bc13f-e7c1-4706-97a3-e965fe962aa8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'+server.ts:95',message:'drawCardFromPack result',data:{packId,success:drawResult.success,cardUuid:drawResult.card?.card_uuid,cardName:drawResult.card?.card_name,error:drawResult.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!drawResult.success || !drawResult.card) {
      // Refund Rips if draw failed
      console.error("Card draw failed, attempting refund...");
      // TODO: Implement refund logic
      return json(
        {
          error: drawResult.error || "Failed to draw card",
        },
        { status: 500 }
      );
    }

    const card = drawResult.card;

    // Ensure value_cents is an integer (round to nearest cent)
    const valueCents = Math.round(card.value_cents);

    // Prepare card data for pack_openings.cards_pulled JSONB
    const cardName = card.card_name || "Unknown Card";
    const cardData = {
      card_uuid: card.card_uuid,
      value_cents: valueCents,
      card_name: cardName,
      card_image_url: card.card_image_url || null,
      set_name: card.set_name || null,
      set_code: card.set_code || null,
      rarity: card.rarity || null,
    };

    // Record pack opening
    const { data: packOpening, error: packError } = await adminClient
      .from("pack_openings")
      .insert({
        user_id: user.id,
        pack_id: packId,
        rips_spent: packCostRips,
        cards_pulled: [cardData], // JSONB array
        total_value_cents: valueCents,
      })
      .select()
      .single();

    if (packError) {
      console.error("Error recording pack opening:", packError);
      // Don't fail the request - user already got the card
    }

    // Add card to user's inventory with all required fields
    const { data: inventoryItem, error: inventoryError } = await adminClient
      .from("user_inventory")
      .insert({
        user_id: user.id,
        pack_opening_id: packOpening?.id,
        card_uuid: card.card_uuid,
        game_code: gameCode,
        card_name: cardName,
        card_image_url: card.card_image_url || null,
        card_value_cents: valueCents,
        tier_id: null, // No longer using tiers
        tier_name: "N/A", // Placeholder for backward compatibility
        set_name: card.set_name || null,
        set_code: card.set_code || null,
        rarity: card.rarity || null,
        is_foil: card.is_foil || false,
        condition: card.condition || "NM",
      })
      .select()
      .single();

    if (inventoryError) {
      console.error("Error adding card to inventory:", inventoryError);
      return json(
        {
          error: "Failed to add card to inventory",
        },
        { status: 500 }
      );
    }

    // Return success with card details
    return json({
      success: true,
      card: {
        id: inventoryItem.id,
        value_cents: valueCents,
        value_usd: (valueCents / 100).toFixed(2),
        card_name: cardName,
        card_image_url: card.card_image_url || inventoryItem.card_image_url || null,
        set_name: card.set_name || null,
        rarity: card.rarity || null,
      },
      new_balance: spendResult.balance,
      pack_opening_id: packOpening?.id,
    });
  } catch (error) {
    console.error("Error opening pack:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
