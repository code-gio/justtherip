<script lang="ts">
  import { IconPinFilled, IconPin, IconTrash, IconLoader2 } from "@tabler/icons-svelte";

  interface Props {
    card: any;
    index: number;
    category: string;
    isHovered: boolean;
    isAnyCardBelowHovered: boolean;
    isLoading: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: (e: DragEvent) => void;
    onTogglePin: (cardId: string, isPinned: boolean) => void;
    onRemove: (cardId: string, card_id: string, category: string) => void;
  }

  let {
    card,
    index,
    category,
    isHovered,
    isAnyCardBelowHovered,
    isLoading,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDragEnd,
    onTogglePin,
    onRemove,
  }: Props = $props();

  function getCardImageUrl(card: any): string | null {
    const cardData = card.cardData;
    if (!cardData || !cardData.image_uri) return null;

    if (typeof cardData.image_uri === "string") {
      return cardData.image_uri;
    }

    if (typeof cardData.image_uri === "object") {
      return (
        cardData.image_uri.normal ||
        cardData.image_uri.small ||
        cardData.image_uri.large ||
        null
      );
    }

    return null;
  }

  function getCardPrice(card: any): string {
    const cardData = card.cardData;
    if (!cardData) return "N/A";

    if (cardData.prices) {
      const usd = parseFloat(cardData.prices.usd || "0");
      const usdFoil = parseFloat(cardData.prices.usd_foil || "0");
      const maxPrice = Math.max(usd, usdFoil);
      return maxPrice > 0 ? `$${maxPrice.toFixed(2)}` : "N/A";
    }

    if (cardData.market_value_cents) {
      return `$${(cardData.market_value_cents / 100).toFixed(2)}`;
    }

    return "N/A";
  }

  const imageUrl = $derived(getCardImageUrl(card));
  const price = $derived(getCardPrice(card));
  const cardName = $derived(card.cardData?.name || "Unknown Card");
  const isPinned = $derived(card.is_pinned);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  draggable="true"
  class="absolute w-full cursor-move transition-all duration-200"
  style={`
    top: ${index * 40}px;
    transform: translateY(${isAnyCardBelowHovered ? "300px" : "0px"});
    z-index: ${index + 1};
  `}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  ondragstart={onDragStart}
  ondragend={onDragEnd}
>
  {#if imageUrl}
    <div
      class="relative w-full rounded-lg overflow-hidden shadow-lg bg-background"
    >
      <!-- Loading Overlay for Card -->
      {#if isLoading}
        <div class="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
          <IconLoader2 class="h-8 w-8 animate-spin text-white" />
        </div>
      {/if}

      <img src={imageUrl} alt={cardName} class="w-full h-auto" />

      {#if isPinned}
        <div
          class="absolute top-1 left-1 bg-primary text-primary-foreground rounded-full p-1 z-10"
        >
          <IconPinFilled class="h-3 w-3" />
        </div>
      {/if}

      {#if isHovered}
        <div
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2"
        >
          <div class="flex items-center justify-between text-white text-xs">
            <span class="font-bold">{price}</span>
            <div class="flex gap-1">
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  onTogglePin(card.id, isPinned);
                }}
                class="bg-white/20 hover:bg-white/30 rounded p-1 transition-colors"
                title={isPinned ? "Unpin" : "Pin"}
              >
                {#if isPinned}
                  <IconPinFilled class="h-3 w-3" />
                {:else}
                  <IconPin class="h-3 w-3" />
                {/if}
              </button>
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  onRemove(card.id, card.card_id, category);
                }}
                class="bg-destructive/80 hover:bg-destructive rounded p-1 transition-colors"
                title="Remove card"
              >
                <IconTrash class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="w-full aspect-[2.5/3.5] bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center"
    >
      <span class="text-xs text-muted-foreground text-center px-2"
        >{cardName}</span
      >
    </div>
  {/if}
</div>
