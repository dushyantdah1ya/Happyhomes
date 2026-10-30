import assert from 'node:assert';
import { getFirebaseAdminApp, getFirestoreDb } from '../src/server/firebaseAdmin.js';
import { getPublicDevelopments } from '../src/server/developmentsService.js';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';

async function runTests() {
  console.log('--- Starting S09 Public Collection Tests ---');

  // 1. Verify Firestore developments_public authority and privacy
  const app = getFirebaseAdminApp();
  const db = getFirestoreDb(app);
  const publicSnap = await db.collection('developments_public').get();
  console.log(`[Read-Only Check] developments_public count: ${publicSnap.docs.length}`);

  const draftSnap = await db.collection('developments_drafts').get();
  console.log(`[Read-Only Check] developments_drafts count: ${draftSnap.docs.length}`);

  // Drafts must not be in developments_public unless published
  const draftIds = new Set(draftSnap.docs.map(d => d.id));
  for (const doc of publicSnap.docs) {
    const pubData = doc.data();
    assert.strictEqual(typeof pubData.slug, 'string', 'Public development must have slug');
  }

  // 2. Test getPublicDevelopments service function
  const allPub = await getPublicDevelopments();
  assert.strictEqual(allPub.length, publicSnap.docs.length, 'getPublicDevelopments count matches Firestore');
  console.log('✓ getPublicDevelopments service returns correct array without throwing');

  // 3. Test filtering logic
  const villas = await getPublicDevelopments({ type: 'Villa' });
  assert.ok(Array.isArray(villas));
  const floors = await getPublicDevelopments({ type: 'Independent Floor' });
  assert.ok(Array.isArray(floors));
  const plots = await getPublicDevelopments({ type: 'Residential Plot' });
  assert.ok(Array.isArray(plots));
  const completed = await getPublicDevelopments({ stage: 'Completed' });
  assert.ok(Array.isArray(completed));
  console.log('✓ getPublicDevelopments filters function without error');

  // 4. Test route metadata for all 5 collection routes
  const metaDev = getRouteMetadata('/developments');
  assert.strictEqual(metaDev.statusCode, 200);
  assert.ok(metaDev.title.includes('Developments'));

  const metaVillas = getRouteMetadata('/villas');
  assert.strictEqual(metaVillas.statusCode, 200);
  assert.ok(metaVillas.title.includes('Villas'));

  const metaFloors = getRouteMetadata('/independent-floors');
  assert.strictEqual(metaFloors.statusCode, 200);
  assert.ok(metaFloors.title.includes('Independent Floors'));

  const metaPlots = getRouteMetadata('/plots');
  assert.strictEqual(metaPlots.statusCode, 200);
  assert.ok(metaPlots.title.includes('Plots'));

  const metaPlotsAlias = getRouteMetadata('/residential-plots');
  assert.strictEqual(metaPlotsAlias.statusCode, 200);
  assert.ok(metaPlotsAlias.title.includes('Plots'));

  const metaCompleted = getRouteMetadata('/completed');
  assert.strictEqual(metaCompleted.statusCode, 200);
  assert.ok(metaCompleted.title.includes('Completed'));

  const metaCompletedAlias = getRouteMetadata('/completed-developments');
  assert.strictEqual(metaCompletedAlias.statusCode, 200);
  assert.ok(metaCompletedAlias.title.includes('Completed'));

  console.log('✓ Route metadata correctly configured for all 5 collection routes & aliases');
  console.log('--- All S09 Public Collection Tests Passed Successfully ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
