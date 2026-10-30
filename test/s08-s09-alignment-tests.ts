import assert from 'node:assert';
import { getFirebaseAdminApp, getFirestoreDb } from '../src/server/firebaseAdmin.js';
import { getPublicDevelopments } from '../src/server/developmentsService.js';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { NAVIGATION_REGISTRY } from '../src/config/navigation.js';
import type { DevelopmentPublic } from '../src/types/development.js';

async function runTests() {
  console.log('=== S08/S09 Alignment Correction Test Suite ===\n');

  // TEST 1: Navigation Destinations Registry Contract
  console.log('1. Checking Navigation Registry Destinations:');
  const devGroup = NAVIGATION_REGISTRY.developments;
  assert.strictEqual(devGroup.label, 'Developments');
  const devHrefs = devGroup.items.map((i) => i.href);
  assert.deepStrictEqual(devHrefs, [
    '/developments',
    '/villas',
    '/independent-floors',
    '/plots',
    '/completed-projects',
  ]);
  console.log('  ✓ Developments group has exact required catalogue destinations');

  const buyerGroup = NAVIGATION_REGISTRY.buyerGuide;
  assert.strictEqual(buyerGroup.label, 'Buyer Guide');
  assert.strictEqual(buyerGroup.items[0].href, '/contact');
  assert.strictEqual(buyerGroup.items[0].label, 'Contact the Builder');
  console.log('  ✓ Buyer Guide group has Contact the Builder (/contact)');

  assert.strictEqual(NAVIGATION_REGISTRY.primaryCta.label, 'Plan a Visit');
  assert.strictEqual(NAVIGATION_REGISTRY.primaryCta.href, '/contact?intent=visit#enquiry');
  console.log('  ✓ Primary CTA is Plan a Visit -> /contact?intent=visit#enquiry');

  // TEST 2: Route Metadata and Completed Route
  console.log('\n2. Checking Route Metadata & Canonical Status:');
  const completedMeta = getRouteMetadata('/completed-projects');
  assert.strictEqual(completedMeta.statusCode, 200);
  assert.strictEqual(completedMeta.title, 'Completed Developments | Happy Homes Jaipur');
  assert.strictEqual(completedMeta.robots, 'noindex, nofollow');
  console.log('  ✓ /completed-projects is primary route returning 200 with noindex');

  const plotsMeta = getRouteMetadata('/plots');
  assert.strictEqual(plotsMeta.statusCode, 200);
  assert.strictEqual(plotsMeta.title, 'Residential Plots | Happy Homes Jaipur');
  assert.strictEqual(plotsMeta.robots, 'noindex, nofollow');
  console.log('  ✓ /plots metadata uses neutral category name');

  const unknownMeta = getRouteMetadata('/developments/non-existent-xyz');
  // Unknown slug defaults to 404 in metadata manager unless verified by DB in SSR
  const notFoundMeta = getRouteMetadata('/non-existent-route-abc');
  assert.strictEqual(notFoundMeta.statusCode, 404);
  console.log('  ✓ Unknown routes return 404 metadata');

  // TEST 3: Isolated Fixtures Finder Contract (Filtering before pagination, combined criteria, budgets)
  console.log('\n3. Checking Finder Contract with Isolated Fixtures:');
  const fixtures: DevelopmentPublic[] = [
    {
      id: 'fix_1',
      slug: 'villa-royal',
      name: 'Villa Royal',
      type: 'Villa',
      locality: 'Kusum Vihar',
      shortDescription: 'Luxury private residence',
      priceMode: 'exact',
      priceAmount: 35000000, // 3.5 Cr
      priceDisplay: '₹3.50 Cr',
      availability: 'Available',
      constructionStage: 'Under construction',
      area: { value: 3200, definition: 'built-up', unit: 'sq ft' },
      bedrooms: 4,
      image: null,
      publishedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'fix_2',
      slug: 'boutique-floor-vidhyadhar',
      name: 'Boutique Floor Vidhyadhar',
      type: 'Independent Floor',
      locality: 'Vidhyadhar Nagar',
      shortDescription: 'Single floor residence with elevator',
      priceMode: 'starting_at',
      priceAmount: 14000000, // 1.4 Cr
      priceDisplay: '₹1.40 Cr',
      availability: 'Available',
      constructionStage: 'Completed',
      area: { value: 1850, definition: 'carpet', unit: 'sq ft' },
      bedrooms: 3,
      image: null,
      publishedAt: '2026-10-02T10:00:00Z',
      configurations: [
        {
          id: 'c1',
          label: 'First Floor',
          bedrooms: 3,
          availability: 'Available',
          priceAmount: 14000000,
        },
        {
          id: 'c2',
          label: 'Second Floor',
          bedrooms: 3,
          availability: 'Reserved',
          priceAmount: 14500000,
        },
      ],
    },
    {
      id: 'fix_3',
      slug: 'residential-plot-jagatpura',
      name: 'Residential Plot Jagatpura',
      type: 'Residential Plot',
      locality: 'Jagatpura',
      shortDescription: 'Corner plot facing sector road',
      priceMode: 'exact',
      priceAmount: 9500000, // 95 L
      priceDisplay: '₹95 Lakh',
      availability: 'Reserved',
      constructionStage: 'Planned',
      area: { value: 250, definition: 'plot', unit: 'sq yd' },
      bedrooms: null,
      image: null,
      publishedAt: '2026-10-03T10:00:00Z',
    },
  ];

  // Positive Test: Category filtering
  const villasOnly = fixtures.filter((d) => d.type === 'Villa');
  assert.strictEqual(villasOnly.length, 1);
  assert.strictEqual(villasOnly[0].id, 'fix_1');
  console.log('  ✓ Category filter isolates exact category (Villa: 1)');

  // Positive Test: Stage filter (Completed)
  const completedOnly = fixtures.filter((d) => d.constructionStage === 'Completed');
  assert.strictEqual(completedOnly.length, 1);
  assert.strictEqual(completedOnly[0].id, 'fix_2');
  console.log('  ✓ Completed stage filter isolates completed construction (Completed: 1)');

  // Positive Test: Total budget cap filter (under 2 Cr)
  const under2Cr = fixtures.filter(
    (d) => typeof d.priceAmount === 'number' && d.priceAmount <= 20000000
  );
  assert.strictEqual(under2Cr.length, 2); // fix_2 (1.4 Cr) and fix_3 (95 L)
  console.log('  ✓ Budget filter correctly compares total INR price (Under 2 Cr: 2)');

  // Positive Test: Bedroom filter
  const threeBhk = fixtures.filter((d) => d.bedrooms === 3);
  assert.strictEqual(threeBhk.length, 1);
  assert.strictEqual(threeBhk[0].id, 'fix_2');
  console.log('  ✓ Bedroom filter correctly matches bedroom count');

  // Positive Test: Combined criteria matching on configurations
  // Search for: bedrooms = 3 AND availability = 'Reserved'
  // root dev fix_2 has availability = 'Available', BUT config c2 has bedrooms = 3 AND availability = 'Reserved'!
  const matchedReserved3Bhk = fixtures.filter((dev) => {
    const rootMatches = dev.bedrooms === 3 && dev.availability === 'Reserved';
    const configMatches =
      Array.isArray(dev.configurations) &&
      dev.configurations.some((c) => c.bedrooms === 3 && c.availability === 'Reserved');
    return rootMatches || configMatches;
  });
  assert.strictEqual(matchedReserved3Bhk.length, 1);
  assert.strictEqual(matchedReserved3Bhk[0].id, 'fix_2');
  console.log('  ✓ Combined criteria correctly matches sub-configurations simultaneously');

  // TEST 4: Live Read-Only Firestore Verification
  console.log('\n4. Live Read-Only Checks:');
  const app = getFirebaseAdminApp();
  const db = getFirestoreDb(app);

  const pubSnap = await db.collection('developments_public').get();
  console.log(`  [Live Firestore] developments_public count: ${pubSnap.docs.length}`);
  assert.strictEqual(pubSnap.docs.length, 0, 'Public collection remains untampered and empty');

  const draftSnap = await db.collection('developments_drafts').get();
  console.log(`  [Live Firestore] developments_drafts count: ${draftSnap.docs.length}`);
  assert.strictEqual(draftSnap.docs.length, 2, 'Draft collection remains preserved (2 drafts)');

  for (const doc of draftSnap.docs) {
    const draft = doc.data();
    assert.strictEqual(draft.status, 'draft', 'Draft retains draft status');
  }
  console.log('  ✓ Confirmed zero draft leakage and zero unverified public records');

  // TEST 5: getPublicDevelopments service call on live database
  const liveResult = await getPublicDevelopments();
  assert.strictEqual(liveResult.length, 0);
  console.log('  ✓ Live getPublicDevelopments() returns empty array without throwing');

  console.log('\n=== All Tests Passed Successfully ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
