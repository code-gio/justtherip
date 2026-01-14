import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ url }) => {
  // Admin check is handled by /admin/+layout.server.ts

  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  // Default to last 30 days if no dates provided
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  const defaultEndDate = new Date();

  const start = startDate || defaultStartDate.toISOString().split("T")[0];
  const end = endDate || defaultEndDate.toISOString().split("T")[0];

  // Fetch all data in parallel
  const [
    packOpeningsResult,
    packsResult,
    transactionsResult,
    stripePaymentsResult,
    profilesResult,
    inventoryResult,
  ] = await Promise.all([
    // Pack openings with date filter
    adminClient
      .from("pack_openings")
      .select("pack_id, rips_spent, total_value_cents, cards_pulled, created_at, user_id")
      .gte("created_at", start)
      .lte("created_at", `${end}T23:59:59`),
    // All packs
    adminClient.from("packs").select("id, name, slug, rip_cost, is_active"),
    // Transactions
    adminClient
      .from("rip_transactions")
      .select("type, amount, created_at, user_id")
      .gte("created_at", start)
      .lte("created_at", `${end}T23:59:59`),
    // Stripe payments
    adminClient
      .from("stripe_payments")
      .select("amount_cents, status, created_at")
      .eq("status", "succeeded")
      .gte("created_at", start)
      .lte("created_at", `${end}T23:59:59`),
    // User profiles for engagement metrics
    adminClient
      .from("profiles")
      .select("id, created_at, total_packs_opened")
      .gte("created_at", start)
      .lte("created_at", `${end}T23:59:59`),
    // Inventory for card analytics
    adminClient
      .from("user_inventory")
      .select("card_name, card_value_cents, game_code, is_sold, sellback_rips, created_at")
      .gte("created_at", start)
      .lte("created_at", `${end}T23:59:59`),
  ]);

  const packOpenings = packOpeningsResult.data || [];
  const packs = packsResult.data || [];
  const transactions = transactionsResult.data || [];
  const stripePayments = stripePaymentsResult.data || [];
  const profiles = profilesResult.data || [];
  const inventory = inventoryResult.data || [];

  // Pack Performance Analytics
  const packStats = new Map<string, {
    packId: string;
    packName: string;
    openings: number;
    totalRipsSpent: number;
    totalValueCents: number;
    avgValueCents: number;
  }>();

  packOpenings.forEach((po: any) => {
    const pack = packs.find((p: any) => p.id === po.pack_id);
    const packName = pack?.name || "Unknown Pack";
    const existing = packStats.get(po.pack_id) || {
      packId: po.pack_id,
      packName,
      openings: 0,
      totalRipsSpent: 0,
      totalValueCents: 0,
      avgValueCents: 0,
    };
    existing.openings += 1;
    existing.totalRipsSpent += po.rips_spent || 0;
    existing.totalValueCents += po.total_value_cents || 0;
    packStats.set(po.pack_id, existing);
  });

  // Calculate averages
  packStats.forEach((stat) => {
    stat.avgValueCents = stat.openings > 0
      ? stat.totalValueCents / stat.openings
      : 0;
  });

  const mostOpenedPacks = Array.from(packStats.values())
    .sort((a, b) => b.openings - a.openings)
    .slice(0, 10);

  const highestValuePacks = Array.from(packStats.values())
    .filter((p) => p.openings > 0)
    .sort((a, b) => b.avgValueCents - a.avgValueCents)
    .slice(0, 10);

  // Revenue Analytics
  const revenueByDay = new Map<string, number>();
  stripePayments.forEach((payment: any) => {
    const date = payment.created_at.split("T")[0];
    const current = revenueByDay.get(date) || 0;
    revenueByDay.set(date, current + (payment.amount_cents || 0));
  });

  const totalRevenue = stripePayments.reduce(
    (sum: number, p: any) => sum + (p.amount_cents || 0),
    0
  );
  const avgTransactionValue =
    stripePayments.length > 0 ? totalRevenue / stripePayments.length : 0;

  // Top spending users
  const userSpending = new Map<string, number>();
  stripePayments.forEach((payment: any) => {
    // Note: stripe_payments might not have user_id directly, need to check schema
    // For now, we'll use transactions for user spending
  });

  transactions
    .filter((t: any) => t.type === "purchase")
    .forEach((tx: any) => {
      const current = userSpending.get(tx.user_id) || 0;
      userSpending.set(tx.user_id, current + Math.abs(tx.amount || 0));
    });

  const topSpendingUsers = Array.from(userSpending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, amount]) => ({ userId, amount }));

  // Fetch user names for top spenders
  const topSpenderIds = topSpendingUsers.map((u) => u.userId);
  const { data: topSpenderProfiles } = await adminClient
    .from("profiles")
    .select("id, username, email, display_name")
    .in("id", topSpenderIds);

  const enrichedTopSpenders = topSpendingUsers.map((spender) => {
    const profile = topSpenderProfiles?.find((p: any) => p.id === spender.userId);
    return {
      ...spender,
      userName: profile?.display_name || profile?.username || profile?.email || "Unknown",
    };
  });

  // User Engagement
  const dailyActiveUsers = new Set<string>();
  packOpenings.forEach((po: any) => {
    dailyActiveUsers.add(po.user_id);
  });
  transactions.forEach((tx: any) => {
    dailyActiveUsers.add(tx.user_id);
  });

  const totalUsers = profiles.length;
  const activeUsers = dailyActiveUsers.size;
  const avgPacksPerUser =
    totalUsers > 0 ? packOpenings.length / totalUsers : 0;

  // Card Analytics
  const cardPullCounts = new Map<string, {
    name: string;
    count: number;
    totalValueCents: number;
    avgValueCents: number;
  }>();

  packOpenings.forEach((po: any) => {
    const cards = Array.isArray(po.cards_pulled)
      ? po.cards_pulled
      : [po.cards_pulled];
    cards.forEach((card: any) => {
      const cardName = card.card_name || "Unknown";
      const existing = cardPullCounts.get(cardName) || {
        name: cardName,
        count: 0,
        totalValueCents: 0,
        avgValueCents: 0,
      };
      existing.count += 1;
      existing.totalValueCents += card.value_cents || card.card_value_cents || 0;
      cardPullCounts.set(cardName, existing);
    });
  });

  cardPullCounts.forEach((stat) => {
    stat.avgValueCents = stat.count > 0 ? stat.totalValueCents / stat.count : 0;
  });

  const mostPulledCards = Array.from(cardPullCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const highestValueCards = Array.from(cardPullCounts.values())
    .filter((c) => c.count > 0)
    .sort((a, b) => b.avgValueCents - a.avgValueCents)
    .slice(0, 10);

  // Sellback rates
  const totalCardsPulled = inventory.length;
  const cardsSold = inventory.filter((i: any) => i.is_sold).length;
  const sellbackRate = totalCardsPulled > 0
    ? (cardsSold / totalCardsPulled) * 100
    : 0;

  return {
    packPerformance: {
      mostOpened: mostOpenedPacks,
      highestValue: highestValuePacks,
    },
    revenue: {
      total: totalRevenue,
      avgTransaction: avgTransactionValue,
      byDay: Array.from(revenueByDay.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      topSpenders: enrichedTopSpenders,
    },
    userEngagement: {
      totalUsers,
      activeUsers,
      avgPacksPerUser,
    },
    cardAnalytics: {
      mostPulled: mostPulledCards,
      highestValue: highestValueCards,
      sellbackRate,
      totalPulled: totalCardsPulled,
      totalSold: cardsSold,
    },
    dateRange: {
      start,
      end,
    },
  };
};
