<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    IconLoader2,
    IconTrophy,
    IconPackage,
    IconCoins,
    IconCheck,
    IconTruck,
  } from "@tabler/icons-svelte";

  interface CardData {
    id: string;
    tier_name: string;
    card_image_url: string | null;
    card_name: string | null;
    card_value_cents: number;
    created_at: string;
    is_sold?: boolean;
    is_shipped?: boolean;
    shipment_id?: string | null;
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
  const isSold = $derived(card.is_sold === true);
  const isShipped = $derived(card.is_shipped === true || card.shipment_id !== null);
  const canSell = $derived(!isSold && !isShipped);
  const canShip = $derived(!isSold && !isShipped);

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

<div class="relative">
  <!-- Status Badge Overlay -->
  {#if isSold || isShipped}
    <div class="absolute top-2 right-2 z-10">
      {#if isSold}
        <Badge variant="destructive" class="text-xs">
          <IconCheck size={12} class="mr-1" />
          Sold
        </Badge>
      {:else if isShipped}
        <Badge class="text-xs">
          <IconTruck size={12} class="mr-1" />
          Shipped
        </Badge>
      {/if}
    </div>
  {/if}

  <button
    type="button"
    class="cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg relative {
      isSold || isShipped ? 'opacity-75' : ''
    }"
    onclick={handleOpenDialog}
    onkeydown={handleKeyDown}
    disabled={isSold && isShipped}
  >
    {#if card.card_image_url}
      <img
        src={card.card_image_url}
        alt={card.card_name || "Card"}
        class="w-full rounded-lg object-cover hover:opacity-90 transition-opacity {
          isSold || isShipped ? 'grayscale' : ''
        }"
      />
    {:else}
      <div class="w-full rounded-lg bg-muted flex items-center justify-center hover:opacity-90 transition-opacity {
        isSold || isShipped ? 'opacity-50' : ''
      }">
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
        disabled={isSelling || isShipping || !canSell}
        title={isSold ? "Card already sold" : isShipped ? "Card already shipped" : "Sell Card"}
      >
        {#if isSelling}
          <IconLoader2 size={18} class="animate-spin" />
        {:else}
          <IconCoins size={18} class={!canSell ? "opacity-50" : ""} />
        {/if}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onclick={handleShip}
        disabled={isSelling || isShipping || !canShip}
        title={isSold ? "Card already sold" : isShipped ? "Card already shipped" : "Ship Card"}
      >
        {#if isShipping}
          <IconLoader2 size={18} class="animate-spin" />
        {:else}
          <IconPackage size={18} class={!canShip ? "opacity-50" : ""} />
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

        {#if isSold || isShipped}
          <div class="pt-4">
            <div class="p-3 rounded-lg bg-muted border">
              {#if isSold}
                <p class="text-sm font-medium text-destructive flex items-center gap-2">
                  <IconCheck size={16} />
                  This card has been sold
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Sold cards cannot be shipped or sold again.
                </p>
              {:else if isShipped}
                <p class="text-sm font-medium flex items-center gap-2">
                  <IconTruck size={16} />
                  This card has been shipped
                </p>
                <p class="text-xs text-muted-foreground mt-1">
                  Shipped cards cannot be sold or shipped again.
                </p>
              {/if}
            </div>
          </div>
        {:else}
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
                dialogOpen = false;
                onShip(card.id);
              }}
              disabled={isSelling || isShipping}
            >
              <IconPackage class="mr-2" size={16} />
              Ship Card
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>

