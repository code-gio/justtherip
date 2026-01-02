import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * Card Ship API Endpoint
 *
 * POST /api/inventory/ship
 *
 * Creates a shipment request for a card:
 * 1. Verifies card ownership
 * 2. Verifies card is not already sold or shipped
 * 3. Creates a shipment record with status "pending"
 * 4. Returns the shipment details
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
      .single();

    if (fetchError || !card) {
      return json(
        { error: "Card not found or already sold" },
        { status: 404 }
      );
    }

    // Check if card already has a pending shipment
    const { data: existingShipment } = await adminClient
      .from("shipments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("inventory_id", card_id)
      .in("status", ["pending", "processing", "shipped"])
      .single();

    if (existingShipment) {
      return json(
        { error: "Card already has an active shipment" },
        { status: 400 }
      );
    }

    // Create shipment record
    const { data: shipment, error: shipmentError } = await adminClient
      .from("shipments")
      .insert({
        user_id: user.id,
        inventory_id: card_id,
        status: "pending",
        card_name: card.card_name,
        card_tier: card.tier_name,
        card_value_cents: card.card_value_cents,
        card_image_url: card.card_image_url,
      })
      .select()
      .single();

    if (shipmentError) {
      console.error("Error creating shipment:", shipmentError);
      return json(
        { error: "Failed to create shipment" },
        { status: 500 }
      );
    }

    return json({
      success: true,
      shipment: {
        id: shipment.id,
        status: shipment.status,
        card_name: card.card_name,
        card_tier: card.tier_name,
        card_value: (card.card_value_cents / 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error shipping card:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

