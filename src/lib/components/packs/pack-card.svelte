<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card/index.js";
  import {
    IconSparkles,
    IconFlame,
    IconTrendingUp,
  } from "@tabler/icons-svelte";
  import type { Pack } from "./types";

  let {
    pack,
    balance,
    onOpen,
  }: {
    pack: Pack;
    balance: number;
    onOpen: (pack: Pack) => void;
  } = $props();

  const canAfford = $derived(balance >= pack.price);
  const evBonus = $derived(pack.ev > pack.price ? ((pack.ev / pack.price - 1) * 100).toFixed(0) : null);
</script>

<Card.Root class="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  <!-- Pack Image -->
  <div class="relative aspect-square bg-muted overflow-hidden">
    {#if pack.image && pack.image !== "📦" && !pack.image.startsWith("📦")}
      <img
        src={pack.image}
        alt={pack.name}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
        <span class="text-6xl opacity-50">📦</span>
      </div>
    {/if}
    
    <!-- Badges Overlay -->
    <div class="absolute top-2 left-2 flex flex-col gap-2">
      {#if pack.new}
        <span class="px-2 py-1 rounded-md text-xs font-bold text-primary-foreground bg-primary shadow-sm">
          NEW
        </span>
      {/if}
      {#if pack.hot}
        <span class="px-2 py-1 rounded-md text-xs font-bold text-destructive-foreground bg-destructive shadow-sm flex items-center gap-1">
          <IconFlame size={12} />
          HOT
        </span>
      {/if}
    </div>

    <!-- EV Badge -->
    {#if pack.ev > 0}
      <div class="absolute top-2 right-2">
        <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-background/90 backdrop-blur-sm border border-border">
          <IconTrendingUp size={12} class="text-chart-2" />
          <span class="text-chart-2">${pack.ev.toFixed(2)} EV</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Card Content -->
  <Card.Content class="p-4 space-y-3">
    <!-- Pack Name and Set -->
    <div class="space-y-1">
      <h3 class="font-semibold text-lg leading-tight">{pack.name}</h3>
      {#if pack.set}
        <p class="text-sm text-muted-foreground uppercase tracking-wide">
          {pack.set}
        </p>
      {/if}
    </div>

    <!-- Description (if available) -->
    {#if pack.description}
      <p class="text-sm text-muted-foreground line-clamp-2">
        {pack.description}
      </p>
    {/if}

    <!-- Price and Action -->
    <div class="flex items-center justify-between pt-2 border-t">
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-2xl font-bold">{pack.price}</span>
          <span class="text-sm text-muted-foreground">Rips</span>
        </div>
        {#if evBonus}
          <span class="text-xs text-chart-2 font-medium">
            +{evBonus}% EV
          </span>
        {/if}
      </div>

      <Button
        onclick={() => onOpen(pack)}
        disabled={!canAfford}
        class="font-semibold"
      >
        <IconSparkles size={16} class="mr-1.5" />
        {canAfford ? "Open Pack" : "Need Rips"}
      </Button>
    </div>
  </Card.Content>
</Card.Root>
