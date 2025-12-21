import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getRipBundles, getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch bundles and user balance in parallel
  const [bundles, balance] = await Promise.all([
    getRipBundles(),
    getUserRipBalance(user.id),
  ]);

  return {
    bundles: bundles || [],
    balance: balance || 0,
  };
};
