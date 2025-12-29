<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { IconPlus } from "@tabler/icons-svelte";

  interface CardData {
    id: string;
    name: string;
    set?: string;
    prices?: {
      usd?: string;
      usd_foil?: string;
      eur?: string;
    };
    market_value_cents?: number;
    rarity?: string;
    image_uri?: {
      small?: string;
      normal?: string;
      large?: string;
      png?: string;
      art_crop?: string;
      border_crop?: string;
    } | string | null;
  }

  let {
    card,
    gameCode,
    isAssigned,
    priceCents,
    priceFormatted,
    onImageClick,
    onAddCard,
  }: {
    card: CardData;
    gameCode: string;
    isAssigned: boolean;
    priceCents: number;
    priceFormatted: string;
    onImageClick: (card: CardData) => void;
    onAddCard: (card: CardData) => void;
  } = $props();

  function getCardImageUrl(
    card: CardData,
    size: "small" | "normal" | "large" = "normal"
  ): string | null {
    if (!card.image_uri) return null;

    if (typeof card.image_uri === "string") {
      return card.image_uri;
    }

    if (typeof card.image_uri === "object") {
      return (
        card.image_uri[size] ||
        card.image_uri.normal ||
        card.image_uri.small ||
        null
      );
    }

    return null;
  }

  const cardImageUrl = $derived(getCardImageUrl(card, "small"));
</script>

<div class="flex flex-col gap-2 {isAssigned ? 'opacity-50' : ''}">
  <!-- Image on top -->
  <div class="w-full aspect-[63/88] relative">
    {#if cardImageUrl}
      <button
        type="button"
        class="w-full h-full rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onclick={() => onImageClick(card)}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onImageClick(card);
          }
        }}
        aria-label={`View full image of ${card.name}`}
      >
        <img
          src={cardImageUrl}
          alt={card.name}
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </button>
    {:else}
      <div class="w-full h-full bg-muted rounded flex items-center justify-center">
        <span class="text-xs text-muted-foreground">No Image</span>
      </div>
    {/if}
  </div>

  <!-- Name and Add button on bottom -->
  <div class="flex items-center justify-between gap-2">
    <div class="flex-1 min-w-0">
      <p class="font-medium text-sm truncate">{card.name}</p>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        {#if card.set}
          <span>{card.set}</span>
        {/if}
        <span>{priceFormatted}</span>
        {#if gameCode === "mtg" && card.prices?.usd_foil}
          <span class="text-yellow-600">★</span>
        {/if}
      </div>
    </div>
    {#if !isAssigned}
      <Button
        variant="outline"
        size="sm"
        onclick={() => onAddCard(card)}
        class="shrink-0"
      >
        <IconPlus size={16} />
      </Button>
    {/if}
  </div>
</div>

