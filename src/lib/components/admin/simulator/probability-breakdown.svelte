<script lang="ts">
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

  interface Props {
    cards: CardProbability[];
    formatRips: (value: number) => string;
  }

  let { cards, formatRips }: Props = $props();

  // Ordena por probabilidad descendente
  const sortedCards = $derived(
    [...cards].sort((a, b) => (b.probability || 0) - (a.probability || 0))
  );

  // Calcula el máximo para la barra
  const maxProbability = $derived(Math.max(...sortedCards.map(c => c.probability || 0), 1));

  const getProbabilityColor = (probability: number) => {
    if (probability > 20) return "bg-emerald-500";
    if (probability > 10) return "bg-blue-500";
    if (probability > 5) return "bg-amber-500";
    return "bg-red-500";
  };

  const getProbabilityLabel = (probability: number) => {
    if (probability > 20) return "Very Common";
    if (probability > 10) return "Common";
    if (probability > 5) return "Uncommon";
    if (probability > 1) return "Rare";
    return "Very Rare";
  };
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <p class="text-sm font-semibold">Probability by Card</p>
    <p class="text-xs text-muted-foreground">Sorted by draw likelihood</p>
  </div>

  <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
    {#each sortedCards as card (card.id)}
      {@const probabilityPercent = ((card.probability || 0) * 100).toFixed(2)}
      {@const barWidth = ((card.probability || 0) / maxProbability) * 100}
      <div class="space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium truncate">{card.name}</p>
            <p class="text-xs text-muted-foreground">
              Market: {formatRips((card.market_value || 0) / 100)} Rips
            </p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-sm font-semibold">{probabilityPercent}%</p>
            <p class={`text-xs font-medium ${
              getProbabilityColor(card.probability || 0).replace('bg-', 'text-')
            }`}>
              {getProbabilityLabel(card.probability || 0)}
            </p>
          </div>
        </div>

        <div class="h-6 rounded-lg bg-muted overflow-hidden flex items-center">
          <div
            class={`h-full transition-all duration-300 ${getProbabilityColor(card.probability || 0)} flex items-center justify-end pr-2`}
            style={`width: ${barWidth}%`}
          >
            {#if barWidth > 15}
              <span class="text-xs font-semibold text-white">{probabilityPercent}%</span>
            {/if}
          </div>
          {#if barWidth <= 15}
            <span class="text-xs font-semibold ml-2 text-muted-foreground">{probabilityPercent}%</span>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="rounded-2xl border border-border bg-muted/30 p-3 space-y-2">
    <p class="text-xs font-semibold">Legend</p>
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded bg-emerald-500"></div>
        <span class="text-muted-foreground">&gt; 20% Very Common</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded bg-blue-500"></div>
        <span class="text-muted-foreground">10-20% Common</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded bg-amber-500"></div>
        <span class="text-muted-foreground">5-10% Uncommon</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="h-3 w-3 rounded bg-red-500"></div>
        <span class="text-muted-foreground">&lt; 5% Rare</span>
      </div>
    </div>
  </div>
</div>
