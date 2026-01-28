<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconCoin } from "@tabler/icons-svelte";

  interface CardProbability {
    id: string;
    name: string;
    image_url: string | null;
    market_value: number;
    probability: number;
    rarity?: string | null;
    set_name?: string | null;
    set_code?: string | null;
  }

  interface SimulationCardStat {
    card: CardProbability;
    count: number;
    totalValueRips: number;
    percentOfDraws: number;
  }

  interface SimulationResult {
    totalTrips: number;
    totalSpentRips: number;
    totalValueRips: number;
    netRips: number;
    cardStats: SimulationCardStat[];
  }

  interface Props {
    simulationResult: SimulationResult | null;
    totalNetRips: number;
    packPrice: number;
    formatRips: (value: number) => string;
  }

  let { simulationResult, totalNetRips, packPrice, formatRips }: Props = $props();

  const cardSpentRips = (stat: SimulationCardStat) => packPrice * stat.count;
  const cardNetRips = (stat: SimulationCardStat) => stat.totalValueRips - cardSpentRips(stat);
</script>

<Card.Root>
  <Card.Content class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-muted-foreground">System Analytics</p>
        <h3 class="text-lg font-semibold">
          {simulationResult ? "Profitability Report" : "Awaiting simulation"}
        </h3>
      </div>
      <div class="text-right">
        <p class="text-xs text-muted-foreground">System profit</p>
        <p class={`text-xl font-semibold ${-totalNetRips >= 0 ? "text-emerald-500" : "text-destructive"}`}>
          {simulationResult
            ? `${-totalNetRips >= 0 ? "+" : ""}${formatRips(-totalNetRips)} Rips`
            : "--"}
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-2xl border border-border p-4">
        <p class="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <IconCoin size={14} />
          Revenue (users paid)
        </p>
        <p class="text-2xl font-semibold">
          {simulationResult
            ? `${formatRips(simulationResult.totalSpentRips)} Rips`
            : "--"}
        </p>
      </div>
      <div class="rounded-2xl border border-border p-4">
        <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Cost (value given)</p>
        <p class="text-2xl font-semibold">
          {simulationResult
            ? `${formatRips(simulationResult.totalValueRips)} Rips`
            : "--"}
        </p>
      </div>
    </div>

    {#if simulationResult}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold">Card profitability breakdown</p>
          <p class="text-xs text-muted-foreground">
            {simulationResult.totalTrips} pulls
          </p>
        </div>
        <div class="grid gap-3 max-h-[520px] overflow-y-auto pr-1">
          {#each simulationResult.cardStats as stat}
            {@const averageValue = stat.totalValueRips / stat.count}
            {@const cardMarketUsd = (stat.card.market_value || 0) / 100}
            <div class="flex gap-4 rounded-2xl border border-border bg-background/60 p-3 shadow-sm">
              <div class="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                {#if stat.card.image_url}
                  <img
                    src={stat.card.image_url}
                    alt={stat.card.name}
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <div class="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                {/if}
              </div>
              <div class="flex flex-1 flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-semibold">{stat.card.name}</p>
                    <p class="text-xs text-muted-foreground">
                      ~{(stat.card.probability * 100).toFixed(2)}% chance · Market: ${cardMarketUsd.toFixed(2)}
                    </p>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {stat.percentOfDraws.toFixed(1)}% of pulls
                  </p>
                </div>
                <div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <p>{stat.count} pulls</p>
                  <p>{formatRips(stat.totalValueRips)} Rips value</p>
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl border border-border bg-muted/50 p-2 text-xs">
                    <p class="text-muted-foreground">Revenue (collected)</p>
                    <p class="font-semibold">{formatRips(cardSpentRips(stat))} Rips</p>
                  </div>
                  <div class="rounded-2xl border border-border bg-muted/50 p-2 text-xs">
                    <p class="text-muted-foreground">Cost per card</p>
                    <p class="font-semibold">{formatRips(averageValue)} Rips</p>
                  </div>
                </div>
                <div class="text-sm">
                  <span
                    class={`font-semibold ${
                      -cardNetRips(stat) >= 0 ? "text-emerald-500" : "text-destructive"
                    }`}
                  >
                    {-cardNetRips(stat) >= 0 ? "+" : ""}
                    {formatRips(-cardNetRips(stat))} Rips system profit on these pulls
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground">
        Results will appear here once you run the simulator.
      </p>
    {/if}
  </Card.Content>
</Card.Root>
