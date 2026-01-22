<script lang="ts">
  /**
   * Landing Page — `/`
   *
   * PURPOSE: Marketing & conversion
   *
   * CONTENT:
   * - Hero section (brand, tagline)
   * - Explanation of how justtherip works
   * - Supported games (MTG, Pokémon)
   * - Example packs showcase
   * - CTA: Sign Up / Log In buttons
   *
   * This is the main entry point for new visitors.
   * Should be visually compelling and clearly explain the value proposition.
   *
   * UI/UX CONSTRAINTS:
   * - No mention of gambling
   * - Rips clearly labeled as non-withdrawable
   * - Fun, engaging, trustworthy aesthetic
   */

  import {
    HomeHero,
    HomeCollectors,
    HomePacks,
    HomeThreeSteps,
    HomeBuildMoment,
    HomeGames,
    HomeFooter,
    HomeFeaturedPacks,
  } from "$lib/components/home";
  import HomeFeatures from "$lib/components/home/home-features.svelte";

  let { data } = $props();

</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="landing-page dark">
  <!-- Main hero section with shared background for Hero, Collectors, and Packs -->
  <div class="hero-section-bg">
    <div class="purple-vector">
      <HomeHero />
      <HomeCollectors recentPulls={data.recentPulls} rarePulls={data.rarePulls} />
    </div>
    <HomePacks packs={data.topPacks} />
    <!-- Three Steps Section -->
    <HomeThreeSteps />

    <!-- Build for the Moment Section -->
    <HomeBuildMoment />
    <!-- Games Section -->
    <HomeGames />
    <HomeFeatures />
    <HomeFeaturedPacks />
    <!-- Footer -->
    <HomeFooter />
  </div>

  <!-- Future sections will go here with different backgrounds -->
</div>

<style>

  .landing-page {
    --font-display: "Organetto", system-ui, sans-serif;
    --font-serif: "Instrument Serif", Georgia, serif;
    --font-sans: "League Spartan", system-ui, sans-serif;

    --gold: #d4a853;
    --gold-light: #e8c97a;
    --gold-glow: rgba(212, 168, 83, 0.3);

    --bg-dark: #0c0c0c;
    --bg-card: #161616;
    --bg-elevated: #1a1a1a;

    --text-white: #ffffff;
    --text-gray: #888888;
    --text-muted: #555555;

    --border: rgba(255, 255, 255, 0.08);

    font-family: "League Spartan", system-ui, sans-serif;
    background: var(--bg-dark);
    color: var(--text-white);
    overflow-x: hidden;
  }

  /* Shared background container for Hero, Collectors, and Packs sections */
  .hero-section-bg {
    position: relative;
    /* Placeholder background - replace with your image */
    /* background-color: var(--bg-dark); */
    /* Example: background-image: url('/your-background-image.jpg'); */
    background-image: url("/landing/dark-pink-and-purple.svg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* Purple vector as background for Hero + Collectors */
  .purple-vector {
    background-image: url("/landing/purple-vec-home.svg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
