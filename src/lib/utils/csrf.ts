import type { RequestEvent } from "@sveltejs/kit";

/**
 * CSRF Protection Utility
 *
 * SvelteKit form actions have built-in CSRF protection, but API endpoints
 * (+server.ts) do not. This utility provides origin-based CSRF protection
 * for API routes.
 */

/**
 * Verify that the request origin matches the expected origin
 * @param event - SvelteKit request event
 * @returns true if origin is valid, false otherwise
 */
export function verifyCsrfToken(event: RequestEvent): boolean {
  // Only check for state-changing methods
  const method = event.request.method.toUpperCase();
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return true; // GET, HEAD, OPTIONS are safe
  }

  const origin = event.request.headers.get("origin");
  const host = event.request.headers.get("host");

  // If no origin header, check referer as fallback
  if (!origin) {
    const referer = event.request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const expectedHost = event.url.host;
        return refererUrl.host === expectedHost;
      } catch {
        return false;
      }
    }
    // No origin or referer - likely not from a browser or legitimate request
    // For API requests from non-browser clients, you may want to allow this
    // or implement token-based authentication
    return false;
  }

  // Check if origin matches the expected host
  try {
    const originUrl = new URL(origin);
    const expectedHost = event.url.host;
    return originUrl.host === expectedHost;
  } catch {
    return false;
  }
}

/**
 * Middleware function to protect API endpoints from CSRF attacks
 * Returns an error response if CSRF check fails
 */
export function csrfProtection(event: RequestEvent): Response | null {
  if (!verifyCsrfToken(event)) {
    return new Response(
      JSON.stringify({
        message: "Invalid request origin. CSRF validation failed.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return null;
}

/**
 * Check if the request is from the same origin
 * Useful for additional security checks
 */
export function isSameOrigin(event: RequestEvent): boolean {
  const origin = event.request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === event.url.host;
  } catch {
    return false;
  }
}
