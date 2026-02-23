import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Admin Shipments API Endpoint
 *
 * GET /api/admin/shipments
 *
 * Returns all shipments with optional filtering and pagination
 * Query params:
 * - status: filter by status
 * - user_id: filter by user
 * - search: search by card name, tracking number, or user email
 * - sort: sort field (requested_at, status, card_value_cents)
 * - order: asc/desc
 * - page: page number (default 1)
 * - limit: results per page (default 50, max 200)
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin access
    await requireAdmin(user.id);

    const statusFilter = url.searchParams.get("status");
    const userIdFilter = url.searchParams.get("user_id");
    const searchQuery = url.searchParams.get("search")?.trim() || "";
    const sortField = url.searchParams.get("sort") || "requested_at";
    const sortOrder = url.searchParams.get("order") === "asc" ? "asc" : "desc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT)),
      MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    // Build base query - fetch shipments first, then profiles separately
    // Supabase foreign key join syntax can be tricky, so we'll do it in two steps
    // let query = adminClient
    //   .from("shipments")
    //   .select("*", { count: "exact" });

    let query = adminClient
      .from("shipments")
      .select(`
        *,
        user_inventory!shipments_inventory_card_id_fkey (*)
      `, { count: "exact" })
      .order("requested_at", { ascending: false });


    // Apply filters
    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (userIdFilter) {
      query = query.eq("user_id", userIdFilter);
    }

    // Search filter (card name, tracking number)
    if (searchQuery) {
      query = query.or(
        `card_name.ilike.%${searchQuery}%,tracking_number.ilike.%${searchQuery}%`
      );
    }

    // Apply sorting
    const validSortFields = [
      "requested_at",
      "status",
      "card_value_cents",
      "created_at",
    ];
    const sortBy = validSortFields.includes(sortField)
      ? sortField
      : "requested_at";

    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: shipments, error, count } = await query;

    if (error) {
      console.error("Error fetching shipments:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return json({ error: "Failed to fetch shipments" }, { status: 500 });
    }

    console.log(`Fetched ${shipments?.length || 0} shipments from database`);

    // Fetch profiles for all unique user IDs
    const userIds = [...new Set((shipments || []).map((s: any) => s.user_id))];
    const profilesMap = new Map<string, any>();

    if (userIds.length > 0) {
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, email, username, display_name")
        .in("id", userIds);

      (profiles || []).forEach((profile: any) => {
        profilesMap.set(profile.id, profile);
      });
    }

    // Transform shipments to match AdminShipment type
    const transformedShipments = (shipments || []).map((shipment: any) => {
      const profile = profilesMap.get(shipment.user_id) || {};
      return {
        id: shipment.id,
        userId: shipment.user_id,
        userEmail: profile.email || undefined,
        userName: profile.display_name || profile.username || undefined,
        cardName: shipment.card_name,
        cardTier: shipment.card_tier_name,
        cardTierName: shipment.card_tier_name,
        cardValue: `$${(shipment.card_value_cents / 100).toFixed(2)}`,
        cardImage: shipment.card_image_url || undefined,
        status: shipment.status,
        requestDate: new Date(shipment.requested_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        ),
        requestedAt: shipment.requested_at,
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimated_delivery_date
          ? new Date(shipment.estimated_delivery_date).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )
          : null,
        deliveredDate: shipment.delivered_date
          ? new Date(shipment.delivered_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          : null,
        shippingAddress: shipment.shipping_address_full,
        shippingName: shipment.shipping_name,
        shippingPhone: shipment.shipping_phone || undefined,
        adminNotes: shipment.admin_notes || undefined,
        processedAt: shipment.processed_at || undefined,
        shippedAt: shipment.shipped_at || undefined,
        createdAt: shipment.created_at,
        updatedAt: shipment.updated_at,
        inventory: shipment.user_inventory,
      };
    });

    // If search query provided, also filter by user email (post-query since it's a join)
    let filteredShipments = transformedShipments;
    if (searchQuery) {
      filteredShipments = transformedShipments.filter(
        (s) =>
          s.cardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return json({
      shipments: filteredShipments,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
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
