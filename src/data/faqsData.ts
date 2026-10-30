export interface FaqItem {
  id: string;
  category: 'browsing' | 'viewings' | 'information' | 'planning';
  question: string;
  answer: string;
  categoryLabel: string;
}

export const FAQS_DATA: FaqItem[] = [
  {
    id: 'property-types',
    category: 'browsing',
    categoryLabel: 'Browsing & Inventory',
    question: 'Which property types can I browse?',
    answer:
      'Our portfolio includes three primary residential categories in Jaipur: turnkey luxury villas, boutique low-rise independent floors, and master-planned residential plots. You can browse current developments across these categories directly in our public catalogue.',
  },
  {
    id: 'currently-listed',
    category: 'browsing',
    categoryLabel: 'Browsing & Inventory',
    question: 'How do I find currently listed developments?',
    answer:
      'Visit the Developments page to explore all active public listings. You can filter by category (Villas, Independent Floors, or Plots) or by residential locality. Each listed development displays published specifications, location details, and direct contact options.',
  },
  {
    id: 'empty-inventory',
    category: 'browsing',
    categoryLabel: 'Browsing & Inventory',
    question: 'What if no developments are listed?',
    answer:
      'If the public catalogue shows zero active listings, it indicates that current developments are either in private pre-launch drafting or have completed handover. It does not mean Happy Homes has ceased operations. You can reach out directly through our Contact page to enquire about upcoming releases or off-market plots.',
  },
  {
    id: 'inquire-particular',
    category: 'browsing',
    categoryLabel: 'Browsing & Inventory',
    question: 'How do I ask about a particular property or configuration?',
    answer:
      'You can enquire using the form on any development detail page or via our main Contact page. State the development name, desired unit configuration, plot dimensions, or architectural preferences. Published details represent current planning and should be reconfirmed with our project desk, as availability does not constitute a reservation.',
  },
  {
    id: 'request-site-visit',
    category: 'viewings',
    categoryLabel: 'Visits & Video Viewings',
    question: 'How do I request a site visit?',
    answer:
      'Select the "Site Visit" option on our Contact page or click "Plan a Visit" in the main navigation. Specify your preferred date and time slot. Our team coordinates guided on-site walkthroughs so you can inspect plot boundaries, street frontage, construction stages, and surrounding neighborhood infrastructure.',
  },
  {
    id: 'visit-confirmation',
    category: 'viewings',
    categoryLabel: 'Visits & Video Viewings',
    question: 'Is a requested visit automatically confirmed?',
    answer:
      'No. Submitting a visit request logs your scheduling preference with our site desk, but it is not an automatically confirmed appointment. An enquiry receipt is not a confirmed booking. A site representative will contact you via phone or email to confirm representative availability, provide exact coordinates, and finalize your visit.',
  },
  {
    id: 'video-viewing',
    category: 'viewings',
    categoryLabel: 'Visits & Video Viewings',
    question: 'Can I request a video viewing?',
    answer:
      'Yes. If you are based outside Jaipur or unable to visit immediately, you can choose "Video Viewing" on our Contact form. We coordinate a live guided video walkthrough of the site, approach road, and property layout with a representative on-site.',
  },
  {
    id: 'time-zone',
    category: 'viewings',
    categoryLabel: 'Visits & Video Viewings',
    question: 'Which time zone applies to viewing preferences?',
    answer:
      'All preferred time slots and appointment requests operate in Indian Standard Time (IST, UTC+05:30). Outstation and international buyers should take this time standard into account when selecting convenient slots.',
  },
  {
    id: 'plans-brochure',
    category: 'information',
    categoryLabel: 'Project Information & Documentation',
    question: 'Where can I find plans, specifications or a brochure?',
    answer:
      'Sanctioned architectural layouts, structural specifications, and floor configurations are presented on individual development detail pages when published. If additional drawings, brochures, or site maps exist for that specific property, you may request them directly from our project desk. Documents are provided only when available for that site.',
  },
  {
    id: 'price-on-request',
    category: 'information',
    categoryLabel: 'Project Information & Documentation',
    question: 'What does “Price on request” mean?',
    answer:
      '“Price on request” indicates that pricing depends on specific unit selection, customized architectural specifications, plot size variations, or current stage of construction. Inquiring directly allows our team to provide current, accurate figures based on your exact property requirements rather than generalized estimates.',
  },
  {
    id: 'confirm-terms',
    category: 'planning',
    categoryLabel: 'Purchase Planning & Agreements',
    question: 'How do I confirm included items, costs and proposed dates?',
    answer:
      'Discuss applicable pricing, included specifications, statutory charges (such as stamp duty, registration fees, and electricity/water connection charges), payment milestones, and estimated handover dates directly with the builder desk. Commitments and contractual terms must rely entirely on the executed written agreement, not on informal discussions or website estimates.',
  },
  {
    id: 'document-review',
    category: 'planning',
    categoryLabel: 'Purchase Planning & Agreements',
    question: 'Who should review technical or legal documents?',
    answer:
      'Buyers are strongly encouraged to engage independent, appropriately qualified professionals—such as an independent property advocate or civil engineer—to examine title deeds, approved colony layout plans, revenue pattas, and proposed contracts. Happy Homes provides available property records upon request but does not conduct legal due diligence on behalf of the purchaser.',
  },
];
