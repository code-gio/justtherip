import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient, addRips } from "$lib/server/rips";
import { calculateSellbackValue } from "$lib/server/card-draw";

/**
 * Card Sell-Back API Endpoint
 *
 * POST /api/inventory/sell
 *
 * Sells a card back to the system for Rips:
 * 1. Verifies card ownership
 * 2. Verifies card is not already sold
 * 3. Calculates sell-back value (85% of card value)
 * 4. Credits Rips to user's account
 * 5. Marks card as sold in inventory
 */

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { card_id } = body;

    if (!card_id) {
      return json({ error: "card_id is required" }, { status: 400 });
    }

    // Fetch card from user's inventory
    const { data: card, error: fetchError } = await adminClient
      .from("user_inventory")
      .select("*")
      .eq("id", card_id)
      .eq("user_id", user.id)
      .eq("is_sold", false)
      .eq("is_shipped", false)
      .single();

    if (fetchError || !card) {
      // Check if card exists but is sold or shipped
      const { data: existingCard } = await adminClient
        .from("user_inventory")
        .select("is_sold, is_shipped, shipment_id")
        .eq("id", card_id)
        .eq("user_id", user.id)
        .single();

      if (existingCard) {
        if (existingCard.is_sold) {
          return json(
            { error: "Card has already been sold" },
            { status: 400 }
          );
        }
        if (existingCard.is_shipped || existingCard.shipment_id) {
          return json(
            { error: "Card has already been shipped and cannot be sold" },
            { status: 400 }
          );
        }
      }

      return json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // Calculate sell-back value
    const sellbackRips = await calculateSellbackValue(card.card_value_cents);

    // Add Rips to user's account
    const addResult = await addRips(user.id, sellbackRips, {
      card_id: card.id,
      card_value_cents: card.card_value_cents,
      tier_name: card.tier_name,
      reason: "card_sellback",
    });

    if (!addResult.success) {
      console.error("Failed to add Rips for sellback:", addResult.error);
      return json(
        { error: "Failed to credit Rips" },
        { status: 500 }
      );
    }

    // Mark card as sold
    const { error: updateError } = await adminClient
      .from("user_inventory")
      .update({
        is_sold: true,
        sold_at: new Date().toISOString(),
        sellback_rips: sellbackRips,
      })
      .eq("id", card_id);

    if (updateError) {
      console.error("Error marking card as sold:", updateError);
      // Don't fail the request - user already got the Rips
    }

    return json({
      success: true,
      card: {
        id: card.id,
        tier_name: card.tier_name,
        value_cents: card.card_value_cents,
        value_usd: (card.card_value_cents / 100).toFixed(2),
      },
      rips_credited: sellbackRips,
      new_balance: addResult.balance,
    });
  } catch (error) {
    console.error("Error selling card:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
