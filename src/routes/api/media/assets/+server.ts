import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getMediaAssets } from "$lib/server/media";

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const folderIdParam = url.searchParams.get("folderId");

    const folderId = folderIdParam === "null" ? null : folderIdParam;
    const assets = await getMediaAssets(session.user.id, folderId);

    return json({ assets });
  } catch (error) {
    console.error("Error fetching media assets:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch assets",
      },
      { status: 500 }
    );
  }
};
