import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Admin Shipments Purchase Options API Endpoint
 *
 * GET /api/admin/shipments/purchase-options
 *
 * Returns the purchase options for a shipment
 * Query params:
 * - shipment_id: the id of the shipment
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    try {
        const { session, user } = await locals.safeGetSession();

        if (!session || !user) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check admin access
        await requireAdmin(user.id);

        const gameCode = url.searchParams.get("game_code");
        const cardName = url.searchParams.get("card_name");


        const tableName = `tcg_${gameCode}_products`;

        let query = adminClient
            .from(tableName)
            .select("*")
            .limit(50);

        if (cardName) {
            query = query.ilike("name", `%${cardName}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching purchase options:", error);
            return json({ error: "Failed to fetch purchase options" }, { status: 500 });
        }



        return json({
            purchaseOptions: data,
            total: data?.length,
        });

    } catch (error) {
        console.error("Error fetching shipments:", error);
        if (error && typeof error === "object" && "status" in error) {
            throw error;
        }
        return json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
};
