<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card/index.js";
  import { IconSearch, IconLoader2 } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import AvailableCardItem from "./card-assignment/available-card-item.svelte";
  import AssignedCardItem from "./card-assignment/assigned-card-item.svelte";
  import CardImageDialog from "./card-assignment/card-image-dialog.svelte";

  interface CardTier {
    id: string;
    name: string;
    min_value_cents: number;
    max_value_cents: number;
  }

  interface Card {
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

  interface PackCard {
    card_uuid: string;
    tier_id: string;
    odds: number;
    market_value: number;
    is_foil: boolean;
    condition: string;
    cardData?: {
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
      prices?: {
        usd?: string;
        usd_foil?: string;
        eur?: string;
      };
      market_value_cents?: number;
      set_code?: string;
      set_name?: string;
      rarity?: string;
    } | null;
  }

  let {
    gameCode,
    tier,
    packId,
    assignedCards = [],
    onAddCard,
    onRemoveCard,
    onUpdateCardOdds,
  }: {
    gameCode: string;
    tier: CardTier;
    packId: string;
    assignedCards?: PackCard[];
    onAddCard?: (card: Card, tierId: string) => void;
    onRemoveCard?: (cardId: string) => void;
    onUpdateCardOdds?: (cardId: string, odds: number) => void;
  } = $props();

  let searchQuery = $state("");
  let cards = $state<Card[]>([]);
  let isLoading = $state(false);
  let currentPage = $state(1);
  let hasMore = $state(false);
  let totalCards = $state(0);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  let selectedCardImage = $state<string | null>(null);
  let imageDialogOpen = $state(false);

  const assignedCardIds = $derived(assignedCards.map((ac) => ac.card_uuid));
  
  // Create a map of card_uuid -> card data for quick lookup (from search results)
  const cardDataMap = $derived(
    new Map(cards.map((card) => [card.id, card]))
  );

  function getCardDataForAssignedCard(packCard: PackCard): Card | null {
    // First check if cardData is already in the packCard (from server)
    if (packCard.cardData) {
      const cardData = packCard.cardData as any;
      // Ensure the cardData has the id field matching card_uuid
      if (!cardData.id) {
        cardData.id = packCard.card_uuid;
      }
      return cardData as Card;
    }
    // Fall back to looking it up from the cards array (from search)
    const foundCard = cardDataMap.get(packCard.card_uuid);
    return foundCard || null;
  }

  function getCardPrice(card: Card): number {
    if (gameCode === "mtg" && card.prices) {
      const usd = parseFloat(card.prices.usd || "0");
      const usdFoil = parseFloat(card.prices.usd_foil || "0");
      return Math.max(usd, usdFoil) * 100; // Convert to cents
    }
    return card.market_value_cents || 0;
  }

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function getCardImageUrl(card: Card, size: "small" | "normal" | "large" = "normal"): string | null {
    if (!card.image_uri) return null;

    if (typeof card.image_uri === "string") {
      return card.image_uri;
    }

    if (typeof card.image_uri === "object") {
      return card.image_uri[size] || card.image_uri.normal || card.image_uri.small || null;
    }

    return null;
  }

  function handleImageClick(card: Card) {
    const imageUrl = getCardImageUrl(card, "large") || getCardImageUrl(card, "normal");
    if (imageUrl) {
      selectedCardImage = imageUrl;
      imageDialogOpen = true;
    }
  }

  async function loadCards(page: number = 1, reset: boolean = false) {
    if (isLoading) return;

    isLoading = true;
    try {
      const params = new URLSearchParams({
        game_code: gameCode,
        tier_id: tier.id,
        page: page.toString(),
        min_value_cents: tier.min_value_cents.toString(),
        max_value_cents: tier.max_value_cents.toString(),
        pack_id: packId,
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/cards/search?${params}`);
      const result = await response.json();

      if (result.error) {
        console.error("Error loading cards:", result.error);
        return;
      }

      if (reset) {
        cards = result.cards || [];
      } else {
        cards = [...cards, ...(result.cards || [])];
      }

      currentPage = result.page;
      hasMore = result.hasMore;
      totalCards = result.total;
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      currentPage = 1;
      loadCards(1, true);
    }, 500);
  }

  function handleLoadMore() {
    if (!isLoading && hasMore) {
      loadCards(currentPage + 1, false);
    }
  }

  function handleAddCard(card: Card) {
    const priceCents = getCardPrice(card);
    if (onAddCard) {
      onAddCard(card, tier.id);
    }
  }

  function handleRemoveCard(cardId: string) {
    if (onRemoveCard) {
      onRemoveCard(cardId);
    }
  }

  function handleUpdateOdds(cardId: string, odds: number) {
    if (onUpdateCardOdds) {
      onUpdateCardOdds(cardId, odds);
    }
  }

  function isCardAssigned(cardId: string): boolean {
    return assignedCardIds.includes(cardId);
  }

  function getAssignedCard(cardUuid: string): PackCard | undefined {
    return assignedCards.find((ac) => ac.card_uuid === cardUuid);
  }

  // Load initial cards
  onMount(() => {
    loadCards(1, true);
  });

  // Reload when search query changes
  $effect(() => {
    if (searchQuery !== undefined) {
      handleSearch();
    }
  });
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label>
      Search Cards ({formatPrice(tier.min_value_cents)} - {formatPrice(tier.max_value_cents)})
    </Label>
    <div class="relative">
      <IconSearch
        size={18}
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        bind:value={searchQuery}
        placeholder="Search by name..."
        class="pl-9"
      />
    </div>
    {#if totalCards > 0}
      <p class="text-xs text-muted-foreground">
        Found {totalCards} card{totalCards !== 1 ? "s" : ""}
      </p>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-4">
    <!-- Available Cards -->
    <div class="space-y-2">
      <h4 class="font-semibold text-sm">Available Cards</h4>
      <div class="max-h-[600px] overflow-y-auto">
        {#if isLoading && cards.length === 0}
          <div class="flex items-center justify-center py-8">
            <IconLoader2 size={24} class="animate-spin text-muted-foreground" />
          </div>
        {:else if cards.length === 0}
          <div class="border rounded-lg p-8 text-center text-muted-foreground">
            <p class="text-sm">No cards found</p>
          </div>
        {:else}
          <div class="grid grid-cols-3 gap-3">
            {#each cards as card (card.id)}
              {@const isAssigned = isCardAssigned(card.id)}
              {@const priceCents = getCardPrice(card)}
                  <AvailableCardItem
                    {card}
                    {gameCode}
                    {isAssigned}
                    {priceCents}
                    priceFormatted={formatPrice(priceCents)}
                    onImageClick={handleImageClick}
                    onAddCard={handleAddCard}
                  />
            {/each}
          </div>

          {#if hasMore}
            <div class="mt-4">
              <Button
                variant="outline"
                class="w-full"
                onclick={handleLoadMore}
                disabled={isLoading}
              >
                {#if isLoading}
                  <IconLoader2 size={16} class="mr-2 animate-spin" />
                {/if}
                Load More
              </Button>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Assigned Cards -->
    <div class="space-y-2">
      <h4 class="font-semibold text-sm">Assigned to {tier.name}</h4>
      <div class="space-y-2 max-h-[600px] overflow-y-auto">
        {#if assignedCards.length === 0}
          <div class="border rounded-lg p-8 text-center text-muted-foreground">
            <p class="text-sm">No cards assigned yet</p>
          </div>
        {:else}
          {#each assignedCards as packCard (packCard.card_uuid)}
            {@const cardData = getCardDataForAssignedCard(packCard)}
            <AssignedCardItem
              {packCard}
              {cardData}
              priceFormatted={formatPrice(packCard.market_value)}
              onUpdateOdds={handleUpdateOdds}
              onRemoveCard={handleRemoveCard}
            />
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Image Dialog -->
  <CardImageDialog bind:open={imageDialogOpen} imageUrl={selectedCardImage} />
</div>
