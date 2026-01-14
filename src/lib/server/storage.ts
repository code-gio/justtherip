import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSignedAvatarUrl(
  supabase: SupabaseClient,
  avatarPath: string | null
): Promise<string | null> {
  if (!avatarPath) return null;

  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, 3600);

  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }

  return data?.signedUrl || null;
}

export async function processProfileWithAvatar<
  T extends { avatar_url: string | null }
>(supabase: SupabaseClient, profile: T | null): Promise<T | null> {
  if (!profile || !profile.avatar_url) return profile;

  const signedUrl = await getSignedAvatarUrl(supabase, profile.avatar_url);

  return {
    ...profile,
    avatar_url: signedUrl,
  };
}

export async function processProfilesWithAvatars<
  T extends { avatar_url: string | null }
>(supabase: SupabaseClient, profiles: T[]): Promise<T[]> {
  return Promise.all(
    profiles.map(async (profile) => {
      if (!profile.avatar_url || profile.avatar_url.startsWith("http")) {
        return profile;
      }

      const signedUrl = await getSignedAvatarUrl(supabase, profile.avatar_url);

      return {
        ...profile,
        avatar_url: signedUrl,
      };
    })
  );
}
