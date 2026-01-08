<script lang="ts">
  import { IconPackage } from "@tabler/icons-svelte";
  import FannedCards from "./fanned-cards.svelte";

  interface TopCard {
    id: string;
    name: string;
    image_url: string | null;
    market_value: number;
  }

  interface Pack {
    id: string;
    name: string;
    image: string | null;
    price: number;
    topCards?: TopCard[];
  }

  let {
    pack,
    onClick,
    class: className = "",
  }: {
    pack: Pack;
    onClick?: () => void;
    class?: string;
  } = $props();
</script>

<div
  class="group overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer {className}"
  role="button"
  tabindex="0"
  onclick={onClick}
  onkeydown={(e) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  }}
>
  <!-- Top Cards or Pack Image -->
  <div class="relative aspect-square bg-muted overflow-hidden">
    {#if pack.topCards && pack.topCards.length > 0}
      <FannedCards cards={pack.topCards} />
    {:else if pack.image}
      <!-- Fallback to Pack Image -->
      <img
        src={pack.image}
        alt={pack.name}
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    {:else}
      <!-- Placeholder -->
      <div
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
      >
        <IconPackage size={64} class="text-muted-foreground/50" />
      </div>
    {/if}
  </div>

  <!-- Pack Info - Vertical Layout -->
  <div class="p-2 space-y-3">
    <!-- Pack Name -->
    <div>
      <h3 class="font-semibold text-lg leading-tight text-center">{pack.name}</h3>
    </div>

    <!-- Price -->
    <div class="flex items-center justify-center gap-1.5">
      <span class="text-xl font-bold">{pack.price}</span>
      <span class="text-sm text-muted-foreground">Rips</span>
    </div>
  </div>
</div>
