import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  locals: { safeGetSession },
  url,
}) => {
  const { session } = await safeGetSession();
  // if the user is already logged in return them to the account page
  if (!session) {
    redirect(303, "/sign-in");
  }

  return { url: url.origin };
};
