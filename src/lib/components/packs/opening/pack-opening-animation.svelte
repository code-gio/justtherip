<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    IconX,
    IconSparkles,
    IconLoader2,
  } from "@tabler/icons-svelte";

  interface Card {
    id: string;
    card_name: string;
    card_image_url?: string | null;
    tier_name: string;
    value_cents: number;
    set_name?: string | null;
    rarity?: string | null;
  }

  let {
    card,
    isOpening = $bindable(false),
    onClose,
    onOpenAnother,
  }: {
    card: Card | null;
    isOpening?: boolean;
    onClose: () => void;
    onOpenAnother: () => void;
  } = $props();

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

{#if isOpening}
  <!-- Opening Animation Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div class="flex flex-col items-center max-w-md w-full space-y-8">
      <!-- Pack Opening Animation -->
      <div class="relative w-64 h-96">
        <!-- Glow Effect -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-60 scale-110 animate-pulse"
        ></div>

        <!-- Pack Card with Animation -->
        <div
          class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-1 shadow-2xl animate-spin-slow"
        >
          <div
            class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8"
          >
            <IconLoader2
              size={64}
              class="text-primary animate-spin mb-4"
            />
            <p class="text-xl font-bold text-foreground">Opening Pack...</p>
            <p class="text-sm text-muted-foreground mt-2">The magic is happening!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if card && !isOpening}
  <!-- Card Reveal Overlay -->
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500"
  >
    <div
      class="flex flex-col items-center max-w-md w-full space-y-8"
    >
      <div class="relative w-full">
        <!-- Glow Effect -->
        <div
          class="absolute inset-0 bg-gradient-to-r {getTierGradient(
            card.tier_name
          )} rounded-3xl blur-3xl opacity-60 scale-110 animate-pulse"
        ></div>

        <!-- Card -->
        <div
          class="relative aspect-[3/4] rounded-3xl bg-gradient-to-br {getTierGradient(
            card.tier_name
          )} p-1 shadow-2xl"
        >
          <div
            class="w-full h-full rounded-[22px] bg-card flex flex-col items-center justify-center p-8 text-center"
          >
            <Badge class="mb-6 text-sm px-4 py-1.5"
              >{card.tier_name}</Badge
            >

            {#if card.card_image_url}
              <img
                src={card.card_image_url}
                alt={card.card_name}
                class="w-32 h-44 object-contain mb-4 rounded-lg"
              />
            {/if}

            <div
              class="text-5xl sm:text-6xl font-black mb-4 bg-gradient-to-br {getTierGradient(
                card.tier_name
              )} bg-clip-text text-transparent"
            >
              ${((card.value_cents || 0) / 100).toFixed(2)}
            </div>

            {#if card.card_name}
              <p class="text-xl font-semibold mb-2">
                {card.card_name}
              </p>
            {/if}

            {#if card.set_name}
              <p class="text-muted-foreground">{card.set_name}</p>
            {/if}

            {#if card.rarity}
              <p class="text-sm text-muted-foreground mt-2">
                {card.rarity}
              </p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap justify-center gap-3 w-full">
        <Button variant="outline" size="lg" onclick={onClose}>
          <IconX size={18} class="mr-2" />
          Close
        </Button>
        <Button size="lg" onclick={onOpenAnother}>
          <IconSparkles size={18} class="mr-2" />
          Open Another
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
</style>

