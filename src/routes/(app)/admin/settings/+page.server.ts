import type { PageServerLoad } from "./$types";
import { adminClient } from "$lib/server/rips";

export const load: PageServerLoad = async () => {
  // Admin check is handled by /admin/+layout.server.ts

  const { data: configs, error } = await adminClient
    .from("system_config")
    .select("key, value, description, updated_at")
    .order("key", { ascending: true });

  if (error) {
    console.error("Error fetching system config:", error);
    return {
      configs: [],
    };
  }

  return {
    configs: configs || [],
  };
};
