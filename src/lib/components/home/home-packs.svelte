<script lang="ts">
  const featuredPacks = [
    {
      name: "Prismatic Evolutions",
      game: "pokemon",
      price: 250,
      image: "/landing/packs/pack1.svg",
    },
    {
      name: "Surging Sparks",
      game: "pokemon",
      price: 200,
      image: "/landing/packs/pack2.svg",
    },
    {
      name: "Foundations",
      game: "magic",
      price: 180,
      image: "/landing/packs/pack3.svg",
    },
    {
      name: "Duskmourn",
      game: "magic",
      price: 220,
      image: "/landing/packs/pack4.svg",
    },
  ];
</script>

<section id="packs" class="packs-section mt-12">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">PACK SHOWCASE</span>
      <h2 class="section-title">FEATURED PACKS</h2>
      <p class="section-description">
        Hand-curated packs with disclosed odds and real collectible pulls.<br />
        Each pack is designed to deliver the thrill of cracking packs — instantly.
      </p>
    </div>

    <div class="packs-grid">
      {#each featuredPacks as pack, i}
        <a href="/packs" class="pack-card {pack.game}">
          <div class="pack-card-bg"></div>
          <div class="pack-content">
            <div class="pack-image-container ">
              <img src={pack.image} alt={pack.name} class="pack-image" />
            </div>
              <div class="pack-info -mt-10" >
                {#if pack.game === "pokemon"}
                  <img src="/landing/packs/PoKéMoN.svg" alt="Pokémon" class="game-logo pokemon-logo" />
                {:else}
                  <img src="/landing/packs/Magic-The-Gathering.svg" alt="Magic: The Gathering" class="game-logo magic-logo" />
                {/if}
              <span class="pack-name">{pack.name}</span>
              <span class="pack-price">{pack.price} Jewels</span>
            </div>
          </div>
          {#if i < featuredPacks.length - 1}
            <div class="connector-line"></div>
          {/if}
        </a>
      {/each}
    </div>

    <div class="section-cta">
      <a href="/packs" class="btn btn-primary">
        VIEW ALL PACKS
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</section>

<style>
  .packs-section {
    padding: 4rem 2rem 6rem;
  }

  .container {
    max-width: 1300px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: white;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
  }

  .section-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0 0 1rem;
    text-transform: uppercase;
  }

  .section-description {
    font-size: 16px;
    color: white;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }

  .packs-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    position: relative;
  }

  @media (max-width: 1024px) {
    .packs-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 540px) {
    .packs-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .pack-card {
    position: relative;
    text-decoration: none;
    color: inherit;
    border-radius: 24px;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .pack-card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    /* backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px); */
    transition: all 0.3s ease;
  }

  /* Pokémon gradient - bottom to top, fades to transparent */
  .pack-card.pokemon .pack-card-bg {
    background: linear-gradient(0deg, rgba(124, 58, 237, 0.6) 0%, rgba(91, 33, 182, 0.4) 20%, transparent 55%);
  }

  /* Magic gradient - bottom to top, fades to transparent */
  .pack-card.magic .pack-card-bg {
    background: linear-gradient(0deg, rgba(13, 148, 136, 0.6) 0%, rgba(15, 118, 110, 0.4) 40%, transparent 55%);
  }

  /* Hover: Increase gradient brightness */
  .pack-card.pokemon:hover .pack-card-bg {
    background: linear-gradient(0deg, rgba(124, 58, 237, 0.85) 0%, rgba(91, 33, 182, 0.65) 40%, transparent 100%);
  }

  .pack-card.magic:hover .pack-card-bg {
    background: linear-gradient(0deg, rgba(13, 148, 136, 0.85) 0%, rgba(15, 118, 110, 0.65) 40%, transparent 100%);
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
    margin-bottom: 0.25rem;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .pack-card:hover .pack-image-container {
    transform: translateY(-10px);
  }

  .pack-image {
    max-width: 100%;
    height: 450px;
    object-fit: cover;
  }

  .pack-card:hover .pack-image {
    transform: scale(1.08);
  }

  .pack-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
  }

  .game-logo {
    width: auto;
    margin-bottom: 0;
    filter: brightness(0) invert(1);
    transition: transform 0.4s cubic-bezier(0.34, 0.56, 0.64, 1), height 0.4s ease;
  }

  .pokemon-logo {
    height: 40px;
  }

  .magic-logo {
    height: 60px;
  }

  .pack-card:hover .game-logo {
    transform: scale(1.50) translateY(-4px);
  }

  .pack-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
  }

  .pack-price {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  /* Connector lines between packs */
  .connector-line {
    position: absolute;
    top: 50%;
    right: -1.5rem;
    width: 1.5rem;
    height: 2px;
    background: linear-gradient(90deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      transparent 50%, 
      rgba(255, 255, 255, 0.2) 100%);
    background-size: 8px 2px;
    background-repeat: repeat-x;
    z-index: 2;
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    .connector-line {
      display: none;
    }
  }

  .section-cta {
    text-align: center;
    margin-top: 3rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    font-size: 16px;
    font-weight: 700;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.25s ease;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #6829F9;
    color: white;
    border: none;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(104, 41, 249, 0.4);
  }

  .btn-outline {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-white);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
</style>
