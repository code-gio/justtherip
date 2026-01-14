import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { processProfileWithAvatar, getSignedAvatarUrl } from "$lib/server/storage";

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

  const processedProfile = await processProfileWithAvatar(supabase, profile);

  return { session, profile: processedProfile };
};

export const actions: Actions = {
  uploadAvatar: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();

    if (!session) {
      return fail(401, { message: "Unauthorized" });
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar") as File;

    if (!avatar || !avatar.size) {
      return fail(400, { message: "No file provided" });
    }

    if (!avatar.type.startsWith("image/")) {
      return fail(400, { message: "File must be an image" });
    }

    if (avatar.size > 5 * 1024 * 1024) {
      return fail(400, { message: "Image size must be less than 5MB" });
    }

    try {
      const userId = session.user.id;
      const fileExt = avatar.name.split(".").pop() || "jpg";
      const fileName = `profile_photo.${fileExt}`;
      const finalPath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(finalPath, avatar, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return fail(500, { message: uploadError.message });
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: finalPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
        return fail(500, { message: updateError.message });
      }

      const signedUrl = await getSignedAvatarUrl(supabase, finalPath);

      return { avatarUrl: signedUrl || finalPath };
    } catch (error) {
      console.error("Avatar upload error:", error);
      return fail(500, { message: "Failed to upload avatar" });
    }
  },

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

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Profile update error:", error);
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

    const { error } = await supabase
      .from("profiles")
      .update({
        profile_visibility: profileVisibility || "public",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Profile visibility update error:", error);
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
