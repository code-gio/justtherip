<section class="features-section">
  <div class="container">
    <div class="features-grid">
      <div class="feature-card">
        <span class="feature-icon">📊</span>
        <h4>Transparent Odds</h4>
        <p>Every pack shows exact pull rates before you open.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">⚡</span>
        <h4>Instant Results</h4>
        <p>See your cards the moment you rip. No waiting.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📦</span>
        <h4>Real Cards</h4>
        <p>Physical cards sourced and shipped on demand.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🎯</span>
        <h4>No Fluff</h4>
        <p>No confusing marketplaces. No fake value charts.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .features-section {
    padding: 8rem 0;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 900px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 540px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }

  .feature-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    transition: border-color 0.2s;
  }

  .feature-card:hover {
    border-color: rgba(212, 168, 83, 0.3);
  }

  .feature-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 1rem;
  }

  .feature-card h4 {
    font-family: var(--font-serif);
    font-size: 1.125rem;
    font-weight: 400;
    margin: 0 0 0.5rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: var(--text-gray);
    line-height: 1.5;
    margin: 0;
  }
</style>

