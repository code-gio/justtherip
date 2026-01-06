<script lang="ts">
</script>

<section class="hero">
  <div class="hero-container" style="padding-top: calc(102px + 3rem);">
    <!-- Left Content -->
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="line-white text-4xl">RIP PACKS FOR REAL</span>
        <span class="line-white text-4xl">CARDS FROM YOUR</span>
        <span class="line-white text-7xl">FAVORITE TCGs.</span>
      </h1>

      <div class="hero-stats px-4 pb-3 mb-10">
        <div class="stat">
          <p class="stat-number">50K+</p>
          <p class="stat-label">Packs Ripped</p>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <p class="stat-number">$2M+</p>
          <p class="stat-label">Cards Shipped</p>
        </div>
      </div>

      <div class="hero-cta">
        <a href="/sign-up" class="btn btn-primary">START RIPPING</a>
        <a href="/sign-in" class="btn btn-outline">LOG IN</a>
      </div>
    </div>

    <!-- Right Side - Single Image -->
    <div class="hero-visual">
      <img src="/landing/hero-img.svg" alt="TCG Cards" class="hero-image" />
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    padding: 2rem 2rem 4rem;
    display: flex;
    align-items: center;
    min-height: 80vh;
  }

  .hero-container {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 1024px) {
    .hero-container {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  /* Hero Content - Left Side */
  .hero-content {
    max-width: 550px;
  }

  @media (max-width: 1024px) {
    .hero-content {
      max-width: 100%;
      margin: 0 auto;
    }
  }

  .hero-title {
    font-family: var(--font-display, var(--font-sans));
    font-size: clamp(2rem, 4.5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.05;
    margin: 0 0 2rem;
    text-transform: uppercase;
    letter-spacing: -0.01em;
  }

  .hero-title .line-white {
    display: block;
    color: var(--text-white);
  }

  .hero-title .line-gradient {
    display: block;
    background: linear-gradient(90deg, #a855f7 0%, #8b5cf6 30%, #6366f1 60%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Stats Box */
  .hero-stats {
    display: inline-flex;
    align-items: center;
    gap: 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
  }

  @media (max-width: 1024px) {
    .hero-stats {
      margin-left: auto;
      margin-right: auto;
    }
  }

  

  .stat-number {
    font-family: var(--font-display, var(--font-sans));
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 20px;
    font-weight: 600;
    color: white;
    text-transform: capitalize;
  }

  .stat-divider {
    width: 1px;
    height: 5rem;
    background-color: #6829F9;
  }

  /* CTA Buttons */
  .hero-cta {
    display: flex;
    gap: 0.75rem;
  }

  @media (max-width: 1024px) {
    .hero-cta {
      justify-content: center;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background-color: #6829F9;
    color: white;
    border-radius: 100px;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
  }

  .btn-outline {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-white);
    border: 1px solid #6829F9;
    border-radius: 100px;
  }

  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Hero Visual - Right Side */
  .hero-visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 1024px) {
    .hero-visual {
      margin-top: 2rem;
    }
  }

  @media (max-width: 640px) {
    .hero-visual {
      display: none;
    }
  }

  .hero-image {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
</style>
