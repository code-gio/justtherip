import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals: { supabase, safeGetSession },
}) => {
  const { session } = await safeGetSession();

  if (!session) {
    redirect(303, "/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `id, username, email, avatar_url, bio, display_name, total_packs_opened, best_pull_value_cents, profile_visibility, created_at, updated_at`
    )
    .eq("id", session.user.id)
    .single();

  return { session, profile };
};

export const actions: Actions = {
  update: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData();
    const displayName = formData.get("displayName") as string;
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    const { session } = await safeGetSession();

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      display_name: displayName || null,
      username: username || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return fail(500, {
        displayName,
        username,
        bio,
        avatarUrl,
        message: error.message,
      });
    }

    return {
      displayName,
      username,
      bio,
      avatarUrl,
    };
  },

  updateVisibility: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData();
    const profileVisibility = formData.get("profileVisibility") as string;

    const { session } = await safeGetSession();

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      profile_visibility: profileVisibility || "public",
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return fail(500, {
        profileVisibility,
        message: error.message,
      });
    }

    return { profileVisibility };
  },

  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
      await supabase.auth.signOut();
      redirect(303, "/");
    }
  },
};
