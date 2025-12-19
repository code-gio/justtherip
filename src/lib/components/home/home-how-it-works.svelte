<script lang="ts">
  import { IconDiamond, IconPackage, IconTruck } from "@tabler/icons-svelte";
</script>

<section class="how-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag">How It Works</span>
      <h2 class="section-title">
        <span class="light">Three steps to</span>
        <span class="accent">pull heat.</span>
      </h2>
    </div>

    <div class="steps-row">
      <div class="step">
        <div class="step-number">01</div>
        <div class="step-icon">
          <IconDiamond size={28} />
        </div>
        <h3>Buy Jewels</h3>
        <p>Load up your wallet with Jewels to unlock any pack instantly.</p>
      </div>

      <div class="step-connector"></div>

      <div class="step">
        <div class="step-number">02</div>
        <div class="step-icon">
          <IconPackage size={28} />
        </div>
        <h3>Rip Packs</h3>
        <p>
          Open packs digitally with full odds disclosure and instant reveals.
        </p>
      </div>

      <div class="step-connector"></div>

      <div class="step">
        <div class="step-number">03</div>
        <div class="step-icon">
          <IconTruck size={28} />
        </div>
        <h3>Ship Cards</h3>
        <p>Every card is real. Request shipping whenever you're ready.</p>
      </div>
    </div>
  </div>
</section>

<style>
  .how-section {
    padding: 8rem 0;
    background: var(--bg-card);
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-header {
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

  .steps-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  @media (max-width: 900px) {
    .steps-row {
      flex-direction: column;
      gap: 3rem;
    }
  }

  .step {
    flex: 1;
    position: relative;
  }

  .step-number {
    font-family: var(--font-serif);
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }

  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--gold);
    margin-bottom: 1.25rem;
  }

  .step h3 {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0 0 0.75rem;
  }

  .step p {
    color: var(--text-gray);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0;
  }

  .step-connector {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, var(--border) 0%, transparent 100%);
    margin-top: 80px;
    flex-shrink: 0;
  }

  @media (max-width: 900px) {
    .step-connector {
      display: none;
    }
  }
</style>

