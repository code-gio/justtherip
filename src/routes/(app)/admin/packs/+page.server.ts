import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

export const load: PageServerLoad = async ({ locals }) => {
  // Admin check is handled by /admin/+layout.server.ts
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Fetch packs and games in parallel using admin client to bypass RLS
  const [packsResult, gamesResult] = await Promise.all([
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
        is_active,
        total_openings
      `)
      .order("created_at", { ascending: false }),
    adminClient
      .from("games")
      .select("id, name, code")
      .order("name"),
  ]);

  if (packsResult.error) {
    console.error("Error fetching packs:", packsResult.error);
  }

  if (gamesResult.error) {
    console.error("Error fetching games:", gamesResult.error);
  }

  // Map packs to include game info
  const packsWithGames = (packsResult.data || []).map(pack => {
    const game = gamesResult.data?.find(g => g.code === pack.game_code);
    return {
      ...pack,
      game: game ? { name: game.name, code: game.code } : null,
    };
  });

  return {
    packs: packsWithGames,
    games: gamesResult.data || [],
  };
};

export const actions = {
  create: async ({ request, locals }) => {
    console.log("Create pack request received");
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return fail(401, { success: false, error: "Unauthorized" });
    }

    // Check if user is admin
    try {
      await requireAdmin(user.id);
    } catch (err) {
      return fail(403, { success: false, error: "Forbidden: Admin access required" });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const game_code = formData.get("game_code") as string;

    // Validate required fields
    if (!name || !slug || !game_code) {
      return fail(400, {
        success: false,
        error: "Missing required fields: name, slug, or game_code",
      });
    }

    // Insert pack using admin client to bypass RLS
    const { data: pack, error } = await adminClient
      .from("packs")
      .insert({
        name,
        slug,
        game_code,
        rip_cost: 1, // default
        is_active: false, // draft
        total_openings: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating pack:", error);
      return fail(500, { success: false, error: error.message });
    }

    return { success: true, packId: pack.id };
  },
  delete: async ({ request, locals }) => {
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return fail(401, { success: false, error: "Unauthorized" });
    }

    // Check if user is admin
    try {
      await requireAdmin(user.id);
    } catch (err) {
      return fail(403, { success: false, error: "Forbidden: Admin access required" });
    }

    const formData = await request.formData();
    const packId = formData.get("id") as string | null;
    if (!packId) {
      return fail(400, { success: false, error: "ID is required" });
    }

    const { error } = await adminClient.from("packs").delete().eq("id", packId);

    if (error) {
      console.error("Error deleting pack:", error);
      return fail(500, { success: false, error: error.message });
    }

    return { success: true, message: "Pack deleted successfully" };
  },
  toggleActive: async ({ request, locals }) => {
    const { session, user } = await locals.safeGetSession();
    if (!session || !user) {
      return fail(401, { success: false, error: "Unauthorized" });
    }
    try {
      await requireAdmin(user.id);
    } catch (err) {
      return fail(403, { success: false, error: "Forbidden: Admin access required" });
    }

    const formData = await request.formData();
    const packId = formData.get("id") as string | null;
    const isActiveRaw = formData.get("is_active");
    if (!packId || isActiveRaw === null || isActiveRaw === undefined) {
      return fail(400, { success: false, error: "ID and is_active are required" });
    }
    const is_active = isActiveRaw === "true" || isActiveRaw === "1";

    const { error } = await adminClient
      .from("packs")
      .update({ is_active: !is_active })
      .eq("id", packId);

    if (error) {
      console.error("Error toggling pack active status:", error);
      return fail(500, { success: false, error: error.message });
    }
    return { success: true };
  },
} satisfies Actions;
