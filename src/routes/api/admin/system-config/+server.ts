import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * GET /api/admin/system-config?key=...
 * 
 * Returns system config value for a given key
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = url.searchParams.get("key");

  if (!key) {
    return json({ error: "key parameter is required" }, { status: 400 });
  }

  try {
    const { data, error } = await adminClient
      .from("system_config")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) {
      return json({ error: "Config not found" }, { status: 404 });
    }

    return json({ value: data.value });
  } catch (error) {
    console.error("Error fetching system config:", error);
    return json(
      { error: "Failed to fetch system config" },
      { status: 500 }
    );
  }
};
