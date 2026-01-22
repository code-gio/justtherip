<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {
    IconSearch,
    IconLoader2,
    IconPlus,
    IconCheck,
  } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    open?: boolean;
    packages: string[] | null;
    selectedCardIds?: Set<string>;
    onClose: () => void;
    onSelect: (cards: any[]) => void;
  }

  let {
    open = $bindable(false),
    packages,
    selectedCardIds = new Set(),
    onClose,
    onSelect,
  }: Props = $props();

  let searchQuery = $state("");
  let isSearching = $state(false);
  let searchResults = $state<any[]>([]);
  let selectedCards = $state<Set<string>>(new Set());

  async function handleSearch() {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    if (!packages || packages.length === 0) {
      toast.error("No packages configured for this deck");
      return;
    }

    isSearching = true;
    searchResults = [];

    try {
      const allResults: any[] = [];

      // Search in each package table
      for (const pkg of packages) {
        const tableName = `${pkg}_cards`;

        const response = await fetch("/api/cards/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            table: tableName,
            query: searchQuery,
            limit: 50,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.cards) {
            allResults.push(
              ...data.cards.map((card: any) => ({
                ...card,
                game_code: pkg,
                card_table: tableName,
              })),
            );
          }
        }
      }

      searchResults = allResults;

      if (allResults.length === 0) {
        toast.info("No cards found", {
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: "An error occurred while searching",
      });
    } finally {
      isSearching = false;
    }
  }

  function toggleCard(cardId: string) {
    if (selectedCards.has(cardId)) {
      selectedCards.delete(cardId);
    } else {
      selectedCards.add(cardId);
    }
    selectedCards = new Set(selectedCards);
  }

  function handleAddSelected() {
    const cardsToAdd = searchResults.filter((card) =>
      selectedCards.has(card.id),
    );

    if (cardsToAdd.length === 0) {
      toast.error("No cards selected");
      return;
    }

    onSelect(cardsToAdd);

    // Reset
    searchQuery = "";
    searchResults = [];
    selectedCards = new Set();
    open = false;
  }

  function handleOpenChange(newOpen: boolean) {
    open = newOpen;
    if (!newOpen) {
      searchQuery = "";
      searchResults = [];
      selectedCards = new Set();
      onClose();
    }
  }

  function getCardImageUrl(card: any): string | null {
    if (!card.image_uri) return null;

    if (typeof card.image_uri === "string") {
      return card.image_uri;
    }

    if (typeof card.image_uri === "object") {
      return (
        card.image_uri.normal ||
        card.image_uri.small ||
        card.image_uri.large ||
        null
      );
    }

    return null;
  }

  function getCardPrice(card: any): string {
    if (card.prices) {
      const usd = parseFloat(card.prices.usd || "0");
      const usdFoil = parseFloat(card.prices.usd_foil || "0");
      const maxPrice = Math.max(usd, usdFoil);
      return maxPrice > 0 ? `$${maxPrice.toFixed(2)}` : "N/A";
    }

    if (card.market_value_cents) {
      return `$${(card.market_value_cents / 100).toFixed(2)}`;
    }

    return "N/A";
  }

  function isCardInDeck(cardId: string): boolean {
    return selectedCardIds.has(cardId);
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !isSearching) {
      handleSearch();
    }
  }
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content class="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
    <Dialog.Header>
      <Dialog.Title>Search Cards</Dialog.Title>
      <Dialog.Description>
        Search for cards to add to your deck
      </Dialog.Description>
    </Dialog.Header>

    <div class="space-y-4 flex-1 flex flex-col overflow-hidden">
      <!-- Search Input -->
      <div class="space-y-2">
        <Label for="card-search">Card Name</Label>
        <div class="flex gap-2">
          <Input
            id="card-search"
            bind:value={searchQuery}
            placeholder="Enter card name..."
            disabled={isSearching}
            onkeypress={handleKeyPress}
          />
          <Button
            onclick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            {#if isSearching}
              <IconLoader2 class="h-4 w-4 animate-spin" />
            {:else}
              <IconSearch class="h-4 w-4 mr-2" />
              Search
            {/if}
          </Button>
        </div>
      </div>

      <!-- Search Results -->
      {#if searchResults.length > 0}
        <div class="flex-1 overflow-hidden flex flex-col">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-muted-foreground">
              {searchResults.length} card{searchResults.length !== 1 ? "s" : ""}
              found
            </p>
            {#if selectedCards.size > 0}
              <p class="text-sm font-medium">
                {selectedCards.size} selected
              </p>
            {/if}
          </div>

          <div class="flex-1 overflow-y-auto border rounded-lg p-4">
            <div class="grid grid-cols-4 gap-4">
              {#each searchResults as card}
                {@const imageUrl = getCardImageUrl(card)}
                {@const price = getCardPrice(card)}
                {@const isSelected = selectedCards.has(card.id)}
                {@const alreadyInDeck = isCardInDeck(card.id)}

                <button
                  class="group relative rounded-lg overflow-hidden border-2 transition-all
										{isSelected
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent hover:border-primary/50'}
										{alreadyInDeck ? 'opacity-60' : ''}"
                  onclick={() => !alreadyInDeck && toggleCard(card.id)}
                  disabled={alreadyInDeck}
                >
                  {#if imageUrl}
                    <img
                      src={imageUrl}
                      alt={card.name}
                      class="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  {:else}
                    <div
                      class="aspect-[2.5/3.5] flex items-center justify-center bg-muted"
                    >
                      <span
                        class="text-xs text-muted-foreground text-center p-2"
                      >
                        {card.name}
                      </span>
                    </div>
                  {/if}

                  <!-- Selection indicator -->
                  {#if isSelected}
                    <div
                      class="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1"
                    >
                      <IconCheck class="h-4 w-4" />
                    </div>
                  {/if}

                  <!-- Already in deck indicator -->
                  {#if alreadyInDeck}
                    <div
                      class="absolute inset-0 bg-black/60 flex items-center justify-center"
                    >
                      <span class="text-white text-sm font-semibold"
                        >In Deck</span
                      >
                    </div>
                  {/if}

                  <!-- Hover overlay -->
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <p class="text-white text-xs font-semibold truncate">
                      {card.name}
                    </p>
                    <div class="flex justify-between items-center mt-1">
                      {#if card.set_code}
                        <span class="text-white/80 text-xs uppercase"
                          >{card.set_code}</span
                        >
                      {/if}
                      <span class="text-white font-bold text-xs">{price}</span>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {:else if searchQuery && !isSearching}
        <div
          class="flex-1 flex items-center justify-center text-muted-foreground"
        >
          <p class="text-sm">No results found</p>
        </div>
      {/if}
    </div>

    <Dialog.Footer class="flex justify-between items-center">
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      {#if selectedCards.size > 0}
        <Button onclick={handleAddSelected}>
          <IconPlus class="h-4 w-4 mr-2" />
          Add {selectedCards.size} Card{selectedCards.size !== 1 ? "s" : ""}
        </Button>
      {/if}
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
