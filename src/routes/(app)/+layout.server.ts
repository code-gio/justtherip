import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { getUserRipBalance } from "$lib/server/rips";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase },
  url,
}) => {
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    redirect(303, "/sign-in");
  }

  // Fetch user profile, balance, and tiers in parallel
  const [profileResult, ripBalance] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getUserRipBalance(user.id),
  ]);

  return {
    url: url.origin,
    profile: profileResult.data,
    ripBalance: ripBalance ?? 0,
  };
};
