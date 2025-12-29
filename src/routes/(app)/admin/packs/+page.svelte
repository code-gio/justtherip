<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { IconPlus, IconEdit, IconCopy, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-svelte";
  import PackCreateDialog from "$lib/components/admin/packs/pack-create-dialog.svelte";
  import type { PageData } from "./$types";

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

  function handleDuplicatePack(packId: string) {
    // TODO: Implement duplicate functionality
    console.log("Duplicate pack:", packId);
  }

  async function handleToggleActive(packId: string) {
    // TODO: Implement toggle active functionality
    console.log("Toggle active:", packId);
  }
</script>

<div class="container mx-auto px-4 py-8 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-bold">Pack Management</h1>
      <p class="text-muted-foreground mt-2">
        Create and edit packs, set prices in Rips, configure card tiers
        with odds, and activate/deactivate packs.
      </p>
    </div>
    <Button onclick={handleCreatePack}>
      <IconPlus size={18} class="mr-2" />
      Create New Pack
    </Button>
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
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.packs as pack (pack.id)}
        <Card.Root>
          <Card.Header>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <Card.Title class="text-lg">{pack.name}</Card.Title>
                <Card.Description class="mt-1 line-clamp-2">
                  {pack.description || "No description"}
                </Card.Description>
              </div>
              <Badge variant={pack.is_active ? "default" : "secondary"}>
                {pack.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Game:</span>
              <span class="font-medium">{pack.game?.name || "Unknown"}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Rip Cost:</span>
              <span class="font-medium">{pack.rip_cost} Rips</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Total Openings:</span>
              <span class="font-medium">{pack.total_openings.toLocaleString()}</span>
            </div>
          </Card.Content>
          <Card.Footer class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              class="flex-1"
              onclick={() => handleEditPack(pack.id)}
            >
              <IconEdit size={16} class="mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="flex-1"
              onclick={() => handleToggleActive(pack.id)}
            >
              {#if pack.is_active}
                <IconEyeOff size={16} class="mr-1" />
                Deactivate
              {:else}
                <IconEye size={16} class="mr-1" />
                Activate
              {/if}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onclick={() => handleDuplicatePack(pack.id)}
            >
              <IconCopy size={16} />
            </Button>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>

<PackCreateDialog
  bind:open={showCreateDialog}
  games={data.games}
  onComplete={handlePackCreated}
/>
