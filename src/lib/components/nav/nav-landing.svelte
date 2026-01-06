<script lang="ts">
  let { transparent = false } = $props();
  let mobileMenuOpen = $state(false);
</script>

<nav class="nav-landing" class:transparent>
  <div class="nav-container">
    <!-- Logo -->
    <a href="/" class="nav-logo">
      <img src="/landing/logo.svg" alt="Just The Rip" class="logo-image" />
    </a>

    <!-- Desktop Navigation Links -->
    <div class="nav-links">
      <a href="#packs" class="nav-link">PACKS</a>
      <a href="#how-it-works" class="nav-link">HOW IT WORKS</a>
      <a href="#why-us" class="nav-link">WHY US</a>
      <a href="#games" class="nav-link">GAMES</a>
      <a href="#features" class="nav-link">FEATURES</a>
    </div>

    <!-- Desktop Actions -->
    <div class="nav-actions">
      <a href="/sign-in" class="btn btn-ghost">LOG IN</a>
      <a href="/sign-up" class="btn btn-primary">START RIPPING</a>
    </div>

    <!-- Mobile Menu Button -->
    <button
      class="mobile-menu-btn"
      onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
      aria-label="Toggle menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if mobileMenuOpen}
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        {:else}
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div class="mobile-menu">
      <div class="mobile-links text-white">
        <a href="#packs" class="mobile-link">PACKS</a>
        <a href="#how-it-works" class="mobile-link">HOW IT WORKS</a>
        <a href="#why-us" class="mobile-link">WHY US</a>
        <a href="#games" class="mobile-link">GAMES</a>
        <a href="#features" class="mobile-link">FEATURES</a>
      </div>
      <div class="mobile-actions">
        <a href="/sign-in" class="btn btn-ghost">LOG IN</a>
        <a href="/sign-up" class="btn btn-primary">START RIPPING</a>
      </div>
    </div>
  {/if}
</nav>

<style>
  .nav-landing {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: transparent;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    height: 102px;
  }

  .nav-landing.transparent {
    background: transparent;
    border-bottom: none;
  }

  .nav-container {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    height: 100%;
  }

  .nav-container::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 80%,
      transparent 100%
    );
  }

  /* Logo */
  .nav-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
    size: 40px;
  }

  .logo-image {
    height: 70px;
    width: auto;
  }

  /* Desktop Navigation */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
    justify-content: center;
  }

  @media (max-width: 1024px) {
    .nav-links {
      display: none;
    }
  }

  .nav-link {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ffffff !important;
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #ffffff !important;
    opacity: 0.8;
  }

  /* Desktop Actions */
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  @media (max-width: 1024px) {
    .nav-actions {
      display: none;
    }
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.625rem 1.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 100px;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    white-space: nowrap;
  }

  .btn-ghost {
    background: #262037;
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid #6829F9;
  }

  .btn-ghost:hover {
    color: white;
  }

  .btn-primary {
    background-color: #6829F9;
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  }

  /* Mobile Menu Button */
  .mobile-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    .mobile-menu-btn {
      display: flex;
    }
  }

  /* Mobile Menu */
  .mobile-menu {
    display: none;
    flex-direction: column;
    padding: 1rem 2rem 2rem;
    background: rgba(12, 12, 12, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 1024px) {
    .mobile-menu {
      display: flex;
    }
  }

  .mobile-links {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .mobile-link {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    text-decoration: none;
    letter-spacing: 0.05em;
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .mobile-link:hover {
    color: white;
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mobile-actions .btn {
    width: 100%;
  }
</style>
