import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAssetCountForFolder } from "$lib/server/media";

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const folderId = url.searchParams.get("folderId");

    if (!folderId) {
      return json({ error: "Missing folderId parameter" }, { status: 400 });
    }

    const count = await getAssetCountForFolder(folderId);

    return json({ count });
  } catch (error) {
    console.error("Error counting assets:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to count assets",
      },
      { status: 500 }
    );
  }
};
