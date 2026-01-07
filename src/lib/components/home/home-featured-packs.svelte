<script lang="ts">
</script>

<section class="featured-packs-section">
  <div class="container">
    <div class="content">
      <span class="section-tag">PACK SHOWCASE</span>
      <h2 class="section-title">FEATURED PACKS</h2>
      <p class="section-description">
        Hand-curated packs with disclosed odds and real collectible pulls.<br />
        Each pack is designed to deliver the thrill of cracking packs — instantly.
      </p>
      <a href="/packs" class="btn btn-primary">START RIPPING NOW</a>
    </div>
  </div>
</section>

<style>
  .featured-packs-section {
    padding: 6rem 2rem;
  }

  @media (max-width: 768px) {
    .featured-packs-section {
      padding: 4rem 1rem;
    }
  }

  .container {
    max-width: 950px;
    width: 100%;
    background: linear-gradient(
      0deg,
      rgba(138, 56, 245, 0.9) 0%,
      rgba(242, 56, 245, 0.5) 50%,
      rgba(138, 56, 245, 0.2) 90%,
      transparent 95%
    );
    border-radius: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    padding: 2rem;
  }

  @media (max-width: 1024px) {
    .container {
      max-width: 90%;
      padding: 2rem 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .container {
      max-width: 95%;
      padding: 1.5rem 1rem;
      border-radius: 16px;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
    padding: 1.5rem 0rem;
  }

  .section-tag {
    display: block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
  }

  .section-title {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-white);
    margin: 0;
    text-transform: uppercase;
    line-height: 1.1;
  }

  @media (max-width: 768px) {
    .section-title {
      font-size: 36px;
    }
  }

  @media (max-width: 480px) {
    .section-title {
      font-size: 28px;
    }
  }

  .section-description {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    max-width: 600px;
    margin: 0;
  }

  @media (max-width: 768px) {
    .section-description {
      font-size: 14px;
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 2rem;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn-primary {
    background-color: #6829f9;
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
</style>
