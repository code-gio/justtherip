<section id="games" class="games-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">Supported Games</span>
      <h2 class="section-title">
        <span class="light">Your favorite</span>
        <span class="accent">TCGs.</span>
      </h2>
    </div>

    <div class="games-row">
      <div class="game-tile pokemon-tile">
        <div class="game-logo">Pokémon</div>
        <span class="game-count">24 packs available</span>
      </div>
      <div class="game-tile mtg-tile">
        <div class="game-logo">Magic: The Gathering</div>
        <span class="game-count">18 packs available</span>
      </div>
    </div>

    <p class="coming-text">More games and drops coming soon.</p>
  </div>
</section>

<style>
  .games-section {
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
    margin: 0;
  }

  .section-title .light {
    font-weight: 400;
    color: var(--text-gray);
  }

  .section-title .accent {
    font-style: italic;
    color: var(--gold);
  }

  .games-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }

  @media (max-width: 640px) {
    .games-row {
      grid-template-columns: 1fr;
    }
  }

  .game-tile {
    position: relative;
    padding: 3rem 2rem;
    border-radius: 20px;
    text-align: center;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .game-tile:hover {
    transform: translateY(-4px);
  }

  .pokemon-tile {
    background: linear-gradient(
      135deg,
      rgba(252, 211, 77, 0.15) 0%,
      rgba(245, 158, 11, 0.1) 100%
    );
    border: 1px solid rgba(252, 211, 77, 0.2);
  }

  .mtg-tile {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.15) 0%,
      rgba(109, 40, 217, 0.1) 100%
    );
    border: 1px solid rgba(139, 92, 246, 0.2);
  }

  .game-logo {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .game-count {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .coming-text {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    margin-top: 2rem;
  }
</style>

