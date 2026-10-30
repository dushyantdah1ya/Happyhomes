import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getRouteMetadata } from '../utils/routeMetadata';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { getTrustedOrigin } from '../utils/seoConfig';
import { safeJsonSerialize } from '../utils/safeJson';

function setOrRemoveMeta(
  selector: string,
  keyAttr: 'name' | 'property',
  keyValue: string,
  content?: string
) {
  let el = document.querySelector(selector);
  if (content) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(keyAttr, keyValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  } else if (el) {
    el.remove();
  }
}

export default function RouteMetadataManager() {
  const location = useLocation();
  const { currentDevelopment } = usePublicCatalog();

  useEffect(() => {
    const origin = getTrustedOrigin();
    const meta = getRouteMetadata(location.pathname, { currentDevelopment, explicitOrigin: origin });

    // 1. Title
    document.title = meta.title;

    // 2. Meta description
    setOrRemoveMeta('meta[name="description"]', 'name', 'description', meta.description);

    // 3. Robots directive
    setOrRemoveMeta('meta[name="robots"]', 'name', 'robots', meta.robots || 'noindex, nofollow');

    // 4. Canonical link (absolute URL if trusted origin configured)
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (meta.canonicalPath && origin) {
      const canonicalUrl = `${origin}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}`;
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', canonicalUrl);
    } else if (canonicalEl) {
      canonicalEl.remove();
    }

    // 5. Open Graph metadata
    setOrRemoveMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setOrRemoveMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
    setOrRemoveMeta('meta[property="og:type"]', 'property', 'og:type', meta.ogType || 'website');
    setOrRemoveMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'Happy Homes');

    const ogUrl = meta.canonicalPath && origin ? `${origin}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}` : undefined;
    setOrRemoveMeta('meta[property="og:url"]', 'property', 'og:url', ogUrl);
    setOrRemoveMeta('meta[property="og:image"]', 'property', 'og:image', meta.ogImage);
    setOrRemoveMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', meta.ogImageAlt);

    // 6. Twitter card metadata
    setOrRemoveMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setOrRemoveMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
    setOrRemoveMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);
    setOrRemoveMeta('meta[name="twitter:image"]', 'name', 'twitter:image', meta.ogImage);
    setOrRemoveMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', meta.ogImageAlt);

    // 7. Structured Data (JSON-LD)
    let schemaEl = document.getElementById('happy-homes-schema');
    if (meta.jsonLd) {
      if (!schemaEl) {
        schemaEl = document.createElement('script');
        schemaEl.setAttribute('type', 'application/ld+json');
        schemaEl.setAttribute('id', 'happy-homes-schema');
        document.head.appendChild(schemaEl);
      }
      schemaEl.textContent = safeJsonSerialize(meta.jsonLd);
    } else if (schemaEl) {
      schemaEl.remove();
    }
  }, [location.pathname, currentDevelopment]);

  // Synchronize scroll position: smooth scroll to hash element or reset to top
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return null;
}
