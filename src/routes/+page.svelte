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
   * - Jewels clearly labeled as non-withdrawable
   * - Fun, engaging, trustworthy aesthetic
   */

  import {
    HomeHeader,
    HomeHero,
    HomePacks,
    HomeHowItWorks,
    HomeWhy,
    HomeGames,
    HomeFeatures,
    HomeCta,
    HomeFooter,
  } from "$lib/components/home";
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="landing-page dark">
  <HomeHeader />
  <HomeHero />
  <HomePacks />
  <HomeHowItWorks />
  <HomeWhy />
  <HomeGames />
  <HomeFeatures />
  <HomeCta />
  <HomeFooter />
</div>

<style>
  .landing-page {
    --font-serif: "Instrument Serif", Georgia, serif;
    --font-sans: "Inter", system-ui, sans-serif;

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

    font-family: var(--font-sans);
    background: var(--bg-dark);
    color: var(--text-white);
    overflow-x: hidden;
  }
</style>
