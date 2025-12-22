import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getRipBundles } from "$lib/server/rips";

/**
 * Get all active Rip bundles
 * Public endpoint - no auth required
 */
export const GET: RequestHandler = async () => {
  try {
    const bundles = await getRipBundles();

    return json({
      bundles: bundles || [],
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return json(
      {
        error: "Failed to fetch bundles",
        bundles: [],
      },
      { status: 500 }
    );
  }
};
