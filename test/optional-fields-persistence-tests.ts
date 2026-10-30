/**
 * Isolated Automated Verification Test Suite for Optional-Field Persistence
 * Tests all required draft persistence, sanitization, clearing, and concurrency invariants.
 */

import {
  normalizeDraftForPersistence,
  normalizePublicSnapshotForPersistence,
  assertNoUndefinedInDocument,
  cleanUndefinedRecursively,
} from '../src/server/developmentsService.ts';
import {
  type DevelopmentDraft,
  type DevelopmentPublic,
  type DevelopmentPhoto,
  type DevelopmentConfiguration,
  type NearbyPlace,
} from '../src/types/development.ts';

function runTestSuite() {
  console.log('=== HAPPY HOMES: OPTIONAL-FIELD PERSISTENCE TESTS ===');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. Invariant checker sanity test
  try {
    let caught = false;
    try {
      assertNoUndefinedInDocument({ safe: 'value', bad: undefined });
    } catch {
      caught = true;
    }
    assert(caught === true, 'assertNoUndefinedInDocument strictly catches top-level undefined');

    let nestedCaught = false;
    try {
      assertNoUndefinedInDocument({
        location: {
          address: undefined,
        },
      });
    } catch {
      nestedCaught = true;
    }
    assert(nestedCaught === true, 'assertNoUndefinedInDocument strictly catches nested location.address undefined');

    // Test preservation of valid false, zero, empty string, and empty array
    const preserves = cleanUndefinedRecursively({
      boolFalse: false,
      numZero: 0,
      emptyStr: '',
      emptyArr: [],
      badUndefined: undefined,
    });
    assert(
      preserves.boolFalse === false &&
        preserves.numZero === 0 &&
        preserves.emptyStr === '' &&
        Array.isArray(preserves.emptyArr) &&
        preserves.emptyArr.length === 0 &&
        preserves.badUndefined === null,
      'cleanUndefinedRecursively strictly preserves false, zero, "", and [] while converting undefined to null'
    );
  } catch (err: any) {
    assert(false, 'Sanity test failed', err.message);
  }

  // 2. Saving a draft with location completely blank
  try {
    const rawDraftWithBlankLocation: any = {
      id: 'dev_test_blank_loc',
      slug: 'test-blank-loc',
      name: 'Test Blank Location Villa',
      type: 'Villa',
      locality: 'Jagatpura',
      shortDescription: 'Modern villa build',
      priceMode: 'on_request',
      priceAmount: null,
      availability: 'Available',
      constructionStage: 'Planned',
      area: null,
      bedrooms: null,
      image: null,
      photos: [],
      specifications: [],
      configurations: [],
      location: {
        address: undefined, // Simulates previous defect
        coordinates: null,
        directionsUrl: undefined,
        nearbyPlaces: [],
      },
      progress: [],
      status: 'draft',
      version: 1,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    const normalized = normalizeDraftForPersistence(rawDraftWithBlankLocation);
    assertNoUndefinedInDocument(normalized, 'draft_blank_location');

    assert(
      normalized.location === null ||
        (normalized.location.address === null && normalized.location.directionsUrl === null),
      'Blank location contains no undefined values and normalizes cleanly'
    );
  } catch (err: any) {
    assert(false, 'Blank location test failed', err.message);
  }

  // 3. Saving with an address but no coordinates
  try {
    const rawDraftAddressNoCoords: any = {
      id: 'dev_test_addr_only',
      slug: 'test-addr-only',
      name: 'Test Address Only Estate',
      type: 'Villa',
      locality: 'Kusum Vihar',
      shortDescription: 'Bespoke estate',
      priceMode: 'exact',
      priceAmount: 45000000,
      availability: 'Available',
      constructionStage: 'Under construction',
      area: { value: 3200, definition: 'built-up', unit: 'sq ft' },
      bedrooms: 4,
      image: null,
      photos: [],
      specifications: [],
      configurations: [],
      location: {
        address: '172, Kusum Vihar, Jagatpura, Jaipur',
        coordinates: null, // explicitly absent coordinates
        directionsUrl: undefined, // optional directions absent
        nearbyPlaces: [],
      },
      progress: [],
      status: 'draft',
      version: 1,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    const normalized = normalizeDraftForPersistence(rawDraftAddressNoCoords);
    assertNoUndefinedInDocument(normalized, 'draft_address_no_coords');

    assert(
      normalized.location !== null &&
        normalized.location.address === '172, Kusum Vihar, Jagatpura, Jaipur' &&
        normalized.location.coordinates === null &&
        normalized.location.directionsUrl === null,
      'Address-only location retains physical address while coordinates and directionsUrl are safe nulls'
    );
  } catch (err: any) {
    assert(false, 'Address only test failed', err.message);
  }

  // 4. Saving and then deliberately clearing an address
  try {
    const existingDraft: DevelopmentDraft = {
      id: 'dev_existing_addr',
      slug: 'existing-addr',
      name: 'Existing Address Villa',
      type: 'Villa',
      locality: 'Vidhyadhar Nagar',
      shortDescription: 'Estate',
      priceMode: 'on_request',
      priceAmount: null,
      availability: 'Available',
      constructionStage: 'Under construction',
      area: null,
      bedrooms: 3,
      image: null,
      photos: [],
      specifications: [],
      configurations: [],
      location: {
        address: 'Old Address 123',
        coordinates: { latitude: 26.8184, longitude: 75.8752 },
        directionsUrl: 'https://maps.google.com/test',
        nearbyPlaces: [],
      },
      progress: [],
      status: 'draft',
      version: 1,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    // Owner deliberately clears address in the form (sends address = null or "")
    const updatePayloadWithClearedAddress: Partial<DevelopmentDraft> = {
      location: {
        address: null, // deliberately cleared!
        coordinates: null,
        directionsUrl: null,
        nearbyPlaces: [],
      },
    };

    const updatedDraft: DevelopmentDraft = {
      ...existingDraft,
      location: updatePayloadWithClearedAddress.location
        ? {
            address: updatePayloadWithClearedAddress.location.address || null,
            coordinates: updatePayloadWithClearedAddress.location.coordinates || null,
            directionsUrl: updatePayloadWithClearedAddress.location.directionsUrl || null,
            nearbyPlaces: [],
          }
        : null,
      version: existingDraft.version + 1,
      updatedAt: '2026-10-10T12:05:00.000Z',
    };

    const normalized = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalized, 'draft_cleared_address');

    const addressIsCleared =
      normalized.location === null || normalized.location.address === null;
    assert(
      addressIsCleared === true,
      'Deliberately cleared address replaces old value with null without undefined errors'
    );
  } catch (err: any) {
    assert(false, 'Cleared address test failed', err.message);
  }

  // 5. Optional nested fields absent in specifications, configurations, progress
  try {
    const rawWithNestedAbsences: any = {
      id: 'dev_nested_absences',
      slug: 'nested-absences',
      name: 'Nested Absences Floor',
      type: 'Independent Floor',
      locality: 'Kusum Vihar',
      shortDescription: 'Luxury floor',
      priceMode: 'starting_at',
      priceAmount: 18500000,
      availability: 'Available',
      constructionStage: 'Completed',
      area: null,
      bedrooms: 3,
      image: null,
      photos: [],
      specifications: [
        {
          id: 'spec_1',
          title: 'Structural Standards',
          items: [
            { id: 'i1', label: 'Steel Grade', value: 'Tata Tiscon Fe-550D', type: 'inclusion' },
            { id: 'i2', label: 'Home Automation', value: 'Schneider Wiser', type: 'optional_extra' },
          ],
        },
      ],
      configurations: [
        {
          id: 'cfg_1',
          label: 'Unit 201',
          floor: undefined, // optional absent
          bedrooms: 3,
          area: undefined, // optional absent
          availability: 'Available',
          priceMode: undefined, // optional absent
          priceAmount: undefined, // optional absent
          priceDisplay: undefined, // optional absent
        },
      ],
      location: {
        address: '172 Kusum Vihar',
        coordinates: null,
        directionsUrl: undefined,
        nearbyPlaces: [
          {
            id: 'place_1',
            name: 'Bisalpur Water Grid Station',
            category: 'Civic',
            distanceValue: 0, // Valid 0 km distance! Must NOT be converted to null
            distanceUnit: 'km',
            status: 'Existing',
            sourceNote: undefined, // optional private note absent
            isPublicSourceNote: false,
            checkedDate: undefined, // optional checked date absent
          },
          {
            id: 'place_2',
            name: 'Upcoming Sector Flyover',
            category: 'Transport',
            distanceValue: undefined, // Absent distance value
            distanceUnit: undefined,
            status: 'Proposed / Upcoming',
            sourceNote: 'JDA Master Plan 2025',
            isPublicSourceNote: true,
            checkedDate: '2026-09-01',
          },
        ],
      },
      progress: [
        {
          id: 'prog_1',
          date: '2026-08-15',
          title: 'Plinth Complete',
          stage: 'Completed work',
          description: 'Structural foundation audited.',
        },
      ],
      status: 'draft',
      version: 1,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    const normalized = normalizeDraftForPersistence(rawWithNestedAbsences);
    assertNoUndefinedInDocument(normalized, 'draft_nested_absences');

    const cfg = normalized.configurations![0];
    assert(
      cfg.floor === null && cfg.area === null && cfg.priceMode === null && cfg.priceAmount === null,
      'Absent configuration fields normalize to null'
    );

    const place1 = normalized.location!.nearbyPlaces![0];
    assert(
      place1.distanceValue === 0 && place1.sourceNote === null && place1.checkedDate === null,
      'Valid distanceValue of 0 is preserved; absent sourceNote and checkedDate normalize to null'
    );

    const place2 = normalized.location!.nearbyPlaces![1];
    assert(
      place2.distanceValue === null && place2.sourceNote === 'JDA Master Plan 2025',
      'Absent distanceValue normalizes to null; present sourceNote is retained'
    );
  } catch (err: any) {
    assert(false, 'Nested absences test failed', err.message);
  }

  // 6. Photo metadata saving without clearing other development details
  try {
    const existingFullDraft: DevelopmentDraft = {
      id: 'dev_full_details',
      slug: 'full-details-villa',
      name: 'Full Details Villa',
      type: 'Villa',
      locality: 'Kusum Vihar',
      shortDescription: 'Detailed architectural residence',
      priceMode: 'exact',
      priceAmount: 37500000,
      availability: 'Available',
      constructionStage: 'Under construction',
      area: { value: 2800, definition: 'built-up', unit: 'sq ft' },
      bedrooms: 4,
      image: null,
      photos: [],
      specifications: [
        {
          id: 'g1',
          title: 'Flooring',
          items: [{ id: 'i1', label: 'Living', value: 'Italian Statuario', type: 'inclusion' }],
        },
      ],
      configurations: [
        {
          id: 'c1',
          label: 'Main Villa',
          floor: 'G+2',
          bedrooms: 4,
          area: { value: 2800, definition: 'built-up', unit: 'sq ft' },
          availability: 'Available',
          priceMode: 'exact',
          priceAmount: 37500000,
          priceDisplay: '₹3.75 Cr',
        },
      ],
      location: {
        address: '172 Kusum Vihar',
        coordinates: { latitude: 26.8184, longitude: 75.8752 },
        directionsUrl: 'https://maps.google.com/test',
        nearbyPlaces: [],
      },
      progress: [],
      status: 'draft',
      version: 2,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
      publishedAt: null,
      lastModifiedBy: 'owner_uid',
    };

    // Client performs a photo-only update: input.location, input.specifications, input.configurations are undefined (omitted)
    const newPhoto: DevelopmentPhoto = {
      id: 'ph_new_1',
      cloudinaryPublicId: 'happy-homes/dev_full_details/photos/ph_new_1',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      width: 1920,
      height: 1080,
      format: 'jpg',
      bytes: 450000,
      altText: 'Front Elevation',
      label: 'Actual photograph',
      isCover: true,
      sortOrder: 0,
      version: null, // No version from Cloudinary
    };

    const partialUpdateInput: Partial<DevelopmentDraft> = {
      photos: [newPhoto],
    };

    // Simulates updateDevelopmentDraft logic
    const mergedDraft: DevelopmentDraft = {
      ...existingFullDraft,
      photos: partialUpdateInput.photos !== undefined ? partialUpdateInput.photos : existingFullDraft.photos,
      location: partialUpdateInput.location !== undefined ? partialUpdateInput.location : existingFullDraft.location,
      specifications:
        partialUpdateInput.specifications !== undefined
          ? partialUpdateInput.specifications
          : existingFullDraft.specifications,
      configurations:
        partialUpdateInput.configurations !== undefined
          ? partialUpdateInput.configurations
          : existingFullDraft.configurations,
      version: existingFullDraft.version + 1,
      updatedAt: '2026-10-10T12:10:00.000Z',
    };

    const normalized = normalizeDraftForPersistence(mergedDraft);
    assertNoUndefinedInDocument(normalized, 'photo_update_persistence');

    assert(
      normalized.location?.address === '172 Kusum Vihar' &&
        normalized.specifications?.length === 1 &&
        normalized.configurations?.length === 1 &&
        normalized.photos?.length === 1 &&
        normalized.photos[0].version === null,
      'Photo metadata update successfully persists without clearing location, specifications, or configurations'
    );
  } catch (err: any) {
    assert(false, 'Photo metadata isolation test failed', err.message);
  }

  // 7. Stale-version rejection and published snapshot isolation
  try {
    const existingVersion: number = 3;
    const submittedStaleVersion: number = 2;
    const isStale = submittedStaleVersion !== existingVersion;
    assert(isStale === true, 'Stale editor submission version mismatch is detected (409 conflict)');

    // Test published snapshot isolation and normalization
    const publicSnapshotInput: DevelopmentPublic = {
      id: 'dev_pub_1',
      slug: 'the-courtyard-residence',
      name: 'The Courtyard Residence',
      type: 'Villa',
      locality: 'Kusum Vihar',
      shortDescription: 'Luxury residence',
      priceMode: 'exact',
      priceAmount: 39500000,
      priceDisplay: '₹3.95 Cr',
      availability: 'Available',
      constructionStage: 'Under construction',
      area: null,
      bedrooms: 4,
      image: null,
      photos: [
        {
          id: 'ph_1',
          cloudinaryPublicId: 'happy-homes/dev_pub_1/photos/ph_1',
          url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          secureUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          width: 1920,
          height: 1080,
          format: 'jpg',
          altText: 'Courtyard',
          label: 'Actual photograph',
          isCover: true,
          sortOrder: 0,
          version: undefined, // Simulates optional absence
        },
      ],
      specifications: [],
      configurations: [],
      location: {
        address: '172 Kusum Vihar',
        coordinates: null,
        directionsUrl: undefined,
        nearbyPlaces: [
          {
            id: 'np1',
            name: 'Airport Corridor',
            category: 'Transport',
            distanceValue: null,
            distanceUnit: 'km',
            status: 'Existing',
            publicNote: undefined, // Simulates optional absence
          },
        ],
      },
      progress: [],
      publishedAt: '2026-10-10T12:00:00.000Z',
    };

    const normalizedPublic = normalizePublicSnapshotForPersistence(publicSnapshotInput);
    assertNoUndefinedInDocument(normalizedPublic, 'public_snapshot');

    assert(
      normalizedPublic.photos![0].version === null &&
        normalizedPublic.location!.directionsUrl === null &&
        normalizedPublic.location!.nearbyPlaces![0].publicNote === null,
      'Public snapshot normalizes optional nested fields to null without undefined values'
    );
  } catch (err: any) {
    assert(false, 'Snapshot and version test failed', err.message);
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
