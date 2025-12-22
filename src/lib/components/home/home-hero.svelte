<script lang="ts">
  import { IconFlame, IconSparkles, IconDiamond } from "@tabler/icons-svelte";
</script>

<section class="hero">
  <div class="hero-grid">
    <!-- Left Content -->
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="light">Rip Packs For</span>
        <span class="accent">Real Cards</span>
        <span class="light">From Your</span>
        <span class="bold">Favorite TCGs.</span>
      </h1>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">50K+</span>
          <span class="stat-label">Packs<br />Ripped</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-number">$2M+</span>
          <span class="stat-label">Cards<br />Shipped</span>
        </div>
      </div>

      <div class="hero-cta">
        <a href="/sign-up" class="btn btn-primary"> Start Ripping </a>
        <a href="/sign-in" class="btn btn-outline"> Log In </a>
      </div>
    </div>

    <!-- Right Side - Floating Cards -->
    <div class="hero-visual">
      <!-- Pack Card 1 - Main -->
      <div class="pack-card card-1">
        <div class="card-badge">
          <IconFlame size={14} />
          HOT
        </div>
        <div class="card-image pokemon-pack"></div>
        <div class="card-info">
          <span class="card-name">Prismatic Evolution</span>
          <div class="card-price">
            <IconDiamond size={16} />
            <span>250 Jewels</span>
          </div>
        </div>
      </div>

      <!-- Pack Card 2 -->
      <div class="pack-card card-2">
        <div class="card-badge mtg-badge">
          <IconSparkles size={14} />
          NEW
        </div>
        <div class="card-image mtg-pack"></div>
        <div class="card-info">
          <span class="card-name">Foundations</span>
          <div class="card-price">
            <IconDiamond size={16} />
            <span>180 Jewels</span>
          </div>
        </div>
      </div>

      <!-- Pack Card 3 -->
      <div class="pack-card card-3">
        <div class="card-image pokemon-pack-2"></div>
        <div class="card-info">
          <span class="card-name">Surging Sparks</span>
          <div class="card-price">
            <IconDiamond size={16} />
            <span>200 Jewels</span>
          </div>
        </div>
      </div>

      <!-- Annotations -->
      <div class="annotation annotation-1">
        <svg class="arrow arrow-1" viewBox="0 0 100 60" fill="none">
          <path
            d="M5 55 Q 30 20, 90 15"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="4 4"
          />
          <path
            d="M85 5 L 92 15 L 80 18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
        <span>Real physical cards<br />shipped to you</span>
      </div>

      <div class="annotation annotation-2">
        <svg class="arrow arrow-2" viewBox="0 0 80 80" fill="none">
          <path
            d="M70 5 Q 40 30, 15 70"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="4 4"
          />
          <path
            d="M5 65 L 15 72 L 20 60"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
        <span>Odds shown<br />before you rip</span>
      </div>

      <div class="annotation annotation-3">
        <span>Instant digital<br />reveals</span>
        <svg class="arrow arrow-3" viewBox="0 0 60 60" fill="none">
          <path
            d="M5 10 Q 25 40, 55 50"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="4 4"
          />
          <path
            d="M50 42 L 57 52 L 45 52"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
      </div>
    </div>
  </div>

  <!-- Trust Logos -->
  <div class="trust-section">
    <span class="trust-label">Trusted by collectors worldwide</span>
    <div class="trust-logos">
      <div class="trust-logo">TCGPlayer</div>
      <div class="trust-logo">eBay</div>
      <div class="trust-logo">PSA</div>
      <div class="trust-logo">CGC</div>
    </div>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    padding: 6rem 2rem 4rem;
    display: flex;
    flex-direction: column;
  }

  .hero-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  .hero-content {
    max-width: 600px;
  }

  @media (max-width: 1024px) {
    .hero-content {
      max-width: 100%;
      margin: 0 auto;
    }
  }

  .hero-title {
    font-family: var(--font-serif);
    font-size: clamp(3rem, 6vw, 5rem);
    font-weight: 400;
    line-height: 1.05;
    margin: 0 0 3rem;
  }

  .hero-title .light {
    display: block;
    color: var(--text-gray);
  }

  .hero-title .accent {
    display: block;
    font-style: italic;
    color: var(--gold);
  }

  .hero-title .bold {
    display: block;
  }

  .hero-stats {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 1024px) {
    .hero-stats {
      justify-content: center;
    }
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .stat-number {
    font-family: var(--font-serif);
    font-size: 2.5rem;
    font-weight: 400;
    color: var(--text-white);
  }

  .stat-label {
    font-size: 0.8125rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border);
  }

  .hero-cta {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .hero-cta {
      justify-content: center;
    }
  }

  /* Hero Visual */
  .hero-visual {
    position: relative;
    height: 600px;
  }

  @media (max-width: 1024px) {
    .hero-visual {
      display: none;
    }
  }

  .pack-card {
    position: absolute;
    width: 220px;
    background: var(--bg-card);
    border-radius: 16px;
    padding: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    transition: transform 0.4s ease;
  }

  .pack-card:hover {
    transform: scale(1.05) !important;
  }

  .card-1 {
    top: 15%;
    left: 10%;
    transform: rotate(-8deg);
    z-index: 3;
  }

  .card-2 {
    top: 5%;
    right: 5%;
    transform: rotate(12deg);
    z-index: 2;
  }

  .card-3 {
    bottom: 10%;
    left: 35%;
    transform: rotate(-3deg);
    z-index: 1;
  }

  .card-badge {
    position: absolute;
    top: -8px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #ef4444;
    color: white;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 100px;
  }

  .card-badge.mtg-badge {
    background: #8b5cf6;
  }

  .card-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .pokemon-pack {
    background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #dc2626 100%);
  }

  .pokemon-pack-2 {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%);
  }

  .mtg-pack {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #6d28d9 100%);
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-name {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .card-price {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--gold);
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* Annotations */
  .annotation {
    position: absolute;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.9375rem;
    color: var(--text-gray);
    line-height: 1.4;
  }

  .arrow {
    color: var(--text-muted);
  }

  .annotation-1 {
    bottom: 25%;
    left: -5%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .arrow-1 {
    width: 100px;
    height: 60px;
    margin-bottom: 8px;
  }

  .annotation-2 {
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }

  .arrow-2 {
    width: 80px;
    height: 80px;
    margin-top: 8px;
  }

  .annotation-3 {
    bottom: 5%;
    right: 10%;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .arrow-3 {
    width: 60px;
    height: 60px;
  }

  /* Trust Section */
  .trust-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding-top: 4rem;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }

  .trust-label {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .trust-logos {
    display: flex;
    align-items: center;
    gap: 2.5rem;
  }

  .trust-logo {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: -0.02em;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .trust-logo:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .trust-section {
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  /* Buttons */
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

