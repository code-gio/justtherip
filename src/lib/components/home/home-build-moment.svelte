<script lang="ts">
  const features = [
    "Instant pack rips — no waiting",
    "Clear odds before you open",
    "Real cards, not NFTs",
    "No streamer tax or break fees",
    "No junk bulk piling up",
  ];
</script>

<section class="build-moment-section">
  <div class="container pt-18">
    <div class="content-grid">
      <!-- Left side -->
      <div class="left-content">
        <span class="section-tag">WHY JUST THE RIP?</span>
        <h2 class="section-title">BUILT FOR THE MOMENT.</h2>
        <p class="section-description">
          The thrill of cracking packs — without the bulk, mess, or guessing.
        </p>

        <ul class="features-list">
          {#each features as feature}
            <li class="feature-item">
              <div class="feature-bullet"></div>
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Right side -->
      <div class="right-content">
        <div class="steps-box">
          <div class="step-row">
            <div class="step-icon">
              <!-- Placeholder icon -->
              <!-- <div class="icon-box"></div> -->
              <img src="/landing/moment/point-cube.svg" alt="Click" />
            </div>
            <div class="step-text">YOU CLICK.</div>
          </div>
          <div class="step-row">
            <div class="step-icon">
              <img src="/landing/moment/point-cube.svg" alt="Click" />
            </div>
            <div class="step-text">YOU RIP.</div>
          </div>
          <div class="step-row">
            <div class="step-icon">
              <img src="/landing/moment/point-cube.svg" alt="Click" />
            </div>
            <div class="step-text">YOU SEE WHAT YOU PULLED.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .build-moment-section {
    padding: 6rem 2rem;
    background-image: url("/landing/moment/ellipse-moment.svg");
    background-size: auto;
    background-position: left start;
    background-repeat: no-repeat;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: center;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
  }

  /* Left Content */
  .left-content {
    max-width: 890px;
    min-width: 600px;
  }

  @media (max-width: 1024px) {
    .left-content {
      max-width: 100%;
      min-width: auto;
      text-align: center;
      margin: 0 auto;
    }
  }

  .section-tag {
    display: block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--text-white);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .section-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0 0 1.5rem;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .section-description {
    font-size: 16px;
    color: white;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    font-weight: 500;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .features-list {
      align-items: center;
    }
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-white);
  }

  .feature-bullet {
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Right Content */
  .right-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .steps-box {
    background: rgba(15, 15, 25, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 600px;
  }

  @media (max-width: 1024px) {
    .steps-box {
      margin: 0 auto;
      text-align: center;
    }
  }

  .step-row {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
  }

  @media (max-width: 1024px) {
    .step-row {
      justify-content: center;
      align-items: center;
    }
  }

  .step-icon {
    flex-shrink: 0;
    margin-top: 0rem;
  }

  .step-icon img {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 768px) {
    .step-icon {
      display: none;
    }
  }

  .icon-box {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%);
    border-radius: 8px;
  }

  .step-text {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    text-transform: uppercase;
    line-height: 1.2;
    margin-left: 1rem;
  }

  @media (max-width: 1024px) {
    .step-text {
      margin-left: 0;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .step-text {
      font-size: 24px;
    }
  }

  @media (max-width: 480px) {
    .step-text {
      font-size: 20px;
    }
  }

  @media (max-width: 768px) {
    .steps-box {
      padding: 2rem 1.5rem;
    }

    .step-row {
      gap: 1rem;
    }

    .icon-box {
      width: 50px;
      height: 50px;
    }
  }
</style>

