import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { uploadMedia } from "$lib/server/media";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { session } = await locals.safeGetSession();

    if (!session?.user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;
    const breadcrumbsStr = formData.get("breadcrumbs") as string | null;
    const tagsStr = formData.get("tags") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return json({ error: "Missing required field: file" }, { status: 400 });
    }

    const breadcrumbs = breadcrumbsStr ? JSON.parse(breadcrumbsStr) : [];
    const tags = tagsStr ? JSON.parse(tagsStr) : [];

    const result = await uploadMedia({
      file,
      userId: session.user.id,
      folderId: folderId || null,
      breadcrumbs,
      tags,
      description: description || undefined,
    });

    if (!result.success) {
      return json({ error: result.error || result.message }, { status: 500 });
    }

    return json({
      success: true,
      asset: result?.asset || null,
    });
  } catch (error) {
    console.error("Error in upload handler:", error);
    return json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
};
