import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getUserRipBalance } from "$lib/server/rips";
import { getCardTiers } from "$lib/server/card-draw";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch user balance and card tiers in parallel
  const [balance, tiers] = await Promise.all([
    getUserRipBalance(user.id),
    getCardTiers(),
  ]);

  return {
    balance: balance || 0,
    tiers: tiers || [],
  };
};
