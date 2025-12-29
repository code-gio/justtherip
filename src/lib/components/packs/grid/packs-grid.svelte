<script lang="ts">
  import { IconPackage } from "@tabler/icons-svelte";
  import { PackCard } from "../card";
  import type { Pack } from "./types";

  let {
    packs,
    balance,
    onOpenPack,
  }: {
    packs: Pack[];
    balance: number;
    onOpenPack: (pack: Pack) => void;
  } = $props();
</script>

<div
  class="px-4 md:px-6 py-8 max-w-7xl mx-auto bg-gradient-to-b from-card to-background"
>
  {#if packs.length === 0}
    <div class="text-center py-16">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary/10"
      >
        <IconPackage size={32} class="text-primary" />
      </div>
      <h3 class="text-lg font-bold text-foreground mb-1">No packs found</h3>
      <p class="text-muted-foreground">Try adjusting your search or filters</p>
    </div>
  {:else}
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      {#each packs as pack (pack.id)}
        <PackCard {pack} {balance} onOpen={onOpenPack} />
      {/each}
    </div>
  {/if}
</div>
