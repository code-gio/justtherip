<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { deserialize } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconPlus, IconTrash, IconSearch } from "@tabler/icons-svelte";
  import { Input } from "$lib/components/ui/input";
  import PackCreateDialog from "$lib/components/admin/packs/pack-create-dialog.svelte";
  import PackListHeader from "$lib/components/admin/packs/pack-list-header.svelte";
  import PackCardItem from "$lib/components/admin/packs/pack-card-item.svelte";
  import type { PageData } from "./$types";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog/index.js";


  interface Pack {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    slug: string;
    game_code: string;
    game: {
      name: string;
      code: string;
    } | null;
    rip_cost: number;
    total_openings: number;
    cards_per_pack: number;
    image_url: string | null;
    created_at: string;
    updated_at: string;
  }

  /**
   * Admin Pack Management — `/admin/packs`
   *
   * PURPOSE: Create, edit, and manage packs
   *
   * ACCESS: Restricted to admin users only
   *
   * FEATURES:
   * - List all packs (active and inactive)
   * - Create new pack via simple dialog
   * - Edit existing pack in dedicated page
   * - Activate/deactivate packs
   * - Duplicate packs
   *
   * VALIDATION:
   * - Odds must sum to exactly 100%
   * - Price must be positive integer
   * - Each tier needs at least one card
   */

  let { data }: { data: PageData } = $props();
  let showCreateDialog = $state(false);
  let deleteDialogOpen = $state(false);
  let packToDelete = $state<Pack | null>(null);
  let isDeleting = $state(false);
  let togglingPackId = $state<string | null>(null);
  let searchQuery = $state("");

  const filteredPacks = $derived(
    data.packs.filter((pack) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      const name = pack.name.toLowerCase();
      const slug = pack.slug.toLowerCase();
      const gameName = pack.game?.name?.toLowerCase() ?? "";
      const gameCode = pack.game_code?.toLowerCase() ?? "";
      return name.includes(q) || slug.includes(q) || gameName.includes(q) || gameCode.includes(q);
    })
  );

  function handleCreatePack() {
    showCreateDialog = true;
  }

  function handlePackCreated(packId: string) {
    // Navigate to the pack editor page
    goto(`/admin/packs/${packId}`);
  }

  function handleEditPack(packId: string) {
    goto(`/admin/packs/${packId}`);
  }

  async function handleDuplicatePack(pack: Pack) {
    const toastId = toast.loading(`Duplicating "${pack.name}"...`);
    const formData = new FormData();
    formData.append("name", pack.name + " (copy)");
    formData.append("slug", pack.slug + "-copy");
    formData.append("game_code", pack.game_code);

    try {
      const response = await fetch("?/create", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text());
      toast.dismiss(toastId);
      if (result.type === "success" && result.data?.packId) {
        toast.success("Pack duplicated successfully");
        await invalidateAll();
      } else {
        const err = result.type === "failure" && result.data?.error
          ? String(result.data.error)
          : "Failed to duplicate pack";
        toast.error(err);
      }
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Failed to duplicate pack");
    }
  }

  async function handleToggleActive(packId: string, is_active: boolean) {
    togglingPackId = packId;
    try {
      const formData = new FormData();
      formData.append("id", packId);
      formData.append("is_active", String(is_active));
      const response = await fetch("?/toggleActive", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text());
      if (result.type === "success") {
        toast.success("Pack status updated");
        await invalidateAll();
      } else {
        const err = result.type === "failure" && result.data?.error
          ? String(result.data.error)
          : "Failed to update pack status";
        toast.error(err);
      }
    } catch {
      toast.error("Failed to update pack status");
    } finally {
      togglingPackId = null;
    }
  }

  function openDeleteDialog(pack: Pack) {
    deleteDialogOpen = true;
    packToDelete = pack;
  }

  async function handleDeletePack() {
    if (!packToDelete?.id) return;
    isDeleting = true;
    try {
      const formData = new FormData();
      formData.append("id", packToDelete.id);
      const response = await fetch("?/delete", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text());
      if (result.type === "success") {
        toast.success(
          result.data?.archived ? "Pack archived (has openings)" : "Pack deleted successfully"
        );
        deleteDialogOpen = false;
        packToDelete = null;
        await invalidateAll();
      } else {
        const err = result.type === "failure" && result.data?.error
          ? String(result.data.error)
          : "Failed to delete pack";
        toast.error(err);
      }
    } catch {
      toast.error("Failed to delete pack");
    } finally {
      isDeleting = false;
    }
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <PackListHeader onCreatePack={handleCreatePack} />

  <div class="relative max-w-sm">
    <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    <Input
      type="text"
      placeholder="Search packs..."
      bind:value={searchQuery}
      class="pl-10"
    />
  </div>

  {#if data.packs.length === 0}
    <Card.Root>
      <Card.Content class="py-12 text-center">
        <p class="text-muted-foreground mb-4">No packs created yet.</p>
        <Button onclick={handleCreatePack}>
          <IconPlus size={18} class="mr-2" />
          Create Your First Pack
        </Button>
      </Card.Content>
    </Card.Root>
  {:else if filteredPacks.length === 0}
    <Card.Root>
      <Card.Content class="py-12 text-center">
        <p class="text-muted-foreground">No packs found matching your search.</p>
      </Card.Content>
    </Card.Root>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredPacks as pack (pack.id)}
        <PackCardItem
          {pack}
          togglingPackId={togglingPackId}
          onEdit={handleEditPack}
          onDuplicate={() => handleDuplicatePack(pack as Pack)}
          onToggleActive={handleToggleActive}
          onDelete={() => openDeleteDialog(pack as Pack)}
        />
      {/each}
    </div>
  {/if}
</div>

<PackCreateDialog
  bind:open={showCreateDialog}
  games={data.games}
  onComplete={handlePackCreated}
/>


<Dialog.Root bind:open={deleteDialogOpen}>
  <Dialog.Content class="max-w-4xl">
    <Dialog.Header>
      <Dialog.Title class="mt-4">Are you sure you want to delete this pack: {packToDelete?.name}?</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description class="mt-4">This action cannot be undone.</Dialog.Description>
    <Dialog.Footer>
      <Button
        variant="outline"
        disabled={isDeleting}
        onclick={() => { deleteDialogOpen = false; packToDelete = null; }}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        disabled={isDeleting}
        onclick={handleDeletePack}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

