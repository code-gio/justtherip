<script lang="ts">
  interface GameData {
    game_code: string;
    packs: number;
  }

  interface Props {
    packsByGame: GameData[];
  }

  let { packsByGame }: Props = $props();

  const gameMap: Record<string, { name: string; image: string }> = {
    mtg: {
      name: "magic",
      image: "/landing/games/magic.svg"
    },
    pokemon: {
      name: "pokemon",
      image: "/landing/games/pokemon.svg"
    }
  };

  const games = $derived(
    Object.entries(gameMap).map(([code, { name, image }]) => {
      const gameData = packsByGame?.find(g => g.game_code === code);
      return {
        code,
        name,
        image,
        packs: gameData?.packs ?? 0
      };
    })
  );
</script>

<section class="games-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">SUPPORTED GAMES</span>
      <h2 class="section-title">YOUR FAVORITE TCGs.</h2>
    </div>

    <div class="games-grid">
      {#each games as game}
        <a href="/packs?game={game.name}" class="game-card {game.name}">
          <div class="game-image-container">
            <img src={game.image} alt={game.name} class="game-image" />
          </div>
          <div class="game-info">
            {#if game.packs > 0}
              <span class="packs-available">{game.packs} PACKS AVAILABLE</span>
            {:else}
              <span class="packs-available">COMING SOON</span>
            {/if}
          </div>
        </a>
      {/each}
    </div>

    <p class="coming-soon">More games and drops coming soon.</p>
  </div>
</section>

<style>
  .games-section {
    padding: 6rem 2rem;
    background-color: transparent;
    background-image: url("/landing/games/game-ellipse.svg");
    background-size: auto;
    background-position: right bottom;
    background-repeat: no-repeat;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .section-tag {
    display: block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--text-muted);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .section-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0;
    text-transform: uppercase;
  }

  .games-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 7rem;
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    .games-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }

  .game-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    border-radius: 24px;
    overflow: hidden;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .game-card:hover {
    transform: translateY(-8px);
  }

  .game-image-container {
    position: relative;
    width: 100%;
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    padding: 3rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 320px;
  }

  /* Pokémon gradient - cyan to blue/purple, fades from bottom to top */
  .game-card.pokemon .game-image-container {
    background: linear-gradient(0deg, rgba(69, 56, 245, 0.4) 0%, rgba(69, 56, 245, 0.4) 20%, rgba(56, 245, 223, 0.4) 70%, transparent 85%);
    /* opacity: 0.5; */
    /* background:
      linear-gradient(0deg, rgba(69, 56, 245, 1) 0%),
      rgba(69, 56, 245, 0.5) 25%,
      rgba(56, 245, 223, 0.6) 65%; */
  }

   

  /* Magic gradient - pink/magenta to dark red/purple, fades from bottom to top */
  .game-card.magic .game-image-container {
    background: linear-gradient(
      180deg,
      rgba(147, 64, 91, 0) 15%,
      rgba(147, 64, 91, 0.6) 65%,
      rgba(147, 64, 91, 0.9) 85%,
      rgba(147, 64, 91, 1) 100%
    );
  }

  .game-image {
    width: 400px;
    height: auto;
    display: block;
    object-fit: cover;
  }

  .game-info {
    text-align: center;
  }

  .packs-available {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-white);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    .packs-available {
      font-size: 1.25rem;
    }
  }

  .coming-soon {
    text-align: center;
    font-size: 16px;
    color: white;
    font-weight: 500;
    margin: 0;
  }
</style>
