<script lang="ts">
  import { IconSparkles, IconChartArcs } from "@tabler/icons-svelte";

  interface Props {
    totalTrips?: number;
  }

  let { totalTrips = 0 }: Props = $props();
</script>

<header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
  <div class="space-y-1">
    <p class="text-sm uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1">
      <IconSparkles size={20} />
      Pack Simulator
    </p>
    <h1 class="text-3xl font-bold">Pack Analytics & Pricing Simulator</h1>
    <p class="text-muted-foreground max-w-2xl">
      Simulate pack openings to analyze house edge, calculate optimal pricing, and ensure profitability. All simulations run locally without affecting live data.
    </p>
  </div>
  <div class="rounded-2xl bg-muted p-4 shadow">
    <div class="flex items-center gap-2">
      <IconChartArcs size={20} class="text-primary" />
      <div>
        <p class="text-sm text-muted-foreground">Trips tracked</p>
        <p class="text-xl font-semibold">{totalTrips}</p>
      </div>
    </div>
  </div>
</header>
