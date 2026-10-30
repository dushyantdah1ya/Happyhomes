export interface LocalitySource {
  title: string;
  url: string;
  verifiedFact: string;
}

export interface LocalityGuideData {
  id: string;
  slug: string;
  name: string;
  shortTag: string;
  zone: string;
  status: 'published' | 'withheld';
  breadcrumbs: { label: string; href?: string }[];
  headline: string;
  subheadline: string;
  characterOverview: string;
  geographyContext: {
    sectorRoads: string;
    corridorPosition: string;
    boundaryNotes: string;
  };
  civicObservations: {
    title: string;
    description: string;
    nuance: string;
  }[];
  buyerFitConsiderations: {
    fitFor: string;
    tradeoffs: string;
    guidance: string;
  }[];
  questionsToAsk: string[];
  filterUrl: string;
  contactUrl: string;
  sources?: LocalitySource[];
  withheldReason?: string;
  requiredOwnerEvidence?: string[];
}

export const JAIPUR_LOCALITIES: Record<string, LocalityGuideData> = {
  jagatpura: {
    id: 'jagatpura',
    slug: 'jagatpura',
    name: 'Jagatpura',
    shortTag: 'South-East Jaipur Residential & Institutional Corridor',
    zone: 'South-East Jaipur',
    status: 'published',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Jaipur Localities', href: '/jaipur-localities' },
      { label: 'Jagatpura' },
    ],
    headline: 'Jagatpura, Jaipur',
    subheadline:
      'A South-East Jaipur residential and institutional sector situated along Mahal Road, hosting healthcare campuses and educational institutions.',
    characterOverview:
      'Jagatpura has grown into a notable residential, healthcare, and educational sector in South-East Jaipur. The corridor is oriented along Mahal Road, comprising private colonies, plots, independent villas, and apartment schemes.',
    geographyContext: {
      sectorRoads: 'Oriented along Mahal Road, with individual colonies accessed via internal sector and scheme roads.',
      corridorPosition: 'Situated in the South-East quadrant of Jaipur, linking toward Sitapura and Malviya Nagar.',
      boundaryNotes: 'Jagatpura encompasses diverse private schemes and housing developments. Road carpeting, sanctioned road widths, and municipal service handovers vary between individual colonies and require property-specific review.',
    },
    civicObservations: [
      {
        title: 'Institutional Addresses',
        description:
          'Institutions operating in this region publish established contact addresses: Bombay Hospital (269, Ramchandrapura, Goner, Sitapura, Jaipur, 302022) and Suresh Gyan Vihar University (Gyan Vihar Marg, Jagatpura, Jaipur, Rajasthan 302017).',
        nuance:
          'These published addresses document institutional locations in South-East Jaipur. Proximity, access routes, and daily travel times vary based on the specific property location.',
      },
      {
        title: 'Individual Colony Access & Surfacing',
        description:
          'Internal colony approach roads vary widely in sanction status and physical paving.',
        nuance:
          'Sanctioned road widths on colony layout plans should be verified against actual on-site road conditions before entering commitments.',
      },
      {
        title: 'Utility Infrastructure Verification',
        description:
          'Water supply sources and municipal drainage handovers differ across schemes. Certain residential pockets rely on localized borewells or private supply rather than municipal piped networks.',
        nuance:
          'Do not assume uniform utility availability across the sector; confirm the operational water and electricity source for the specific plot or development.',
      },
    ],
    buyerFitConsiderations: [
      {
        fitFor: 'Independent Home & Plot Buyers',
        tradeoffs: 'Infrastructure maturity and road surfacing vary widely between established streets and emerging colony layouts.',
        guidance: 'Well suited for buyers seeking residential space within South-East Jaipur, provided specific layout approvals are verified.',
      },
      {
        fitFor: 'Buyers Evaluating Custom Builds or Floor Units',
        tradeoffs: 'Requires verifying exact plot documentation, boundary demarcation, and service connection points.',
        guidance: 'Confirm physical road carpeting, electricity sanction, and water provision prior to acquisition.',
      },
    ],
    questionsToAsk: [
      'What is the sanctioned road width fronting the property according to the approved layout plan, and is it physically paved?',
      'What is the active water supply arrangement for this specific plot or building (municipal connection, colony borewell, or private supply)?',
      'What layout approvals, title documents, patta, or conversion papers are available for professional review?',
      'What electricity transformer connection and load sanction are established for this address?',
    ],
    filterUrl: '/developments?locality=Jagatpura',
    contactUrl: '/contact?intent=visit#enquiry',
    sources: [
      {
        title: 'Bombay Hospital Jaipur — Contact',
        url: 'https://bombayhospitalsjaipur.com/contact',
        verifiedFact: '269, Ramchandrapura, Goner, Sitapura, Jaipur, 302022',
      },
      {
        title: 'Suresh Gyan Vihar University — Contact Us',
        url: 'https://www.gyanvihar.org/contact-us',
        verifiedFact: 'Gyan Vihar Marg, Jagatpura, Jaipur, Rajasthan 302017',
      },
    ],
  },

  'kusum-vihar': {
    id: 'kusum-vihar',
    slug: 'kusum-vihar',
    name: 'Kusum Vihar',
    shortTag: 'Residential Enclave off Mahal Road (Documentation Pending)',
    zone: 'South-East Jaipur (Jagatpura Sector)',
    status: 'withheld',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Jaipur Localities', href: '/jaipur-localities' },
      { label: 'Kusum Vihar' },
    ],
    headline: 'Kusum Vihar, Jaipur',
    subheadline:
      'A residential pocket situated off Mahal Road. Public guide is currently withheld pending verified primary layout documentation.',
    characterOverview:
      'Kusum Vihar is a residential pocket situated off Mahal Road in South-East Jaipur. In accordance with Happy Homes verification standards, detailed descriptive claims regarding lane dimensions, scheme associations, and public spaces remain withheld pending official layout records.',
    geographyContext: {
      sectorRoads: 'Located off Mahal Road. Specific sanctioned lane widths require official scheme plan documentation.',
      corridorPosition: 'South-East Jaipur quadrant off Mahal Road.',
      boundaryNotes: 'Exact colony boundaries, approved layout sheets, and connection points require primary owner documentation.',
    },
    civicObservations: [
      {
        title: 'Layout & Boundary Documentation',
        description:
          'Sanctioned road dimensions and scheme boundaries must be confirmed against approved town planning or development authority layout plans.',
        nuance:
          'Prospective buyers should review the sanctioned layout map with a qualified legal or architectural professional.',
      },
    ],
    buyerFitConsiderations: [
      {
        fitFor: 'Independent Home & Plot Buyers',
        tradeoffs: 'Documentation must be verified on an individual site basis.',
        guidance: 'Enquire directly with our desk for property-specific coordinates and documentation.',
      },
    ],
    questionsToAsk: [
      'What is the sanctioned road width fronting the property on the approved scheme plan?',
      'What water source and electricity connections are operational for the plot?',
      'What layout sanction and patta documentation are available for professional verification?',
    ],
    filterUrl: '/developments?locality=Kusum+Vihar',
    contactUrl: '/contact?intent=visit#enquiry',
    withheldReason:
      'Withheld pending primary evidence: official approved layout map, documented colony boundaries, verified road widths, and open space allocations.',
    requiredOwnerEvidence: [
      'Approved scheme layout plan with sanction number and authority stamp.',
      'Documented boundary demarcation and exact connecting access point to Mahal Road.',
      'Verified sanctioned lane widths and accessible public space / park demarcations.',
      'Operational utility handover or supply documentation.',
    ],
  },
};
