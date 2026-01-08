import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { deleteMediaAsset, getMediaAsset } from "$lib/server/media";

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const asset = await getMediaAsset(params.id);

    if (!asset) {
      return json({ error: "Asset not found" }, { status: 404 });
    }

    return json({ asset });
  } catch (error) {
    console.error("Error fetching media asset:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch asset",
      },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteMediaAsset(params.id);

    if (!result.success) {
      return json({ error: result.error || result.message }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting media asset:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete asset",
      },
      { status: 500 }
    );
  }
};
