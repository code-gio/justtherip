import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";

/**
 * User Inventory API Endpoint
 *
 * GET /api/inventory
 *
 * Returns the authenticated user's card inventory with:
 * - All owned cards (not sold)
 * - Total inventory value
 * - Card count by tier
 */

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional pagination
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    // Build query - show all cards that aren't sold (including shipped ones for visibility)
    let query = adminClient
      .from("user_inventory")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("is_sold", false)
      .order("created_at", { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data: cards, error, count } = await query;

    if (error) {
      console.error("Error fetching inventory:", error);
      return json(
        { error: "Failed to fetch inventory" },
        { status: 500 }
      );
    }

    // Calculate total inventory value
    const totalValueCents =
      cards?.reduce(
        (sum: number, card: any) => sum + (card.card_value_cents || 0),
        0
      ) || 0;

    return json({
      cards: cards || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
      stats: {
        total_cards: count || 0,
        total_value_cents: totalValueCents,
        total_value_usd: (totalValueCents / 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error in inventory endpoint:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
