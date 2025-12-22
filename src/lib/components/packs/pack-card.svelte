<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import {
    IconSparkles,
    IconFlame,
    IconTrendingUp,
    IconInfoCircle,
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

  let totalChance = $derived(
    pack.odds.reduce((sum, odd) => sum + odd.chance, 0)
  );
  let progressWidth = $derived(
    Math.min(100, (pack.odds.filter((o) => o.tier !== "Common").reduce((s, o) => s + o.chance, 0) / totalChance) * 100 * 2)
  );
</script>

<div class="group relative">
  <!-- Card Container -->
  <div
    class="relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl bg-gradient-to-b from-card/50 to-card border border-border"
  >
    <!-- Background Pattern -->
    <div
      class="absolute inset-0 opacity-20 rounded-3xl"
      style="background: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2220%22 cy=%2250%22 r=%221%22 fill=%22white%22/><circle cx=%2280%22 cy=%2250%22 r=%221%22 fill=%22white%22/></svg>') repeat; background-size: 30px 30px;"
    ></div>

    <!-- Gradient Overlay based on pack -->
    <div
      class="absolute inset-0 opacity-25 rounded-3xl bg-gradient-to-br {pack.gradient.includes('violet')
        ? 'from-violet-500/30'
        : pack.gradient.includes('amber')
          ? 'from-amber-500/30'
          : pack.gradient.includes('emerald')
            ? 'from-emerald-500/30'
            : pack.gradient.includes('rose')
              ? 'from-rose-500/30'
              : 'from-primary/30'} to-transparent"
    ></div>

    <!-- Info Button -->
    <div class="absolute top-3 left-3 z-10">
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button
            class="p-2 rounded-lg bg-background/50 hover:bg-background/80 border border-border transition-colors"
          >
            <IconInfoCircle size={16} class="text-muted-foreground" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content side="right" class="max-w-xs">
          <div class="space-y-2">
            <p class="font-semibold">{pack.name}</p>
            <p class="text-sm text-muted-foreground">{pack.set}</p>
            <div class="text-xs space-y-1">
              {#each pack.odds as odd}
                <div class="flex justify-between">
                  <span>{odd.tier}</span>
                  <span>{odd.chance}%</span>
                </div>
              {/each}
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>

    <!-- Badges -->
    <div class="absolute top-3 right-3 z-10 flex gap-2">
      {#if pack.new}
        <span
          class="px-2 py-1 rounded-lg text-xs font-bold text-primary-foreground bg-primary"
        >
          NEW
        </span>
      {/if}
      {#if pack.hot}
        <span
          class="px-2 py-1 rounded-lg text-xs font-bold text-destructive-foreground bg-destructive flex items-center gap-1"
        >
          <IconFlame size={12} />
          HOT
        </span>
      {/if}
    </div>

    <!-- Pack Image Section -->
    <div class="relative h-44 flex items-center justify-center pt-8">
      <span
        class="text-8xl drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
        style="filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.2));"
      >
        {pack.image}
      </span>

      <!-- Shine Effect -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
      ></div>
    </div>

    <!-- Content Section -->
    <div class="relative p-4 space-y-3">
      <!-- Title & EV -->
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-base font-bold text-foreground truncate">{pack.name}</h3>
          <p class="text-xs text-muted-foreground uppercase tracking-wider">
            {pack.set}
          </p>
        </div>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <div
              class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-chart-2/15 text-chart-2"
            >
              <IconTrendingUp size={12} />
              ${pack.ev.toFixed(2)}
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Expected Value per pack</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-muted-foreground">Pull Rates</span>
          <span class="text-muted-foreground"
            >{pack.totalOpened.toLocaleString()} opened</span
          >
        </div>
        <div
          class="relative h-3 rounded-full overflow-hidden bg-background border border-border"
        >
          <!-- Progress bar -->
          <div
            class="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-gradient-to-r from-chart-4 via-chart-5 to-chart-5 shadow-[0_0_15px_rgba(var(--chart-4),0.5)]"
            style="width: {progressWidth}%;"
          ></div>
          <!-- Remaining dark section -->
          <div
            class="absolute inset-y-0 right-0 rounded-r-full bg-secondary"
            style="width: {100 - progressWidth}%;"
          ></div>
        </div>
      </div>

      <!-- Price & Action -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <!-- Price Badge -->
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-4/15 border border-chart-4/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" class="fill-chart-4">
              <circle cx="12" cy="12" r="10" />
              <text
                x="12"
                y="16"
                text-anchor="middle"
                font-size="10"
                class="fill-background"
                font-weight="bold">R</text
              >
            </svg>
            <span class="font-bold text-chart-4">{pack.price}</span>
          </div>
          {#if pack.ev > pack.price}
            <span
              class="text-xs font-semibold px-2 py-1 rounded-lg bg-chart-2/10 text-chart-2"
            >
              +{((pack.ev / pack.price - 1) * 100).toFixed(0)}% EV
            </span>
          {/if}
        </div>

        <Button
          size="sm"
          onclick={() => onOpen(pack)}
          disabled={balance < pack.price}
          class="font-bold disabled:opacity-50 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        >
          <IconSparkles size={14} class="mr-1" />
          Open
        </Button>
      </div>
    </div>
  </div>
</div>
