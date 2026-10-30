/**
 * Centralized SEO, Origin, and Pre-launch Policy Configuration
 *
 * PRE-LAUNCH POLICY:
 * - The application is strictly in pre-launch mode.
 * - 'noindex, nofollow' is enforced across all public routes and private workspaces.
 * - A final owner-approved production domain is NOT yet established.
 * - The explicitly configured preview URL (via APP_URL / VITE_APP_URL) serves as
 *   the current preview origin. If unconfigured or localhost in production, origin-dependent
 *   tags are omitted rather than emitting fabricated domains (e.g. happyhomesjaipur.com).
 */

export const PRE_LAUNCH_ROBOTS = 'noindex, nofollow';
export const SITE_NAME = 'Happy Homes';

/**
 * Validates and returns the trusted origin.
 * Never constructs origin from untrusted Host / X-Forwarded-Host headers.
 */
export function getTrustedOrigin(): string | null {
  // Check server environment variable
  let candidate = '';
  if (typeof process !== 'undefined' && process.env?.APP_URL) {
    candidate = process.env.APP_URL.trim();
  } else if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL) {
    candidate = (import.meta as any).env.VITE_APP_URL.trim();
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    // Client-side fallback if running in a browser with a valid origin
    const clientOrigin = window.location.origin;
    if (clientOrigin.startsWith('https://') || clientOrigin.startsWith('http://localhost')) {
      candidate = clientOrigin;
    }
  }

  if (!candidate) {
    return null;
  }

  // Strip trailing slashes
  candidate = candidate.replace(/\/+$/, '');

  // Validate URL scheme
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

/**
 * Normalizes an incoming raw URL or pathname into a clean canonical path.
 * Strips query strings, hashes, and trailing slashes while preserving canonical identities.
 * Drops tracking parameters and filter queries while leaving actual navigation intact.
 */
export function normalizeCanonicalPath(rawUrlOrPath: string): string {
  if (!rawUrlOrPath) return '/';

  // Strip query strings and hash anchors
  const pathOnly = rawUrlOrPath.split('?')[0].split('#')[0];
  const normalized = pathOnly === '/' ? '/' : pathOnly.replace(/\/+$/, '');

  if (normalized === '' || normalized === '/') {
    return '/';
  }

  // Canonical mappings for legacy aliases & redirect targets
  if (normalized === '/residential-plots') {
    return '/plots';
  }
  if (normalized === '/completed' || normalized === '/completed-developments') {
    return '/completed-projects';
  }

  return normalized;
}

/**
 * Combines trusted origin with a canonical path.
 * Returns null if no trusted origin exists.
 */
export function toAbsoluteCanonicalUrl(canonicalPath: string, explicitOrigin?: string | null): string | null {
  const origin = explicitOrigin !== undefined ? explicitOrigin : getTrustedOrigin();
  if (!origin) return null;

  const cleanPath = normalizeCanonicalPath(canonicalPath);
  return cleanPath === '/' ? origin : `${origin}${cleanPath}`;
}
