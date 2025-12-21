import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch user balance
  const balance = await getUserRipBalance(user.id);

  return {
    balance: balance || 0,
  };
};
