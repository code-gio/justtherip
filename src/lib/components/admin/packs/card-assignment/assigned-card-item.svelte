<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { IconX } from "@tabler/icons-svelte";
  import CardImageDialog from "./card-image-dialog.svelte";

  interface PackCard {
    card_uuid: string;
    market_value: number;
    is_foil: boolean;
    condition: string;
  }

  interface CardData {
    id: string;
    name?: string;
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
    packCard,
    priceFormatted,
    cardData,
    onRemoveCard,
  }: {
    packCard: PackCard;
    priceFormatted: string;
    cardData?: CardData | null;
    onRemoveCard: (cardId: string) => void;
  } = $props();

  let imageDialogOpen = $state(false);
  let selectedCardImage = $state<string | null>(null);

  function getCardImageUrl(
    card: CardData,
    size: "small" | "normal" | "large" = "normal"
  ): string | null {
    if (!card?.image_uri) return null;

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

  function handleImageClick() {
    if (!cardData) return;
    const imageUrl = getCardImageUrl(cardData, "large") || getCardImageUrl(cardData, "normal");
    if (imageUrl) {
      selectedCardImage = imageUrl;
      imageDialogOpen = true;
    }
  }

  const cardImageUrl = $derived(cardData ? getCardImageUrl(cardData, "small") : null);
  const cardName = $derived(cardData?.name || `Card #${packCard.card_uuid.slice(0, 8)}...`);
</script>

<div class="bg-background border p-2 rounded-lg">
  <!-- Card Image -->
  {#if cardImageUrl}
    <button
      type="button"
      class="w-full rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onclick={handleImageClick}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleImageClick();
        }
      }}
      aria-label={`View full image of ${cardName}`}
    >
      <img
        src={cardImageUrl}
        alt={cardName}
        class="w-full h-auto object-cover"
        loading="lazy"
      />
    </button>
  {:else}
    <div class="w-full bg-muted rounded flex items-center justify-center aspect-2/3">
      <span class="text-xs text-muted-foreground">No Image</span>
    </div>
  {/if}

  <!-- Bottom Info -->
  <div class="flex items-center justify-between gap-2 mt-2">
    <div class="flex-1 min-w-0">
      <p class="font-medium text-sm truncate">{cardName}</p>
      <p class="text-xs text-muted-foreground">{priceFormatted}</p>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onclick={() => onRemoveCard(packCard.card_uuid)}
    >
      <IconX size={16} />
    </Button>
  </div>
</div>

<!-- Image Dialog -->
<CardImageDialog bind:open={imageDialogOpen} imageUrl={selectedCardImage} />

