<script lang="ts">
</script>

<section class="collectors">
  <div class="container pt-10">
    <span class="collectors-label text-white">TRUSTED BY COLLECTORS</span>
    <div class="collectors-logos pt-2">
      <!-- TCGPlayer logo placeholder -->
      <div class="logo-item">
        <img
          src="/landing/collectors/tcgplayer.svg"
          alt="TCGplayer"
          class="tcgplayer"
        />
      </div>
      <!-- eBay logo placeholder -->
      <div class="logo-item">
        <img src="/landing/collectors/ebay.svg" alt="ebay" class="ebay" />
      </div>
      <!-- PSA logo placeholder -->
      <div class="logo-item">
        <img src="/landing/collectors/psa.svg" alt="PSA" class="psa" />
      </div>
      <!-- CGC Cards logo placeholder -->
      <div class="logo-item">
        <img
          src="/landing/collectors/cgccards.svg"
          alt="CGC CARDS"
          class="cgc"
        />
      </div>
    </div>
  </div>
</section>

<style>
  .collectors {
    padding: 3rem 2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .collectors-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .collectors-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .collectors-logos {
      gap: 2rem;
    }
  }

  .logo-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tcgplayer {
    font-family: var(--font-sans);
    font-weight: 800;
  }

  .ebay {
    font-family: var(--font-sans);
    font-weight: 700;
    font-style: italic;
  }

  .psa {
    font-family: var(--font-sans);
    font-weight: 900;
    letter-spacing: 0.1em;
  }

  .cgc {
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 1.25rem;
  }
</style>
