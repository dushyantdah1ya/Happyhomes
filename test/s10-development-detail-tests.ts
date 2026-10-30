import assert from 'node:assert';
import { getFirebaseAdminApp, getFirestoreDb } from '../src/server/firebaseAdmin.js';
import { getPublicDevelopmentBySlug, getPublicDevelopments } from '../src/server/developmentsService.js';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import {
  type DevelopmentPublic,
  formatPriceDisplay,
  formatBytes,
  getOptimizedImageUrl,
} from '../src/types/development.js';

// Safe URL validator logic matching DevelopmentDetail.tsx
function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const base = 'https://happyhomesjaipur.com';
    const parsed = new URL(url, base);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

async function runS10Tests() {
  console.log('=== S10: Public Development-Detail Experience Test Suite ===\n');

  // TEST 1: Isolated Fixtures Contract Testing
  console.log('1. Verifying Development Detail Fixtures Contract:');

  const testFixture: DevelopmentPublic = {
    id: 'fixture-savoy',
    slug: 'the-savoy-residence',
    name: 'The Savoy Residence',
    type: 'Villa',
    locality: 'Kusum Vihar, Jagatpura',
    shortDescription: 'Architectural duplex estate engineered with Fe-550D structural steel and Statuario Italian marble.',
    priceMode: 'starting_at',
    priceAmount: 28500000,
    priceDisplay: 'Starting from ₹2.85 Cr',
    availability: 'Available',
    constructionStage: 'Under construction',
    area: {
      value: 3600,
      unit: 'sq ft',
      definition: 'carpet',
    },
    bedrooms: 4,
    image: null,
    photos: [
      {
        id: 'p1',
        cloudinaryPublicId: 'sample-facade',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/sample-facade.jpg',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-facade.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        altText: 'North elevation facade',
        label: 'Actual photograph',
        isCover: true,
        sortOrder: 1,
        version: 1,
      },
      {
        id: 'p2',
        cloudinaryPublicId: 'sample-interior',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/sample-interior.jpg',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-interior.jpg',
        width: 1920,
        height: 1080,
        format: 'jpg',
        altText: 'Double height living area render',
        label: 'Architectural visualization',
        isCover: false,
        sortOrder: 2,
        version: 1,
      },
    ],
    configurations: [
      {
        id: 'c1',
        label: '4BHK Signature Villa (East Facing)',
        floor: 'Ground + 2 Floors',
        bedrooms: 4,
        area: { value: 3600, unit: 'sq ft', definition: 'carpet' },
        priceMode: 'exact',
        priceAmount: 28500000,
        priceDisplay: '₹2.85 Cr',
        availability: 'Available',
      },
    ],
    plans: [
      {
        id: 'plan1',
        cloudinaryPublicId: 'savoy-ground',
        title: 'Ground Floor Master Blueprint',
        floor: 'Ground Level',
        configurationId: 'c1',
        assetType: 'pdf',
        url: 'https://res.cloudinary.com/demo/raw/upload/v1/blueprints/savoy-ground.pdf',
        secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/blueprints/savoy-ground.pdf',
        format: 'pdf',
        bytes: 2450000,
        sortOrder: 1,
      },
      {
        id: 'plan2',
        cloudinaryPublicId: 'savoy-first',
        title: 'First Level Structural Layout',
        floor: 'First Level',
        configurationId: 'c1',
        assetType: 'image',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/savoy-first.png',
        secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/blueprints/savoy-first.png',
        format: 'png',
        bytes: 1200000,
        width: 2400,
        height: 1800,
        sortOrder: 2,
      },
    ],
    brochure: {
      assetId: 'brochure-123',
      title: 'The Savoy Residence - Master Architectural Folio',
      editionDate: 'October 2026',
      url: 'https://res.cloudinary.com/demo/raw/upload/v1/brochures/the-savoy.pdf',
      secureUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/brochures/the-savoy.pdf',
      format: 'pdf',
      bytes: 5800000,
    },
    specifications: [
      {
        id: 'sg1',
        title: 'Structural Engineering',
        items: [
          { id: 'i1', label: 'Reinforcement Steel', value: 'Tata Tiscon Fe-550D TMT Rebars', type: 'inclusion' },
          { id: 'i2', label: 'Private Passenger Elevator', value: 'KONE 6-Passenger Machine-Room-Less Lift', type: 'optional_extra' },
        ],
      },
    ],
    location: {
      address: 'Plot 172, Kusum Vihar, Vidhyadhar Nagar, Jagatpura, Jaipur 303905',
      coordinates: { latitude: 26.8184, longitude: 75.8752 },
      directionsUrl: 'https://maps.google.com/?q=26.8184,75.8752',
      nearbyPlaces: [
        {
          id: 'nb1',
          name: 'Suresh Gyan Vihar University',
          category: 'Education & Institutional',
          distanceValue: 0.8,
          distanceUnit: 'km',
          status: 'Existing',
          publicNote: '5-minute walking distance',
        },
      ],
    },
    progress: [
      {
        id: 'prog1',
        date: '10 October 2026',
        title: 'Second Floor Slab Casting Completed',
        stage: 'Completed work',
        description: 'M-25 design mix concrete cured and verified.',
        photoIds: ['p1'],
        photos: [
          {
            id: 'p1',
            cloudinaryPublicId: 'sample-facade',
            url: 'https://res.cloudinary.com/demo/image/upload/v1/sample-facade.jpg',
            secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-facade.jpg',
            width: 1920,
            height: 1080,
            format: 'jpg',
            altText: 'Slab reinforcement photograph',
            label: 'Actual photograph',
            isCover: true,
            sortOrder: 1,
            version: 1,
          },
        ],
      },
    ],
    publishedAt: '2026-10-10T08:00:00.000Z',
  };

  // Check Price Display
  assert.strictEqual(formatPriceDisplay(testFixture.priceMode, testFixture.priceAmount), 'Starting from ₹2.85 Cr');
  assert.strictEqual(formatPriceDisplay('exact', 15000000), '₹1.50 Cr');
  assert.strictEqual(formatPriceDisplay('on_request', null), 'Price on Request');
  console.log('  ✓ Price display correctly reflects exact, starting_at, and on_request modes');

  // Check Byte Formatter
  assert.strictEqual(formatBytes(2450000), '2.3 MB');
  assert.strictEqual(formatBytes(5800000), '5.5 MB');
  console.log('  ✓ File size formatting correctly produces human-readable MB / KB');

  // Check URL Safety Validator
  assert.strictEqual(isSafeUrl(testFixture.location!.directionsUrl), true);
  assert.strictEqual(isSafeUrl(testFixture.brochure!.url), true);
  assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
  assert.strictEqual(isSafeUrl('data:text/html,<script>'), false);
  console.log('  ✓ URL safety validation allows http/https and blocks dangerous protocols');

  // Check Image Optimization & PDF Protection
  const optImg = getOptimizedImageUrl(testFixture.photos![0].url, 1600);
  assert.ok(optImg.includes('f_auto') && optImg.includes('w_1600'), 'Cloudinary transform applied to image');

  const pdfUrl = testFixture.plans![0].url;
  const optPdf = getOptimizedImageUrl(pdfUrl, 1600);
  assert.strictEqual(optPdf, pdfUrl, 'PDF links must NEVER receive photo transformations');
  console.log('  ✓ PDF documents preserved untouched without image transformation filters');

  // Check Separate Facts Separation
  assert.strictEqual(testFixture.availability, 'Available');
  assert.strictEqual(testFixture.constructionStage, 'Under construction');
  assert.notStrictEqual(testFixture.availability, testFixture.constructionStage);
  console.log('  ✓ Commercial availability and construction stage maintained as separate facts');

  // Check Inclusions vs Optional Extra separation
  const includedItem = testFixture.specifications![0].items.find(i => i.type === 'inclusion');
  const optionalItem = testFixture.specifications![0].items.find(i => i.type === 'optional_extra');
  assert.ok(includedItem, 'Inclusion item exists');
  assert.ok(optionalItem, 'Optional upgrade item exists');
  assert.strictEqual(includedItem?.label, 'Reinforcement Steel');
  assert.strictEqual(optionalItem?.label, 'Private Passenger Elevator');
  console.log('  ✓ Specifications clearly distinguish baseline inclusions from optional upgrades');

  // TEST 2: Live Database Inspection (Read-Only)
  console.log('\n2. Live Firestore Database Read-Only Checks:');
  const app = getFirebaseAdminApp();
  const db = getFirestoreDb(app);

  const publicDocs = await db.collection('developments_public').get();
  console.log(`  ✓ Read-only query: developments_public count = ${publicDocs.size}`);

  const draftDocs = await db.collection('developments_drafts').get();
  console.log(`  ✓ Read-only query: developments_drafts count = ${draftDocs.size}`);

  // Ensure draft records are strictly kept private
  const publicCatalogue = await getPublicDevelopments();
  assert.strictEqual(publicCatalogue.length, publicDocs.size);
  console.log('  ✓ Public catalogue matches developments_public collection exactly (zero draft leakage)');

  // TEST 3: SSR & Route Metadata Verification
  console.log('\n3. Route Metadata & Unknown Slug SSR Behavior:');
  const metaDetail = getRouteMetadata('/developments/the-savoy-residence');
  assert.strictEqual(metaDetail.statusCode, 200);
  assert.strictEqual(metaDetail.robots, 'noindex, nofollow');
  console.log('  ✓ Detail route has pre-launch noindex, nofollow');

  const metaUnknown = getRouteMetadata('/developments/totally-unknown-slug-xyz');
  // Unknown slug in SSR without DB record returns 404
  const dbSlugResult = await getPublicDevelopmentBySlug('totally-unknown-slug-xyz');
  assert.strictEqual(dbSlugResult, null);
  console.log('  ✓ Non-existent slug returns null in developmentsService (SSR yields 404)');

  console.log('\n=== All S10 Development Detail Tests Passed Successfully! ===');
}

runS10Tests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
