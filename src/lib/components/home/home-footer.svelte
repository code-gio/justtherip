<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="footer-container">
    <!-- Logo and Tagline -->
    <div class="footer-brand">
      <a href="/" class="footer-logo">
        <img src="/landing/logo.svg" alt="Just The Rip" class="logo-image" />
      </a>
      <p class="footer-tagline">Rip packs. Get cards.</p>
    </div>

    <!-- Navigation Links -->
    <div class="footer-links">
      <a href="/packs" class="footer-link">PACKS</a>
      <a href="#how-it-works" class="footer-link">HOW IT WORKS</a>
      <a href="/support" class="footer-link">SUPPORT</a>
      <a href="/terms" class="footer-link">TERMS</a>
      <a href="/privacy" class="footer-link">PRIVACY</a>
    </div>

    <!-- Social Icons -->
    <div class="footer-social">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>
      <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="TikTok">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X / Twitter">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    </div>
  </div>

  <!-- Copyright -->
  <div class="footer-bottom">
    <p class="footer-copyright">© {currentYear} JUSTTHERIP. ALL RIGHTS RESERVED.</p>
  </div>
</footer>

<style>
  .footer {
    background: transparent;
    padding: 3rem 2rem 2rem;
  }

  .footer-container {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
     padding: 0rem 2rem;
     padding-bottom: 2rem;
  }

  /* Gradient bottom border like nav */
  .footer-container::after {
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

  @media (max-width: 1024px) {
    .footer-container {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
    }
  }

  /* Logo and Tagline */
  .footer-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  @media (max-width: 1024px) {
    .footer-brand {
      align-items: center;
    }
  }

  .footer-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .logo-image {
    height: 70px;
    width: auto;
  }

  .footer-tagline {
    font-size: 0.875rem;
    color: var(--text-gray);
    margin: 0;
    font-weight: 500;
  }

  /* Navigation Links */
  .footer-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex: 1;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .footer-links {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }

  .footer-link {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff !important;
    text-decoration: none;
    letter-spacing: 0.05em;
    transition: opacity 0.2s;
  }

  .footer-link:hover {
    opacity: 0.8;
  }

  /* Social Icons */
  .footer-social {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #ffffff;
    transition: all 0.2s ease;
  }

  .social-link:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  /* Copyright */
  .footer-bottom {
    max-width: 1400px;
    margin: 0 auto;
    padding-top: 2rem;
    text-align: center;
  }

  .footer-copyright {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
    letter-spacing: 0.05em;
    font-weight: 500;
  }
</style>
