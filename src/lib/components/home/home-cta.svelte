<script lang="ts">
  import { IconSparkles, IconArrowRight } from "@tabler/icons-svelte";
</script>

<section class="cta-section">
  <div class="container">
    <div class="cta-card">
      <h2>
        <span class="light">Ready to</span>
        <span class="accent">rip?</span>
      </h2>
      <p>Create an account and open your first pack today.</p>
      <a href="/sign-up" class="btn btn-primary btn-lg">
        <IconSparkles size={20} />
        Start Ripping Now
        <IconArrowRight size={18} />
      </a>
    </div>
  </div>
</section>

<style>
  .cta-section {
    padding: 8rem 0;
    background: var(--bg-card);
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .cta-card {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-card h2 {
    font-family: var(--font-serif);
    font-size: clamp(3rem, 6vw, 5rem);
    font-weight: 400;
    line-height: 1;
    margin: 0 0 1rem;
  }

  .cta-card h2 .light {
    color: var(--text-gray);
  }

  .cta-card h2 .accent {
    font-style: italic;
    color: var(--gold);
  }

  .cta-card p {
    font-size: 1.125rem;
    color: var(--text-gray);
    margin: 0 0 2.5rem;
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

  .btn-primary {
    background: var(--gold);
    color: var(--bg-dark);
  }

  .btn-primary:hover {
    background: var(--gold-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px var(--gold-glow);
  }

  .btn-lg {
    padding: 1.125rem 2.5rem;
    font-size: 1rem;
  }
</style>

