import assert from 'node:assert';
import {
  isDevelopmentAvailable,
  isDevelopmentSoldOnly,
  getEffectiveAvailability,
  isPrivateRecord,
} from '../src/utils/canonicalAvailability.js';
import { projectPublicDevelopment } from '../src/utils/publicProjection.js';
import type { DevelopmentPublic } from '../src/types/development.js';

console.log('--- RUNNING CANONICAL AVAILABILITY AND PUBLIC PROJECTION TESTS ---');

// --- 1. Canonical Availability Tests ---
// Case A: Root available, no configs
const devAvailableRoot: any = {
  id: 'dev-1',
  slug: 'dev-1',
  name: 'Available Villa',
  type: 'villa',
  availability: 'Available',
};
assert.strictEqual(isDevelopmentAvailable(devAvailableRoot), true, 'Case A should be available');
assert.strictEqual(isDevelopmentSoldOnly(devAvailableRoot), false, 'Case A should not be sold only');
assert.strictEqual(getEffectiveAvailability(devAvailableRoot), 'Available');

// Case B: Root sold, no configs
const devSoldRoot: any = {
  id: 'dev-2',
  slug: 'dev-2',
  name: 'Sold Villa',
  type: 'villa',
  availability: 'Sold',
};
assert.strictEqual(isDevelopmentAvailable(devSoldRoot), false, 'Case B should not be available');
assert.strictEqual(isDevelopmentSoldOnly(devSoldRoot), true, 'Case B should be sold only');
assert.strictEqual(getEffectiveAvailability(devSoldRoot), 'Sold');

// Case C: Root reserved, no configs
const devReservedRoot: any = {
  id: 'dev-3',
  slug: 'dev-3',
  name: 'Reserved Villa',
  type: 'villa',
  availability: 'Reserved',
};
assert.strictEqual(isDevelopmentAvailable(devReservedRoot), false, 'Reserved should not be available');
assert.strictEqual(isDevelopmentSoldOnly(devReservedRoot), false, 'Reserved is not sold-only');
assert.strictEqual(getEffectiveAvailability(devReservedRoot), 'Reserved');

// Case D: Stale parent label 'Sold', but has an 'Available' sub-configuration
const devStaleSoldWithAvailableConfig: any = {
  id: 'dev-4',
  slug: 'dev-4',
  name: 'Stale Sold Parent',
  type: 'independent-floor',
  availability: 'Sold', // Stale parent label
  configurations: [
    { id: 'c1', unitName: '1st Floor', bedrooms: 3, availability: 'Sold' },
    { id: 'c2', unitName: '2nd Floor', bedrooms: 3, availability: 'Available' },
  ],
};
assert.strictEqual(
  isDevelopmentAvailable(devStaleSoldWithAvailableConfig),
  true,
  'Development with Available config must be Available despite stale parent label'
);
assert.strictEqual(
  isDevelopmentSoldOnly(devStaleSoldWithAvailableConfig),
  false,
  'Development with Available config must not be sold only'
);
assert.strictEqual(getEffectiveAvailability(devStaleSoldWithAvailableConfig), 'Available');

// Case E: Parent label 'Available', but ALL sub-configurations are 'Sold'
const devStaleAvailableWithAllSoldConfigs: any = {
  id: 'dev-5',
  slug: 'dev-5',
  name: 'Stale Available Parent',
  type: 'independent-floor',
  availability: 'Available', // Stale parent label
  configurations: [
    { id: 'c1', unitName: '1st Floor', bedrooms: 3, availability: 'Sold' },
    { id: 'c2', unitName: '2nd Floor', bedrooms: 3, availability: 'Sold' },
  ],
};
assert.strictEqual(
  isDevelopmentAvailable(devStaleAvailableWithAllSoldConfigs),
  false,
  'All configs sold must mean not available'
);
assert.strictEqual(
  isDevelopmentSoldOnly(devStaleAvailableWithAllSoldConfigs),
  true,
  'All configs sold must mean sold only'
);
assert.strictEqual(getEffectiveAvailability(devStaleAvailableWithAllSoldConfigs), 'Sold');

