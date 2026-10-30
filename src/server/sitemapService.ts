import { NAVIGATION_REGISTRY } from '../config/navigation.js';
import { isDevelopmentSoldOnly } from '../utils/canonicalAvailability.js';

export interface SitemapDevelopment {
  slug: string;
  status: 'draft' | 'published' | 'archived';
  availability?: string;
  updatedAt?: string;
  [key: string]: any;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates whether an ISO timestamp or date string is a legitimate historical date.
 * Returns YYYY-MM-DD format if valid, or null if missing/invalid.
 * Crucial rule: Never defaults all URLs to today's date.
 */
export function formatValidLastMod(timestamp?: string): string | null {
  if (!timestamp || typeof timestamp !== 'string') return null;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return null;

  // Format as YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

/**
 * Static public routes explicitly enabled in Happy Homes pre-launch architecture.
 * Excludes admin, api, aliases (/completed), redirects (/jaipur-localities/kusum-vihar),
 * and query variants.
 */
export const ENABLED_STATIC_PUBLIC_ROUTES = [
  '/',
  '/developments',
  '/villas',
  '/independent-floors',
  '/plots',
  '/completed-projects',
  '/about',
  '/construction-quality',
  '/jaipur-localities',
  '/jaipur-localities/jagatpura',
  '/buying-process',
  '/nri-buyers',
  '/faqs',
  '/our-approach',
  '/visit-checklist',
  '/contact',
] as const;

/**
 * Generates sitemap XML from the enabled route registry and public published developments.
 * - Requires an explicit trusted origin (cannot be empty).
 * - Excludes admin, APIs, private drafts, archived records, disabled Kusum Vihar, and redirects.
 * - Includes legitimate published sold/completed developments when public (availability != publication eligibility).
 * - Only includes <lastmod> when a trustworthy content-update timestamp exists.
 */
export function generateSitemapXml(options: {
  origin: string;
  publicDevelopments: SitemapDevelopment[];
}): string {
  const { origin, publicDevelopments } = options;

  if (!origin || typeof origin !== 'string') {
    throw new Error('Sitemap generation requires a valid, explicit trusted origin.');
  }

  const cleanOrigin = origin.replace(/\/+$/, '');
  const urlEntries: string[] = [];

  // 1. Static public routes
  for (const route of ENABLED_STATIC_PUBLIC_ROUTES) {
    const loc = route === '/' ? cleanOrigin : `${cleanOrigin}${route}`;
    urlEntries.push(`  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`);
  }

  // 2. Dynamic published developments
  for (const dev of publicDevelopments) {
    // Only published status permitted (exclude drafts and archives)
    if (dev.status !== 'published') {
      continue;
    }
    if (!dev.slug || typeof dev.slug !== 'string') {
      continue;
    }

    const loc = `${cleanOrigin}/developments/${escapeXml(dev.slug)}`;
    const lastMod = formatValidLastMod(dev.updatedAt);

    if (lastMod) {
      urlEntries.push(
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastMod}</lastmod>\n  </url>`
      );
    } else {
      urlEntries.push(`  <url>\n    <loc>${loc}</loc>\n  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`;
}
