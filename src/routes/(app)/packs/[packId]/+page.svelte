<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconLoader2,
    IconCoin,
    IconX,
    IconPackage,
    IconArrowLeft,
  } from "@tabler/icons-svelte";
  import { invalidateAll, goto } from "$app/navigation";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { balance, pack } = $derived(data);

  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let showCardReveal = $state(false);

  // TRACE: Log whenever pulledCard changes
  $effect(() => {
    if (pulledCard) {
      console.log("[TRACE] pulledCard changed (reactive):", {
        card_name: pulledCard.card_name,
        tier_name: pulledCard.tier_name,
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
    showCardReveal = false;

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
        tier_name: result.card?.tier_name,
        fullResponse: JSON.stringify(result, null, 2)
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      pulledCard = result.card;
      
      // TRACE: Log the pulledCard state after assignment
      console.log("[TRACE] pulledCard state after assignment:", {
        card_name: pulledCard?.card_name,
        tier_name: pulledCard?.tier_name,
        has_card_name: !!pulledCard?.card_name,
        fullPulledCard: JSON.stringify(pulledCard, null, 2)
      });

      showCardReveal = true;
      await invalidateAll();

      toast.success(
        `You pulled a ${result.card.tier_name} worth $${(result.card.value_cents / 100).toFixed(2)}!`
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

  function closeReveal() {
    showCardReveal = false;
    pulledCard = null;
  }

  function getTierGradient(tierName: string): string {
    const gradients: Record<string, string> = {
      Trash: "from-slate-400 to-slate-600",
      Low: "from-emerald-400 to-emerald-600",
      Mid: "from-blue-400 to-blue-600",
      High: "from-purple-400 to-purple-600",
      Chase: "from-amber-400 to-orange-500",
      "Ultra Chase": "from-rose-400 via-pink-500 to-purple-600",
    };
    return gradients[tierName] || "from-gray-400 to-gray-600";
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

    {#if showCardReveal && pulledCard}
      <!-- Card Reveal Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div
          class="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center max-w-md w-full"
        >
          <div class="relative w-full">
            <!-- Glow Effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r {getTierGradient(
                pulledCard.tier_name
              )} rounded-3xl blur-3xl opacity-60 scale-110 animate-pulse"
            ></div>

            <!-- Card -->
            <div
              class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br {getTierGradient(
                pulledCard.tier_name
              )} p-1 shadow-2xl"
            >
              <div
                class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8 text-center"
              >
                <div
                  class="px-3 py-1 rounded-full text-xs font-bold mb-4 bg-primary/10 text-primary border border-primary/20"
                >
                  {pulledCard.tier_name}
                </div>

                {#if pulledCard.card_image_url}
                  <img
                    src={pulledCard.card_image_url}
                    alt={pulledCard.card_name || "Card"}
                    class="w-32 h-44 object-contain mb-4 rounded-lg"
                    loading="eager"
                  />
                {/if}

                <div
                  class="text-5xl sm:text-6xl font-black mb-4 bg-gradient-to-br {getTierGradient(
                    pulledCard.tier_name
                  )} bg-clip-text text-transparent"
                >
                  ${((pulledCard.value_cents || 0) / 100).toFixed(2)}
                </div>

                {#if pulledCard}
                  <!-- TRACE: Log card name before display -->
                  {@const cardDisplayName = pulledCard.card_name || `${pulledCard.tier_name} Card`}
                  {(() => {
                    console.log("[TRACE] Template rendering card name:", {
                      pulledCard_card_name: pulledCard.card_name,
                      pulledCard_tier_name: pulledCard.tier_name,
                      cardDisplayName: cardDisplayName,
                      showCardReveal: showCardReveal,
                      pulledCard_exists: !!pulledCard
                    });
                    return '';
                  })()}
                  <p class="text-xl font-semibold mb-2">
                    {cardDisplayName}
                  </p>
                {/if}

                {#if pulledCard.set_name}
                  <p class="text-muted-foreground text-sm">{pulledCard.set_name}</p>
                {/if}

                {#if pulledCard.rarity}
                  <p class="text-xs text-muted-foreground mt-2">{pulledCard.rarity}</p>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="outline" size="lg" onclick={closeReveal}>
              <IconX size={18} class="mr-2" />
              Close
            </Button>
            <Button
              size="lg"
              onclick={openPack}
              disabled={isOpening || balance < pack.rip_cost}
            >
              <IconSparkles size={18} class="mr-2" />
              Open Another
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onclick={() => goto("/inventory")}
            >
              Inventory
            </Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="px-6 pb-12 max-w-7xl mx-auto">
      <div class="max-w-md mx-auto space-y-6">
        <!-- Pack Image -->
        <div class="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
          {#if pack.image_url}
            <img
              src={pack.image_url}
              alt={pack.name}
              class="w-full h-full object-cover"
            />
          {:else}
            <div class="w-full h-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center">
              <IconPackage size={64} class="text-white/50" />
            </div>
          {/if}

          <!-- Opening Overlay -->
          {#if isOpening}
            <div
              class="absolute inset-0 flex items-center justify-center bg-black/50"
            >
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
                You need {pack.rip_cost - balance} more Rips to open this pack
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
              class="w-full"
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
          <h2 class="text-2xl font-bold">Available Cards</h2>
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