// Case F: Unknown/Coming Soon/Reserved configs only
const devReservedConfigs: any = {
  id: 'dev-6',
  slug: 'dev-6',
  name: 'Reserved Floor',
  type: 'independent-floor',
  availability: 'Available',
  configurations: [
    { id: 'c1', unitName: '1st Floor', bedrooms: 3, availability: 'Reserved' },
  ],
};
assert.strictEqual(isDevelopmentAvailable(devReservedConfigs), false);
assert.strictEqual(isDevelopmentSoldOnly(devReservedConfigs), false);

// Case G: Private drafts and archived records
const devDraft: any = {
  id: 'dev-draft',
  slug: 'dev-draft',
  name: 'Draft Record',
  type: 'villa',
  availability: 'Available',
  publicationStatus: 'draft',
};
assert.strictEqual(isPrivateRecord(devDraft), true);
assert.strictEqual(isDevelopmentAvailable(devDraft), false);

const devArchived: any = {
  id: 'dev-archived',
  slug: 'dev-archived',
  name: 'Archived Record',
  type: 'villa',
  availability: 'Available',
  archived: true,
};
assert.strictEqual(isPrivateRecord(devArchived), true);
assert.strictEqual(isDevelopmentAvailable(devArchived), false);

console.log('✓ Canonical availability tests passed!');

// --- 2. Explicit Public Projection Allowlist Tests ---
const rawRecordWithPrivateFields: any = {
  id: 'dev-complex-1',
  slug: 'dev-complex-1',
  name: 'Greenfield Villas',
  type: 'villa',
  status: 'Ready to Move',
  locality: 'Mansarovar',
  availability: 'Available',
  priceAmount: 8500000,
  priceMode: 'fixed',
  bedrooms: 4,
  bathrooms: 4,
  description: 'Luxury 4BHK Villa in Mansarovar',
  overview: 'Spacious direct builder villa.',
  summary: 'Short summary',
  area: {
    builtUpAreaSqFt: 2400,
    carpetAreaSqFt: 2100,
    plotAreaSqYd: 150,
    unauthorizedInternalField: 'classified',
  },
  image: {
    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    caption: 'Front Elevation',
    secretCloudinaryBucketId: 'leak-bucket',
  },
  photos: [
    {
      url: 'https://res.cloudinary.com/demo/image/upload/p1.jpg',
      caption: 'Living room',
      category: 'interior',
      order: 1,
      internalPhotographerCost: 5000,
    },
  ],
  configurations: [
    {
      id: 'cfg-1',
      unitName: 'Unit A',
      bedrooms: 4,
      bathrooms: 4,
      availability: 'Available',
      priceAmount: 8500000,
      privateDeveloperMargin: '30%',
      profitEstimate: 1200000,
    },
  ],
  specifications: [
    {
      group: 'Flooring',
      items: [
        { label: 'Living', value: 'Italian Marble', vendorWholesaleRate: '120/sqft' },
      ],
      internalAuditCode: 'SPEC-999',
    },
  ],
  brochure: {
    url: 'https://res.cloudinary.com/demo/raw/upload/brochure.pdf',
    fileName: 'brochure.pdf',
    sizeBytes: 1048576,
    mimeType: 'application/pdf',
    publishedAt: '2026-03-01T00:00:00.00Z',
    backendStorageFolder: '/private/corp/assets',
  },
  progress: [
    {
      date: '2026-02-15',
      title: 'Structure complete',
      stage: 'Structure Completed',
      percentComplete: 75,
      superintendentPhone: '+91 9999999999',
    },
  ],
  location: {
    address: 'Plot 45, Mansarovar',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302020',
    privateOwnerLandAgreementId: 'AGR-4001',
  },
  publishedAt: '2026-03-01T00:00:00.00Z',
  updatedAt: '2026-03-05T00:00:00.00Z',
  // Arbitrary newly introduced private and audit fields
  internalNotes: 'Owner requested no broker visits',
  draftNotes: 'Draft revision pending approval',
  auditLog: [{ action: 'CREATE', user: 'admin@happyhomes.com', timestamp: 123456789 }],
  privateDraft: { some: 'secret' },
  ownerContactSecret: 'secret-token-xyz',
  marginRate: 0.18,
  unpublishedChanges: true,
};

