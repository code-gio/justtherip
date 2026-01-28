<script lang="ts">
  interface Props {
    averageCardValue: number;
    packPrice: number;
    formatRips: (value: number) => string;
  }

  let { averageCardValue, packPrice, formatRips }: Props = $props();
</script>

<div class="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold">Pack Pricing Calculator</p>
      <p class="text-xs text-muted-foreground">Based on simulation data</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-3">
      <div>
        <p class="text-xs text-muted-foreground">Avg card value</p>
        <p class="text-lg font-semibold">{formatRips(averageCardValue)} Rips</p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Current pack price</p>
        <p class="text-lg font-semibold">{formatRips(packPrice)} Rips</p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground">Suggested 20% edge</p>
        <p class="text-lg font-semibold text-blue-500">
          {formatRips(averageCardValue * 1.25)} Rips
        </p>
      </div>
    </div>
    <p class="text-xs text-muted-foreground">
      Suggested pricing: {formatRips(averageCardValue * 1.15)} (15% edge) - {formatRips(averageCardValue * 1.3)} (30% edge)
    </p>
  </div>
</div>
