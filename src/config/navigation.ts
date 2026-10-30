export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

export const NAVIGATION_REGISTRY = {
  developments: {
    id: 'developments',
    label: 'Developments',
    items: [
      {
        label: 'All Developments',
        href: '/developments',
        description: 'Complete portfolio of direct builder developments',
      },
      {
        label: 'Villas',
        href: '/villas',
        description: 'Private turnkey villas in prime Jaipur corridors',
      },
      {
        label: 'Independent Floors',
        href: '/independent-floors',
        description: 'Boutique single-floor low-rise residences',
      },
      {
        label: 'Residential Plots',
        href: '/plots',
        description: 'Master-planned residential plots across key sectors',
      },
      {
        label: 'Completed Developments',
        href: '/completed-projects',
        description: 'Delivered estates and handed-over residences',
      },
    ],
  },
  aboutUs: {
    id: 'aboutUs',
    label: 'About Us',
    items: [
      {
        label: 'About Happy Homes',
        href: '/about',
        description: 'Direct residential builder and developer in Jaipur',
      },
      {
        label: 'Construction Quality',
        href: '/construction-quality',
        description: 'Builder documentation, materials, and handover questions',
      },
    ],
  },
  locations: {
    id: 'locations',
    label: 'Locations',
    items: [
      {
        label: 'Jaipur Localities Overview',
        href: '/jaipur-localities',
        description: 'Objective sector guides across primary residential corridors',
      },
      {
        label: 'Jagatpura Guide',
        href: '/jaipur-localities/jagatpura',
        description: 'South-East institutional and residential corridor along Mahal Road',
      },
    ],
  },
  buyerGuide: {
    id: 'buyerGuide',
    label: 'Buyer Guide',
    items: [
      {
        label: 'Buying Process',
        href: '/buying-process',
        description: 'Step-by-step guidance from initial inquiry to property handover',
      },
      {
        label: 'Remote & NRI Buyers',
        href: '/nri-buyers',
        description: 'Practical coordination and video viewings from outside Jaipur',
      },
      {
        label: 'Frequently Asked Questions',
        href: '/faqs',
        description: 'Plain-language answers on inventory, visits, and documentation',
      },
      {
        label: 'Contact the Builder',
        href: '/contact',
        description: 'Direct project desk consultation and coordinates',
      },
    ],
  },
  ourApproach: {
    id: 'ourApproach',
    label: 'Our Approach',
    href: '/our-approach',
    description: 'A clearer way to explore developments and make a considered choice',
  },
  visitChecklist: {
    id: 'visitChecklist',
    label: 'Visit Checklist',
    href: '/visit-checklist',
    description: 'Practical questions and observations for property viewings',
  },
  primaryCta: {
    label: 'Plan a Visit',
    href: '/contact?intent=visit#enquiry',
  },
} as const;
