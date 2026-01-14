import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { adminClient } from "$lib/server/rips";
import { requireAdmin } from "$lib/server/auth";

export const GET: RequestHandler = async ({ locals, params }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    try {
      await requireAdmin(user.id);
    } catch (err) {
      return json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId } = params;

    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from("rip_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching transactions:", error);
      return json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    return json({ transactions: data || [] });
  } catch (error) {
    console.error("Error in transactions endpoint:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
