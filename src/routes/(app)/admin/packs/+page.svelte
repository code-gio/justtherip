<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconPlus } from "@tabler/icons-svelte";
  import PackCreateDialog from "$lib/components/admin/packs/pack-create-dialog.svelte";
  import PackListHeader from "$lib/components/admin/packs/pack-list-header.svelte";
  import PackCardItem from "$lib/components/admin/packs/pack-card-item.svelte";
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
  <PackListHeader onCreatePack={handleCreatePack} />

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
        <PackCardItem
          pack={pack}
          onEdit={handleEditPack}
          onDuplicate={handleDuplicatePack}
          onToggleActive={handleToggleActive}
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
