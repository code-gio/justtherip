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

<div class="fanned-cards-container {className}">
  <div class="fanned-cards-inner">
    {#each cards as card, index (card.id)}
      {@const rotation = index === 0 ? -8 : index === 1 ? 0 : 8}
      {@const rotationHover = index === 0 ? -25 : index === 1 ? 0 : 25}
      {@const translateX = index === 0 ? -20 : index === 1 ? 0 : 20}
      {@const translateXHover = index === 0 ? -45 : index === 1 ? 0 : 45}
      {@const translateY = index === 0 ? 8 : index === 1 ? 0 : 8}
      {@const translateYHover = index === 0 ? -35 : index === 1 ? -8 : -35}
      {@const zIndex = index + 1}
      
      <div
        class="fanned-card"
        style="
          --rotation: {rotation}deg;
          --rotation-hover: {rotationHover}deg;
          --translate-x: {translateX}px;
          --translate-x-hover: {translateXHover}px;
          --translate-y: {translateY}px;
          --translate-y-hover: {translateYHover}px;
          z-index: {zIndex};
        "
      >
        {#if card.image_url}
          <img
            src={card.image_url}
            alt={card.name}
            class="card-image"
            loading="lazy"
          />
        {:else}
          <div class="card-placeholder pt-8">
            <IconPackage size={32} class="text-muted-foreground/50" />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .fanned-cards-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fanned-cards-inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fanned-card {
    position: absolute;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: rotate(var(--rotation)) translateX(var(--translate-x)) translateY(var(--translate-y));
  }

  :global(.group:hover) .fanned-card {
    transform: rotate(var(--rotation-hover)) translateX(var(--translate-x-hover)) translateY(var(--translate-y-hover)) scale(1.05);
    filter: brightness(1.1);
  }

  .card-image {
    width: 11rem;
    height: 15rem;
    object-fit: cover;
    border-radius: 0.75rem;
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(138, 56, 245, 0.3),
      inset 0 0 0 2px rgba(138, 56, 245, 0.2);
    border: 2px solid rgba(138, 56, 245, 0.3);
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  :global(.group:hover) .card-image {
    box-shadow: 
      0 20px 50px rgba(0, 0, 0, 0.7),
      0 0 40px rgba(242, 56, 245, 0.5),
      inset 0 0 0 2px rgba(242, 56, 245, 0.4);
    border-color: rgba(242, 56, 245, 0.5);
  }

  .card-placeholder {
    width: 7rem;
    height: 9.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.2) 0%,
      rgba(242, 56, 245, 0.1) 100%
    );
    border-radius: 0.75rem;
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(138, 56, 245, 0.3),
      inset 0 0 0 2px rgba(138, 56, 245, 0.2);
    border: 2px solid rgba(138, 56, 245, 0.3);
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  :global(.group:hover) .card-placeholder {
    box-shadow: 
      0 20px 50px rgba(0, 0, 0, 0.7),
      0 0 40px rgba(242, 56, 245, 0.5),
      inset 0 0 0 2px rgba(242, 56, 245, 0.4);
    border-color: rgba(242, 56, 245, 0.5);
  }

  @media (min-width: 640px) {
    .card-image,
    .card-placeholder {
      width: 9rem;
      height: 13rem;
    }
  }

  @media (min-width: 768px) {
    .card-image,
    .card-placeholder {
      width: 10rem;
      height: 14.5rem;
    }
  }

  @media (min-width: 1024px) {
    .card-image,
    .card-placeholder {
      width: 10.5rem;
      height: 15.5rem;
    }
  }

  @media (min-width: 1200px) {
    .card-image,
    .card-placeholder {
      width: 10rem;
      height: 14rem;
    }
  }

  @media (min-width: 1400px) {
    .card-image,
    .card-placeholder {
      width: 10.5rem;
      height: 15rem;
    }
  }

  @media (min-width: 1660px) {
    .card-image,
    .card-placeholder {
      width: 12rem;
      height: 18rem;
    }
  }
</style>
