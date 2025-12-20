<script lang="ts">
  import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTiktok,
    IconBrandX,
  } from "@tabler/icons-svelte";

  interface FooterLink {
    label: string;
    href: string;
  }

  interface SocialLink {
    label: string;
    href: string;
    icon: typeof IconBrandFacebook;
  }

  const footerLinks: FooterLink[] = [
    { label: "Packs", href: "#packs" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Support", href: "/support" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ];

  const socialLinks: SocialLink[] = [
    { label: "Facebook", href: "https://facebook.com", icon: IconBrandFacebook },
    { label: "Instagram", href: "https://instagram.com", icon: IconBrandInstagram },
    { label: "TikTok", href: "https://tiktok.com", icon: IconBrandTiktok },
    { label: "X", href: "https://x.com", icon: IconBrandX },
  ];
</script>

<footer class="footer">
  <div class="footer-container">
    <div class="footer-brand">
      <a href="/" class="brand-link">
        <span class="brand-text">justtherip</span>
      </a>
      <p class="brand-tagline">Rip packs. Get cards.</p>
    </div>

    <ul class="footer-links">
      {#each footerLinks as link, i}
        <li class="footer-link-item">
          <a href={link.href} class="footer-link">
            {link.label}
          </a>
          {#if i < footerLinks.length - 1}
            <span class="link-separator">/</span>
          {/if}
        </li>
      {/each}
    </ul>

    <div class="footer-socials">
      {#each socialLinks as social}
        <a
          href={social.href}
          class="social-link"
          aria-label={social.label}
          target="_blank"
          rel="noopener noreferrer"
        >
          <social.icon size={18} />
        </a>
      {/each}
    </div>
  </div>

  <div class="footer-bottom">
    <span class="copyright">
      © {new Date().getFullYear()} justtherip. All rights reserved.
    </span>
  </div>
</footer>

<style>
  .footer {
    padding: 4rem 2rem 2rem;
    border-top: 1px solid var(--border);
    background: var(--bg-dark);
  }

  .footer-container {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .footer-container {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 2.5rem;
    }
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (max-width: 900px) {
    .footer-brand {
      align-items: center;
    }
  }

  .brand-link {
    text-decoration: none;
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

  .brand-tagline {
    font-size: 0.8125rem;
    color: var(--text-muted);
    margin: 0;
  }

  .footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-wrap: wrap;
  }

  .footer-link-item {
    display: inline-flex;
    align-items: center;
  }

  .footer-link {
    font-size: 0.875rem;
    color: var(--text-gray);
    text-decoration: none;
    padding: 0.25rem 0.75rem;
    transition: color 0.2s ease;
  }

  .footer-link:hover {
    color: var(--text-white);
  }

  .link-separator {
    color: var(--text-muted);
    font-size: 0.75rem;
  }

  .footer-socials {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  @media (max-width: 900px) {
    .footer-socials {
      justify-content: center;
    }
  }

  .social-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: var(--text-gray);
    background: transparent;
    border: 1px solid var(--border);
    transition: all 0.2s ease;
  }

  .social-link:hover {
    color: var(--gold);
    border-color: var(--gold);
    background: rgba(212, 168, 83, 0.1);
  }

  .footer-bottom {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
  }

  .copyright {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
</style>

