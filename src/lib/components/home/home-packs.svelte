<script lang="ts">
  import { IconDiamond, IconFlame, IconSparkles, IconArrowRight } from "@tabler/icons-svelte";

  const featuredPacks = [
    {
      name: "Prismatic Evolution",
      game: "Pokémon",
      price: 250,
      badge: { text: "HOT", type: "hot" },
      gradient: "pokemon-1",
    },
    {
      name: "Surging Sparks",
      game: "Pokémon",
      price: 200,
      badge: null,
      gradient: "pokemon-2",
    },
    {
      name: "Foundations",
      game: "Magic: The Gathering",
      price: 180,
      badge: { text: "NEW", type: "new" },
      gradient: "mtg-1",
    },
    {
      name: "Duskmourn",
      game: "Magic: The Gathering",
      price: 220,
      badge: null,
      gradient: "mtg-2",
    },
  ];
</script>

<section id="packs" class="packs-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Pack Showcase</span>
      <h2 class="section-title">
        <span class="light">Featured</span>
        <span class="accent">Packs</span>
      </h2>
      <p class="section-description">
        Hand-curated packs with disclosed odds and real collectible pulls.<br />
        Each pack is designed to deliver the thrill of cracking packs — instantly.
      </p>
    </div>

    <div class="packs-grid">
      {#each featuredPacks as pack}
        <a href="/packs" class="pack-card">
          {#if pack.badge}
            <div class="pack-badge {pack.badge.type}">
              {#if pack.badge.type === "hot"}
                <IconFlame size={12} />
              {:else}
                <IconSparkles size={12} />
              {/if}
              {pack.badge.text}
            </div>
          {/if}
          <div class="pack-image {pack.gradient}"></div>
          <div class="pack-info">
            <span class="pack-game">{pack.game}</span>
            <span class="pack-name">{pack.name}</span>
            <div class="pack-price">
              <IconDiamond size={16} />
              <span>{pack.price} Jewels</span>
            </div>
          </div>
        </a>
      {/each}
    </div>

    <div class="section-cta">
      <a href="/packs" class="btn btn-outline">
        View All Packs
        <IconArrowRight size={18} />
      </a>
    </div>
  </div>
</section>

<style>
  .packs-section {
    padding: 8rem 0;
    background: var(--bg-card);
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-tag {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gold);
    margin-bottom: 1rem;
  }

  .section-title {
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 400;
    line-height: 1.1;
    margin: 0 0 1.5rem;
  }

  .section-title .light {
    font-weight: 400;
    color: var(--text-gray);
  }

  .section-title .accent {
    font-style: italic;
    color: var(--gold);
  }

  .section-description {
    font-size: 1.125rem;
    color: var(--text-gray);
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  .packs-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    .packs-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 540px) {
    .packs-grid {
      grid-template-columns: 1fr;
      max-width: 300px;
      margin: 0 auto;
    }
  }

  .pack-card {
    position: relative;
    background: var(--bg-elevated);
    border-radius: 16px;
    padding: 12px;
    border: 1px solid var(--border);
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
  }

  .pack-card:hover {
    transform: translateY(-8px);
    border-color: rgba(212, 168, 83, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .pack-badge {
    position: absolute;
    top: 4px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 100px;
    z-index: 1;
  }

  .pack-badge.hot {
    background: #ef4444;
  }

  .pack-badge.new {
    background: #8b5cf6;
  }

  .pack-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .pokemon-1 {
    background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #dc2626 100%);
  }

  .pokemon-2 {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
  }

  .mtg-1 {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6d28d9 100%);
  }

  .mtg-2 {
    background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
  }

  .pack-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pack-game {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .pack-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .pack-price {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--gold);
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 4px;
  }

  .section-cta {
    text-align: center;
    margin-top: 3rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.25s ease;
    cursor: pointer;
    border: none;
  }

  .btn-outline {
    background: transparent;
    color: var(--text-white);
    border: 1px solid var(--border);
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
</style>

