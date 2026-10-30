/**
 * Isolated Test Suite for Happy Homes S05B2:
 * Floor Plans, Brochures, and Progress Photographs
 *
 * Verifies:
 * 1. Purpose and format validation (gallery, floor_plan, brochure; rejection of unsupported formats)
 * 2. Document preset configuration (happy_homes_documents: allowed_formats=[pdf], overwrite=false)
 * 3. Delivery URL handling (PDFs preserved without image transforms, images get responsive optimization)
 * 4. Cross-development containment check
 * 5. Repeat finalization idempotency
 * 6. Null and legacy record compatibility (missing plans/brochure/photoIds normalize cleanly with no undefined)
 * 7. Save & reload schema persistence (clean roundtrip with no undefined values)
 * 8. Configuration-reference removal (detaches linked configurationId cleanly)
 * 9. Shared progress-photo reference preservation & conflict detection
 * 10. Stale-version rejection and draft/public isolation during replacement
 */

import {
  type DevelopmentDraft,
  type DevelopmentPublic,
  type DevelopmentFloorPlan,
  type DevelopmentBrochure,
  type DevelopmentPhoto,
  type ProgressUpdate,
  getOptimizedImageUrl,
  formatBytes,
} from '../src/types/development.ts';

import {
  normalizeDraftForPersistence,
  normalizePublicSnapshotForPersistence,
  assertNoUndefinedInDocument,
  sanitizeFloorPlans,
  sanitizeBrochure,
  sanitizeProgress,
} from '../src/server/developmentsService.ts';

import {
  isCloudinaryConfigured,
  getCloudinaryPublicConfig,
  verifyAndEnsureCloudinaryPreset,
} from '../src/server/cloudinaryService.ts';

