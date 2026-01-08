import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * User Shipments API Endpoint
 *
 * GET /api/shipments
 *
 * Returns the authenticated user's shipments with optional filtering
 * Query params:
 * - status: filter by status (pending, processing, shipped, delivered)
 */

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const statusFilter = url.searchParams.get("status");

    // Build query
    let query = adminClient
      .from("shipments")
      .select("*")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data: shipments, error } = await query;

    if (error) {
      console.error("Error fetching shipments:", error);
      return json(
        { error: "Failed to fetch shipments" },
        { status: 500 }
      );
    }

    // Transform shipments to match UI type
    const transformedShipments = (shipments || []).map((shipment) => ({
      id: shipment.id,
      cardName: shipment.card_name,
      cardValue: `$${(shipment.card_value_cents / 100).toFixed(2)}`,
      cardImage: shipment.card_image_url || undefined,
      status: shipment.status,
      requestDate: new Date(shipment.requested_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      trackingNumber: shipment.tracking_number,
      carrier: shipment.carrier,
      estimatedDelivery: shipment.estimated_delivery_date
        ? new Date(shipment.estimated_delivery_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      deliveredDate: shipment.delivered_date
        ? new Date(shipment.delivered_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      shippingAddress: shipment.shipping_address_full,
    }));

    return json({
      shipments: transformedShipments,
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};

