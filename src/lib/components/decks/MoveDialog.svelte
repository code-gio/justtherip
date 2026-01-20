<script lang="ts">
  import type { DeckFolder, DeckFolderWithChildren } from "$lib/types/decks";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {
    IconFolder,
    IconFolderOpen,
    IconHome,
    IconLoader2,
  } from "@tabler/icons-svelte";

  interface Props {
    open?: boolean;
    item: DeckFolder | null;
    allFolders: DeckFolderWithChildren[];
    currentParentId?: string | null;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (targetParentId: string | null) => void;
  }

  let {
    open = $bindable(false),
    item,
    allFolders,
    currentParentId = null,
    isSubmitting = false,
    onClose,
    onSubmit,
  }: Props = $props();

  let selectedParentId = $state<string | null>(null);

  $effect(() => {
    if (item && open) {
      selectedParentId = currentParentId || null;
    }
  });

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    if (!newOpen) {
      selectedParentId = null;
      onClose();
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (isSubmitting) return;
    onSubmit(selectedParentId);
  }

  function selectParent(parentId: string | null) {
    selectedParentId = parentId;
  }

  // Get descendants of a folder (all children, grandchildren, etc.)
  function getDescendantIds(
    folderId: string,
    folders: DeckFolderWithChildren[],
  ): Set<string> {
    const descendants = new Set<string>();

    function traverse(currentFolders: DeckFolderWithChildren[]) {
      for (const folder of currentFolders) {
        if (folder.id === folderId) {
          addAllChildren(folder.children);
          return;
        }
        if (folder.children.length > 0) {
          traverse(folder.children);
        }
      }
    }

    function addAllChildren(children: DeckFolderWithChildren[]) {
      for (const child of children) {
        descendants.add(child.id);
        if (child.children.length > 0) {
          addAllChildren(child.children);
        }
      }
    }

    traverse(folders);
    return descendants;
  }

  // Check if a folder can be selected as target
  function canSelectFolder(folderId: string): boolean {
    if (!item) return false;

    // Can't move to itself
    if (item.id === folderId) return false;

    // If moving a folder, can't move to any of its descendants
    if (item.type === "folder") {
      const descendants = getDescendantIds(item.id, allFolders);
      if (descendants.has(folderId)) return false;
    }

    return true;
  }

  // Recursively render folder tree
  function renderFolderTree(folders: DeckFolderWithChildren[], depth = 0): any {
    return folders
      .filter((f) => f.type === "folder")
      .map((folder) => ({
        folder,
        depth,
        children:
          folder.children.length > 0
            ? renderFolderTree(folder.children, depth + 1)
            : [],
      }));
  }

  const folderTree = $derived(() => renderFolderTree(allFolders));
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title
        >Move {item?.type === "folder" ? "Folder" : "Deck"}</Dialog.Title
      >
      <Dialog.Description>
        Select the destination folder for "{item?.name}"
      </Dialog.Description>
    </Dialog.Header>

    {#if item}
      <form onsubmit={handleSubmit} class="space-y-4">
        <div class="space-y-2">
          <Label>Destination</Label>

          <div class="max-h-[300px] overflow-y-auto rounded-md border p-4">
            <div class="space-y-1">
              <!-- Root option -->
              <button
                type="button"
                class="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors text-left {selectedParentId ===
                null
                  ? 'bg-accent'
                  : ''}"
                onclick={() => selectParent(null)}
              >
                <IconHome class="h-4 w-4 flex-shrink-0" />
                <span class="font-medium">Root (No folder)</span>
              </button>

              <!-- Folder tree -->
              {#each folderTree() as { folder, depth, children }}
                {@const canSelect = canSelectFolder(folder.id)}
                {@const isSelected = selectedParentId === folder.id}
                {@const isCurrentParent = currentParentId === folder.id}

                <button
                  type="button"
                  disabled={!canSelect}
                  class="w-full flex items-center gap-2 p-2 rounded text-left transition-colors
										{canSelect ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed'}
										{isSelected ? 'bg-accent' : ''}"
                  style="padding-left: {(depth + 1) * 1.5}rem"
                  onclick={() => canSelect && selectParent(folder.id)}
                >
                  {#if folder.children.length > 0}
                    <IconFolderOpen class="h-4 w-4 flex-shrink-0" />
                  {:else}
                    <IconFolder class="h-4 w-4 flex-shrink-0" />
                  {/if}
                  <span class:font-medium={isSelected}>
                    {folder.name}
                    {#if isCurrentParent}
                      <span class="text-xs text-muted-foreground"
                        >(current)</span
                      >
                    {/if}
                    {#if !canSelect && item.id === folder.id}
                      <span class="text-xs text-muted-foreground"
                        >(can't move to itself)</span
                      >
                    {:else if !canSelect}
                      <span class="text-xs text-muted-foreground"
                        >(descendant)</span
                      >
                    {/if}
                  </span>
                </button>

                {#each children as childItem}
                  {@render renderChild(childItem)}
                {/each}
              {/each}
            </div>
          </div>
        </div>

        <Dialog.Footer>
          <Button
            type="button"
            variant="outline"
            onclick={() => (open = false)}
            disabled={isSubmitting}>Cancel</Button
          >
          <Button
            type="submit"
            disabled={selectedParentId === currentParentId || isSubmitting}
          >
            {#if isSubmitting}
              <IconLoader2 class="mr-2 h-4 w-4 animate-spin" />
              Moving...
            {:else}
              Move Here
            {/if}
          </Button>
        </Dialog.Footer>
      </form>
    {/if}
  </Dialog.Content>
</Dialog.Root>

{#snippet renderChild({
  folder,
  depth,
  children,
}: {
  folder: DeckFolderWithChildren;
  depth: number;
  children: any[];
})}
  {@const canSelect = canSelectFolder(folder.id)}
  {@const isSelected = selectedParentId === folder.id}
  {@const isCurrentParent = currentParentId === folder.id}

  <button
    type="button"
    disabled={!canSelect}
    class="w-full flex items-center gap-2 p-2 rounded text-left transition-colors
			{canSelect ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed'}
			{isSelected ? 'bg-accent' : ''}"
    style="padding-left: {(depth + 1) * 1.5}rem"
    onclick={() => canSelect && selectParent(folder.id)}
  >
    {#if folder.children.length > 0}
      <IconFolderOpen class="h-4 w-4 flex-shrink-0" />
    {:else}
      <IconFolder class="h-4 w-4 flex-shrink-0" />
    {/if}
    <span class:font-medium={isSelected}>
      {folder.name}
      {#if isCurrentParent}
        <span class="text-xs text-muted-foreground">(current)</span>
      {/if}
      {#if !canSelect && item && item.id === folder.id}
        <span class="text-xs text-muted-foreground">(can't move to itself)</span
        >
      {:else if !canSelect}
        <span class="text-xs text-muted-foreground">(descendant)</span>
      {/if}
    </span>
  </button>

  {#each children as childItem}
    {@render renderChild(childItem)}
  {/each}
{/snippet}