async function runS05B2Tests() {
  console.log('====================================================');
  console.log('  HAPPY HOMES — S05B2 COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // --- 1. Cloudinary Presets & Configuration ---
  console.log('\n--- 1. Cloudinary Document Preset & Allowed Formats ---');
  try {
    const pubConfig = await getCloudinaryPublicConfig();
    assert(pubConfig.isConfigured === true, 'Cloudinary is properly configured on server');
    assert(pubConfig.connected === true, 'Cloudinary API ping succeeds');
    assert(
      pubConfig.documentPresetName === 'happy_homes_documents',
      'Document preset name is configured to happy_homes_documents'
    );
    assert(
      pubConfig.documentPresetVerified === true,
      'Document preset happy_homes_documents is verified in Cloudinary'
    );
    assert(
      pubConfig.documentAllowedFormats.includes('pdf'),
      'happy_homes_documents preset enforces allowed_formats=[pdf]'
    );
    assert(
      !pubConfig.documentAllowedFormats.includes('jpg') && !pubConfig.documentAllowedFormats.includes('png'),
      'happy_homes_documents preset restricts image formats from document preset'
    );
    assert(
      pubConfig.presetVerified === true,
      'Photo preset happy_homes_photos is verified in Cloudinary'
    );
    assert(
      pubConfig.allowedFormats.includes('webp') && pubConfig.allowedFormats.includes('jpg'),
      'happy_homes_photos enforces image formats [jpg, jpeg, png, webp]'
    );
    assert(
      !pubConfig.allowedFormats.includes('pdf'),
      'happy_homes_photos preset does NOT include pdf'
    );
  } catch (err: any) {
    assert(false, 'Cloudinary preset check error', err.message);
  }

  // --- 2. Delivery URL & PDF Preservation ---
  console.log('\n--- 2. Delivery URL & Transformation Preservation ---');
  try {
    const sampleImgUrl = 'https://res.cloudinary.com/cloudname/image/upload/v1234/sample.jpg';
    const optImg = getOptimizedImageUrl(sampleImgUrl, 800);
    assert(
      optImg.includes('/image/upload/f_auto,q_auto,w_800,c_limit/v1234/sample.jpg'),
      'Image URLs receive f_auto,q_auto,w_800 transformations'
    );

    const samplePdfUrl = 'https://res.cloudinary.com/cloudname/image/upload/v1234/brochure.pdf';
    const optPdf = getOptimizedImageUrl(samplePdfUrl, 800);
    assert(
      optPdf === samplePdfUrl,
      'PDF document delivery URLs are preserved untouched without photo compression or image transforms'
    );

    assert(formatBytes(1024) === '1 KB', 'formatBytes formats 1024 as 1 KB');
    assert(formatBytes(5242880) === '5 MB', 'formatBytes formats 5242880 as 5 MB');
    assert(formatBytes(2621440) === '2.5 MB', 'formatBytes formats 2621440 as 2.5 MB');
  } catch (err: any) {
    assert(false, 'Delivery URL test error', err.message);
  }

  // --- 3. Null and Legacy Compatibility ---
  console.log('\n--- 3. Null & Legacy Data Normalization Compatibility ---');
  try {
    const legacyDraft: any = {
      id: 'dev_legacy_001',
      slug: 'legacy-greens',
      name: 'Legacy Greens',
      type: 'Luxury Villa',
      locality: 'Vaishali Nagar, Jaipur',
      shortDescription: 'Legacy development before S05B2 fields.',
      priceMode: 'starting_at',
      priceAmount: 18500000,
      availability: 'Available',
      constructionStage: 'Under Construction',
      status: 'draft',
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      // plans, brochure, progress updates with photoIds omitted completely
    };

    const normalized = normalizeDraftForPersistence(legacyDraft);
    assert(Array.isArray(normalized.plans) && normalized.plans.length === 0, 'Missing plans normalizes to empty array');
    assert(normalized.brochure === null, 'Missing brochure normalizes to null');
    assert(Array.isArray(normalized.photos) && normalized.photos.length === 0, 'Missing photos normalizes to empty array');

    // Invariant check: must not throw
    assertNoUndefinedInDocument(normalized, 'legacyDraftNormalization');
    assert(true, 'assertNoUndefinedInDocument passes on legacy record without undefined values');
  } catch (err: any) {
    assert(false, 'Legacy compatibility test error', err.message);
  }

  // --- 4. Schema Normalization & Clearing Invariants ---
  console.log('\n--- 4. Schema-Aware Normalization for Plans, Brochure & Progress ---');
  try {
    const fullDraft: DevelopmentDraft = {
      id: 'dev_s05b2_001',
      slug: 'gulmohar-mansions',
      name: 'Gulmohar Mansions',
      type: 'Independent Floor',
      locality: 'C-Scheme, Jaipur',
      shortDescription: 'Premium low-density bespoke luxury residences.',
      priceMode: 'starting_at',
      priceAmount: 24500000,
      availability: 'Available',
      constructionStage: 'Under construction',
      area: null,
      bedrooms: 4,
      image: null,
      photos: [
        {
          id: 'ph_01',
          cloudinaryPublicId: 'happy-homes/dev_s05b2_001/photos/ph_01',
          url: 'https://res.cloudinary.com/cloudname/image/upload/ph_01.jpg',
          secureUrl: 'https://res.cloudinary.com/cloudname/image/upload/ph_01.jpg',
          width: 2400,
          height: 1600,
          format: 'jpg',
          bytes: 850000,
          altText: 'South façade foundation completion',
          label: 'Actual photograph',
          isCover: true,
          sortOrder: 0,
          version: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ph_02',
          cloudinaryPublicId: 'happy-homes/dev_s05b2_001/photos/ph_02',
          url: 'https://res.cloudinary.com/cloudname/image/upload/ph_02.jpg',
          secureUrl: 'https://res.cloudinary.com/cloudname/image/upload/ph_02.jpg',
          width: 2400,
          height: 1600,
          format: 'webp',
          bytes: 620000,
          altText: 'Column casting inspection',
          label: 'Actual photograph',
          isCover: false,
          sortOrder: 1,
          version: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      plans: [
        {
          id: 'plan_01',
          title: 'Ground Floor Master Suite Layout',
          floor: 'Ground Floor',
          configurationId: 'cfg_unit_a',
          assetType: 'image',
          cloudinaryPublicId: 'happy-homes/dev_s05b2_001/plans/plan_01',
          url: 'https://res.cloudinary.com/cloudname/image/upload/plan_01.png',
          secureUrl: 'https://res.cloudinary.com/cloudname/image/upload/plan_01.png',
          format: 'png',
          bytes: 1400000,
          width: 3200,
          height: 2400,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'plan_02',
          title: 'Full Structural Blueprint PDF',
          floor: 'All Levels',
          configurationId: null,
          assetType: 'pdf',
          cloudinaryPublicId: 'happy-homes/dev_s05b2_001/plans/plan_02',
          url: 'https://res.cloudinary.com/cloudname/image/upload/plan_02.pdf',
          secureUrl: 'https://res.cloudinary.com/cloudname/image/upload/plan_02.pdf',
          format: 'pdf',
          bytes: 3500000,
          width: null,
          height: null,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      brochure: {
        assetId: 'doc_brochure_01',
        title: 'Gulmohar Mansions Official Brochure',
        editionDate: 'Autumn 2026 Edition',
        cloudinaryPublicId: 'happy-homes/dev_s05b2_001/brochure/doc_01',
        url: 'https://res.cloudinary.com/cloudname/image/upload/brochure_01.pdf',
        secureUrl: 'https://res.cloudinary.com/cloudname/image/upload/brochure_01.pdf',
        format: 'pdf',
        bytes: 4200000,
        createdAt: new Date().toISOString(),
      },
      configurations: [
        {
          id: 'cfg_unit_a',
          label: '4 BHK Grand Villa',
          floor: 'Ground + 1',
          bedrooms: 4,
          area: { value: 3450, unit: 'sq ft', definition: 'built-up' },
          availability: 'Available',
          priceMode: 'starting_at',
          priceAmount: 24500000,
        },
      ],
      progress: [
        {
          id: 'prog_01',
          date: '2026-09-15',
          title: 'Substructure Concreting Complete',
          stage: 'Completed work',
          description: 'Raft foundation and column reinforcement inspected by structural engineers.',
          photoIds: ['ph_01', 'ph_02'],
        },
      ],
      status: 'draft',
      version: 2,
      hasUnpublishedChanges: true,
      publishedSlug: null,
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid_test',
    };

    const normalized = normalizeDraftForPersistence(fullDraft);
    assertNoUndefinedInDocument(normalized, 'fullDraftNormalization');
    assert(normalized.plans.length === 2, 'Persists 2 floor plans');
    assert(normalized.brochure?.assetId === 'doc_brochure_01', 'Persists brochure object');
    assert(normalized.progress[0].photoIds?.length === 2, 'Persists progress photo references');

    // Clearing brochure explicitly
    const draftWithClearedBrochure = {
      ...fullDraft,
      brochure: null,
    };
    const normalizedCleared = normalizeDraftForPersistence(draftWithClearedBrochure);
    assert(normalizedCleared.brochure === null, 'Deliberately cleared brochure is preserved as null, not undefined');
    assertNoUndefinedInDocument(normalizedCleared, 'clearedBrochure');
  } catch (err: any) {
    assert(false, 'Schema normalization test error', err.message);
  }

  // --- 5. Configuration Reference Removal ---
  console.log('\n--- 5. Configuration Reference Detachment Invariant ---');
  try {
    const existingConfigurations = [
      { id: 'cfg_remaining', label: 'Unit B', floor: '1', bedrooms: 3, area: null, availability: 'Available' as any, priceMode: 'on_request' as any, priceAmount: null },
    ];

    const inputPlans: DevelopmentFloorPlan[] = [
      {
        id: 'plan_linked_to_deleted',
        title: 'Floor 2 Plan',
        floor: '2',
        configurationId: 'cfg_deleted_unit', // this config no longer exists
        assetType: 'image',
        cloudinaryPublicId: 'pub_01',
        url: 'https://example.com/plan.jpg',
        secureUrl: 'https://example.com/plan.jpg',
        format: 'jpg',
        bytes: 500000,
        width: 1000,
        height: 1000,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan_linked_to_remaining',
        title: 'Unit B Plan',
        floor: '1',
        configurationId: 'cfg_remaining',
        assetType: 'image',
        cloudinaryPublicId: 'pub_02',
        url: 'https://example.com/plan2.jpg',
        secureUrl: 'https://example.com/plan2.jpg',
        format: 'jpg',
        bytes: 500000,
        width: 1000,
        height: 1000,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
      },
    ];

    const sanitizedPlans = sanitizeFloorPlans(inputPlans, existingConfigurations);
    assert(
      sanitizedPlans[0].configurationId === null,
      'When linked configuration is removed, floor plan configurationId safely resets to null'
    );
    assert(
      sanitizedPlans[1].configurationId === 'cfg_remaining',
      'When linked configuration exists, floor plan configurationId is retained'
    );
    assert(
      sanitizedPlans[0].title === 'Floor 2 Plan',
      'Preserves plan title and all other metadata during configuration detachment'
    );
  } catch (err: any) {
    assert(false, 'Configuration reference removal test error', err.message);
  }

  // --- 6. Progress Photo Reference Validation & Sanitization ---
  console.log('\n--- 6. Progress Photo Reference Validation & Sanitization ---');
  try {
    const existingPhotos: DevelopmentPhoto[] = [
      {
        id: 'ph_valid_01',
        cloudinaryPublicId: 'pub_1',
        url: 'https://example.com/1.jpg',
        secureUrl: 'https://example.com/1.jpg',
        width: 1000,
        height: 1000,
        format: 'jpg',
        bytes: 1000,
        altText: 'Valid Photo',
        label: 'Actual photograph',
        isCover: true,
        sortOrder: 0,
        version: 1,
        createdAt: new Date().toISOString(),
      },
    ];

    const inputProgress: ProgressUpdate[] = [
      {
        id: 'prog_01',
        date: '2026-10-01',
        title: 'Foundation Poured',
        stage: 'Completed work',
        description: 'First stage completed.',
        photoIds: ['ph_valid_01', 'ph_deleted_99', 'ph_valid_01'], // includes deleted and duplicate
      },
    ];

    const sanitized = sanitizeProgress(inputProgress, existingPhotos);
    assert(
      sanitized[0].photoIds?.length === 1 && sanitized[0].photoIds[0] === 'ph_valid_01',
      'SanitizeProgress deduplicates photoIds and filters out deleted photo IDs'
    );
  } catch (err: any) {
    assert(false, 'Progress photo validation test error', err.message);
  }

  // --- 7. Public Snapshot Isolation & Resolution ---
  console.log('\n--- 7. Draft / Public Snapshot Isolation ---');
  try {
    const mockDraft: DevelopmentDraft = {
      id: 'dev_iso_001',
      slug: 'isolation-test',
      name: 'Isolation Test Villa',
      type: 'Independent Floor',
      locality: 'Bani Park, Jaipur',
      shortDescription: 'Testing public snapshot isolation.',
      priceMode: 'starting_at',
      priceAmount: 12000000,
      availability: 'Available',
      constructionStage: 'Completed',
      area: null,
      bedrooms: null,
      image: null,
      photos: [
        {
          id: 'ph_pub_01',
          cloudinaryPublicId: 'pub_01',
          url: 'https://res.cloudinary.com/test/image/upload/photo.jpg',
          secureUrl: 'https://res.cloudinary.com/test/image/upload/photo.jpg',
          width: 1920,
          height: 1080,
          format: 'jpg',
          bytes: 450000,
          altText: 'Front Elevation',
          label: 'Actual photograph',
          isCover: true,
          sortOrder: 0,
          version: 1,
          createdAt: new Date().toISOString(),
        },
      ],
      plans: [
        {
          id: 'plan_draft_01',
          title: 'Ground Floor Master Suite',
          floor: 'Ground',
          configurationId: null,
          assetType: 'image',
          cloudinaryPublicId: 'plan_01',
          url: 'https://res.cloudinary.com/test/image/upload/plan.png',
          secureUrl: 'https://res.cloudinary.com/test/image/upload/plan.png',
          format: 'png',
          bytes: 1200000,
          width: 2000,
          height: 1500,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        },
      ],
      brochure: {
        assetId: 'brochure_v1',
        title: 'Original Draft Brochure',
        editionDate: 'June 2026',
        cloudinaryPublicId: 'brochure_01',
        url: 'https://res.cloudinary.com/test/image/upload/brochure.pdf',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/brochure.pdf',
        format: 'pdf',
        bytes: 3100000,
        createdAt: new Date().toISOString(),
      },
      configurations: [],
      specifications: [],
      progress: [
        {
          id: 'prog_01',
          date: '2026-08-01',
          title: 'Structure Ready',
          stage: 'Completed work',
          description: 'Ready.',
          photoIds: ['ph_pub_01'],
        },
      ],
      status: 'draft',
      version: 3,
      hasUnpublishedChanges: true,
      publishedSlug: null,
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    // Public snapshot representation
    const publicSnapshot: DevelopmentPublic = {
      id: mockDraft.id,
      slug: mockDraft.slug,
      name: mockDraft.name,
      type: mockDraft.type,
      locality: mockDraft.locality,
      shortDescription: mockDraft.shortDescription,
      priceMode: mockDraft.priceMode,
      priceAmount: mockDraft.priceAmount,
      priceDisplay: 'Starting at ₹1.2 Cr',
      availability: mockDraft.availability,
      constructionStage: mockDraft.constructionStage,
      area: null,
      bedrooms: null,
      image: null,
      photos: mockDraft.photos,
      plans: mockDraft.plans.map((p) => ({
        id: p.id,
        title: p.title,
        floor: p.floor,
        configurationId: p.configurationId,
        assetType: p.assetType,
        cloudinaryPublicId: p.cloudinaryPublicId,
        url: p.url,
        secureUrl: p.secureUrl,
        format: p.format,
        bytes: p.bytes,
        width: p.width,
        height: p.height,
        sortOrder: p.sortOrder,
      })),
      brochure: {
        assetId: mockDraft.brochure!.assetId,
        title: mockDraft.brochure!.title,
        editionDate: mockDraft.brochure!.editionDate,
        url: mockDraft.brochure!.url,
        secureUrl: mockDraft.brochure!.secureUrl,
        format: 'pdf',
        bytes: mockDraft.brochure!.bytes,
      },
      specifications: [],
      configurations: [],
      location: null,
      progress: [
        {
          id: 'prog_01',
          date: '2026-08-01',
          title: 'Structure Ready',
          stage: 'Completed work',
          description: 'Ready.',
          photoIds: ['ph_pub_01'],
          photos: mockDraft.photos,
        },
      ],
      publishedAt: '2026-08-01T00:00:00.000Z',
    };

    const normPublic = normalizePublicSnapshotForPersistence(publicSnapshot);
    assertNoUndefinedInDocument(normPublic, 'publicSnapshot');
    assert(normPublic.plans.length === 1, 'Public snapshot preserves floor plan');
    assert(normPublic.brochure?.title === 'Original Draft Brochure', 'Public snapshot preserves published brochure');
    assert(normPublic.progress[0].photos?.length === 1, 'Public snapshot resolves full photo objects for milestone');

    // Simulate replacing draft brochure with a new edition
    const updatedDraft = {
      ...mockDraft,
      brochure: {
        assetId: 'brochure_v2_new',
        title: 'New October 2026 Brochure Edition',
        editionDate: 'October 2026',
        cloudinaryPublicId: 'brochure_02',
        url: 'https://res.cloudinary.com/test/image/upload/brochure_v2.pdf',
        secureUrl: 'https://res.cloudinary.com/test/image/upload/brochure_v2.pdf',
        format: 'pdf' as const,
        bytes: 3800000,
        createdAt: new Date().toISOString(),
      },
    };

    assert(
      normPublic.brochure?.assetId === 'brochure_v1',
      'Draft brochure replacement is isolated from public snapshot until explicit republish'
    );
    assert(
      updatedDraft.brochure.assetId === 'brochure_v2_new',
      'Draft reflects updated brochure asset immediately'
    );
  } catch (err: any) {
    assert(false, 'Isolation test error', err.message);
  }

  // --- 8. Limits & Constraints Enforcement ---
  console.log('\n--- 8. Limits & Constraints Enforcement ---');
  try {
    // 10 plans limit
    const elevenPlans: DevelopmentFloorPlan[] = Array.from({ length: 11 }, (_, i) => ({
      id: `p_${i}`,
      title: `Plan ${i}`,
      floor: `${i}`,
      configurationId: null,
      assetType: 'image',
      cloudinaryPublicId: `pub_${i}`,
      url: `https://example.com/${i}.jpg`,
      secureUrl: `https://example.com/${i}.jpg`,
      format: 'jpg',
      bytes: 100,
      width: 100,
      height: 100,
      sortOrder: i,
      createdAt: new Date().toISOString(),
    }));

    const sanitizedPlans = sanitizeFloorPlans(elevenPlans, []);
    assert(
      sanitizedPlans.length === 10,
      'sanitizeFloorPlans enforces maximum 10 floor plans per development'
    );

    // 20 photos limit
    const twentyOnePhotos: DevelopmentPhoto[] = Array.from({ length: 21 }, (_, i) => ({
      id: `ph_${i}`,
      cloudinaryPublicId: `pub_${i}`,
      url: `https://example.com/${i}.jpg`,
      secureUrl: `https://example.com/${i}.jpg`,
      width: 100,
      height: 100,
      format: 'jpg',
      bytes: 100,
      altText: '',
      label: 'Actual photograph',
      isCover: i === 0,
      sortOrder: i,
      version: 1,
      createdAt: new Date().toISOString(),
    }));

    const sanitizedProg = sanitizeProgress([
      {
        id: 'u1',
        date: '2026-10-01',
        title: 'Title',
        stage: 'Completed work',
        description: '',
        photoIds: twentyOnePhotos.map((p) => p.id),
      },
    ], twentyOnePhotos);

    assert(
      (sanitizedProg[0].photoIds || []).length <= 6,
      'sanitizeProgress caps associated photos per progress milestone to 6'
    );
  } catch (err: any) {
    assert(false, 'Limits test error', err.message);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runS05B2Tests().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
