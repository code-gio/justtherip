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

  const list = configs || [];
  if (!list.some((c: { key: string }) => c.key === "carousel_min_value_usd")) {
    list.push({
      key: "carousel_min_value_usd",
      value: 0,
      description:
        "Minimum card value in USD to show in the home carousel. 0 = show all.",
      updated_at: new Date().toISOString(),
    });
    list.sort((a: { key: string }, b: { key: string }) =>
      a.key.localeCompare(b.key)
    );
  }

  return {
    configs: list,
  };
};
