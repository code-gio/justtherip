import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getFolders, createFolder } from "$lib/server/media";

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const parentIdParam = url.searchParams.get("parentId");

    const parentId = parentIdParam === "null" ? null : parentIdParam;
    const folders = await getFolders(session.user.id, parentId);

    return json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch folders",
      },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId, breadcrumbs } = body;

    if (!name) {
      return json({ error: "Missing required field: name" }, { status: 400 });
    }

    const result = await createFolder({
      userId: session.user.id,
      name,
      parentId: parentId || null,
      breadcrumbs: breadcrumbs || [],
    });

    if (!result.success) {
      return json({ error: result.error || result.message }, { status: 500 });
    }

    return json({
      success: true,
      folder: result.folder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create folder",
      },
      { status: 500 }
    );
  }
};
