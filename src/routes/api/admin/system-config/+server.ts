import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

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

  await requireAdmin(user.id);

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

/**
 * PUT /api/admin/system-config
 * 
 * Updates system config value for a given key
 */
export const PUT: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  await requireAdmin(user.id);

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return json({ error: "key is required" }, { status: 400 });
    }

    if (value === undefined) {
      return json({ error: "value is required" }, { status: 400 });
    }

    // Check if config exists
    const { data: existing } = await adminClient
      .from("system_config")
      .select("key")
      .eq("key", key)
      .single();

    if (existing) {
      // Update existing config
      const { error } = await adminClient
        .from("system_config")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) {
        console.error("Error updating system config:", error);
        return json(
          { error: "Failed to update system config" },
          { status: 500 }
        );
      }
    } else {
      // Insert new config
      const { error } = await adminClient
        .from("system_config")
        .insert({ key, value });

      if (error) {
        console.error("Error creating system config:", error);
        return json(
          { error: "Failed to create system config" },
          { status: 500 }
        );
      }
    }

    return json({ success: true, key, value });
  } catch (error) {
    console.error("Error updating system config:", error);
    return json(
      { error: "Failed to update system config" },
      { status: 500 }
    );
  }
};
