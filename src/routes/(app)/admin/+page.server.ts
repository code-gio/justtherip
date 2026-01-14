import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async () => {
  // Admin check is handled by /admin/+layout.server.ts

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch all data in parallel
  const [
    profilesResult,
    packOpeningsResult,
    transactionsResult,
    stripePaymentsResult,
    shipmentsResult,
    recentPackOpeningsResult,
    recentTransactionsResult,
    recentShipmentsResult,
    recentSignupsResult,
  ] = await Promise.all([
    // Total users
    adminClient.from("profiles").select("id, created_at", { count: "exact" }),
    // Total packs opened
    adminClient
      .from("pack_openings")
      .select("id, rips_spent, created_at", { count: "exact" }),
    // Total Jewels spent (pack opens)
    adminClient
      .from("rip_transactions")
      .select("amount, type, created_at")
      .eq("type", "pack_open"),
    // Total revenue (succeeded Stripe payments)
    adminClient
      .from("stripe_payments")
      .select("amount_cents, status, created_at")
      .eq("status", "succeeded"),
    // Pending fulfillments
    adminClient
      .from("shipments")
      .select("id, status")
      .in("status", ["pending", "processing"]),
    // Recent pack openings (last 20)
    adminClient
      .from("pack_openings")
      .select(
        "id, user_id, pack_id, rips_spent, total_value_cents, cards_pulled, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(20),
    // Recent transactions (last 20)
    adminClient
      .from("rip_transactions")
      .select("id, user_id, type, amount, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    // Recent shipments (last 20)
    adminClient
      .from("shipments")
      .select("id, user_id, status, card_name, requested_at")
      .order("requested_at", { ascending: false })
      .limit(20),
    // Recent signups (last 20)
    adminClient
      .from("profiles")
      .select("id, username, email, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  // Calculate KPIs
  const totalUsers = profilesResult.count || 0;
  const totalPacksOpened = packOpeningsResult.count || 0;

  // Calculate active users (7d and 30d)
  const packOpenings = packOpeningsResult.data || [];
  const transactions = transactionsResult.data || [];
  const allUserActivity = new Set<string>();

  // Get unique users from pack openings and transactions in last 30 days
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  packOpenings.forEach((po: any) => {
    if (new Date(po.created_at) >= thirtyDaysAgo) {
      allUserActivity.add(po.user_id);
    }
  });

  transactions.forEach((tx: any) => {
    if (new Date(tx.created_at) >= thirtyDaysAgo) {
      allUserActivity.add(tx.user_id);
    }
  });

  const activeUsers30d = allUserActivity.size;

  // Calculate 7d active users
  const activeUsers7d = new Set<string>();
  packOpenings.forEach((po: any) => {
    if (new Date(po.created_at) >= sevenDaysAgo) {
      activeUsers7d.add(po.user_id);
    }
  });
  transactions.forEach((tx: any) => {
    if (new Date(tx.created_at) >= sevenDaysAgo) {
      activeUsers7d.add(tx.user_id);
    }
  });

  // Calculate total Jewels spent
  const totalJewelsSpent = transactions.reduce(
    (sum: number, tx: any) => sum + Math.abs(tx.amount || 0),
    0
  );

  // Calculate total revenue
  const stripePayments = stripePaymentsResult.data || [];
  const totalRevenue = stripePayments.reduce(
    (sum: number, payment: any) => sum + (payment.amount_cents || 0),
    0
  );

  // Pending fulfillments
  const pendingFulfillments = shipmentsResult.data?.length || 0;

  // Build recent activity feed
  const recentActivity: any[] = [];

  // Add recent pack openings
  const recentPackOpenings = recentPackOpeningsResult.data || [];
  recentPackOpenings.forEach((po: any) => {
    const cards = Array.isArray(po.cards_pulled)
      ? po.cards_pulled
      : [po.cards_pulled];
    const topCard = cards[0];
    recentActivity.push({
      id: `pack-${po.id}`,
      type: "pack_open",
      userId: po.user_id,
      description: `Opened pack${topCard?.card_name ? ` and pulled ${topCard.card_name}` : ""}`,
      value: `$${((po.total_value_cents || 0) / 100).toFixed(2)}`,
      timestamp: po.created_at,
    });
  });

  // Add recent purchases
  const recentTransactions = recentTransactionsResult.data || [];
  recentTransactions
    .filter((tx: any) => tx.type === "purchase")
    .forEach((tx: any) => {
      recentActivity.push({
        id: `tx-${tx.id}`,
        type: "purchase",
        userId: tx.user_id,
        description: `Purchased ${tx.amount} Jewels`,
        value: `$${((Math.abs(tx.amount) * 100) / 100).toFixed(2)}`,
        timestamp: tx.created_at,
      });
    });

  // Add recent shipments
  const recentShipments = recentShipmentsResult.data || [];
  recentShipments.forEach((shipment: any) => {
    recentActivity.push({
      id: `shipment-${shipment.id}`,
      type: "shipment",
      userId: shipment.user_id,
      description: `Shipment ${shipment.status}: ${shipment.card_name}`,
      value: null,
      timestamp: shipment.requested_at,
    });
  });

  // Add recent signups
  const recentSignups = recentSignupsResult.data || [];
  recentSignups.forEach((profile: any) => {
    recentActivity.push({
      id: `signup-${profile.id}`,
      type: "signup",
      userId: profile.id,
      description: `New user: ${profile.username || profile.email}`,
      value: null,
      timestamp: profile.created_at,
    });
  });

  // Sort by timestamp (most recent first) and limit to 20
  recentActivity.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const limitedActivity = recentActivity.slice(0, 20);

  // Fetch user info for activity items
  const userIds = [
    ...new Set(limitedActivity.map((a) => a.userId).filter(Boolean)),
  ];
  const profilesMap = new Map<string, any>();
  if (userIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username, email, display_name")
      .in("id", userIds);

    (profiles || []).forEach((profile: any) => {
      profilesMap.set(profile.id, profile);
    });
  }

  // Enrich activity with user info
  const enrichedActivity = limitedActivity.map((activity) => {
    const profile = profilesMap.get(activity.userId) || {};
    return {
      ...activity,
      userName: profile.display_name || profile.username || profile.email || "Unknown",
    };
  });

  // Time-series data for charts (last 30 days)
  const timeSeriesData = {
    signups: [] as { date: string; count: number }[],
    packOpenings: [] as { date: string; count: number }[],
    revenue: [] as { date: string; amount: number }[],
  };

  // Generate date range for last 30 days
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  // Count signups per day
  const profiles = profilesResult.data || [];
  dates.forEach((date) => {
    const count = profiles.filter(
      (p: any) => p.created_at?.split("T")[0] === date
    ).length;
    timeSeriesData.signups.push({ date, count });
  });

  // Count pack openings per day
  dates.forEach((date) => {
    const count = packOpenings.filter(
      (po: any) => po.created_at?.split("T")[0] === date
    ).length;
    timeSeriesData.packOpenings.push({ date, count });
  });

  // Calculate revenue per day
  dates.forEach((date) => {
    const amount = stripePayments
      .filter((p: any) => p.created_at?.split("T")[0] === date)
      .reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
    timeSeriesData.revenue.push({ date, amount });
  });

  return {
    kpis: {
      totalUsers,
      activeUsers7d: activeUsers7d.size,
      activeUsers30d,
      totalPacksOpened,
      totalJewelsSpent,
      totalRevenue,
      pendingFulfillments,
    },
    recentActivity: enrichedActivity,
    timeSeriesData,
  };
};
