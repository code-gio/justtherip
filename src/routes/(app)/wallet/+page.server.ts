import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getUserRipBalance, getRipBundles, getUserTransactions } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch user data in parallel
  const [balance, bundles, transactions] = await Promise.all([
    getUserRipBalance(user.id),
    getRipBundles(),
    getUserTransactions(user.id, 50),
  ]);

  return {
    balance: balance || 0,
    bundles: bundles || [],
    transactions: transactions || [],
  };
};
