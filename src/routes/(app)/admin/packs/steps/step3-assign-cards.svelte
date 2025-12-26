<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { IconSearch, IconAlertCircle, IconPlus, IconX } from "@tabler/icons-svelte";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import * as Card from "$lib/components/ui/card/index.js";

  interface Step3Data {
    tierCards: Record<string, Array<{ cardId: string; weight: number; condition: string; isFoil: boolean }>>;
  }

  let {
    data,
    onComplete,
  }: {
    data: {
      game: "mtg" | "pokemon";
      tierProbabilities: Array<{ tierId: string; tierName: string; probability: number }>;
      tierCards: Record<string, Array<{ cardId: string; weight: number; condition: string; isFoil: boolean }>>;
    };
    onComplete: (data: Step3Data) => void;
  } = $props();

  let selectedTierId = $state<string | undefined>(
    data.tierProbabilities.length > 0 ? data.tierProbabilities[0].tierId : undefined
  );
  let searchQuery = $state("");
  let errors = $state<Record<string, string>>({});

  // TODO: Fetch from API - mtg_cards table filtered by game
  const mockCards = [
    { id: "1", name: "Force of Will", set: "Alliances", rarity: "Rare", market_value_cents: 500000, image_url: null },
    { id: "2", name: "Mana Crypt", set: "Eternal Masters", rarity: "Mythic", market_value_cents: 800000, image_url: null },
    { id: "3", name: "Lightning Bolt", set: "Alpha", rarity: "Common", market_value_cents: 5000, image_url: null },
    { id: "4", name: "Black Lotus", set: "Alpha", rarity: "Rare", market_value_cents: 50000000, image_url: null },
  ];

  let tierCards = $state<Record<string, Array<{
    cardId: string;
    cardName: string;
    cardSet: string;
    weight: number;
    condition: string;
    isFoil: boolean;
  }>>>({});

  // Initialize tierCards from data
  $effect(() => {
    if (data.tierCards) {
      const enriched: Record<string, Array<{
        cardId: string;
        cardName: string;
        cardSet: string;
        weight: number;
        condition: string;
        isFoil: boolean;
      }>> = {};
      
      for (const [tierId, cards] of Object.entries(data.tierCards)) {
        enriched[tierId] = cards.map((card) => {
          const cardInfo = mockCards.find((c) => c.id === card.cardId);
          return {
            cardId: card.cardId,
            cardName: cardInfo?.name || "Unknown Card",
            cardSet: cardInfo?.set || "Unknown Set",
            weight: card.weight,
            condition: card.condition,
            isFoil: card.isFoil,
          };
        });
      }
      
      tierCards = enriched;
    }
  });

  function getFilteredCards() {
    if (!searchQuery.trim()) {
      return mockCards;
    }
    const query = searchQuery.toLowerCase();
    return mockCards.filter(
      (card) =>
        card.name.toLowerCase().includes(query) ||
        card.set.toLowerCase().includes(query) ||
        card.rarity.toLowerCase().includes(query)
    );
  }

  function isCardInTier(cardId: string, tierId: string): boolean {
    return tierCards[tierId]?.some((tc) => tc.cardId === cardId) || false;
  }

  function addCardToTier(cardId: string, tierId: string) {
    const card = mockCards.find((c) => c.id === cardId);
    if (!card) return;

    if (!tierCards[tierId]) {
      tierCards[tierId] = [];
    }

    // Check if card already in this tier
    if (isCardInTier(cardId, tierId)) {
      return;
    }

    // Check if card is in another tier
    const inOtherTier = Object.keys(tierCards).some(
      (tid) => tid !== tierId && isCardInTier(cardId, tid)
    );
    if (inOtherTier) {
      errors.general = `${card.name} is already assigned to another tier`;
      return;
    }

    tierCards[tierId].push({
      cardId: card.id,
      cardName: card.name,
      cardSet: card.set,
      weight: 1,
      condition: "NM",
      isFoil: false,
    });

    errors.general = "";
  }

  function removeCardFromTier(cardId: string, tierId: string) {
    if (tierCards[tierId]) {
      tierCards[tierId] = tierCards[tierId].filter((tc) => tc.cardId !== cardId);
    }
  }

  function updateCardWeight(tierId: string, cardId: string, weight: number) {
    const card = tierCards[tierId]?.find((tc) => tc.cardId === cardId);
    if (card) {
      card.weight = Math.max(1, Math.floor(weight));
    }
  }

  function validate(): boolean {
    errors = {};

    for (const tier of data.tierProbabilities) {
      if (!tierCards[tier.tierId] || tierCards[tier.tierId].length === 0) {
        errors[`tier-${tier.tierId}`] = `${tier.tierName} tier must have at least 1 card`;
        return false;
      }
    }

    return true;
  }

  function handleSubmit() {
    if (validate()) {
      // Convert to expected format
      const formattedTierCards: Record<string, Array<{
        cardId: string;
        weight: number;
        condition: string;
        isFoil: boolean;
      }>> = {};

      for (const [tierId, cards] of Object.entries(tierCards)) {
        formattedTierCards[tierId] = cards.map((c) => ({
          cardId: c.cardId,
          weight: c.weight,
          condition: c.condition,
          isFoil: c.isFoil,
        }));
      }

      onComplete({ tierCards: formattedTierCards });
    }
  }

  const filteredCards = $derived(getFilteredCards());
  const isValid = $derived(validate());
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-xl font-semibold mb-1">Assign Cards to Tiers</h2>
    <p class="text-sm text-muted-foreground">
      Search for cards and assign them to tiers. Each tier must have at least one card.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left Panel: Tier Selector & Card List -->
    <div class="space-y-4">
      <div>
        <Label>Select Tier</Label>
        <Tabs.Root bind:value={selectedTierId} class="mt-2">
          <Tabs.List class="grid w-full" style="grid-template-columns: repeat({data.tierProbabilities.length}, 1fr);">
            {#each data.tierProbabilities as tier (tier.tierId)}
              <Tabs.Trigger value={tier.tierId} class="text-xs">
                {tier.tierName}
                <Badge variant="secondary" class="ml-1">
                  {tierCards[tier.tierId]?.length || 0}
                </Badge>
              </Tabs.Trigger>
            {/each}
          </Tabs.List>
        </Tabs.Root>
      </div>

      {#if selectedTierId}
        {@const selectedTier = data.tierProbabilities.find((t) => t.tierId === selectedTierId)}
        {#if selectedTier}
          <div class="border rounded-lg p-4 space-y-4">
            <div>
              <h3 class="font-semibold">{selectedTier.tierName} Tier</h3>
              <p class="text-sm text-muted-foreground">
                Probability: {selectedTier.probability}%
              </p>
            </div>

            <div class="space-y-2">
              <Label>Search Cards</Label>
              <div class="relative">
                <IconSearch
                  size={18}
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  bind:value={searchQuery}
                  placeholder="Search by name, set, or rarity..."
                  class="pl-9"
                />
              </div>
            </div>

            <div class="space-y-2 max-h-[400px] overflow-y-auto">
              {#each filteredCards as card (card.id)}
                {@const isInTier = isCardInTier(card.id, selectedTierId)}
                <Card.Root class={isInTier ? "border-primary" : ""}>
                  <Card.Content class="p-3">
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">{card.name}</p>
                        <p class="text-xs text-muted-foreground">
                          {card.set} • {card.rarity}
                        </p>
                        <p class="text-xs text-muted-foreground">
                          ${(card.market_value_cents / 100).toFixed(2)}
                        </p>
                      </div>
                      {#if isInTier}
                        <Button
                          variant="ghost"
                          size="sm"
                          onclick={() => {
                            if (selectedTierId) {
                              removeCardFromTier(card.id, selectedTierId);
                            }
                          }}
                        >
                          <IconX size={16} />
                        </Button>
                      {:else}
                        <Button
                          variant="outline"
                          size="sm"
                          onclick={() => {
                            if (selectedTierId) {
                              addCardToTier(card.id, selectedTierId);
                            }
                          }}
                        >
                          <IconPlus size={16} />
                        </Button>
                      {/if}
                    </div>
                  </Card.Content>
                </Card.Root>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Right Panel: Cards in Selected Tier -->
    <div class="space-y-4">
      <div>
        <h3 class="font-semibold mb-4">Cards in Selected Tier</h3>
        {#if selectedTierId && tierCards[selectedTierId]?.length > 0}
          <div class="space-y-2">
            {#each tierCards[selectedTierId] as card (card.cardId)}
              <Card.Root>
                <Card.Content class="p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="font-medium">{card.cardName}</p>
                      <p class="text-xs text-muted-foreground">{card.cardSet}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1">
                        <Label for="weight-{card.cardId}" class="text-xs">Weight:</Label>
                        <Input
                          id="weight-{card.cardId}"
                          type="number"
                          min="1"
                          value={card.weight}
                          oninput={(e) => {
                            if (selectedTierId) {
                              updateCardWeight(
                                selectedTierId,
                                card.cardId,
                                parseInt(e.currentTarget.value) || 1
                              );
                            }
                          }}
                          class="w-16 h-8"
                        />
                      </div>
                      <Checkbox
                        id="foil-{card.cardId}"
                        checked={card.isFoil}
                        onCheckedChange={(checked) => {
                          card.isFoil = checked || false;
                        }}
                      />
                      <Label for="foil-{card.cardId}" class="text-xs">Foil</Label>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            {/each}
          </div>
        {:else}
          <div class="border rounded-lg p-8 text-center text-muted-foreground">
            <p>No cards assigned to this tier yet.</p>
            <p class="text-sm mt-2">Search and add cards from the left panel.</p>
          </div>
        {/if}
      </div>

      <!-- Validation Summary -->
      <div class="space-y-2">
        {#each data.tierProbabilities as tier (tier.tierId)}
          {#if errors[`tier-${tier.tierId}`]}
            <Alert variant="destructive">
              <IconAlertCircle size={16} />
              <AlertDescription>{errors[`tier-${tier.tierId}`]}</AlertDescription>
            </Alert>
          {/if}
        {/each}

        {#if errors.general}
          <Alert variant="destructive">
            <IconAlertCircle size={16} />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex justify-end pt-4 border-t">
    <Button onclick={handleSubmit} disabled={!isValid}>
      Save Card Pool
    </Button>
  </div>
</div>

