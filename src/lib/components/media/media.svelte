<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input";
  import { toast } from "svelte-sonner";
  import * as v from "valibot";
  import {
    IconFolderPlus,
    IconLayoutGrid,
    IconList,
    IconUpload,
    IconX,
  } from "@tabler/icons-svelte";
  import type {
    MediaAsset,
    MediaBreadcrumb,
    MediaFolder,
  } from "$lib/types/media";

  interface Props {
    userId: string;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    showFileTypeError?: boolean;
    onSelect?: (asset: MediaAsset) => void;
    selectable?: boolean;
  }

  let {
    userId,
    maxFileSize = 100 * 1024 * 1024, // 100MB default
    allowedFileTypes = [],
    showFileTypeError = true,
    onSelect,
    selectable = false,
  }: Props = $props();

  const folderSchema = v.object({
    name: v.pipe(v.string(), v.nonEmpty("Folder name is required")),
  });

  // Component state
  let isDragOver = $state(false);
  let uploadError = $state<string | null>(null);
  let mediaAssets = $state<MediaAsset[]>([]);
  let isLoadingAssets = $state(true);
  let folders = $state<MediaFolder[]>([]);
  let isLoadingFolders = $state(true);
  let folderStack = $state<MediaFolder[]>([]);
  let isFolderDialogOpen = $state(false);
  let folderName = $state("");
  let folderError = $state<string | null>(null);
  let isSavingFolder = $state(false);
  let viewMode = $state<"grid" | "list">("grid");
  let isUploadDialogOpen = $state(false);
  let isUploading = $state(false);
  let selectedFiles = $state<File[]>([]);
  let uploadProgress = $state<Map<string, number>>(new Map());

  // Derived state
  const breadcrumbs = $derived(folderStack);
  const currentFolderId = $derived(folderStack.at(-1)?.id ?? null);
  const uploadBreadcrumbs = $derived(
    folderStack.map((folder) => ({
      id: folder.id,
      name: folder.name,
    }))
  );

  // Load existing media assets
  async function loadMediaAssets(folderId?: string | null) {
    try {
      isLoadingAssets = true;
      const response = await fetch(
        `/api/media/assets${folderId !== undefined ? `?folderId=${folderId ?? "null"}` : ""}`
      );
      console.log(response);
      if (!response.ok) throw new Error("Failed to load assets");
      const data = await response.json();
      mediaAssets = data.assets || [];
    } catch (error) {
      console.error("Error loading media assets:", error);
      toast.error("Failed to load media assets");
    } finally {
      isLoadingAssets = false;
    }
  }

  async function loadFolders(parentId?: string | null) {
    try {
      isLoadingFolders = true;
      const response = await fetch(
        `/api/media/folders${parentId !== undefined ? `?parentId=${parentId ?? "null"}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to load folders");
      const data = await response.json();

      // Load asset counts for each folder
      const foldersWithCounts = await Promise.all(
        (data.folders || []).map(async (folder: MediaFolder) => {
          const countResponse = await fetch(
            `/api/media/count?folderId=${folder.id}`
          );
          const countData = await countResponse.json();
          return { ...folder, childAssetCount: countData.count || 0 };
        })
      );

      folders = foldersWithCounts;
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("Failed to load folders");
    } finally {
      isLoadingFolders = false;
    }
  }

  async function refreshFolderContext(
    targetFolderId: string | null = currentFolderId
  ) {
    await Promise.all([
      loadFolders(targetFolderId),
      loadMediaAssets(targetFolderId),
    ]);
  }

  function resetFolderForm() {
    folderName = "";
    folderError = null;
  }

  function handleFolderDialogOpen() {
    resetFolderForm();
    isFolderDialogOpen = true;
  }

  function closeFolderDialog() {
    isFolderDialogOpen = false;
  }

  async function handleFolderSubmit(event: SubmitEvent) {
    event.preventDefault();
    const trimmedName = folderName.trim();
    const validation = v.safeParse(folderSchema, { name: trimmedName });

    if (!validation.success) {
      folderError =
        validation.issues.find((issue) => issue.path?.[0]?.key === "name")
          ?.message ?? "Folder name is required";
      return;
    }

    try {
      folderError = null;
      isSavingFolder = true;

      const response = await fetch("/api/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validation.output.name,
          parentId: currentFolderId ?? null,
          breadcrumbs: uploadBreadcrumbs,
        }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      const data = await response.json();
      folders = [data.folder, ...folders];
      resetFolderForm();
      closeFolderDialog();
      toast.success("Folder created");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      isSavingFolder = false;
    }
  }

  async function handleFolderOpen(folder: MediaFolder) {
    folderStack = [...folderStack, folder];
    await refreshFolderContext(folder.id);
  }

  async function handleBreadcrumbNavigate(index: number | null) {
    let targetFolderId: string | null;
    if (index === null) {
      folderStack = [];
      targetFolderId = null;
    } else {
      folderStack = folderStack.slice(0, index + 1);
      targetFolderId = folderStack.at(-1)?.id ?? null;
    }
    await refreshFolderContext(targetFolderId);
  }

  function setViewMode(mode: "grid" | "list") {
    viewMode = mode;
  }

  // Upload handlers
  function handleUploadDialogOpen() {
    selectedFiles = [];
    uploadError = null;
    isUploadDialogOpen = true;
  }

  function handleFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      selectedFiles = Array.from(input.files);
    }
  }

  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }

  function validateFiles(files: File[]): { valid: boolean; error?: string } {
    if (files.length === 0) {
      return { valid: false, error: "No files selected" };
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        return {
          valid: false,
          error: `File "${file.name}" exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        };
      }

      if (
        allowedFileTypes.length > 0 &&
        !allowedFileTypes.includes(file.type)
      ) {
        return {
          valid: false,
          error: `File type "${file.type}" is not allowed`,
        };
      }
    }

    return { valid: true };
  }

  async function handleUpload() {
    const validation = validateFiles(selectedFiles);
    if (!validation.valid) {
      uploadError = validation.error || "Validation failed";
      toast.error(uploadError);
      return;
    }

    try {
      isUploading = true;
      uploadError = null;
      uploadProgress = new Map();

      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) formData.append("folderId", currentFolderId);
        if (uploadBreadcrumbs.length > 0) {
          formData.append("breadcrumbs", JSON.stringify(uploadBreadcrumbs));
        }

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      const newAssets = results.filter((r) => r.success).map((r) => r.asset);

      mediaAssets = [...newAssets, ...mediaAssets];
      toast.success(`${newAssets.length} file(s) uploaded successfully`);

      selectedFiles = [];
      isUploadDialogOpen = false;
    } catch (error) {
      console.error("Error uploading files:", error);
      uploadError = error instanceof Error ? error.message : "Upload failed";
      toast.error(uploadError);
    } finally {
      isUploading = false;
    }
  }

  // Drag and drop handlers
  function handleDragOver(event: DragEvent): void {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    isDragOver = false;
  }

  function handleDrop(event: DragEvent): void {
    event.preventDefault();
    isDragOver = false;

    if (event.dataTransfer?.files) {
      selectedFiles = Array.from(event.dataTransfer.files);
      isUploadDialogOpen = true;
    }
  }

  // Delete a media asset
  async function handleDeleteAsset(assetId: string) {
    try {
      const response = await fetch(`/api/media/assets/${assetId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete asset");

      mediaAssets = mediaAssets.filter((a) => a.id !== assetId);
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset");
    }
  }

  function handleAssetClick(asset: MediaAsset) {
    if (selectable && onSelect) {
      onSelect(asset);
    }
  }

  onMount(async () => {
    await Promise.all([loadMediaAssets(null), loadFolders(null)]);
  });
</script>

<div class="space-y-6">
  <!-- Header + Upload Dialog -->
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div class="space-y-1">
      <h2 class="text-2xl font-semibold">Media Library</h2>
      <p class="text-sm text-muted-foreground">
        Upload assets and organize them with folders.
      </p>
    </div>
    <Button onclick={handleUploadDialogOpen}>
      <IconUpload class="mr-2 h-4 w-4" />
      Upload Files
    </Button>
  </div>

  <!-- Toolbar -->
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex gap-2">
      <Button variant="outline" onclick={handleFolderDialogOpen}>
        <IconFolderPlus class="mr-2 h-4 w-4" />
        Create Folder
      </Button>
    </div>
    <div class="flex gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="icon"
        onclick={() => setViewMode("grid")}
        aria-label="Grid view"
      >
        <IconLayoutGrid class="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onclick={() => setViewMode("list")}
        aria-label="List view"
      >
        <IconList class="h-4 w-4" />
      </Button>
    </div>
  </div>

  <!-- Breadcrumbs -->
  {#if breadcrumbs.length > 0}
    <div class="flex items-center gap-2 text-sm">
      <button
        onclick={() => handleBreadcrumbNavigate(null)}
        class="hover:underline text-muted-foreground"
      >
        Home
      </button>
      {#each breadcrumbs as crumb, index}
        <span class="text-muted-foreground">/</span>
        <button
          onclick={() => handleBreadcrumbNavigate(index)}
          class="hover:underline {index < breadcrumbs.length - 1
            ? 'text-muted-foreground'
            : ''}"
        >
          {crumb.name}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Media Grid -->
  {#if isLoadingAssets || isLoadingFolders}
    <Card.Root>
      <Card.Content class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          ></div>
          <p class="text-muted-foreground">Loading media assets...</p>
        </div>
      </Card.Content>
    </Card.Root>
  {:else if folders.length === 0 && mediaAssets.length === 0}
    <!-- Empty state -->
    <Card.Root>
      <Card.Content class="flex items-center justify-center py-16">
        <div class="text-center max-w-md">
          <div class="mb-4">
            <IconUpload
              class="h-16 w-16 mx-auto text-muted-foreground opacity-50"
            />
          </div>
          <h3 class="text-lg font-semibold mb-2">No media files yet</h3>
          <p class="text-sm text-muted-foreground mb-6">
            Get started by uploading your first file or creating a folder to
            organize your media.
          </p>
          <div class="flex gap-3 justify-center">
            <Button onclick={handleUploadDialogOpen} variant="default">
              <IconUpload class="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button onclick={handleFolderDialogOpen} variant="outline">
              <IconFolderPlus class="mr-2 h-4 w-4" />
              Create Folder
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="space-y-4">
      <!-- Folders -->
      {#if folders.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {#each folders as folder}
            <button
              onclick={() => handleFolderOpen(folder)}
              class="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <IconFolderPlus class="h-12 w-12 text-primary" />
              <span class="text-sm font-medium truncate w-full text-center"
                >{folder.name}</span
              >
              {#if folder.childAssetCount !== undefined}
                <span class="text-xs text-muted-foreground"
                  >{folder.childAssetCount} items</span
                >
              {/if}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Assets -->
      {#if mediaAssets.length > 0}
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {#each mediaAssets as asset}
            <div
              class="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onclick={() => handleAssetClick(asset)}
                class="w-full aspect-square bg-muted flex items-center justify-center {selectable
                  ? 'cursor-pointer'
                  : ''}"
              >
                {#if asset.mimeType.startsWith("image/")}
                  <img
                    src={asset.url}
                    alt={asset.originalName}
                    class="w-full h-full object-cover"
                  />
                {:else}
                  <div class="text-center p-4">
                    <p class="text-xs truncate">{asset.originalName}</p>
                  </div>
                {/if}
              </button>
              <button
                onclick={() => handleDeleteAsset(asset.id)}
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconX
                  class="h-5 w-5 text-destructive bg-background rounded-full p-1"
                />
              </button>
            </div>
          {/each}
        </div>
      {:else if folders.length > 0}
        <!-- Folder exists but no assets -->
        <Card.Root>
          <Card.Content class="flex items-center justify-center py-12">
            <div class="text-center">
              <IconUpload
                class="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50"
              />
              <p class="text-muted-foreground mb-4">This folder is empty</p>
              <Button onclick={handleUploadDialogOpen} variant="outline">
                <IconUpload class="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  {/if}
</div>

<!-- Create Folder Dialog -->
<Dialog.Root bind:open={isFolderDialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Create Folder</Dialog.Title>
      <Dialog.Description
        >Organize your media by creating nested folders.</Dialog.Description
      >
    </Dialog.Header>
    <form class="space-y-4" onsubmit={handleFolderSubmit}>
      <div class="space-y-2">
        <label
          class="text-sm font-medium text-foreground"
          for="media-folder-name"
        >
          Folder name
        </label>
        <Input
          id="media-folder-name"
          placeholder="e.g. Campaign Assets"
          bind:value={folderName}
          autocomplete="off"
        />
        {#if folderError}
          <p class="text-xs text-destructive">{folderError}</p>
        {/if}
      </div>
      <Dialog.Footer>
        <div class="flex w-full justify-end gap-2">
          <Button type="button" variant="outline" onclick={closeFolderDialog}
            >Cancel</Button
          >
          <Button type="submit" disabled={isSavingFolder}>
            {isSavingFolder ? "Creating…" : "Create"}
          </Button>
        </div>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<!-- Upload Dialog -->
<Dialog.Root bind:open={isUploadDialogOpen}>
  <Dialog.Content class="sm:max-w-[600px]">
    <Dialog.Header>
      <Dialog.Title>Upload Files</Dialog.Title>
      <Dialog.Description
        >Select files to upload to your media library.</Dialog.Description
      >
    </Dialog.Header>
    <div class="space-y-4">
      <div
        role="button"
        tabindex="0"
        class="border-2 border-dashed rounded-lg p-8 text-center {isDragOver
          ? 'border-primary bg-primary/5'
          : ''}"
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onchange={handleFileInputChange}
          class="hidden"
          id="file-upload-input"
        />
        <label for="file-upload-input" class="cursor-pointer">
          <IconUpload class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p class="text-sm text-muted-foreground">
            Drag and drop files here or click to browse
          </p>
          {#if maxFileSize}
            <p class="text-xs text-muted-foreground mt-2">
              Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          {/if}
        </label>
      </div>

      {#if selectedFiles.length > 0}
        <div class="space-y-2">
          <p class="text-sm font-medium">
            Selected files ({selectedFiles.length}):
          </p>
          <div class="space-y-1 max-h-40 overflow-y-auto">
            {#each selectedFiles as file, index}
              <div
                class="flex items-center justify-between p-2 bg-muted rounded text-sm"
              >
                <span class="truncate flex-1">{file.name}</span>
                <span class="text-muted-foreground ml-2"
                  >{(file.size / 1024).toFixed(1)} KB</span
                >
                <button
                  onclick={() => removeFile(index)}
                  class="ml-2 text-destructive hover:text-destructive/80"
                >
                  <IconX class="h-4 w-4" />
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if uploadError}
        <p class="text-sm text-destructive">{uploadError}</p>
      {/if}
    </div>
    <Dialog.Footer>
      <div class="flex w-full justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onclick={() => (isUploadDialogOpen = false)}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button
          onclick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
