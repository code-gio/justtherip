import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

/**
 * Admin Shipment Update API Endpoint
 *
 * PATCH /api/admin/shipments/[id]
 *
 * Updates a shipment with admin privileges
 * Body params (all optional):
 * - status: pending, processing, shipped, delivered, cancelled
 * - carrier: carrier name (required if status is shipped/delivered)
 * - tracking_number: tracking number (required if status is shipped/delivered)
 * - estimated_delivery_date: ISO date string
 * - delivered_date: ISO date string
 * - admin_notes: admin notes text
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin access
    await requireAdmin(user.id);

    const shipmentId = params.id;
    const body = await request.json();
    const {
      status,
      carrier,
      tracking_number,
      estimated_delivery_date,
      delivered_date,
      admin_notes,
    } = body;

    // Fetch existing shipment
    const { data: existingShipment, error: fetchError } = await adminClient
      .from("shipments")
      .select("*")
      .eq("id", shipmentId)
      .single();

    if (fetchError || !existingShipment) {
      return json({ error: "Shipment not found" }, { status: 404 });
    }

    // Validate tracking requirement for shipped/delivered status
    const newStatus = status || existingShipment.status;
    if (
      (newStatus === "shipped" || newStatus === "delivered") &&
      (!carrier || !tracking_number)
    ) {
      // Check if we're updating status and need tracking
      if (status && status !== existingShipment.status) {
        return json(
          {
            error:
              "Carrier and tracking number are required for shipped/delivered status",
          },
          { status: 400 }
        );
      }
      // If not updating status, check existing values
      if (!existingShipment.carrier || !existingShipment.tracking_number) {
        return json(
          {
            error:
              "Carrier and tracking number are required for shipped/delivered status",
          },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, any> = {};

    if (status !== undefined) {
      updateData.status = status;

      // Auto-set timestamps based on status changes
      if (status === "processing" && existingShipment.status !== "processing") {
        updateData.processed_at = new Date().toISOString();
      }
      if (status === "shipped" && existingShipment.status !== "shipped") {
        updateData.shipped_at = new Date().toISOString();
      }
    }

    if (carrier !== undefined) updateData.carrier = carrier || null;
    if (tracking_number !== undefined)
      updateData.tracking_number = tracking_number || null;
    if (estimated_delivery_date !== undefined)
      updateData.estimated_delivery_date =
        estimated_delivery_date || null;
    if (delivered_date !== undefined)
      updateData.delivered_date = delivered_date || null;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes || null;

    // Update shipment
    const { data: updatedShipment, error: updateError } = await adminClient
      .from("shipments")
      .update(updateData)
      .eq("id", shipmentId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating shipment:", updateError);
      return json({ error: "Failed to update shipment" }, { status: 500 });
    }

    // Fetch profile for the user
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id, email, username, display_name")
      .eq("id", updatedShipment.user_id)
      .single();

    // Transform to match AdminShipment type
    const transformedShipment = {
      id: updatedShipment.id,
      userId: updatedShipment.user_id,
      userEmail: profile?.email || undefined,
      userName: profile?.display_name || profile?.username || undefined,
      cardName: updatedShipment.card_name,
      cardTier: updatedShipment.card_tier_name,
      cardTierName: updatedShipment.card_tier_name,
      cardValue: `$${(updatedShipment.card_value_cents / 100).toFixed(2)}`,
      cardImage: updatedShipment.card_image_url || undefined,
      status: updatedShipment.status,
      requestDate: new Date(updatedShipment.requested_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ),
      requestedAt: updatedShipment.requested_at,
      trackingNumber: updatedShipment.tracking_number,
      carrier: updatedShipment.carrier,
      estimatedDelivery: updatedShipment.estimated_delivery_date
        ? new Date(updatedShipment.estimated_delivery_date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
        : null,
      deliveredDate: updatedShipment.delivered_date
        ? new Date(updatedShipment.delivered_date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
        : null,
      shippingAddress: updatedShipment.shipping_address_full,
      shippingName: updatedShipment.shipping_name,
      shippingPhone: updatedShipment.shipping_phone || undefined,
      adminNotes: updatedShipment.admin_notes || undefined,
      processedAt: updatedShipment.processed_at || undefined,
      shippedAt: updatedShipment.shipped_at || undefined,
      createdAt: updatedShipment.created_at,
      updatedAt: updatedShipment.updated_at,
    };

    return json({
      success: true,
      shipment: transformedShipment,
    });
  } catch (error) {
    console.error("Error updating shipment:", error);
    if (error && typeof error === "object" && "status" in error) {
      throw error;
    }
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
