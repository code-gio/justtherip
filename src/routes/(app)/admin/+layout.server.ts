import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { requireAdmin } from "$lib/server/auth";

export const load: LayoutServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    throw redirect(303, "/sign-in");
  }

  // Check if user is admin - protects all routes under /admin
  await requireAdmin(user.id);
};
