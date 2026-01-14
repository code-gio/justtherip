import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient, getUserRipBalance } from "$lib/server/rips";
import type { UserWithStats } from "$lib/components/admin/users/types";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Admin check is handled by /admin/+layout.server.ts

  // Fetch all profiles
  const profilesResult = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesResult.error) {
    console.error("Error fetching profiles:", profilesResult.error);
    return {
      users: [] as UserWithStats[],
    };
  }

  const profiles = profilesResult.data || [];

  // Fetch inventory stats for all users in batch
  const inventoryStatsResult = await adminClient
    .from("user_inventory")
    .select("user_id, card_value_cents, is_sold")
    .eq("is_sold", false);

  // Fetch transaction stats for all users
  // Get latest balance and transaction totals per user
  const transactionsResult = await adminClient
    .from("rip_transactions")
    .select("user_id, amount, type, balance_after, created_at")
    .order("created_at", { ascending: false });

  // Process inventory stats
  const inventoryStats = new Map<string, { count: number; value: number }>();
  if (inventoryStatsResult.data) {
    for (const item of inventoryStatsResult.data) {
      const existing = inventoryStats.get(item.user_id) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += item.card_value_cents || 0;
      inventoryStats.set(item.user_id, existing);
    }
  }

  // Process transaction stats
  const latestBalances = new Map<string, number>();
  const totalPurchased = new Map<string, number>();
  const totalSpent = new Map<string, number>();

  if (transactionsResult.data) {
    for (const tx of transactionsResult.data) {
      // Track latest balance per user
      if (!latestBalances.has(tx.user_id)) {
        latestBalances.set(tx.user_id, tx.balance_after || 0);
      }

      // Track totals
      if (tx.type === "purchase") {
        const current = totalPurchased.get(tx.user_id) || 0;
        totalPurchased.set(tx.user_id, current + Math.abs(tx.amount || 0));
      } else if (tx.type === "pack_open") {
        const current = totalSpent.get(tx.user_id) || 0;
        totalSpent.set(tx.user_id, current + Math.abs(tx.amount || 0));
      }
    }
  }

  // Combine all data into UserWithStats array
  const usersWithStats: UserWithStats[] = profiles.map((profile) => {
    const inventory = inventoryStats.get(profile.id) || { count: 0, value: 0 };
    const balance = latestBalances.get(profile.id) || 0;
    const purchased = totalPurchased.get(profile.id) || 0;
    const spent = totalSpent.get(profile.id) || 0;

    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      display_name: profile.display_name,
      total_packs_opened: profile.total_packs_opened || 0,
      best_pull_value_cents: profile.best_pull_value_cents || 0,
      profile_visibility: profile.profile_visibility || "public",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      stripe_customer_id: profile.stripe_customer_id,
      is_admin: profile.is_admin || false,
      inventory_card_count: inventory.count,
      inventory_value_cents: inventory.value,
      current_balance: balance,
      total_purchased: purchased,
      total_spent: spent,
    };
  });

  return {
    users: usersWithStats,
  };
};
