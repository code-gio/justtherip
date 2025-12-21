import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { spendRips, getUserRipBalance } from "$lib/server/rips";
import { drawCard } from "$lib/server/card-draw";
import { adminClient } from "$lib/server/rips";

/**
 * Pack Opening API Endpoint
 *
 * POST /api/packs/open
 *
 * Opens a pack for the authenticated user:
 * 1. Verifies user has sufficient Rips (1 Rip per pack)
 * 2. Deducts Rips from user's balance
 * 3. Draws a card using tier probability system
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

    // Get pack_id from request body (optional - for future multi-pack support)
    const body = await request.json();
    const packId = body.pack_id || "default_pack";

    // TODO: Fetch pack details from database
    // For now, we assume all packs cost 1 Rip
    const packCostRips = 1;

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

    // Draw a card
    const drawResult = await drawCard(user.id);

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

    // Record pack opening
    const { data: packOpening, error: packError } = await adminClient
      .from("pack_openings")
      .insert({
        user_id: user.id,
        pack_id: packId,
        tier_id: card.tier_id,
        tier_name: card.tier_name,
        card_value_cents: card.value_cents,
        rips_spent: packCostRips,
      })
      .select()
      .single();

    if (packError) {
      console.error("Error recording pack opening:", packError);
      // Don't fail the request - user already got the card
    }

    // Add card to user's inventory
    const { data: inventoryItem, error: inventoryError } = await adminClient
      .from("user_inventory")
      .insert({
        user_id: user.id,
        pack_opening_id: packOpening?.id,
        tier_id: card.tier_id,
        tier_name: card.tier_name,
        card_value_cents: card.value_cents,
        card_name: card.card_name,
        card_image_url: card.card_image_url,
        set_name: card.set_name,
        rarity: card.rarity,
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
        tier_name: card.tier_name,
        value_cents: card.value_cents,
        value_usd: (card.value_cents / 100).toFixed(2),
        card_name: card.card_name,
        card_image_url: card.card_image_url,
        set_name: card.set_name,
        rarity: card.rarity,
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
