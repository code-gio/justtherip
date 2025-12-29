import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // TODO: Check if user is admin
  // const { data: profile } = await locals.supabase
  //   .from('profiles')
  //   .select('is_admin')
  //   .eq('id', user.id)
  //   .single()
  //
  // if (!profile?.is_admin) {
  //   throw redirect(303, '/')
  // }

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
        total_openings,
        created_at
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
    const { session, user } = await locals.safeGetSession();

    if (!session || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const game_code = formData.get("game_code") as string;

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
      return { success: false, error: error.message };
    }

    return { success: true, packId: pack.id };
  },
} satisfies Actions;
