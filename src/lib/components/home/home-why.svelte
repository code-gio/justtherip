<script lang="ts">
  import { IconCheck } from "@tabler/icons-svelte";
</script>

<section class="why-section">
  <div class="container">
    <div class="why-grid">
      <div class="why-content">
        <span class="section-tag">Why Just the Rip?</span>
        <h2 class="section-title">
          <span class="light">Built for the</span>
          <span class="accent">moment.</span>
        </h2>
        <p class="why-subtitle">
          The thrill of cracking packs — without the bulk, mess, or guessing.
        </p>

        <ul class="benefits">
          <li>
            <IconCheck size={20} />
            <span>Instant pack rips — no waiting</span>
          </li>
          <li>
            <IconCheck size={20} />
            <span>Clear odds before you open</span>
          </li>
          <li>
            <IconCheck size={20} />
            <span>Real cards, not NFTs</span>
          </li>
          <li>
            <IconCheck size={20} />
            <span>No streamer tax or break fees</span>
          </li>
          <li>
            <IconCheck size={20} />
            <span>No junk bulk piling up</span>
          </li>
        </ul>
      </div>

      <div class="why-visual">
        <div class="quote-card">
          <p class="quote-text">
            You click.<br />
            You rip.<br />
            <span class="highlight">You see what you pulled.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .why-section {
    padding: 8rem 0;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
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

  .why-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
    align-items: center;
  }

  @media (max-width: 900px) {
    .why-grid {
      grid-template-columns: 1fr;
      gap: 4rem;
    }
  }

  .why-subtitle {
    font-size: 1.125rem;
    color: var(--text-gray);
    margin: 1.5rem 0 2.5rem;
    line-height: 1.6;
  }

  .benefits {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .benefits li {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    font-size: 1rem;
    color: var(--text-white);
  }

  .benefits li :global(svg) {
    color: var(--gold);
    flex-shrink: 0;
  }

  .quote-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 3rem;
  }

  .quote-text {
    font-family: var(--font-serif);
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.3;
    margin: 0;
    color: var(--text-gray);
  }

  .quote-text .highlight {
    color: var(--gold);
    font-style: italic;
  }
</style>

