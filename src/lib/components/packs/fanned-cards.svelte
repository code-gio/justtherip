<script lang="ts">
  import { IconPackage } from "@tabler/icons-svelte";

  interface Card {
    id: string;
    name: string;
    image_url: string | null;
  }

  let {
    cards,
    class: className = "",
  }: {
    cards: Card[];
    class?: string;
  } = $props();
</script>

<div class="relative w-full h-full flex items-center justify-center {className}">
  <div class="relative w-full h-full flex items-center justify-center">
    {#each cards as card, index (card.id)}
      {@const rotation = index === 0 ? -8 : index === 1 ? 0 : 8}
      {@const zIndex = index + 1}
      {@const translateX = index === 0 ? -20 : index === 1 ? 0 : 20}
      <div
        class="absolute transition-all duration-300 group-hover:scale-105"
        style="transform: rotate({rotation}deg) translateX({translateX}px); z-index: {zIndex};"
      >
        {#if card.image_url}
          <img
            src={card.image_url}
            alt={card.name}
            class="w-36 h-52 sm:w-40 sm:h-56 md:w-48 md:h-72 object-cover rounded-lg shadow-xl border-2 border-background"
            loading="lazy"
          />
        {:else}
          <div
            class="w-36 h-52 sm:w-40 sm:h-56 md:w-48 md:h-72 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border-2 border-background"
          >
            <IconPackage size={32} class="text-muted-foreground/50" />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
