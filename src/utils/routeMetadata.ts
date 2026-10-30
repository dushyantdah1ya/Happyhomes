import { normalizeCanonicalPath, PRE_LAUNCH_ROBOTS, SITE_NAME, getTrustedOrigin } from './seoConfig.js';
import { isDevelopmentSoldOnly } from './canonicalAvailability.js';

export interface BreadcrumbItem {
  name: string;
  item?: string;
}

export interface RouteMeta {
  title: string;
  description: string;
  robots?: string;
  statusCode: number;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export interface RouteMetadataContext {
  currentDevelopment?: any | null;
  explicitOrigin?: string | null;
}

/**
 * Builds restrained, honest Organization structured data.
 * Does not invent founding dates, ratings, reviews, or brokerage affiliations.
 */
function getOrganizationJsonLd(origin?: string | null): Record<string, any> {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: 'Direct architectural residential builders and developers in Jaipur.',
    telephone: '+91 98280 12345',
    email: 'info@happyhomesjaipur.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot No. 12, Vaishali Nagar',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302021',
      addressCountry: 'IN',
    },
  };

  if (origin) {
    data.url = origin;
  }

  return data;
}

/**
 * Builds BreadcrumbList structured data matching visible UI breadcrumbs.
 */
function buildBreadcrumbsJsonLd(items: BreadcrumbItem[], origin?: string | null): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => {
      const itemUrl = crumb.item ? (origin ? `${origin}${crumb.item === '/' ? '' : crumb.item}` : crumb.item) : undefined;
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        ...(itemUrl ? { item: itemUrl } : {}),
      };
    }),
  };
}

/**
 * Builds RealEstateListing structured data using honest public projection facts only.
 * Omits absent or unverified fields.
 */
function buildDevelopmentJsonLd(dev: any, origin?: string | null): Record<string, any> {
  const isSold = isDevelopmentSoldOnly(dev);
  const photoUrl = dev.photos?.[0]?.secureUrl || dev.photos?.[0]?.url || dev.image?.url;
  const canonicalUrl = origin && dev.slug ? `${origin}/developments/${dev.slug}` : undefined;

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: dev.name,
    description: dev.shortDescription,
    category: dev.type,
  };

  if (canonicalUrl) {
    data.url = canonicalUrl;
  }
  if (photoUrl) {
    data.image = photoUrl;
  }
  if (dev.priceAmount) {
    data.offers = {
      '@type': 'Offer',
      price: dev.priceAmount,
      priceCurrency: 'INR',
      availability: isSold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    };
  }
  if (dev.location?.address) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: dev.location.address,
      addressLocality: dev.locality || 'Jaipur',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
    };
  }

  return data;
}

/**
 * Shared route metadata definition used for both server-side rendering
 * and client-side browser navigation.
 */
