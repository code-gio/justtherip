// Media Library Types for Hub Context

export interface MediaBreadcrumb {
  id: string;
  name: string;
}

export interface MediaAsset {
  id: string;
  userId: string;
  folderId?: string | null;
  breadcrumbs?: MediaBreadcrumb[];
  storagePath: string;
  url: string;
  thumbnailURL?: string;
  originalName: string;
  mimeType: string;
  fileExtension: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  updatedAt: string;
  tags?: string[];
  description?: string;
  variants?: MediaVariant[];
}

export interface MediaFolder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  breadcrumbs: MediaBreadcrumb[];
  createdAt: string;
  updatedAt: string;
  coverAssetId?: string;
  childFolderCount?: number;
  childAssetCount?: number;
}

export interface MediaVariant {
  type: "webp" | "avif" | "thumbnail" | "optimized";
  url: string;
  width?: number;
  height?: number;
  size: number;
}

export interface DragAndDropProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  showFileTypeError?: boolean;
  autoStart?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadManagerConfig {
  autoStart?: boolean;
  maxConcurrentUploads?: number;
  chunkSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableHealthChecks?: boolean;
  enableSmartScheduling?: boolean;
  maxBandwidthMbps?: number;
  adaptiveBandwidth?: boolean;
}

export interface MediaFilters {
  search: string;
  fileType: "all" | "image" | "video" | "document" | "other";
  sortBy: "date" | "name" | "size";
  sortOrder: "asc" | "desc";
}
