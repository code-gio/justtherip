import { adminClient } from "./rips";
import type {
  MediaAsset,
  MediaFolder,
  MediaBreadcrumb,
} from "$lib/types/media";

export interface UploadMediaResult {
  success: boolean;
  message: string;
  asset?: MediaAsset;
  error?: string;
}

export interface CreateFolderResult {
  success: boolean;
  message: string;
  folder?: MediaFolder;
  error?: string;
}

export interface DeleteMediaResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Upload file to Supabase Storage and create media record
 */
export async function uploadMedia({
  file,
  userId,
  folderId = null,
  breadcrumbs = [],
  tags = [],
  description,
}: {
  file: File;
  userId: string;
  folderId?: string | null;
  breadcrumbs?: MediaBreadcrumb[];
  tags?: string[];
  description?: string;
}): Promise<UploadMediaResult> {
  try {
    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() || "";
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${userId}/${timestamp}-${randomId}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("media")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return {
        success: false,
        message: "Failed to upload file to storage",
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from("media")
      .getPublicUrl(storagePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        message: "Failed to get public URL for uploaded file",
        error: "No public URL returned",
      };
    }

    // Prepare media asset data
    const mediaAsset = {
      user_id: userId,
      folder_id: folderId,
      breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : null,
      storage_path: storagePath,
      url: urlData.publicUrl,
      original_name: file.name,
      mime_type: file.type,
      file_extension: fileExtension,
      size: file.size,
      tags: tags.length > 0 ? tags : null,
      description: description || null,
    };

    // Insert media record into database
    // const { data: dbData, error: dbError } = await adminClient
    //   .from("media_assets")
    //   .insert(mediaAsset)
    //   .select()
    //   .single();

    // if (dbError) {
    //   console.error("Error creating media record:", dbError);

    //   // Cleanup: Delete uploaded file if database insert fails
    //   await adminClient.storage.from("media").remove([storagePath]);

    //   return {
    //     success: false,
    //     message: "Failed to create media record in database",
    //     error: dbError.message,
    //   };
    // }

    // Map database response to MediaAsset type
    // const asset: MediaAsset = {
    //   id: dbData.id,
    //   userId: dbData.user_id,
    //   folderId: dbData.folder_id,
    //   breadcrumbs: dbData.breadcrumbs || [],
    //   storagePath: dbData.storage_path,
    //   url: dbData.url,
    //   thumbnailURL: dbData.thumbnail_url,
    //   originalName: dbData.original_name,
    //   mimeType: dbData.mime_type,
    //   fileExtension: dbData.file_extension,
    //   size: dbData.size,
    //   width: dbData.width,
    //   height: dbData.height,
    //   uploadedAt: dbData.uploaded_at,
    //   updatedAt: dbData.updated_at,
    //   tags: dbData.tags || [],
    //   description: dbData.description,
    // };

    return {
      success: true,
      message: "File uploaded successfully",
      // asset,
    };
  } catch (error) {
    console.error("Error uploading media:", error);
    return {
      success: false,
      message: "Error uploading media",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all media assets for a user (optionally filtered by folder)
 */
export async function getMediaAssets(
  userId: string,
  folderId?: string | null
): Promise<MediaAsset[]> {
  try {
    let query = adminClient
      .from("media_assets")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (folderId !== undefined) {
      query =
        folderId === null
          ? query.is("folder_id", null)
          : query.eq("folder_id", folderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching media assets:", error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      folderId: item.folder_id,
      breadcrumbs: item.breadcrumbs || [],
      storagePath: item.storage_path,
      url: item.url,
      thumbnailURL: item.thumbnail_url,
      originalName: item.original_name,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      size: item.size,
      width: item.width,
      height: item.height,
      uploadedAt: item.uploaded_at,
      updatedAt: item.updated_at,
      tags: item.tags || [],
      description: item.description,
    }));
  } catch (error) {
    console.error("Error fetching media assets:", error);
    return [];
  }
}

/**
 * Get a single media asset by ID
 */
export async function getMediaAsset(
  assetId: string
): Promise<MediaAsset | null> {
  try {
    const { data, error } = await adminClient
      .from("media_assets")
      .select("*")
      .eq("id", assetId)
      .single();

    if (error || !data) {
      console.error("Error fetching media asset:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      folderId: data.folder_id,
      breadcrumbs: data.breadcrumbs || [],
      storagePath: data.storage_path,
      url: data.url,
      thumbnailURL: data.thumbnail_url,
      originalName: data.original_name,
      mimeType: data.mime_type,
      fileExtension: data.file_extension,
      size: data.size,
      width: data.width,
      height: data.height,
      uploadedAt: data.uploaded_at,
      updatedAt: data.updated_at,
      tags: data.tags || [],
      description: data.description,
    };
  } catch (error) {
    console.error("Error fetching media asset:", error);
    return null;
  }
}

/**
 * Delete media asset (removes from storage and database)
 */
export async function deleteMediaAsset(
  assetId: string
): Promise<DeleteMediaResult> {
  try {
    // First get the asset to know the storage path
    const { data: asset, error: fetchError } = await adminClient
      .from("media_assets")
      .select("storage_path")
      .eq("id", assetId)
      .single();

    if (fetchError || !asset) {
      return {
        success: false,
        message: "Asset not found",
        error: fetchError?.message || "Asset not found",
      };
    }

    // Delete from storage
    const { error: storageError } = await adminClient.storage
      .from("media")
      .remove([asset.storage_path]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Continue anyway to remove database record
    }

    // Delete from database
    const { error: dbError } = await adminClient
      .from("media_assets")
      .delete()
      .eq("id", assetId);

    if (dbError) {
      console.error("Error deleting media record:", dbError);
      return {
        success: false,
        message: "Failed to delete media record",
        error: dbError.message,
      };
    }

    return {
      success: true,
      message: "Media asset deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting media asset:", error);
    return {
      success: false,
      message: "Error deleting media asset",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a new folder
 */
export async function createFolder({
  userId,
  name,
  parentId = null,
  breadcrumbs = [],
}: {
  userId: string;
  name: string;
  parentId?: string | null;
  breadcrumbs?: MediaBreadcrumb[];
}): Promise<CreateFolderResult> {
  try {
    const folderData = {
      user_id: userId,
      name,
      parent_id: parentId,
      breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : null,
    };

    const { data, error } = await adminClient
      .from("media_folders")
      .insert(folderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating folder:", error);
      return {
        success: false,
        message: "Failed to create folder",
        error: error.message,
      };
    }

    const folder: MediaFolder = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      parentId: data.parent_id,
      breadcrumbs: data.breadcrumbs || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return {
      success: true,
      message: "Folder created successfully",
      folder,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return {
      success: false,
      message: "Error creating folder",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get folders for a user (optionally filtered by parent)
 */
export async function getFolders(
  userId: string,
  parentId?: string | null
): Promise<MediaFolder[]> {
  try {
    let query = adminClient
      .from("media_folders")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (parentId !== undefined) {
      query =
        parentId === null
          ? query.is("parent_id", null)
          : query.eq("parent_id", parentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching folders:", error);
      return [];
    }

    return (data || []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      parentId: item.parent_id,
      breadcrumbs: item.breadcrumbs || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
}

/**
 * Get asset count for a folder
 */
export async function getAssetCountForFolder(
  folderId: string
): Promise<number> {
  try {
    const { count, error } = await adminClient
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("folder_id", folderId);

    if (error) {
      console.error("Error counting assets:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting assets:", error);
    return 0;
  }
}

/**
 * Delete a folder (only if empty)
 */
export async function deleteFolder(
  folderId: string
): Promise<DeleteMediaResult> {
  try {
    // Check if folder has any assets
    const assetCount = await getAssetCountForFolder(folderId);
    if (assetCount > 0) {
      return {
        success: false,
        message: "Cannot delete folder with assets",
        error: "Folder is not empty",
      };
    }

    // Check if folder has any subfolders
    const { count: subfolderCount, error: subfoldersError } = await adminClient
      .from("media_folders")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", folderId);

    if (subfoldersError) {
      return {
        success: false,
        message: "Error checking subfolders",
        error: subfoldersError.message,
      };
    }

    if (subfolderCount && subfolderCount > 0) {
      return {
        success: false,
        message: "Cannot delete folder with subfolders",
        error: "Folder has subfolders",
      };
    }

    // Delete folder
    const { error: deleteError } = await adminClient
      .from("media_folders")
      .delete()
      .eq("id", folderId);

    if (deleteError) {
      console.error("Error deleting folder:", deleteError);
      return {
        success: false,
        message: "Failed to delete folder",
        error: deleteError.message,
      };
    }

    return {
      success: true,
      message: "Folder deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return {
      success: false,
      message: "Error deleting folder",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
