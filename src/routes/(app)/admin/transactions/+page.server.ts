import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ url }) => {
  // Admin check is handled by /admin/+layout.server.ts

  const typeFilter = url.searchParams.get("type") || "all";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  // Date range filters (optional)
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const userSearch = url.searchParams.get("user") || "";

  // Build query
  let query = adminClient
    .from("rip_transactions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply type filter
  if (typeFilter && typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  // Apply date filters
  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: transactions, error, count } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      total: 0,
      page: 1,
      limit,
      hasMore: false,
      stats: {
        totalRevenue: 0,
        totalSpent: 0,
        totalTransactions: 0,
      },
    };
  }

  // Fetch user profiles for transactions
  const userIds = [
    ...new Set((transactions || []).map((t: any) => t.user_id)),
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

  // Transform transactions
  const transformedTransactions = (transactions || []).map((tx: any) => {
    const profile = profilesMap.get(tx.user_id) || {};
    return {
      id: tx.id,
      userId: tx.user_id,
      userName: profile.display_name || profile.username || profile.email || "Unknown",
      userEmail: profile.email,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balance_after,
      reason: tx.reason,
      metadata: tx.metadata || {},
      createdAt: tx.created_at,
      formattedDate: new Date(tx.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  // Filter by user search if provided
  let filteredTransactions = transformedTransactions;
  if (userSearch) {
    const searchLower = userSearch.toLowerCase();
    filteredTransactions = transformedTransactions.filter(
      (t) =>
        t.userName.toLowerCase().includes(searchLower) ||
        t.userEmail?.toLowerCase().includes(searchLower)
    );
  }

  // Calculate aggregate stats (from all transactions, not just filtered)
  const allTransactionsResult = await adminClient
    .from("rip_transactions")
    .select("type, amount");

  const allTransactions = allTransactionsResult.data || [];
  const totalRevenue = allTransactions
    .filter((t: any) => t.type === "purchase")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
  const totalSpent = allTransactions
    .filter((t: any) => t.type === "pack_open")
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);

  return {
    transactions: filteredTransactions,
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
    stats: {
      totalRevenue,
      totalSpent,
      totalTransactions: count || 0,
    },
  };
};
