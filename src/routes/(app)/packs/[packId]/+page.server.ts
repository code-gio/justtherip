import { redirect, error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  const packId = params.packId;

  // Fetch pack data, pack tiers, and card tiers in parallel
  const [packResult, packTiersResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("is_active", true)
      .single(),
    adminClient
      .from("pack_tiers")
      .select("*, card_tiers!inner(*)")
      .eq("pack_id", packId)
      .order("display_order", { ascending: true }),
    getUserRipBalance(user.id),
  ]);

  if (packResult.error || !packResult.data) {
    throw error(404, "Pack not found");
  }

  const pack = packResult.data;
  const packTiers = packTiersResult.data || [];

  // Build odds array from pack_tiers
  const odds = packTiers
    .filter((pt) => pt.probability > 0 && pt.card_tiers)
    .map((pt: any) => {
      const tier = pt.card_tiers;
      if (!tier) return null;

      return {
        tier_id: tier.id,
        tier_name: tier.name,
        chance: pt.probability * 100,
        min_value: tier.min_value_cents / 100,
        max_value: tier.max_value_cents / 100,
        value_range: `$${(tier.min_value_cents / 100).toFixed(2)} - $${(tier.max_value_cents / 100).toFixed(2)}`,
      };
    })
    .filter((o) => o !== null);

  return {
    pack: {
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      image_url: pack.image_url,
      game_code: pack.game_code,
      rip_cost: pack.rip_cost,
      total_openings: pack.total_openings || 0,
      odds,
    },
    balance: balance || 0,
  };
};

