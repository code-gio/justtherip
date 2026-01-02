<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    IconLoader2,
    IconTrophy,
    IconPackage,
    IconCoins,
  } from "@tabler/icons-svelte";

  interface CardData {
    id: string;
    tier_name: string;
    card_image_url: string | null;
    card_name: string | null;
    card_value_cents: number;
    created_at: string;
  }

  interface Props {
    card: CardData;
    isSelling: boolean;
    isShipping: boolean;
    onSell: (cardId: string) => void;
    onShip: (cardId: string) => void;
  }

  let { card, isSelling, isShipping, onSell, onShip }: Props = $props();

  let dialogOpen = $state(false);
  const sellbackRips = $derived((card.card_value_cents * 0.85 / 100).toFixed(2));
  const cardValue = $derived((card.card_value_cents / 100).toFixed(2));

  function handleOpenDialog() {
    dialogOpen = true;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dialogOpen = true;
    }
  }

  function handleSell(event: MouseEvent) {
    event.stopPropagation();
    onSell(card.id);
  }

  function handleShip(event: MouseEvent) {
    event.stopPropagation();
    onShip(card.id);
  }
</script>

<div>
  <button
    type="button"
    class="cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    onclick={handleOpenDialog}
    onkeydown={handleKeyDown}
  >
    {#if card.card_image_url}
      <img
        src={card.card_image_url}
        alt={card.card_name || "Card"}
        class="w-full rounded-lg object-cover hover:opacity-90 transition-opacity"
      />
    {:else}
      <div class="w-full rounded-lg bg-muted flex items-center justify-center hover:opacity-90 transition-opacity">
        <IconTrophy size={64} class="text-muted-foreground" />
      </div>
    {/if}
  </button>

  <!-- Card Name, Cost, and Action Icons -->
  <div class="mt-2 flex items-center justify-between gap-2">
    <div class="flex-1 min-w-0">
      {#if card.card_name}
        <p class="text-sm font-medium truncate">{card.card_name}</p>
      {/if}
      <p class="text-sm text-muted-foreground">${cardValue}</p>
    </div>

    <!-- Action Icons -->
    <div class="flex gap-2 shrink-0">
      <Button
        size="icon"
        variant="ghost"
        onclick={handleSell}
        disabled={isSelling || isShipping}
        title="Sell Card"
      >
        {#if isSelling}
          <IconLoader2 size={18} class="animate-spin" />
        {:else}
          <IconCoins size={18} />
        {/if}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onclick={handleShip}
        disabled={isSelling || isShipping}
        title="Ship Card"
      >
        {#if isShipping}
          <IconLoader2 size={18} class="animate-spin" />
        {:else}
          <IconPackage size={18} />
        {/if}
      </Button>
    </div>
  </div>
</div>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="max-w-4xl">
    <Dialog.Header>
      <Dialog.Title>{card.card_name || "Card"}</Dialog.Title>
    </Dialog.Header>
    <div class="grid md:grid-cols-2 gap-6 py-4">
      <!-- Card Image -->
      <div class="flex items-center justify-center">
        {#if card.card_image_url}
          <img
            src={card.card_image_url}
            alt={card.card_name || "Card"}
            class="w-full max-w-sm rounded-lg object-cover"
          />
        {:else}
          <div class="w-full max-w-sm rounded-lg bg-muted flex items-center justify-center">
            <IconTrophy size={128} class="text-muted-foreground" />
          </div>
        {/if}
      </div>

      <!-- Card Information -->
      <div class="space-y-4">
        <div>
          <Badge variant="secondary" class="mb-2">
            {card.tier_name}
          </Badge>
          <h3 class="text-2xl font-bold">${cardValue}</h3>
          {#if card.card_name}
            <p class="text-lg text-muted-foreground mt-1">{card.card_name}</p>
          {/if}
        </div>

        <div class="space-y-2 text-sm text-muted-foreground">
          <p>
            <span class="font-medium">Pulled:</span>{" "}
            {new Date(card.created_at).toLocaleDateString()}
          </p>
          <p>
            <span class="font-medium">Sell-back Value:</span>{" "}
            <span class="font-bold text-primary">{sellbackRips} Rips</span> (85%)
          </p>
        </div>

        <div class="flex flex-col gap-3 pt-4">
          <Button
            class="w-full"
            variant="outline"
            onclick={() => {
              onSell(card.id);
              dialogOpen = false;
            }}
            disabled={isSelling || isShipping}
          >
            {#if isSelling}
              <IconLoader2 class="mr-2 animate-spin" size={16} />
              Selling...
            {:else}
              Sell Card
            {/if}
          </Button>
          <Button
            class="w-full"
            onclick={() => {
              onShip(card.id);
              dialogOpen = false;
            }}
            disabled={isSelling || isShipping}
          >
            {#if isShipping}
              <IconLoader2 class="mr-2 animate-spin" size={16} />
              Shipping...
            {:else}
              <IconPackage class="mr-2" size={16} />
              Ship Card
            {/if}
          </Button>
        </div>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