const projected = projectPublicDevelopment(rawRecordWithPrivateFields);

// Verify allowlisted top-level fields are preserved
assert.strictEqual(projected.id, 'dev-complex-1');
assert.strictEqual(projected.slug, 'dev-complex-1');
assert.strictEqual(projected.name, 'Greenfield Villas');
assert.strictEqual(projected.type, 'Villa');
assert.strictEqual(projected.locality, 'Mansarovar');
assert.strictEqual(projected.availability, 'Available');
assert.strictEqual(projected.priceAmount, 8500000);
assert.strictEqual(projected.shortDescription, 'Luxury 4BHK Villa in Mansarovar');
assert.strictEqual(projected.area?.value, 2400);

// Verify arbitrary top-level private fields are STRIPPED
assert.strictEqual((projected as any).internalNotes, undefined, 'internalNotes must be stripped');
assert.strictEqual((projected as any).draftNotes, undefined, 'draftNotes must be stripped');
assert.strictEqual((projected as any).auditLog, undefined, 'auditLog must be stripped');
assert.strictEqual((projected as any).privateDraft, undefined, 'privateDraft must be stripped');
assert.strictEqual((projected as any).ownerContactSecret, undefined, 'ownerContactSecret must be stripped');
assert.strictEqual((projected as any).marginRate, undefined, 'marginRate must be stripped');
assert.strictEqual((projected as any).unpublishedChanges, undefined, 'unpublishedChanges must be stripped');

// Verify nested private fields are STRIPPED
assert.strictEqual((projected.area as any)?.unauthorizedInternalField, undefined);
assert.strictEqual((projected.image as any)?.secretCloudinaryBucketId, undefined);
assert.strictEqual((projected.photos?.[0] as any)?.internalPhotographerCost, undefined);
assert.strictEqual(projected.photos?.[0]?.altText, 'Living room');
assert.strictEqual((projected.photos?.[0] as any)?.caption, undefined);
assert.strictEqual((projected.configurations?.[0] as any)?.privateDeveloperMargin, undefined);
assert.strictEqual((projected.configurations?.[0] as any)?.profitEstimate, undefined);
assert.strictEqual(projected.configurations?.[0]?.label, 'Unit A');
assert.strictEqual((projected.configurations?.[0] as any)?.unitName, undefined);
assert.strictEqual((projected.specifications?.[0] as any)?.internalAuditCode, undefined);
assert.strictEqual((projected.specifications?.[0]?.items[0] as any)?.vendorWholesaleRate, undefined);
assert.strictEqual(projected.specifications?.[0]?.items[0]?.label, 'Living');
assert.strictEqual((projected.brochure as any)?.backendStorageFolder, undefined);
assert.strictEqual(projected.brochure?.title, 'brochure.pdf');
assert.strictEqual((projected.progress?.[0] as any)?.superintendentPhone, undefined);
assert.strictEqual(projected.progress?.[0]?.title, 'Structure complete');
assert.strictEqual((projected.location as any)?.privateOwnerLandAgreementId, undefined);
assert.strictEqual((projected.location as any)?.city, undefined, 'unsupported location.city must not leak');
assert.strictEqual(projected.location?.address, 'Plot 45, Mansarovar');

console.log('✓ Explicit public projection allowlist tests passed!');

// --- 3. Related Developments Ranking & Exclusion Tests ---
const currentDev: any = {
  id: 'dev-current',
  slug: 'current-villa',
  name: 'Current Villa',
  type: 'Villa',
  locality: 'Mansarovar',
  availability: 'Available',
};

