<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { toast } from "svelte-sonner";
  import {
    IconSparkles,
    IconLoader2,
    IconCoin,
    IconX,
    IconChevronRight,
    IconShoppingCart,
  } from "@tabler/icons-svelte";
  import { invalidateAll, goto } from "$app/navigation";

  let { data } = $props();
  let { balance } = $derived(data);

  let isOpening = $state(false);
  let pulledCard = $state<any>(null);
  let showCardReveal = $state(false);
  let packHover = $state(false);

  async function openPack() {
    if (balance < 1) {
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
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open pack");
      }

      const result = await response.json();
      await new Promise((resolve) => setTimeout(resolve, 1800));

      pulledCard = result.card;
      showCardReveal = true;
      await invalidateAll();

      toast.success(
        `You pulled a ${result.card.tier_name} worth $${result.card.value_usd}!`
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
      Common: "from-slate-400 to-slate-600",
      Uncommon: "from-emerald-400 to-emerald-600",
      Rare: "from-blue-400 to-blue-600",
      Epic: "from-purple-400 to-purple-600",
      Legendary: "from-amber-400 to-orange-500",
      "Ultra Chase": "from-rose-400 via-pink-500 to-purple-600",
    };
    return gradients[tierName] || "from-gray-400 to-gray-600";
  }
</script>

<div class="relative min-h-[calc(100vh-8rem)] flex flex-col">
  <!-- Background Effects -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
      style="animation-delay: 1s"
    ></div>
  </div>

  <!-- Main Pack Area -->
  <div class="flex-1 flex flex-col items-center justify-center relative z-10">
    {#if showCardReveal && pulledCard}
      <!-- Card Reveal -->
      <div
        class="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center"
      >
        <div class="relative">
          <!-- Glow Effect -->
          <div
            class="absolute inset-0 bg-gradient-to-r {getTierGradient(
              pulledCard.tier_name
            )} rounded-3xl blur-2xl opacity-60 scale-110 animate-pulse"
          ></div>

          <!-- Card -->
          <div
            class="relative w-72 sm:w-80 aspect-[3/4] rounded-3xl bg-gradient-to-br {getTierGradient(
              pulledCard.tier_name
            )} p-1 shadow-2xl"
          >
            <div
              class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-6 text-center"
            >
              <Badge class="mb-4 text-sm px-4 py-1.5">{pulledCard.tier_name}</Badge>

              <div class="text-5xl sm:text-6xl font-black mb-2 bg-gradient-to-br {getTierGradient(pulledCard.tier_name)} bg-clip-text text-transparent">
                ${pulledCard.value_usd}
              </div>

              {#if pulledCard.card_name}
                <p class="text-lg font-semibold mb-1">{pulledCard.card_name}</p>
              {/if}

              {#if pulledCard.set_name}
                <p class="text-sm text-muted-foreground">{pulledCard.set_name}</p>
              {/if}

              {#if pulledCard.rarity}
                <p class="text-xs text-muted-foreground mt-1">{pulledCard.rarity}</p>
              {/if}
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <Button variant="outline" size="lg" onclick={closeReveal}>
            <IconX size={18} class="mr-2" />
            Close
          </Button>
          <Button
            size="lg"
            onclick={openPack}
            disabled={isOpening || balance < 1}
          >
            <IconSparkles size={18} class="mr-2" />
            Open Another
          </Button>
          <Button variant="secondary" size="lg" onclick={() => goto("/inventory")}>
            Inventory
            <IconChevronRight size={18} class="ml-1" />
          </Button>
        </div>
      </div>
    {:else}
      <!-- Pack Display -->
      <div class="flex flex-col items-center">
        <button
          onclick={openPack}
          disabled={isOpening || balance < 1}
          onmouseenter={() => (packHover = true)}
          onmouseleave={() => (packHover = false)}
          class="group relative cursor-pointer disabled:cursor-not-allowed transition-transform duration-300 {packHover && !isOpening ? 'scale-105' : ''}"
        >
          <!-- Animated Glow Ring -->
          <div
            class="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 {isOpening ? 'opacity-70 animate-pulse' : ''}"
          ></div>

          <!-- Pack Container -->
          <div
            class="relative w-64 sm:w-72 aspect-[3/4] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden"
          >
            <!-- Shine Effect -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>

            <!-- Pack Design -->
            <div class="absolute inset-0 flex flex-col items-center justify-center p-6">
              <!-- Logo Area -->
              <div
                class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg {isOpening ? 'animate-bounce' : ''}"
              >
                <IconSparkles size={40} class="text-white" />
              </div>

              <h2 class="text-2xl font-black text-white mb-1">RIP PACK</h2>
              <p class="text-white/60 text-sm mb-6">Standard Edition</p>

              <!-- Price Tag -->
              <div
                class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur"
              >
                <IconCoin size={18} class="text-amber-400" />
                <span class="font-bold text-white">1 Rip</span>
              </div>
            </div>

            <!-- Opening Animation Overlay -->
            {#if isOpening}
              <div
                class="absolute inset-0 bg-gradient-to-t from-amber-500/30 via-transparent to-transparent animate-pulse"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <IconLoader2 size={48} class="text-white animate-spin" />
              </div>
            {/if}
          </div>
        </button>

        <!-- CTA Text -->
        <div class="mt-8 text-center">
          {#if balance < 1}
            <p class="text-destructive mb-4">
              You need Rips to open packs
            </p>
            <Button onclick={() => goto("/store")}>
              <IconShoppingCart size={18} class="mr-2" />
              Get Rips
            </Button>
          {:else if isOpening}
            <p class="text-lg text-muted-foreground animate-pulse">
              Opening your pack...
            </p>
          {:else}
            <p class="text-lg text-muted-foreground mb-2">
              Click the pack to open
            </p>
            <p class="text-sm text-muted-foreground/70">
              Win cards worth up to <span class="text-amber-500 font-semibold">$500</span>
            </p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
