import assert from 'node:assert';
import {
  isDevelopmentAvailable,
  isDevelopmentSoldOnly,
  getEffectiveAvailability,
  isPrivateRecord,
} from '../src/utils/canonicalAvailability.js';
import {
  projectPublicDevelopment,
  projectPublicArea,
  projectPublicPhoto,
  projectPublicFloorPlan,
  projectPublicBrochure,
  projectPublicConfiguration,
  projectPublicLocation,
  projectPublicSpecificationGroup,
  projectPublicProgressUpdate,
} from '../src/utils/publicProjection.js';
import type { DevelopmentPublic } from '../src/types/development.js';

async function runTargetedCorrectionsTests() {
  console.log('=== S10 Targeted Corrections Test Suite ===\n');

  // =========================================================================
  // PART 1: CANONICAL AVAILABILITY TESTS
  // =========================================================================
  console.log('--- 1. Testing Canonical Availability Logic ---');

  // 1a. Root availability states (single-inventory / no configurations)
  const singleAvailable = { id: 'd1', availability: 'Available', configurations: [] };
  const singleReserved = { id: 'd2', availability: 'Reserved', configurations: [] };
  const singleSold = { id: 'd3', availability: 'Sold', configurations: [] };
  const singleNotSpecified = { id: 'd4', availability: 'Not specified', configurations: [] };
  const singleUnknown = { id: 'd5', availability: 'Coming Soon', configurations: [] };
  const singleNull = { id: 'd6', availability: null, configurations: [] };

  assert.strictEqual(isDevelopmentAvailable(singleAvailable), true, 'Single Available is available');
  assert.strictEqual(isDevelopmentSoldOnly(singleAvailable), false, 'Single Available is not sold-only');
  assert.strictEqual(getEffectiveAvailability(singleAvailable), 'Available');

  assert.strictEqual(isDevelopmentAvailable(singleReserved), false, 'Single Reserved is not available');
  assert.strictEqual(isDevelopmentSoldOnly(singleReserved), false, 'Single Reserved is not sold-only');
  assert.strictEqual(getEffectiveAvailability(singleReserved), 'Reserved');

  assert.strictEqual(isDevelopmentAvailable(singleSold), false, 'Single Sold is not available');
  assert.strictEqual(isDevelopmentSoldOnly(singleSold), true, 'Single Sold is sold-only');
  assert.strictEqual(getEffectiveAvailability(singleSold), 'Sold');

  assert.strictEqual(isDevelopmentAvailable(singleNotSpecified), false, 'Not specified is not available');
  assert.strictEqual(isDevelopmentSoldOnly(singleNotSpecified), false, 'Not specified is not sold-only');
  assert.strictEqual(getEffectiveAvailability(singleNotSpecified), 'Not specified');

  assert.strictEqual(isDevelopmentAvailable(singleUnknown), false, 'Unknown string is not available');
  assert.strictEqual(isDevelopmentSoldOnly(singleUnknown), false, 'Unknown string is not sold-only');
  assert.strictEqual(getEffectiveAvailability(singleUnknown), 'Not specified');

  assert.strictEqual(isDevelopmentAvailable(singleNull), false, 'Null availability is not available');
  assert.strictEqual(isDevelopmentSoldOnly(singleNull), false, 'Null availability is not sold-only');
  console.log('  ✓ Single-inventory availability states correctly classified');

  // 1b. Multi-configuration developments & Stale Parent Labels
  // Stale parent label: parent says 'Sold', but config 1 is 'Available'
  const staleParentSoldWithAvailableConfig = {
    id: 'd_stale_1',
    availability: 'Sold', // STALE PARENT
    configurations: [
      { id: 'c1', label: 'Unit A', availability: 'Available' },
      { id: 'c2', label: 'Unit B', availability: 'Sold' },
    ],
  };

  assert.strictEqual(
    isDevelopmentAvailable(staleParentSoldWithAvailableConfig),
    true,
    'Stale parent "Sold" with available configuration must be genuinely Available'
  );
  assert.strictEqual(
    isDevelopmentSoldOnly(staleParentSoldWithAvailableConfig),
    false,
    'Stale parent "Sold" with available configuration must NOT be treated as sold-only'
  );
  assert.strictEqual(
    getEffectiveAvailability(staleParentSoldWithAvailableConfig),
    'Available',
    'Effective availability must be Available'
  );
  console.log('  ✓ Stale parent "Sold" label does NOT cause sold-only CTA when available config exists');

  // Stale parent label: parent says 'Available', but ALL configurations are 'Sold'
  const staleParentAvailableWithAllSoldConfigs = {
    id: 'd_stale_2',
    availability: 'Available', // STALE PARENT
    configurations: [
      { id: 'c1', label: 'Floor 1', availability: 'Sold' },
      { id: 'c2', label: 'Floor 2', availability: 'Sold' },
    ],
  };

  assert.strictEqual(
    isDevelopmentAvailable(staleParentAvailableWithAllSoldConfigs),
    false,
    'Stale parent "Available" with all sold configs must NOT be available'
  );
  assert.strictEqual(
    isDevelopmentSoldOnly(staleParentAvailableWithAllSoldConfigs),
    true,
    'Stale parent "Available" with all sold configs must be treated as sold-only'
  );
  assert.strictEqual(
    getEffectiveAvailability(staleParentAvailableWithAllSoldConfigs),
    'Sold',
    'Effective availability must be Sold'
  );
  console.log('  ✓ All-sold configurations correctly recognized as sold-only despite stale parent "Available"');

  // Mixed configurations: some Reserved, none Available
  const mixedReservedAndSoldConfigs = {
    id: 'd_mixed_1',
    availability: 'Available',
    configurations: [
      { id: 'c1', label: 'Unit 1', availability: 'Reserved' },
      { id: 'c2', label: 'Unit 2', availability: 'Sold' },
    ],
  };

  assert.strictEqual(isDevelopmentAvailable(mixedReservedAndSoldConfigs), false, 'No available config -> not available');
  assert.strictEqual(isDevelopmentSoldOnly(mixedReservedAndSoldConfigs), false, 'Reserved config exists -> not sold-only');
  assert.strictEqual(getEffectiveAvailability(mixedReservedAndSoldConfigs), 'Reserved');
  console.log('  ✓ Mixed Reserved and Sold configurations correctly evaluated');

  // 1c. Private / Unpublished record exclusion
  const privateDraft1 = { id: 'priv_1', availability: 'Available', status: 'draft' };
  const privateDraft2 = { id: 'priv_2', availability: 'Available', isDraft: true };
  const privateDraft3 = { id: 'priv_3', availability: 'Available', publicationStatus: 'draft' };
  const privateArchived = { id: 'priv_4', availability: 'Available', status: 'archived' };

  assert.strictEqual(isPrivateRecord(privateDraft1), true);
  assert.strictEqual(isPrivateRecord(privateDraft2), true);
  assert.strictEqual(isPrivateRecord(privateDraft3), true);
  assert.strictEqual(isPrivateRecord(privateArchived), true);

  assert.strictEqual(isDevelopmentAvailable(privateDraft1), false, 'Private draft 1 excluded');
  assert.strictEqual(isDevelopmentAvailable(privateDraft2), false, 'Private draft 2 excluded');
  assert.strictEqual(isDevelopmentAvailable(privateDraft3), false, 'Private draft 3 excluded');
  assert.strictEqual(isDevelopmentAvailable(privateArchived), false, 'Private archived excluded');
  console.log('  ✓ Private records strictly excluded from available inventory');

  // 1d. Related Developments Filtering & Ranking
  console.log('\n--- 2. Testing Related Developments Filtering & Deterministic Ranking ---');
  const currentDev: DevelopmentPublic = {
    id: 'current_1',
    slug: 'current-villa',
    name: 'Current Villa',
    type: 'Villa',
    locality: 'Jagatpura',
    shortDescription: 'Current',
    priceMode: 'starting_at',
    priceAmount: 20000000,
    priceDisplay: 'Starting from ₹2.00 Cr',
    availability: 'Available',
    constructionStage: 'Under construction',
    area: null,
    bedrooms: 4,
    image: null,
    publishedAt: '2026-10-10T00:00:00Z',
  };

  const pool: any[] = [
    currentDev, // Self - MUST BE EXCLUDED
    {
      id: 'self_dup_slug',
      slug: 'current-villa', // Matching slug - MUST BE EXCLUDED
      name: 'Current Villa Dup',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Available',
    },
    {
      id: 'sold_dev',
      slug: 'sold-dev',
      name: 'Sold Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Sold', // Sold - MUST BE EXCLUDED
    },
    {
      id: 'reserved_dev',
      slug: 'reserved-dev',
      name: 'Reserved Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Reserved', // Reserved - MUST BE EXCLUDED
    },
    {
      id: 'coming_soon_dev',
      slug: 'coming-soon-dev',
      name: 'Coming Soon Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Coming Soon', // Coming Soon - MUST BE EXCLUDED
    },
    {
      id: 'private_draft',
      slug: 'private-draft',
      name: 'Draft Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Available',
      status: 'draft', // Private - MUST BE EXCLUDED
    },
    {
      id: 'avail_diff_type_diff_loc',
      slug: 'plot-vaishali',
      name: 'Vaishali Plot',
      type: 'Residential Plot',
      locality: 'Vaishali Nagar',
      availability: 'Available',
    },
    {
      id: 'avail_same_type_same_loc',
      slug: 'villa-jagatpura-b',
      name: 'B Jagatpura Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      availability: 'Available',
    },
    {
      id: 'avail_same_type_diff_loc',
      slug: 'villa-mansarovar',
      name: 'Mansarovar Villa',
      type: 'Villa',
      locality: 'Mansarovar',
      availability: 'Available',
    },
    {
      id: 'avail_stale_sold_with_unit',
      slug: 'floor-jagatpura',
      name: 'Jagatpura Floor',
      type: 'Independent Floor',
      locality: 'Jagatpura',
      availability: 'Sold', // Stale parent label
      configurations: [
        { id: 'c1', label: 'Unit 1', availability: 'Available' }, // genuinely available!
      ],
    },
  ];

  const related = pool
    .filter((d) => d && d.id !== currentDev.id && d.slug !== currentDev.slug && isDevelopmentAvailable(d))
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

  assert.strictEqual(related.length, 3, 'Caps strictly at 3 related items');
  assert.ok(!related.some((r) => r.id === currentDev.id), 'Excludes current development');
  assert.ok(!related.some((r) => r.slug === currentDev.slug), 'Excludes current slug');
  assert.ok(!related.some((r) => r.id === 'sold_dev'), 'Excludes sold development');
  assert.ok(!related.some((r) => r.id === 'reserved_dev'), 'Excludes reserved development');
  assert.ok(!related.some((r) => r.id === 'coming_soon_dev'), 'Excludes coming soon development');
  assert.ok(!related.some((r) => r.id === 'private_draft'), 'Excludes private draft');

  // Verify rank ordering:
  // 1st: same type + same locality (avail_same_type_same_loc)
  assert.strictEqual(related[0].id, 'avail_same_type_same_loc');
  // 2nd: same type, different locality (avail_same_type_diff_loc)
  assert.strictEqual(related[1].id, 'avail_same_type_diff_loc');
  // 3rd: same locality, different type (avail_stale_sold_with_unit which is genuinely available!)
  assert.strictEqual(related[2].id, 'avail_stale_sold_with_unit');
  console.log('  ✓ Related developments accurately ranked and strictly filtered to available records');

  // =========================================================================
  // PART 2: EXPLICIT PUBLIC PROJECTION TESTS
  // =========================================================================
  console.log('\n--- 3. Testing Explicit Public Projection Allowlist ---');

  // Hostile/dirty raw record with arbitrary newly introduced private fields
  // at BOTH top-level and nested positions
  const dirtyRawRecord = {
    // Legitimate public fields
    id: 'dev_proj_1',
    slug: 'luxury-villa',
    name: 'Luxury Villa',
    type: 'Villa',
    locality: 'Jagatpura',
    shortDescription: 'Modern villa estate',
    priceMode: 'starting_at',
    priceAmount: 32000000,
    priceDisplay: 'Starting from ₹3.20 Cr',
    availability: 'Available',
    constructionStage: 'Under construction',
    publishedAt: '2026-10-10T12:00:00Z',
    version: 2,

    // TOP-LEVEL PRIVATE & UNKNOWN FIELDS (Must be excluded)
    actorUid: 'priv_admin_123',
    lastModifiedBy: 'priv_admin_123',
    lastAvailabilityCheck: { timestamp: '2026-10-10', actorUid: 'priv_admin_123', revision: 1 },
    lastBrochureReview: { timestamp: '2026-10-10', actorUid: 'priv_admin_123', revision: 1, assetId: 'b1' },
    internalNotes: 'Confidential: Land acquired under special settlement',
    draft: { internalFlag: true },
    secrets: 'cloudinary-api-secret-key-xyz',
    status: 'published',
    hasUnpublishedChanges: true,
    arbitraryTopLevelKey1: 'UNWANTED_LEAK_1',
    builderCostMarginPercent: 28.5,
    contractorPaymentPending: true,

    // NESTED: area with unknown fields
    area: {
      value: 3500,
      definition: 'carpet',
      unit: 'sq ft',
      internalFormula: 'plot * 0.78', // UNWANTED
      rawSurveyorNotes: 'survey done 2025', // UNWANTED
    },

    // NESTED: image with unknown fields
    image: {
      url: 'https://res.cloudinary.com/demo/image/upload/v1/villa.jpg',
      altText: 'Villa exterior',
      label: 'Actual photograph',
      uploadedByAdminId: 'admin_456', // UNWANTED
      exifGpsLocation: '26.85, 75.82', // UNWANTED
    },

    // NESTED: photos with unknown fields
    photos: [
      {
        id: 'photo_1',
        cloudinaryPublicId: 'photo_1_id',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/p1.jpg',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p1.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        altText: 'Living area',
        label: 'Actual photograph',
        isCover: true,
        sortOrder: 1,
        version: 1,
        uploadedBy: 'staff_123', // UNWANTED
        bytes: 845000, // UNWANTED on public photo
        cameraModel: 'Sony A7IV', // UNWANTED
      },
    ],

    // NESTED: plans with unknown fields
    plans: [
      {
        id: 'plan_1',
        title: 'Ground Floor Plan',
        floor: 'Ground',
        configurationId: 'cfg_1',
        assetType: 'image',
        cloudinaryPublicId: 'plan_1_id',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/plan1.jpg',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/plan1.jpg',
        format: 'jpg',
        bytes: 450000,
        width: 1200,
        height: 800,
        sortOrder: 1,
        architectFeePaid: true, // UNWANTED
        internalCadRef: 'CAD-2026-X9', // UNWANTED
      },
    ],

    // NESTED: brochure with unknown fields
    brochure: {
      assetId: 'brochure_1',
      title: 'Project Brochure',
      editionDate: 'October 2026',
      url: 'https://res.cloudinary.com/demo/raw/upload/v1/b.pdf',
      secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/b.pdf',
      format: 'pdf',
      bytes: 2100000,
      createdAt: '2026-10-01', // UNWANTED
      internalReviewStatus: 'approved', // UNWANTED
    },

    // NESTED: specifications with unknown fields
    specifications: [
      {
        id: 'spec_g_1',
        title: 'Structure & Flooring',
        internalGroupCode: 'GRP_01', // UNWANTED
        items: [
          {
            id: 'spec_i_1',
            label: 'Flooring',
            value: 'Italian Marble in foyer',
            type: 'inclusion',
            supplierCostPerSqFt: 450, // UNWANTED
            contractorName: 'Rajasthan Stones Ltd', // UNWANTED
          },
        ],
      },
    ],

    // NESTED: configurations with unknown fields
    configurations: [
      {
        id: 'cfg_1',
        label: '4 BHK Grand Villa',
        floor: 'Ground + 1',
        bedrooms: 4,
        area: {
          value: 3500,
          definition: 'carpet',
          unit: 'sq ft',
          secretBufferArea: 200, // UNWANTED
        },
        availability: 'Available',
        priceMode: 'starting_at',
        priceAmount: 32000000,
        priceDisplay: 'Starting from ₹3.20 Cr',
        internalBaseCost: 24000000, // UNWANTED
        brokerCommissionRate: 0.02, // UNWANTED
      },
    ],

    // NESTED: location with unknown fields and private notes
    location: {
      address: 'Plot 45, Kusum Vihar, Jagatpura, Jaipur',
      coordinates: {
        latitude: 26.824,
        longitude: 75.864,
        altitudeMeters: 430, // UNWANTED
      },
      directionsUrl: 'https://maps.google.com/?q=26.824,75.864',
      internalLandTitleId: 'JDA-TITLE-9988', // UNWANTED
      nearbyPlaces: [
        {
          id: 'place_1',
          name: 'Bombay Hospital',
          category: 'Healthcare',
          distanceValue: 2.5,
          distanceUnit: 'km',
          status: 'Existing',
          publicNote: 'Operational tertiary hospital',
          sourceNote: 'Internal check by staff on 2026-09-15', // UNWANTED private field
          isPublicSourceNote: false, // UNWANTED private field
          checkedDate: '2026-09-15', // UNWANTED private field
          actorUid: 'priv_user_99', // UNWANTED private field
        },
      ],
    },

    // NESTED: progress with unknown fields
    progress: [
      {
        id: 'prog_1',
        date: '02 October 2026',
        title: 'Plinth Foundation Completed',
        stage: 'Completed work',
        description: 'Quality inspection verified by structural auditor.',
        internalAuditLog: 'Auditor ID #991 passed with 0 defects', // UNWANTED
        contractorInvoiceAmount: 850000, // UNWANTED
      },
    ],
  };

  const projected = projectPublicDevelopment(dirtyRawRecord)!;
  assert.ok(projected, 'Projection succeeded');

  // Check top-level exclusion of unknown & private fields
  const projectedKeys = Object.keys(projected);
  assert.strictEqual((projected as any).actorUid, undefined, 'actorUid must not exist');
  assert.strictEqual((projected as any).lastModifiedBy, undefined, 'lastModifiedBy must not exist');
  assert.strictEqual((projected as any).lastAvailabilityCheck, undefined, 'lastAvailabilityCheck must not exist');
  assert.strictEqual((projected as any).lastBrochureReview, undefined, 'lastBrochureReview must not exist');
  assert.strictEqual((projected as any).internalNotes, undefined, 'internalNotes must not exist');
  assert.strictEqual((projected as any).draft, undefined, 'draft must not exist');
  assert.strictEqual((projected as any).secrets, undefined, 'secrets must not exist');
  assert.strictEqual((projected as any).status, undefined, 'status must not exist');
  assert.strictEqual((projected as any).hasUnpublishedChanges, undefined, 'hasUnpublishedChanges must not exist');
  assert.strictEqual((projected as any).arbitraryTopLevelKey1, undefined, 'arbitraryTopLevelKey1 must not exist');
  assert.strictEqual((projected as any).builderCostMarginPercent, undefined, 'builderCostMarginPercent must not exist');
  assert.strictEqual((projected as any).contractorPaymentPending, undefined, 'contractorPaymentPending must not exist');
  console.log('  ✓ Top-level unknown and private fields are strictly excluded');

  // Check nested area
  assert.deepStrictEqual(projected.area, { value: 3500, definition: 'carpet', unit: 'sq ft' });
  assert.strictEqual((projected.area as any).internalFormula, undefined);
  assert.strictEqual((projected.area as any).rawSurveyorNotes, undefined);
  console.log('  ✓ Nested area unknown fields are strictly excluded');

  // Check nested image
  assert.deepStrictEqual(projected.image, {
    url: 'https://res.cloudinary.com/demo/image/upload/v1/villa.jpg',
    altText: 'Villa exterior',
    label: 'Actual photograph',
  });
  assert.strictEqual((projected.image as any).uploadedByAdminId, undefined);
  assert.strictEqual((projected.image as any).exifGpsLocation, undefined);
  console.log('  ✓ Nested image unknown fields are strictly excluded');

  // Check nested photos
  assert.strictEqual(projected.photos?.length, 1);
  const p0 = projected.photos![0];
  assert.strictEqual((p0 as any).uploadedBy, undefined);
  assert.strictEqual((p0 as any).bytes, undefined);
  assert.strictEqual((p0 as any).cameraModel, undefined);
  assert.strictEqual(p0.id, 'photo_1');
  assert.strictEqual(p0.isCover, true);
  console.log('  ✓ Nested photos unknown fields are strictly excluded');

  // Check nested plans
  assert.strictEqual(projected.plans?.length, 1);
  const pl0 = projected.plans![0];
  assert.strictEqual((pl0 as any).architectFeePaid, undefined);
  assert.strictEqual((pl0 as any).internalCadRef, undefined);
  assert.strictEqual(pl0.title, 'Ground Floor Plan');
  console.log('  ✓ Nested plans unknown fields are strictly excluded');

  // Check nested brochure
  assert.strictEqual((projected.brochure as any).createdAt, undefined);
  assert.strictEqual((projected.brochure as any).internalReviewStatus, undefined);
  assert.strictEqual(projected.brochure?.assetId, 'brochure_1');
  console.log('  ✓ Nested brochure unknown fields are strictly excluded');

  // Check nested specifications
  const specG0 = projected.specifications![0];
  assert.strictEqual((specG0 as any).internalGroupCode, undefined);
  const specI0 = specG0.items[0];
  assert.strictEqual((specI0 as any).supplierCostPerSqFt, undefined);
  assert.strictEqual((specI0 as any).contractorName, undefined);
  assert.strictEqual(specI0.label, 'Flooring');
  console.log('  ✓ Nested specification group & item unknown fields are strictly excluded');

  // Check nested configurations
  const cfg0 = projected.configurations![0];
  assert.strictEqual((cfg0 as any).internalBaseCost, undefined);
  assert.strictEqual((cfg0 as any).brokerCommissionRate, undefined);
  assert.strictEqual((cfg0.area as any)?.secretBufferArea, undefined);
  assert.strictEqual(cfg0.label, '4 BHK Grand Villa');
  console.log('  ✓ Nested configuration unknown fields are strictly excluded');

  // Check nested location & nearby places
  assert.strictEqual((projected.location as any).internalLandTitleId, undefined);
  assert.strictEqual((projected.location?.coordinates as any)?.altitudeMeters, undefined);
  const place0 = projected.location?.nearbyPlaces?.[0];
  assert.strictEqual(place0?.publicNote, 'Operational tertiary hospital');
  assert.strictEqual((place0 as any)?.sourceNote, undefined, 'private sourceNote stripped');
  assert.strictEqual((place0 as any)?.isPublicSourceNote, undefined, 'isPublicSourceNote stripped');
  assert.strictEqual((place0 as any)?.checkedDate, undefined, 'checkedDate stripped');
  assert.strictEqual((place0 as any)?.actorUid, undefined, 'actorUid stripped');
  console.log('  ✓ Nested location coordinates and nearby places private fields are strictly excluded');

  // Check nested progress
  const prog0 = projected.progress![0];
  assert.strictEqual((prog0 as any).internalAuditLog, undefined);
  assert.strictEqual((prog0 as any).contractorInvoiceAmount, undefined);
  assert.strictEqual(prog0.title, 'Plinth Foundation Completed');
  console.log('  ✓ Nested progress updates unknown fields are strictly excluded');

  // Preserves legitimate public content completely
  assert.strictEqual(projected.id, 'dev_proj_1');
  assert.strictEqual(projected.name, 'Luxury Villa');
  assert.strictEqual(projected.type, 'Villa');
  assert.strictEqual(projected.locality, 'Jagatpura');
  assert.strictEqual(projected.priceDisplay, 'Starting from ₹3.20 Cr');
  assert.strictEqual(projected.availability, 'Available');
  console.log('  ✓ Legitimate public content perfectly preserved');

  console.log('\n=== All Targeted Corrections Tests Passed! ===');
}

runTargetedCorrectionsTests().catch((err) => {
  console.error('Targeted Corrections Tests Failed:', err);
  process.exit(1);
});
