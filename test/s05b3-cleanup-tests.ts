/**
 * Automated Verification for Happy Homes S05B3: Unused Upload Cleanup
 * Tests reference protection, grace periods, race safety, and transactional integrity.
 */

import { getFirebaseAdminApp } from '../src/server/firebaseAdmin.ts';
import { getFirestore } from 'firebase-admin/firestore';
import { 
  initiateAssetDeletion, 
  executeCloudinaryDeletion,
  listDevelopmentAssets
} from '../src/server/assetCleanupService.ts';
import { 
  updateDevelopmentDraft,
  publishDevelopment,
  getAllReferencedAssetIds
} from '../src/server/developmentsService.ts';
import { type DevelopmentDraft } from '../src/types/development.ts';

async function runTests() {
  console.log('--- S05B3 Cleanup & Registry Security Tests ---');
  const app = getFirebaseAdminApp();
  const db = getFirestore(app);
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

  const testDevId = `test_cleanup_${Date.now()}`;
  const ownerUid = 'test_owner_uid';

  try {
    // SETUP: Create a test development draft
    const draftRef = db.collection('developments_drafts').doc(testDevId);
    await draftRef.set({
      id: testDevId,
      name: 'Cleanup Test Site',
      status: 'draft',
      version: 1,
      photos: [],
      plans: [],
      brochure: null,
      progress: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: ownerUid
    });

    // SETUP: Create mock assets
    const now = new Date();
    const oldDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 days ago
    const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago

    const assetOld = `asset_old_${Date.now()}`;
    const assetRecent = `asset_recent_${Date.now()}`;
    const assetAttached = `asset_attached_${Date.now()}`;

    await db.collection('managed_assets').doc(assetOld).set({
      assetId: assetOld,
      developmentId: testDevId,
      status: 'unattached',
      createdAt: oldDate,
      publicId: 'test/old',
      secureUrl: 'https://test/old.jpg',
      format: 'jpg',
      bytes: 1024,
      purpose: 'gallery'
    });

    await db.collection('managed_assets').doc(assetRecent).set({
      assetId: assetRecent,
      developmentId: testDevId,
      status: 'unattached',
      createdAt: recentDate,
      publicId: 'test/recent',
      secureUrl: 'https://test/recent.jpg',
      format: 'jpg',
      bytes: 1024,
      purpose: 'gallery'
    });

    await db.collection('managed_assets').doc(assetAttached).set({
      assetId: assetAttached,
      developmentId: testDevId,
      status: 'attached',
      createdAt: oldDate,
      publicId: 'test/attached',
      secureUrl: 'https://test/attached.jpg',
      format: 'jpg',
      bytes: 1024,
      purpose: 'gallery'
    });

    // 1. ELIGIBILITY: Rejects young assets
    try {
      await initiateAssetDeletion(ownerUid, assetRecent, testDevId);
      assert(false, 'Young asset deletion should fail');
    } catch (e: any) {
      assert(e.message.includes('too young'), 'Correctly rejects asset < 7 days old');
    }

    // 2. ELIGIBILITY: Rejects attached assets
    try {
      await initiateAssetDeletion(ownerUid, assetAttached, testDevId);
      assert(false, 'Attached asset deletion should fail');
    } catch (e: any) {
      assert(e.message.includes('currently attached'), 'Correctly rejects attached asset');
    }

    // 3. REFERENCE PROTECTION: Transactional check during SAVE
    // Attach an eligible asset to the draft
    const updatedDraft = await updateDevelopmentDraft(ownerUid, testDevId, {
      photos: [{
        id: assetOld,
        cloudinaryPublicId: 'test/old',
        url: 'https://test/old.jpg',
        secureUrl: 'https://test/old.jpg',
        width: 100, height: 100, format: 'jpg', bytes: 1024, altText: '', label: 'Actual photograph', isCover: true, sortOrder: 0, createdAt: oldDate
      }]
    });
    
    const assetOldSnap = await db.collection('managed_assets').doc(assetOld).get();
    assert(assetOldSnap.data()?.status === 'attached', 'Asset status correctly promoted to "attached" on draft save');

    // 4. REFERENCE PROTECTION: Cannot delete if referenced in draft
    try {
      await initiateAssetDeletion(ownerUid, assetOld, testDevId);
      assert(false, 'Draft-referenced asset deletion should fail');
    } catch (e: any) {
      assert(e.message.includes('currently attached'), 'Correctly rejects deletion of draft-referenced asset');
    }

    // 5. RACE SAFETY: Attach vs Delete
    // Detach it first
    await updateDevelopmentDraft(ownerUid, testDevId, { photos: [] });
    const detachedSnap = await db.collection('managed_assets').doc(assetOld).get();
    assert(detachedSnap.data()?.status === 'detached', 'Asset status correctly set to "detached" on removal');
    assert(!!detachedSnap.data()?.detachedAt, 'Detached timestamp recorded');

    // Manually backdate detachedAt to bypass grace for test
    await db.collection('managed_assets').doc(assetOld).update({
      detachedAt: oldDate
    });

    // Simulate Deletion Initiation
    await initiateAssetDeletion(ownerUid, assetOld, testDevId);
    const pendingSnap = await db.collection('managed_assets').doc(assetOld).get();
    assert(pendingSnap.data()?.status === 'deletion_pending', 'Asset marked as "deletion_pending"');

    // ATTEMPT TO RE-ATTACH DURING DELETION-PENDING (Race Condition Test)
    try {
      await updateDevelopmentDraft(ownerUid, testDevId, {
        photos: [{ id: assetOld, /* ... */ } as any]
      });
      assert(false, 'Re-attachment of deletion-pending asset should fail transactionally');
    } catch (e: any) {
      assert(e.message.includes('unavailable for attachment'), 'Transactional protection prevents re-attaching asset being deleted');
    }

    // 6. FOREIGN ASSET PROTECTION
    const foreignAsset = `foreign_${Date.now()}`;
    await db.collection('managed_assets').doc(foreignAsset).set({
      assetId: foreignAsset,
      developmentId: 'other_dev',
      status: 'unattached',
      createdAt: oldDate
    });
    try {
      await initiateAssetDeletion(ownerUid, foreignAsset, testDevId);
      assert(false, 'Deletion of other development asset should fail');
    } catch (e: any) {
      assert(e.message.includes('not belong'), 'Correctly rejects deletion of assets from other developments');
    }

    // 7. ACTIVE INTENT PROTECTION
    const intentAsset = `intent_asset_${Date.now()}`;
    await db.collection('managed_assets').doc(intentAsset).set({
      assetId: intentAsset,
      developmentId: testDevId,
      status: 'unattached',
      createdAt: oldDate
    });
    await db.collection('media_upload_intents').doc(`intent_${Date.now()}`).set({
      assetId: intentAsset,
      status: 'pending',
      developmentId: testDevId
    });
    try {
      await initiateAssetDeletion(ownerUid, intentAsset, testDevId);
      assert(false, 'Asset with active intent should not be deletable');
    } catch (e: any) {
      assert(e.message.includes('active upload intent'), 'Correctly protects assets with active intents');
    }

    console.log('\n--- Final Summary ---');
    console.log(`Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) process.exit(1);

  } catch (e) {
    console.error('Fatal test error:', e);
    process.exit(1);
  } finally {
    // Cleanup test data
    // (Optional, but good for isolated firestore)
  }
}

runTests();
