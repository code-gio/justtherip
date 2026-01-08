<script lang="ts">
  const features = [
    {
      title: "TRANSPARENT ODDS",
      description: "Every pack shows exact pull rates before you open.",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ec008c 100%)",
      icon: "/landing/features/star-1.svg",
    },
    {
      title: "NO FLUFF",
      description: "No confusing marketplaces. No fake value charts.",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ec008c 100%)",
      icon: "/landing/features/star-2.svg",
    },
    {
      title: "INSTANT RESULTS",
      description: "See your cards the moment you rip. No waiting.",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)",
      icon: "/landing/features/star-3.svg",
    },
    {
      title: "REAL CARDS",
      description: "Physical cards sourced and shipped on demand.",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
      icon: "/landing/features/star-4.svg",
    },
  ];
</script>

<section class="features-section">
  <div class="container">
    <div class="features-grid">
      {#each features as feature, i}
        <div class="feature-card feature-{i + 1}" style="--gradient: {feature.gradient}">
          <div class="feature-card-border"></div>
          <div class="feature-content">
            <h3 class="feature-title">{feature.title}</h3>
            <div class="feature-icon">
              <img src={feature.icon} alt={feature.title} class="feature-icon-image" />
            </div>
            <p class="feature-description">{feature.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .features-section {
    padding: 10rem 6rem;
     background: linear-gradient(
      180deg,
      rgba(18, 14, 37, 0.6) 0%,
      rgba(18, 14, 37, 0.6) 47%,
      rgba(68, 53, 139, 0.65) 100%
    );
  }

  @media (max-width: 768px) {
    .features-section {
      padding: 6rem 2rem;
    }
  }

  @media (max-width: 640px) {
    .features-section {
      padding: 4rem 1.5rem;
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 640px) {
    .features-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      max-width: 400px;
      margin: 0 auto;
    }
  }

  .feature-card {
    position: relative;
    background: rgba(10, 10, 10, 0.8);
    border-radius: 20px;
    padding: 3px;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-8px);
  }

  .feature-card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    padding: 3px;
    background: var(--gradient);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .feature-content {
    position: relative;
    background: rgba(10, 10, 10, 0.95);
    border-radius: 18px;
    padding: 2.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 220px;

    
  }

  .feature-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .feature-icon {
    margin: 1rem 0;
  }

  .feature-icon-image {
    width: 55px;
    height: 55px;
    object-fit: contain;
  }

  .feature-description {
    font-size: 16px;
    color: white;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
  }
</style>
