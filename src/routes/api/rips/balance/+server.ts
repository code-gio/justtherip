import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getUserRipBalance } from "$lib/server/rips";

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const { user } = await locals.safeGetSession();

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await getUserRipBalance(user.id);

    if (balance === null) {
      return json(
        { error: "Failed to fetch balance" },
        { status: 500 }
      );
    }

    return json({
      balance,
      user_id: user.id,
    });
  } catch (error) {
    console.error("Error fetching Rip balance:", error);
    return json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};
