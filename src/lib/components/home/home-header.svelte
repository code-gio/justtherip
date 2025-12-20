<script lang="ts">
  import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  interface NavLink {
    label: string;
    href: string;
  }

  const navLinks: NavLink[] = [
    { label: "Packs", href: "#packs" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why Us", href: "#why-us" },
    { label: "Games", href: "#games" },
    { label: "Features", href: "#features" },
  ];
</script>

<header class="header">
  <div class="header-container">
    <a href="/" class="brand">
      <span class="brand-text">justtherip</span>
    </a>

    <NavigationMenu.Root class="nav-menu">
      <NavigationMenu.List class="nav-list">
        {#each navLinks as link}
          <NavigationMenu.Item>
            <NavigationMenu.Link
              href={link.href}
              class="nav-link"
            >
              {link.label}
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        {/each}
      </NavigationMenu.List>
    </NavigationMenu.Root>

    <div class="header-actions">
      <Button
        href="/sign-in"
        variant="ghost"
        class="login-btn"
      >
        Log In
      </Button>
      <Button
        href="/sign-up"
        class="rip-btn"
      >
        Start Ripping
      </Button>
    </div>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0 2rem;
    backdrop-filter: blur(12px);
    background: rgba(12, 12, 12, 0.85);
    border-bottom: 1px solid var(--border);
  }

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
    height: 72px;
  }

  .brand {
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .brand-text {
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 400;
    color: var(--text-white);
    letter-spacing: -0.02em;
  }

  .brand-text::first-letter {
    color: var(--gold);
  }

  :global(.nav-menu) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  :global(.nav-list) {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  :global(.nav-link) {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem !important;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-gray) !important;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s ease;
    background: transparent !important;
  }

  :global(.nav-link:hover) {
    color: var(--text-white) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.login-btn) {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-gray) !important;
    background: transparent !important;
    border: none !important;
    padding: 0.5rem 1rem !important;
  }

  :global(.login-btn:hover) {
    color: var(--text-white) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }

  :global(.rip-btn) {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 600;
    background: var(--gold) !important;
    color: var(--bg-dark) !important;
    border-radius: 100px !important;
    padding: 0.5rem 1.25rem !important;
    transition: all 0.25s ease !important;
  }

  :global(.rip-btn:hover) {
    background: var(--gold-light) !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px var(--gold-glow);
  }

  @media (max-width: 900px) {
    :global(.nav-menu) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .header {
      padding: 0 1rem;
    }

    .header-container {
      height: 60px;
    }

    .brand-text {
      font-size: 1.25rem;
    }

    :global(.login-btn) {
      display: none !important;
    }

    :global(.rip-btn) {
      font-size: 0.8125rem;
      padding: 0.5rem 1rem !important;
    }
  }
</style>