const fullTestCatalogue: any[] = [
  currentDev, // Self - should be excluded
  { id: 'rel-1', slug: 'rel-1', name: 'Alpha Villa', type: 'Villa', locality: 'Mansarovar', availability: 'Available' }, // Match type & loc
  { id: 'rel-2', slug: 'rel-2', name: 'Beta Villa', type: 'Villa', locality: 'Vaishali Nagar', availability: 'Available' }, // Match type
  { id: 'rel-3', slug: 'rel-3', name: 'Gamma Floor', type: 'Independent Floor', locality: 'Mansarovar', availability: 'Available' }, // Match loc
  { id: 'rel-4', slug: 'rel-4', name: 'Delta Plot', type: 'Residential Plot', locality: 'Jagatpura', availability: 'Available' }, // Match none
  { id: 'rel-sold', slug: 'rel-sold', name: 'Sold Villa', type: 'Villa', locality: 'Mansarovar', availability: 'Sold' }, // Sold - exclude
  { id: 'rel-res', slug: 'rel-res', name: 'Reserved Villa', type: 'Villa', locality: 'Mansarovar', availability: 'Reserved' }, // Reserved - exclude
  { id: 'rel-draft', slug: 'rel-draft', name: 'Draft Villa', type: 'Villa', locality: 'Mansarovar', availability: 'Available', isDraft: true }, // Draft - exclude
  {
    id: 'rel-stale-sold',
    slug: 'rel-stale-sold',
    name: 'Epsilon Floor',
    type: 'Independent Floor',
    locality: 'Mansarovar',
    availability: 'Sold', // Stale parent label
    configurations: [{ id: 'c1', label: 'Unit 1', availability: 'Available' }], // Has available config
  },
];

// Replicate the exact related developments filter from DevelopmentDetail.tsx
const filteredRelated = fullTestCatalogue
  .filter(
    (d) =>
      d &&
      d.id !== currentDev.id &&
      d.slug !== currentDev.slug &&
      isDevelopmentAvailable(d)
  )
  .sort((a, b) => {
    const aTypeMatch = a.type === currentDev.type;
    const bTypeMatch = b.type === currentDev.type;
    const aLocMatch = a.locality === currentDev.locality;
    const bLocMatch = b.locality === currentDev.locality;

    if (aTypeMatch && aLocMatch && !(bTypeMatch && bLocMatch)) return -1;
    if (bTypeMatch && bLocMatch && !(aTypeMatch && aLocMatch)) return 1;
    if (aTypeMatch && !bTypeMatch) return -1;
    if (bTypeMatch && !aTypeMatch) return 1;
    if (aLocMatch && !bLocMatch) return -1;
    if (bLocMatch && !aLocMatch) return 1;
    return a.name.localeCompare(b.name);
  })
  .slice(0, 3);

assert.strictEqual(filteredRelated.length, 3, 'Must cap at exactly 3 related developments');
assert.ok(!filteredRelated.some((d) => d.id === 'dev-current'), 'Must exclude current dev');
assert.ok(!filteredRelated.some((d) => d.id === 'rel-sold'), 'Must exclude sold dev');
assert.ok(!filteredRelated.some((d) => d.id === 'rel-res'), 'Must exclude reserved dev');
assert.ok(!filteredRelated.some((d) => d.id === 'rel-draft'), 'Must exclude draft dev');
assert.strictEqual(filteredRelated[0].id, 'rel-1', 'Highest match (same type & loc) must be first');
assert.strictEqual(filteredRelated[1].id, 'rel-2', 'Same type must be second');

console.log('✓ Related developments ranking and exclusion tests passed!');

// --- 4. Hostile text & JSON-LD / SSR serialization safety ---
function serializePublicDataSafely(data: any): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

const hostileDev = projectPublicDevelopment({
  id: 'dev-xss',
  slug: 'dev-xss',
  name: 'XSS Attack </script><script>alert(1)</script>',
  type: 'Villa',
  locality: 'Jaipur',
  shortDescription: '"><script src="evil.js"></script>',
  internalPrivateToken: 'DO_NOT_EXPOSE',
});

const serialized = serializePublicDataSafely(hostileDev);
assert.ok(!serialized.includes('</script>'), 'Must not contain literal </script>');
assert.ok(!serialized.includes('<script>'), 'Must not contain literal <script>');
assert.ok(!serialized.includes('DO_NOT_EXPOSE'), 'Must not contain private fields');
assert.ok(serialized.includes('\\u003c/script\\u003e'), 'Must escape hostile tags');

console.log('✓ Hostile serialization and private field omission tests passed!');
console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');

