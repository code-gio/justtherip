<script lang="ts">
  import { IconPackage, IconCards } from "@tabler/icons-svelte";
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
    game_code?: string;
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


  $effect(() => {
    console.log(pack);
  });
</script>

<div
  class="pack-card group {className}"
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
  <div class="pack-card-bg"></div>
  <div class="pack-content">
    <!-- Top Cards or Pack Image -->
    <div class="pack-image-container">
      {#if pack.topCards && pack.topCards.length > 0}
        <FannedCards cards={pack.topCards} />
      {:else if pack.image}
        <!-- Fallback to Pack Image -->
        <img
          src={pack.image}
          alt={pack.name}
          class="pack-image"
          loading="lazy"
        />
      {:else}
        <!-- Placeholder -->
        <div class="pack-placeholder">
          <IconPackage size={64} class="text-muted-foreground/50" />
        </div>
      {/if}
    </div>

    <!-- Pack Info -->
    <div class="pack-info">
      {#if pack.game_code === "mtg"}
        <img src="/landing/packs/Magic-The-Gathering.svg" alt="Magic: The Gathering" class="game-logo magic-logo" />
      {:else if pack.game_code === "pokemon"}
        <img src="/landing/packs/PoKéMoN.svg" alt="Pokémon" class="game-logo pokemon-logo" />
      {:else}
        <IconCards size={32} class="game-icon" />
      {/if}
      <h3 class="pack-name">{pack.name}</h3>
      <span class="pack-price">{pack.price} Rips</span>
    </div>
  </div>
</div>

<style>
  .pack-card {
    position: relative;
    text-decoration: none;
    color: inherit;
    border-radius: 24px;
    overflow: visible;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease,
                z-index 0.1s ease;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    z-index: 1;
  }

  .pack-card:hover {
    z-index: 10;
  }

  .pack-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: linear-gradient(
      0deg,
      rgba(124, 58, 237, 0.6) 0%,
      rgba(91, 33, 182, 0.4) 20%,
      transparent 55%
    );
    transition: all 0.3s ease;
    border-radius: 24px;
    overflow: hidden;
  }

  .pack-card:hover .pack-card-bg {
    background: linear-gradient(
      0deg,
      rgba(124, 58, 237, 0.85) 0%,
      rgba(91, 33, 182, 0.65) 40%,
      transparent 100%
    );
  }

  .pack-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .pack-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .pack-image-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    aspect-ratio: 1;
    margin-bottom: 0.25rem;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 2;
  }

  .pack-card:hover .pack-image-container {
    transform: translateY(-10px);
    z-index: 20;
  }

  .pack-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pack-card:hover .pack-image {
    transform: scale(1.08);
  }

  .pack-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(138, 56, 245, 0.2) 0%,
      rgba(242, 56, 245, 0.1) 100%
    );
  }

  .pack-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
    margin-top: 1.5rem;
  }

  .game-logo {
    width: auto;
    margin-bottom: 0.5rem;
    filter: brightness(0) invert(1);
    transition: transform 0.4s cubic-bezier(0.34, 0.56, 0.64, 1);
  }

  .pokemon-logo {
    height: 40px;
  }

  .magic-logo {
    height: 60px;
  }

  .pack-card:hover .game-logo {
    transform: scale(1.15) translateY(-2px);
  }

  .game-icon {
    color: white;
    margin-bottom: 0.5rem;
    transition: transform 0.4s cubic-bezier(0.34, 0.56, 0.64, 1);
  }

  .pack-card:hover .game-icon {
    transform: scale(1.15) translateY(-2px);
  }

  .pack-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .pack-price {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
</style>
