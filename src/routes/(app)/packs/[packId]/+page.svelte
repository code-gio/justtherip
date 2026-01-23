<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconLoader2,
    IconCoin,
    IconPackage,
    IconArrowLeft,
  } from "@tabler/icons-svelte";
  import { invalidateAll, goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import PackOpeningAnimation from "$lib/components/packs/opening/pack-opening-animation.svelte";
  import ShipCardDialog from "$lib/components/inventory/ship-card-dialog.svelte";
  import FannedCards from "$lib/components/packs/fanned-cards.svelte";

  let { data }: { data: PageData } = $props();
  let { balance, pack } = $derived(data);

  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let isSelling = $state(false);
  let isShipping = $state(false);
  let shipDialogOpen = $state(false);
  let cardToShip = $state<any>(null);

  // TRACE: Log whenever pulledCard changes
  $effect(() => {
    if (pulledCard) {
      console.log("[TRACE] pulledCard changed (reactive):", {
        card_name: pulledCard.card_name,
        has_card_name: !!pulledCard.card_name,
        all_keys: Object.keys(pulledCard),
        full_object: JSON.stringify(pulledCard, null, 2)
      });
    }
  });

  async function openPack() {
    if (!pack || balance < pack.rip_cost) {
      toast.error("Insufficient Rips! Purchase more from the store.");
      return;
    }

    isOpening = true;
    pulledCard = null;

    try {
      const response = await fetch("/api/packs/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: pack.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open pack");
      }

      const result = await response.json();
      
      // TRACE: Log the API response
      console.log("[TRACE] API Response received:", {
        success: result.success,
        card: result.card,
        card_name: result.card?.card_name,
        fullResponse: JSON.stringify(result, null, 2)
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      pulledCard = result.card;
      
      // TRACE: Log the pulledCard state after assignment
      console.log("[TRACE] pulledCard state after assignment:", {
        card_name: pulledCard?.card_name,
        has_card_name: !!pulledCard?.card_name,
        fullPulledCard: JSON.stringify(pulledCard, null, 2)
      });

      await invalidateAll();

      toast.success(
        `You pulled ${result.card.card_name || 'a card'} worth $${(result.card.value_cents / 100).toFixed(2)}!`
      );
    } catch (error) {
      console.error("Pack opening error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open pack"
      );
    } finally {
      isOpening = false;
    }
  }

  async function sellCard(cardId: string) {
    try {
      isSelling = true;

      const response = await fetch("/api/inventory/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card_id: cardId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sell card");
      }

      const result = await response.json();

      toast.success(
        `Sold for ${result.rips_credited.toFixed(2)} Rips!`
      );

      pulledCard = null;
      await invalidateAll();
    } catch (error) {
      console.error("Error selling card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sell card"
      );
    } finally {
      isSelling = false;
    }
  }

  function openShipDialog(cardId: string) {
    if (pulledCard && pulledCard.id === cardId) {
      cardToShip = pulledCard;
      shipDialogOpen = true;
    }
  }

  async function shipCard(cardId: string, shippingAddressId?: string) {
    try {
      isShipping = true;

      const response = await fetch("/api/inventory/ship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          card_id: cardId,
          shipping_address_id: shippingAddressId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to ship card");
      }

      const result = await response.json();

      toast.success("Shipment request created successfully!");

      pulledCard = null;
      shipDialogOpen = false;
      cardToShip = null;
      await invalidateAll();
    } catch (error) {
      console.error("Error shipping card:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to ship card"
      );
      throw error;
    } finally {
      isShipping = false;
    }
  }

  function closeShipDialog() {
    shipDialogOpen = false;
    cardToShip = null;
  }

  function closeReveal() {
    pulledCard = null;
  }
</script>

{#if !pack}
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
      <IconPackage size={64} class="mx-auto text-muted-foreground mb-4" />
      <h1 class="text-2xl font-bold mb-2">Pack Not Found</h1>
      <p class="text-muted-foreground mb-6">
        This pack doesn't exist or has been removed.
      </p>
      <Button onclick={() => goto("/packs")}>
        <IconArrowLeft size={18} class="mr-2" />
        Back to Packs
      </Button>
    </div>
  </div>
{:else}
  <div class="min-h-screen">
    <!-- Back Button -->
    <div class="px-6 py-4 max-w-7xl mx-auto">
      <Button variant="ghost" size="sm" onclick={() => goto("/packs")}>
        <IconArrowLeft size={18} class="mr-2" />
        Back to Store
      </Button>
    </div>

    <PackOpeningAnimation
      bind:isOpening
      card={pulledCard}
      cardPool={pack.cards || []}
      onOpenAnother={openPack}
      onSell={sellCard}
      onShip={openShipDialog}
      onClose={closeReveal}
      {isSelling}
      {isShipping}
    />

    <!-- Main Content -->
    <div class="px-6 pb-12 max-w-7xl mx-auto">
      <div class="max-w-md mx-auto space-y-6">
        <!-- Pack Image or Fanned Cards -->
        <div class="pack-card-wrapper group">
          <div class="pack-card-bg"></div>
          {#if pack.topCards && pack.topCards.length > 0}
            <!-- Fanned Cards Display -->
            <div class="relative aspect-square flex items-center justify-center pack-image-container">
              <FannedCards cards={pack.topCards} />
              <!-- Opening Overlay -->
              {#if isOpening}
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                  <div class="text-center">
                    <IconLoader2
                      size={64}
                      class="text-white animate-spin mx-auto mb-4"
                    />
                    <p class="text-white text-xl font-bold">Opening...</p>
                  </div>
                </div>
              {/if}
            </div>
          {:else if pack.image_url}
            <!-- Fallback to Pack Image -->
            <div class="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-muted pack-image-container">
              <img
                src={pack.image_url}
                alt={pack.name}
                class="w-full h-full object-cover pack-image"
              />
              <!-- Opening Overlay -->
              {#if isOpening}
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                  <div class="text-center">
                    <IconLoader2
                      size={64}
                      class="text-white animate-spin mx-auto mb-4"
                    />
                    <p class="text-white text-xl font-bold">Opening...</p>
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <!-- Placeholder -->
            <div class="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center pack-image-container">
              <IconPackage size={64} class="text-white/50" />
              <!-- Opening Overlay -->
              {#if isOpening}
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                  <div class="text-center">
                    <IconLoader2
                      size={64}
                      class="text-white animate-spin mx-auto mb-4"
                    />
                    <p class="text-white text-xl font-bold">Opening...</p>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Pack Name -->
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">{pack.name}</h1>
          {#if pack.description}
            <p class="text-muted-foreground mb-4">{pack.description}</p>
          {/if}
        </div>

        <!-- Price and Button -->
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2">
            <IconCoin size={24} class="text-amber-500" />
            <span class="text-2xl font-bold">{pack.rip_cost} Rips</span>
          </div>

          {#if balance < pack.rip_cost}
            <div class="space-y-3">
              <p class="text-destructive text-sm text-center">
                You need {Math.ceil(pack.rip_cost - balance)} more Rips to open this pack
              </p>
              <Button
                class="w-full"
                size="lg"
                onclick={() => goto("/buy")}
              >
                <IconCoin size={18} class="mr-2" />
                Get Rips
              </Button>
            </div>
          {:else}
            <Button
              class="w-full text-white"
              size="lg"
              onclick={openPack}
              disabled={isOpening}
            >
              {#if isOpening}
                <IconLoader2 size={18} class="mr-2 animate-spin" />
                Opening...
              {:else}
                <IconSparkles size={18} class="mr-2" />
                Open Pack
              {/if}
            </Button>
          {/if}
        </div>
      </div>

      <!-- All Cards Grid -->
      {#if pack.cards && pack.cards.length > 0}
        <div class="mt-12 space-y-4">
          <div class="space-y-2 text-center">
            <h2 class="text-2xl font-bold">What's Inside?</h2>
            <p class="text-muted-foreground">
              1 of the {pack.totalCards || pack.cards.length} cards below
            </p>
            
            <!-- Stats Grid -->
            {#if pack.floor !== undefined && pack.ev !== undefined && pack.ceiling !== undefined}
              <div class="grid grid-cols-3 gap-4 mt-4">
                <div class="bg-muted/50 rounded-lg p-4 text-center">
                  <p class="text-xs text-muted-foreground mb-1">Floor</p>
                  <p class="text-lg font-bold">${(pack.floor / 100).toFixed(2)}</p>
                </div>
                <div class="bg-muted/50 rounded-lg p-4 text-center">
                  <p class="text-xs text-muted-foreground mb-1">EV</p>
                  <p class="text-lg font-bold">${(pack.ev / 100).toFixed(2)}</p>
                </div>
                <div class="bg-muted/50 rounded-lg p-4 text-center">
                  <p class="text-xs text-muted-foreground mb-1">Ceiling</p>
                  <p class="text-lg font-bold">${(pack.ceiling / 100).toFixed(2)}</p>
                </div>
              </div>
            {/if}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {#each pack.cards as card}
              <div
                class="group relative aspect-[2/3] rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-shadow"
              >
                {#if card.image_uri}
                  {@const imageUrl = typeof card.image_uri === 'string' 
                    ? card.image_uri 
                    : card.image_uri?.normal || card.image_uri?.small || card.image_uri?.png || ''}
                  {#if imageUrl}
                    <img
                      src={imageUrl}
                      alt={card.name}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center bg-muted">
                      <IconPackage size={32} class="text-muted-foreground/50" />
                    </div>
                  {/if}
                {:else}
                  <div class="w-full h-full flex items-center justify-center bg-muted">
                    <IconPackage size={32} class="text-muted-foreground/50" />
                  </div>
                {/if}
                
                <!-- Probability Badge -->
                {#if card.probability > 0}
                  <div
                    class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold bg-background/90 backdrop-blur-sm border border-border"
                  >
                    {(card.probability * 100).toFixed(2)}%
                  </div>
                {/if}

                <!-- Card Name Overlay -->
                <div
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2"
                >
                  <p class="text-xs font-medium text-white line-clamp-2">
                    {card.name}
                  </p>
                  {#if card.market_value}
                    <p class="text-xs text-white/80 mt-0.5">
                      ${(card.market_value / 100).toFixed(2)}
                    </p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if cardToShip}
  <ShipCardDialog
    bind:open={shipDialogOpen}
    card={cardToShip}
    onShip={shipCard}
    onClose={closeShipDialog}
  />
{/if}

<style>
  .pack-card-wrapper {
    position: relative;
    border-radius: 24px;
    padding: 2rem 1.5rem;
    overflow: visible;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease,
                z-index 0.1s ease;
    cursor: pointer;
    z-index: 1;
  }

  .pack-card-wrapper:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .pack-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: linear-gradient(0deg, rgba(124, 58, 237, 0.6) 0%, rgba(91, 33, 182, 0.4) 20%, transparent 55%);
    transition: all 0.3s ease;
    border-radius: 24px;
    pointer-events: none;
  }

  .pack-card-wrapper:hover .pack-card-bg {
    background: linear-gradient(0deg, rgba(124, 58, 237, 0.85) 0%, rgba(91, 33, 182, 0.65) 40%, transparent 100%);
  }

  .pack-image-container {
    position: relative;
    z-index: 2;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pack-card-wrapper:hover .pack-image-container {
    transform: translateY(-10px);
    z-index: 20;
  }

  .pack-image {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pack-card-wrapper:hover .pack-image {
    transform: scale(1.08);
  }

  :global(.pack-card-wrapper .pack-image-container > *) {
    position: relative;
    z-index: inherit;
  }
</style>
