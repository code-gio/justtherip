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
 * 3. Gets or validates shipping address
 * 4. Creates a shipment record with status "pending"
 * 5. Updates inventory card with shipment_id
 * 6. Returns the shipment details
 */

export const POST: RequestHandler = async ({ locals, request }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { card_id, shipping_address_id } = body;

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
      return json(
        { error: "Card not found, already sold, or already shipped" },
        { status: 404 }
      );
    }

    // Check if card already has an active shipment
    if (card.shipment_id) {
      const { data: existingShipment } = await adminClient
        .from("shipments")
        .select("id, status")
        .eq("id", card.shipment_id)
        .in("status", ["pending", "processing", "shipped"])
        .single();

      if (existingShipment) {
        return json(
          { error: "Card already has an active shipment" },
          { status: 400 }
        );
      }
    }

    // Get shipping address
    let shippingAddress = null;
    let shippingAddressFull = "";
    let shippingName = "";
    let shippingPhone = null;

    if (shipping_address_id) {
      const { data: address, error: addressError } = await adminClient
        .from("shipping_addresses")
        .select("*")
        .eq("id", shipping_address_id)
        .eq("user_id", user.id)
        .single();

      if (addressError || !address) {
        return json(
          { error: "Shipping address not found" },
          { status: 404 }
        );
      }

      shippingAddress = address;
      shippingName = address.name;
      shippingPhone = address.phone;
      shippingAddressFull = [
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.postal_code,
        address.country,
      ]
        .filter(Boolean)
        .join(", ");
    } else {
      // Try to get default address
      const { data: defaultAddress } = await adminClient
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      if (!defaultAddress) {
        return json(
          { error: "No shipping address provided. Please add a shipping address first." },
          { status: 400 }
        );
      }

      shippingAddress = defaultAddress;
      shippingName = defaultAddress.name;
      shippingPhone = defaultAddress.phone;
      shippingAddressFull = [
        defaultAddress.address_line1,
        defaultAddress.address_line2,
        defaultAddress.city,
        defaultAddress.state,
        defaultAddress.postal_code,
        defaultAddress.country,
      ]
        .filter(Boolean)
        .join(", ");
    }

    // Create shipment record
    const { data: shipment, error: shipmentError } = await adminClient
      .from("shipments")
      .insert({
        user_id: user.id,
        inventory_card_id: card_id,
        status: "pending",
        shipping_address_id: shippingAddress.id,
        shipping_address_full: shippingAddressFull,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        card_name: card.card_name,
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

    // Update inventory card with shipment_id
    const { error: updateError } = await adminClient
      .from("user_inventory")
      .update({ shipment_id: shipment.id })
      .eq("id", card_id);

    if (updateError) {
      console.error("Error updating inventory card:", updateError);
      // Don't fail the request - shipment was created
    }

    return json({
      success: true,
      shipment: {
        id: shipment.id,
        status: shipment.status,
        card_name: card.card_name,
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

