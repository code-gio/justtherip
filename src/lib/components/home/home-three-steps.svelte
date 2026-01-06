<script lang="ts">
  const steps = [
    {
      number: 1,
      title: "Buy Jewels",
      description:
        "Load up your wallet with Jewels to unlock any pack instantly.",
      gradient:
        "linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ec008c 100%)",
      url: "/landing/steps/jewel.svg",
    },
    {
      number: 2,
      title: "Rip Packs",
      description:
        "Open packs digitally with full odds disclosure and instant reveals.",
      gradient:
        "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
      url: "/landing/steps/packs.svg",
    },
    {
      number: 3,
      title: "Ship Cards",
      description:
        "Every card is real. Request shipping whenever you're ready.",
      gradient:
        "linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #ec4899 100%)",
      url: "/landing/steps/cards.svg",
    },
  ];
</script>

<section class="three-steps-section">
  <div class="container">
    <div class="section-header">
      <span class="section-tag text-white">HOW IT WORKS</span>
      <h2 class="section-title">THREE STEPS TO PULL HEAT.</h2>
    </div>

    <div class="steps-grid">
      {#each steps as step, i}
        <div class="step-card step-{i + 1}" style="--gradient: {step.gradient}">
          <div class="step-card-border"></div>
          <div class="step-content">
            <div class="step-icon">
              <!-- Placeholder icon -->
              <!-- <div class="icon-placeholder"></div> -->
              <img src={step.url} alt={step.title} class="step-icon-image" />
            </div>
            <div class="step-info">
              <h3 class="step-number-title">
                {step.number}. {step.title}
              </h3>
              <p class="step-description">{step.description}</p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .three-steps-section {
    padding: 6rem 2rem;
    background: linear-gradient(
      180deg,
      rgba(18, 14, 37, 0.6) 0%,
      rgba(18, 14, 37, 0.6) 47%,
      rgba(68, 53, 139, 0.65) 100%
    );
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    margin-bottom: 4rem;
  }

  .section-tag {
    display: block;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .section-title {
    font-family: var(--font-display, var(--font-sans));
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--text-white);
    margin: 0;
    text-transform: uppercase;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  @media (max-width: 1024px) {
    .steps-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }

  .step-card {
    position: relative;
    background: rgba(10, 10, 10, 0.8);
    border-radius: 20px;
    padding: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  /* Sombras con colores del gradiente */
  .step-1 {
    box-shadow: 0 10px 30px rgba(247, 147, 30, 0.3);
  }

  .step-2 {
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
  }

  .step-3 {
    box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
  }

  .step-card:hover {
    transform: translateY(-8px);
  }

  .step-1:hover {
    box-shadow: 0 20px 50px rgba(247, 147, 30, 0.5);
  }

  .step-2:hover {
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.5);
  }

  .step-3:hover {
    box-shadow: 0 20px 50px rgba(168, 85, 247, 0.5);
  }

  .step-card-border {
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

  .step-content {
    position: relative;
    background: rgba(10, 10, 10, 0.95);
    border-radius: 18px;
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 220px;
    max-height: 250px;
  }

  .step-icon {
    margin-bottom: 1.5rem;
  }

  .step-icon-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .icon-placeholder {
    width: 80px;
    height: 80px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .step-number-title {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-white);
    margin: 0;
  }

  .step-description {
    font-size: 0.9375rem;
    color: var(--text-gray);
    line-height: 1.5;
    margin: 0;
  }
</style>
