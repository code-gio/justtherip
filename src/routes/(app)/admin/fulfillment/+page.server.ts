import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ url }) => {
  // Admin check is handled by /admin/+layout.server.ts
  
  const statusFilter = url.searchParams.get("status") || "all";
  const searchQuery = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query - fetch shipments first
  let query = adminClient
    .from("shipments")
    .select("*", { count: "exact" })
    .order("requested_at", { ascending: false });

  // Apply filters
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: shipments, error, count } = await query;

  if (error) {
    console.error("Error fetching shipments:", error);
    return {
      shipments: [],
      total: 0,
      page: 1,
      limit,
      hasMore: false,
    };
  }

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

  // Transform shipments
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
      requestDate: new Date(shipment.requested_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      requestedAt: shipment.requested_at,
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
      shippingName: shipment.shipping_name,
      shippingPhone: shipment.shipping_phone || undefined,
      adminNotes: shipment.admin_notes || undefined,
      processedAt: shipment.processed_at || undefined,
      shippedAt: shipment.shipped_at || undefined,
      createdAt: shipment.created_at,
      updatedAt: shipment.updated_at,
    };
  });

  // Filter by search query if provided (post-query since it's a join)
  let filteredShipments = transformedShipments;
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    filteredShipments = transformedShipments.filter(
      (s) =>
        s.cardName.toLowerCase().includes(queryLower) ||
        s.trackingNumber?.toLowerCase().includes(queryLower) ||
        s.userEmail?.toLowerCase().includes(queryLower)
    );
  }

  return {
    shipments: filteredShipments,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  };
};
