import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession, supabase },
  url,
}) => {
  const { session, user } = await safeGetSession();

  if (!session || !user) {
    redirect(303, "/sign-in");
  }

  // Fetch user profile from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log(profile);
  return {
    url: url.origin,
    profile,
  };
};
