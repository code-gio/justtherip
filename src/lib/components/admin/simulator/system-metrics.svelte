<script lang="ts">
  interface Props {
    totalSpentRips: number;
    totalValueRips: number;
    totalNetRips: number;
    houseEdgePercent: number;
    formatRips: (value: number) => string;
  }

  let { totalSpentRips, totalValueRips, totalNetRips, houseEdgePercent, formatRips }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-4">
  <div class="rounded-2xl border border-border bg-background/70 p-4 space-y-1">
    <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">System Revenue</p>
    <p class="text-2xl font-semibold">{formatRips(totalSpentRips)} Rips</p>
  </div>
  <div class="rounded-2xl border border-border bg-background/70 p-4 space-y-1">
    <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Value Given Out</p>
    <p class="text-2xl font-semibold">{formatRips(totalValueRips)} Rips</p>
  </div>
  <div class="rounded-2xl border border-border bg-background/70 p-4 space-y-1">
    <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">System Profit</p>
    <p class={`text-2xl font-semibold ${-totalNetRips >= 0 ? "text-emerald-500" : "text-destructive"}`}>
      {-totalNetRips >= 0 ? "+" : ""}{formatRips(-totalNetRips)} Rips
    </p>
  </div>
  <div class="rounded-2xl border border-border bg-background/70 p-4 space-y-1">
    <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">House Edge</p>
    <p class={`text-2xl font-semibold ${houseEdgePercent >= 0 ? "text-emerald-500" : "text-destructive"}`}>
      {houseEdgePercent >= 0 ? "+" : ""}{houseEdgePercent.toFixed(2)}%
    </p>
  </div>
</div>
