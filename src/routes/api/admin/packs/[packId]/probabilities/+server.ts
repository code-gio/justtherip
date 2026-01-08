import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { calculatePackCardProbabilities } from "$lib/server/card-draw";

/**
 * GET /api/admin/packs/[packId]/probabilities
 * 
 * Returns calculated probabilities for all cards in a pack
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const packId = params.packId;

  if (!packId) {
    return json({ error: "packId is required" }, { status: 400 });
  }

  try {
    const probabilities = await calculatePackCardProbabilities(packId);
    return json({ probabilities });
  } catch (error) {
    console.error("Error calculating probabilities:", error);
    return json(
      { error: "Failed to calculate probabilities" },
      { status: 500 }
    );
  }
};
