import { error } from "@sveltejs/kit";
import { adminClient } from "./rips";

/**
 * Require that the user is an admin. Throws a 403 error if not.
 * @param userId - The user ID to check
 * @throws {HttpError} 403 Forbidden if user is not an admin
 */
export async function requireAdmin(userId: string): Promise<void> {
  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    throw error(403, "Forbidden: Admin access required");
  }
}
