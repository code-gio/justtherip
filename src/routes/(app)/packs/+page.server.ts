import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch active packs and balance
  const [packsResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select(`
        id,
        name,
        image_url,
        rip_cost
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    getUserRipBalance(user.id),
  ]);

  if (packsResult.error) {
    console.error("Error fetching packs:", packsResult.error);
    return {
      packs: [],
      balance: balance || 0,
    };
  }

  // Map database packs to simple format
  const packs = (packsResult.data || []).map((pack: any) => ({
    id: pack.id,
    name: pack.name,
    image: pack.image_url || null,
    price: pack.rip_cost,
  }));

  return {
    packs,
    balance: balance || 0,
  };
};