export function getRouteMetadata(
  rawUrlOrPathname: string,
  context?: RouteMetadataContext
): RouteMeta {
  const normalized = normalizeCanonicalPath(rawUrlOrPathname);
  const origin = context?.explicitOrigin !== undefined ? context.explicitOrigin : getTrustedOrigin();

  // 1. Home
  if (normalized === '/') {
    return {
      title: 'Happy Homes | Luxury Residential Developments & Structural Consultations in Jaipur',
      description:
        'Direct architectural builders and developers in Jaipur. Developing turnkey luxury villas, boutique independent floors, and residential plots in Jagatpura, Kusum Vihar & Vidhyadhar Nagar.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/',
      ogType: 'website',
      jsonLd: [
        getOrganizationJsonLd(origin),
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          ...(origin ? { url: origin } : {}),
        },
      ],
    };
  }

  // 2. About
  if (normalized === '/about') {
    return {
      title: 'About Happy Homes | Direct Residential Builder Jaipur',
      description:
        'Direct residential builder and developer in Jaipur. Developing bespoke luxury villas, boutique independent floors, and residential plots in Jagatpura.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/about',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'About Happy Homes', item: '/about' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'About Happy Homes', item: '/about' },
        ],
        origin
      ),
    };
  }

  // 3. Construction Quality
  if (normalized === '/construction-quality') {
    return {
      title: 'Construction Quality & Structural Standards | Happy Homes Jaipur',
      description:
        'Explore our engineering framework, structural discipline, material standards, and due diligence checklist for residential developments in Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/construction-quality',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Construction Quality', item: '/construction-quality' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Construction Quality', item: '/construction-quality' },
        ],
        origin
      ),
    };
  }

  // 4. Jaipur Localities Hub
  if (normalized === '/jaipur-localities') {
    return {
      title: 'Jaipur Localities & Residential Sector Guides | Happy Homes Jaipur',
      description:
        'Objective sector guides and buyer due diligence considerations covering residential corridors in Jaipur, including Jagatpura.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/jaipur-localities',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Jaipur Localities', item: '/jaipur-localities' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Jaipur Localities', item: '/jaipur-localities' },
        ],
        origin
      ),
    };
  }

  // 5. Jagatpura Guide
  if (normalized === '/jaipur-localities/jagatpura') {
    return {
      title: 'Jagatpura Locality Guide | Happy Homes Jaipur',
      description:
        'Institutional addresses along Mahal Road, colony access considerations, and property due diligence for Jagatpura, South-East Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/jaipur-localities/jagatpura',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Jaipur Localities', item: '/jaipur-localities' },
        { name: 'Jagatpura', item: '/jaipur-localities/jagatpura' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Jaipur Localities', item: '/jaipur-localities' },
          { name: 'Jagatpura', item: '/jaipur-localities/jagatpura' },
        ],
        origin
      ),
    };
  }

  // 6. Kusum Vihar (Withheld — 302 Redirect to Hub)
  if (normalized === '/jaipur-localities/kusum-vihar') {
    return {
      title: 'Jaipur Localities Overview | Happy Homes Jaipur',
      description:
        'Locality guide withheld pending primary layout documentation. Redirecting to Jaipur Localities Overview.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 302,
      // No canonical tag on redirects
    };
  }

  // 7. Buying Process
  if (normalized === '/buying-process') {
    return {
      title: 'Buying a Home with Happy Homes | Residential Purchase Process Jaipur',
      description:
        'A step-by-step residential purchase planning guide for Happy Homes developments in Jaipur, from initial inquiry to handover inspection.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/buying-process',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Buyer Guide', item: '/buying-process' },
        { name: 'Buying Process', item: '/buying-process' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Buyer Guide', item: '/buying-process' },
          { name: 'Buying Process', item: '/buying-process' },
        ],
        origin
      ),
    };
  }

  // 8. Remote & NRI Buyers
  if (normalized === '/nri-buyers') {
    return {
      title: 'Remote & NRI Buyers Guide | Planning Your Purchase in Jaipur',
      description:
        'Practical coordination guidance for remote and NRI buyers purchasing residential properties in Jaipur, including video viewings and due diligence.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/nri-buyers',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Buyer Guide', item: '/nri-buyers' },
        { name: 'Remote & NRI Buyers', item: '/nri-buyers' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Buyer Guide', item: '/nri-buyers' },
          { name: 'Remote & NRI Buyers', item: '/nri-buyers' },
        ],
        origin
      ),
    };
  }

  // 9. FAQs
  if (normalized === '/faqs') {
    return {
      title: 'Frequently Asked Questions | Happy Homes Jaipur',
      description:
        'Plain-language answers on browsing developments, requesting site visits and video viewings, documentation, and purchase planning.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/faqs',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Buyer Guide', item: '/faqs' },
        { name: 'Frequently Asked Questions', item: '/faqs' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Buyer Guide', item: '/faqs' },
          { name: 'Frequently Asked Questions', item: '/faqs' },
        ],
        origin
      ),
    };
  }

  // 9a. Our Approach
  if (normalized === '/our-approach') {
    return {
      title: 'Our Approach | Happy Homes Jaipur',
      description:
        'A clearer way to explore Happy Homes developments in Jaipur. Learn how to review property-specific specifications, ask direct questions, and make an informed decision.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/our-approach',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'About Us', item: '/about' },
        { name: 'Our Approach', item: '/our-approach' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'About Us', item: '/about' },
          { name: 'Our Approach', item: '/our-approach' },
        ],
        origin
      ),
    };
  }

  // 9b. Visit Checklist
  if (normalized === '/visit-checklist') {
    return {
      title: 'Homebuyer Visit Checklist | Happy Homes Jaipur',
      description:
        'A practical reading guide for preparing questions and observations before, during, and after a Happy Homes property viewing in Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/visit-checklist',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Buyer Guide', item: '/buying-process' },
        { name: 'Visit Checklist', item: '/visit-checklist' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Buyer Guide', item: '/buying-process' },
          { name: 'Visit Checklist', item: '/visit-checklist' },
        ],
        origin
      ),
    };
  }

  // 10. Contact
  if (normalized === '/contact') {
    return {
      title: 'Contact Project Desk | Happy Homes Jaipur',
      description:
        'Connect with Happy Homes for construction projects, site visits, and architectural consultations in Jagatpura, Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/contact',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Contact the Builder', item: '/contact' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Contact the Builder', item: '/contact' },
        ],
        origin
      ),
    };
  }

  // 11. Developments Catalogue
  if (normalized === '/developments') {
    return {
      title: 'Developments Portfolio | Happy Homes Jaipur',
      description:
        'Explore villas, independent floors and residential plots by Happy Homes in Jaipur. View development details and enquire directly.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/developments',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Developments', item: '/developments' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
        ],
        origin
      ),
    };
  }

  // 12. Villas Category
  if (normalized === '/villas') {
    return {
      title: 'Villas | Happy Homes Jaipur',
      description:
        'Explore private turnkey villas across prime residential corridors of Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/villas',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Developments', item: '/developments' },
        { name: 'Villas', item: '/villas' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
          { name: 'Villas', item: '/villas' },
        ],
        origin
      ),
    };
  }

  // 13. Independent Floors Category
  if (normalized === '/independent-floors') {
    return {
      title: 'Independent Floors | Happy Homes Jaipur',
      description:
        'Explore low-rise independent floors with private ownership in Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/independent-floors',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Developments', item: '/developments' },
        { name: 'Independent Floors', item: '/independent-floors' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
          { name: 'Independent Floors', item: '/independent-floors' },
        ],
        origin
      ),
    };
  }

  // 14. Plots Category
  if (normalized === '/plots') {
    return {
      title: 'Residential Plots | Happy Homes Jaipur',
      description:
        'Residential plots and planned sectors across Jagatpura and Jaipur corridors.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/plots',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Developments', item: '/developments' },
        { name: 'Residential Plots', item: '/plots' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
          { name: 'Residential Plots', item: '/plots' },
        ],
        origin
      ),
    };
  }

  // 15. Completed Developments
  if (normalized === '/completed-projects') {
    return {
      title: 'Completed Developments | Happy Homes Jaipur',
      description:
        'Delivered architectural developments and handed-over residences in Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/completed-projects',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Developments', item: '/developments' },
        { name: 'Completed Developments', item: '/completed-projects' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
          { name: 'Completed Developments', item: '/completed-projects' },
        ],
        origin
      ),
    };
  }

  // 15a. Privacy Policy
  if (normalized === '/privacy-policy') {
    return {
      title: 'Privacy Policy | Happy Homes Jaipur',
      description:
        'Operational privacy policy for Happy Homes Jaipur property inquiries and site visit scheduling.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/privacy-policy',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Privacy Policy', item: '/privacy-policy' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Privacy Policy', item: '/privacy-policy' },
        ],
        origin
      ),
    };
  }

  // 15b. Website Terms
  if (normalized === '/website-terms') {
    return {
      title: 'Website Terms | Happy Homes Jaipur',
      description:
        'Terms of use for Happy Homes Jaipur website information, property details, and visit requests.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
      canonicalPath: '/website-terms',
      ogType: 'website',
      breadcrumbs: [
        { name: 'Home', item: '/' },
        { name: 'Website Terms', item: '/website-terms' },
      ],
      jsonLd: buildBreadcrumbsJsonLd(
        [
          { name: 'Home', item: '/' },
          { name: 'Website Terms', item: '/website-terms' },
        ],
        origin
      ),
    };
  }

  // 16. Dynamic Development Detail Route
  if (normalized.startsWith('/developments/')) {
    if (context?.currentDevelopment) {
      const dev = context.currentDevelopment;
      const photoUrl = dev.photos?.[0]?.secureUrl || dev.photos?.[0]?.url || dev.image?.url;
      const canonicalPath = `/developments/${dev.slug}`;

      return {
        title: `${dev.name} | Happy Homes Jaipur`,
        description: dev.shortDescription || 'Architectural residential development by Happy Homes Jaipur.',
        robots: PRE_LAUNCH_ROBOTS,
        statusCode: 200,
        canonicalPath,
        ogType: 'website',
        ogImage: photoUrl || undefined,
        ogImageAlt: photoUrl ? `${dev.name} architectural development in Jaipur` : undefined,
        breadcrumbs: [
          { name: 'Home', item: '/' },
          { name: 'Developments', item: '/developments' },
          { name: dev.name, item: canonicalPath },
        ],
        jsonLd: buildDevelopmentJsonLd(dev, origin),
      };
    }

    // Unknown or draft development slug without public projection: Real 404
    return {
      title: 'Property Not Found | Happy Homes Jaipur',
      description: 'The requested development is not currently listed in our public catalogue.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 404,
      // Strictly do NOT canonicalize unknown slug to Home or another property
    };
  }

  // Admin Routes (Private management workspace)
  if (normalized === '/admin') {
    return {
      title: 'Owner Workspace | Happy Homes Jaipur',
      description: 'Authorized builder management workspace for Happy Homes developments.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized === '/admin/login') {
    return {
      title: 'Owner Sign-in | Happy Homes Jaipur',
      description: 'Authorized owner authentication for Happy Homes Jaipur.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized === '/admin/developments') {
    return {
      title: 'Developments Manager | Happy Homes Jaipur',
      description: 'Owner management console for Happy Homes residential portfolio.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized === '/admin/enquiries') {
    return {
      title: 'Enquiries Inbox | Happy Homes Jaipur',
      description: 'Owner inbox for consultation requests and client interest.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized === '/admin/settings') {
    return {
      title: 'Business Settings | Happy Homes Jaipur',
      description: 'Manage shared contact details and social links.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized === '/admin/developments/new') {
    return {
      title: 'New Development | Happy Homes Jaipur',
      description: 'Create a new property development draft.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  if (normalized.startsWith('/admin/developments/')) {
    return {
      title: 'Development Editor | Happy Homes Jaipur',
      description: 'Manage and publish property development draft.',
      robots: PRE_LAUNCH_ROBOTS,
      statusCode: 200,
    };
  }

  // Generic 404
  return {
    title: 'Page Not Found | Happy Homes Jaipur',
    description: 'The requested page could not be located in our development catalog.',
    robots: PRE_LAUNCH_ROBOTS,
    statusCode: 404,
  };
}
