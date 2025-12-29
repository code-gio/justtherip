import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";
import { getUserRipBalance } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch active packs
  const [packsResult, balance] = await Promise.all([
    adminClient
      .from("packs")
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        game_code,
        rip_cost,
        total_openings,
        created_at
      `)
      .eq("is_active", true)
      .order("total_openings", { ascending: false }),
    getUserRipBalance(user.id),
  ]);

  // Fetch pack tiers for all packs
  const packIds = (packsResult.data || []).map((p: any) => p.id);
  let packTiersMap: Record<string, any[]> = {};

  if (packIds.length > 0) {
    const { data: packTiersData, error: packTiersError } = await adminClient
      .from("pack_tiers")
      .select(`
        pack_id,
        probability,
        card_tiers!inner(
          id,
          name,
          min_value_cents,
          max_value_cents
        )
      `)
      .in("pack_id", packIds)
      .order("display_order", { ascending: true });

    if (packTiersError) {
      console.error("Error fetching pack tiers:", packTiersError);
    }

    // Group tiers by pack_id
    (packTiersData || []).forEach((pt: any) => {
      if (!packTiersMap[pt.pack_id]) {
        packTiersMap[pt.pack_id] = [];
      }
      packTiersMap[pt.pack_id].push(pt);
    });
  }

  if (packsResult.error) {
    console.error("Error fetching packs:", packsResult.error);
    return {
      packs: [],
      balance: balance || 0,
    };
  }

  // Map database packs to Pack type
  const packs = (packsResult.data || []).map((pack: any) => {
    const packTiers = packTiersMap[pack.id] || [];

    // Build odds array from pack_tiers
    const odds = packTiers
      .filter((pt: any) => pt.probability > 0 && pt.card_tiers)
      .map((pt: any) => {
        const tier = pt.card_tiers;
        return {
          tier: tier.name,
          chance: pt.probability * 100,
          color: getTierColor(tier.name),
        };
      });

    // Calculate EV from tier probabilities
    const ev = packTiers.reduce((sum: number, pt: any) => {
      if (!pt.card_tiers || pt.probability <= 0) return sum;

      const minValue = pt.card_tiers.min_value_cents / 100;
      const maxValue = pt.card_tiers.max_value_cents / 100;
      const avgValue = (minValue + maxValue) / 2;
      return sum + (avgValue * pt.probability * 100) / 100;
    }, 0);

    // Get default gradient based on game or pack name
    const gradient = getPackGradient(pack.game_code, pack.name);

    // Get default icon (we'll use a generic one for now)
    const icon = null; // Will be handled in component

    return {
      id: pack.id,
      name: pack.name,
      set: pack.game_code?.toUpperCase() || "Unknown",
      price: pack.rip_cost,
      ev: ev,
      image: pack.image_url || null, // Use actual image URL or null
      description: pack.description || null,
      gradient,
      icon,
      featured: pack.total_openings > 10000, // Featured if popular
      hot: pack.total_openings > 5000, // Hot if moderately popular
      new: isNewPack(pack.created_at), // New if created in last 30 days
      odds,
      totalOpened: pack.total_openings || 0,
    };
  }); // Show all active packs, even if they don't have tiers configured yet

  return {
    packs,
    balance: balance || 0,
  };
};

function getTierColor(tierName: string): string {
  const colors: Record<string, string> = {
    Trash: "bg-slate-400",
    Low: "bg-emerald-500",
    Mid: "bg-blue-500",
    High: "bg-purple-500",
    Chase: "bg-amber-500",
    "Ultra Chase": "bg-rose-500",
  };
  return colors[tierName] || "bg-gray-400";
}

function getPackGradient(gameCode: string | null, packName: string): string {
  // Default gradients based on game or pack name
  const gradients: Record<string, string> = {
    mtg: "from-blue-500 via-indigo-500 to-purple-500",
    pokemon: "from-yellow-400 via-orange-500 to-red-500",
  };

  if (gameCode && gradients[gameCode]) {
    return gradients[gameCode];
  }

  // Default gradient
  return "from-violet-500 via-fuchsia-500 to-pink-500";
}

function isNewPack(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}
