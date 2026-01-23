<script lang="ts">
  import { IconPackage } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import PackCardDisplay from "$lib/components/packs/pack-card-display.svelte";

  let { data }: { data: PageData } = $props();
  let { packs } = $derived(data);
</script>

<div class="min-h-screen bg-background px-4 md:px-6 py-8">
  <div class="max-w-7xl mx-auto">
    {#if !packs || packs.length === 0}
      <div class="text-center py-16">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary/10"
        >
          <IconPackage size={32} class="text-primary" />
        </div>
        <h3 class="text-lg font-bold text-foreground mb-1">No packs found</h3>
        <p class="text-muted-foreground">No active packs available</p>
      </div>
    {:else}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {#each packs as pack (pack.id)}
          <PackCardDisplay
            pack={pack}
            onClick={() => goto(`/packs/${pack.id}`)}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
