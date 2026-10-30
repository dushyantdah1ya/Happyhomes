import { 
  initiateAssetDeletion, 
  executeCloudinaryDeletion,
  listDevelopmentAssets,
  __test_setDb,
  __test_setCloudinary
} from '../src/server/assetCleanupService.ts';
import { 
  reconcileAssetStatuses,
  __test_setDb as __test_setDbDev
} from '../src/server/developmentsService.ts';

// --- Manual Mock Implementation ---

class MockFirestore {
  collections: any = {};
  
  collection(name: string) {
    if (!this.collections[name]) this.collections[name] = {};
    const self = this;
    const queryBase = {
      get: async () => {
        const results = Object.values(this.collections[name]).filter((d: any) => d.data !== null);
        return {
          empty: results.length === 0,
          docs: results.map((r: any) => ({
            id: r.id,
            data: () => r.data,
            ref: { id: r.id }
          }))
        };
      },
      limit: (n: number) => ({
        ...queryBase,
        get: async () => {
          const results = Object.values(this.collections[name]).filter((d: any) => d.data !== null).slice(0, n);
          return {
            empty: results.length === 0,
            docs: results.map((r: any) => ({
              id: r.id,
              data: () => r.data,
              ref: { id: r.id }
            }))
          };
        }
      }),
      where: (field: string, op: string, val: any) => {
        const results = Object.values(this.collections[name]).filter((d: any) => {
          if (!d.data) return false;
          return d.data[field] === val;
        });
        return {
          ...queryBase,
          get: async () => ({
            empty: results.length === 0,
            docs: results.map((r: any) => ({
              id: r.id,
              data: () => r.data,
              ref: { id: r.id }
            }))
          }),
          limit: (n: number) => ({
            get: async () => ({
              empty: results.length === 0,
              docs: results.slice(0, n).map((r: any) => ({
                id: r.id,
                data: () => r.data,
                ref: { id: r.id }
              }))
            })
          })
        };
      },
      orderBy: () => ({
        ...queryBase,
        limit: (n: number) => ({
          get: async () => ({
            docs: Object.values(this.collections[name])
              .filter((d: any) => d.data !== null)
              .slice(0, n)
              .map((r: any) => ({
                id: r.id,
                data: () => r.data,
                ref: { id: r.id }
              }))
          })
        })
      })
    };

    return {
      ...queryBase,
      doc: (id: string) => {
        if (!this.collections[name][id]) this.collections[name][id] = { id, data: null };
        return {
          id,
          get: async () => ({
            exists: this.collections[name][id].data !== null,
            data: () => this.collections[name][id].data,
            id
          }),
          update: async (data: any) => {
            this.collections[name][id].data = { ...this.collections[name][id].data, ...data };
          },
          set: async (data: any) => {
            this.collections[name][id].data = data;
          },
          delete: async () => {
            this.collections[name][id].data = null;
          }
        };
      }
    };
  }

  async runTransaction(cb: any) {
    const pendingUpdates: { col: string, id: string, data: any }[] = [];
    const transaction = {
      get: async (refOrQuery: any) => {
        if (typeof refOrQuery.get === 'function' && !refOrQuery.id) {
          return await refOrQuery.get();
        }
        const id = refOrQuery.id;
        for (const colName of Object.keys(this.collections)) {
          if (this.collections[colName][id]) {
             return {
               exists: this.collections[colName][id].data !== null,
               data: () => this.collections[colName][id].data,
               id
             };
          }
        }
        return { exists: false, data: () => null, id };
      },
      update: (ref: any, data: any) => {
        const id = ref.id;
        for (const colName of Object.keys(this.collections)) {
          if (this.collections[colName][id]) {
            pendingUpdates.push({ col: colName, id, data });
            return;
          }
        }
      },
      set: (ref: any, data: any) => {
        // For simplicity, we assume the collection is known or we just put it in a 'generic' place
        // In our tests, we usually pre-seed, so we can find the collection
        const id = ref.id;
        for (const colName of Object.keys(this.collections)) {
          if (this.collections[colName][id]) {
            pendingUpdates.push({ col: colName, id, data });
            return;
          }
        }
        // Fallback if not found: use a default collection name if we could infer it,
        // but for this mock we'll just skip or assume it's seeded.
      },
      delete: (ref: any) => {
        const id = ref.id;
        for (const colName of Object.keys(this.collections)) {
          if (this.collections[colName][id]) {
            pendingUpdates.push({ col: colName, id, data: null });
            return;
          }
        }
      }
    };

    try {
      const result = await cb(transaction);
      // Success! Apply all pending updates
      for (const update of pendingUpdates) {
        if (update.data === null) {
          this.collections[update.col][update.id].data = null;
        } else {
          this.collections[update.col][update.id].data = { 
            ...this.collections[update.col][update.id].data, 
            ...update.data 
          };
        }
      }
      return result;
    } catch (err) {
      // Error! Discard all pending updates
      throw err;
    }
  }
}

const mockDb = new MockFirestore();
const mockCloudinary = {
  uploader: {
    destroy: async (publicId: string, options: any) => {
      console.log(`[Mock Cloudinary] Deleting ${publicId} with options`, options);
      if (publicId === 'fail_me') return { result: 'error' };
      if (publicId === 'not_found_me') return { result: 'not found' };
      return { result: 'ok' };
    }
  }
};

__test_setDb(mockDb);
__test_setDbDev(mockDb);
__test_setCloudinary(mockCloudinary);

// --- Test Suite ---

async function runTests() {
  console.log('--- STARTING S05B3 CLEANUP VERIFICATION ---');

  const DEV_ID = 'dev_123';
  const OWNER_UID = 'owner_789';
  const OTHER_UID = 'other_456';
  
  // Seed data
  mockDb.collections['managed_assets'] = {};
  mockDb.collections['developments_drafts'] = {};
  mockDb.collections['developments_public'] = {};
  mockDb.collections['media_upload_intents'] = {};

  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 10);
  const oldIso = oldDate.toISOString();

  const youngDate = new Date();
  youngDate.setDate(youngDate.getDate() - 2);
  const youngIso = youngDate.toISOString();

  // 1. Unauthenticated / Non-owner check (simulated via service call with different UID)
  // Re-checking in actual routes would be better, but service enforces ownership via params
  console.log('\n[Test 1] Foreign development check');
  mockDb.collections['managed_assets'] = {
    'asset_1': { 
      id: 'asset_1', 
      data: { 
        assetId: 'asset_1', 
        developmentId: 'dev_wrong', 
        status: 'unattached', 
        createdAt: oldIso 
      } 
    }
  };
  try {
    await initiateAssetDeletion(OWNER_UID, 'asset_1', DEV_ID);
    console.error('FAIL: Should have rejected asset from wrong development');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  // 2. Reference Protection
  console.log('\n[Test 2] Reference protection (Draft)');
  mockDb.collections['managed_assets']['asset_ref_draft'] = {
    id: 'asset_ref_draft',
    data: { assetId: 'asset_ref_draft', developmentId: DEV_ID, status: 'attached', createdAt: oldIso }
  };
  mockDb.collections['developments_drafts'][DEV_ID] = {
    id: DEV_ID,
    data: { id: DEV_ID, photos: [{ id: 'asset_ref_draft' }], status: 'draft' }
  };
  try {
    await initiateAssetDeletion(OWNER_UID, 'asset_ref_draft', DEV_ID);
    console.error('FAIL: Should have blocked deletion of referenced asset');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  console.log('\n[Test 2b] Reference protection (Public Snapshot)');
  mockDb.collections['managed_assets']['asset_ref_public'] = {
    id: 'asset_ref_public',
    data: { assetId: 'asset_ref_public', developmentId: DEV_ID, status: 'detached', detachedAt: oldIso, createdAt: oldIso }
  };
  mockDb.collections['developments_public']['snapshot_1'] = {
    id: 'snapshot_1',
    data: { id: DEV_ID, plans: [{ id: 'asset_ref_public' }] }
  };
  // Ensure draft doesn't have it
  mockDb.collections['developments_drafts'][DEV_ID].data.photos = [];
  try {
    await initiateAssetDeletion(OWNER_UID, 'asset_ref_public', DEV_ID);
    console.error('FAIL: Should have blocked deletion of asset used by public snapshot');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  // 3. Grace periods
  console.log('\n[Test 3] Young asset check');
  mockDb.collections['managed_assets']['asset_young'] = {
    id: 'asset_young',
    data: { assetId: 'asset_young', developmentId: DEV_ID, status: 'unattached', createdAt: youngIso }
  };
  try {
    await initiateAssetDeletion(OWNER_UID, 'asset_young', DEV_ID);
    console.error('FAIL: Should have blocked deletion of young asset');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  console.log('\n[Test 3b] Historical grace period (Missing detachedAt)');
  mockDb.collections['managed_assets']['asset_missing_history'] = {
    id: 'asset_missing_history',
    data: { assetId: 'asset_missing_history', developmentId: DEV_ID, status: 'detached', createdAt: oldIso }
  };
  const result3b = await initiateAssetDeletion(OWNER_UID, 'asset_missing_history', DEV_ID);
  if (result3b.status === 'waiting_period_started') {
    console.log('PASS:', result3b.message);
    const updated = mockDb.collections['managed_assets']['asset_missing_history'].data;
    if (updated.detachedAt) {
      console.log('Verified: detachedAt was set and PERSISTED');
    } else {
      console.error('FAIL: detachedAt was NOT persisted');
    }
  } else {
    console.error('FAIL: Should have returned waiting_period_started, got:', result3b.status);
  }

  console.log('\n[Regression 1 & 2] Retrying preserves timestamp and blocks deletion');
  const firstDetachedAt = mockDb.collections['managed_assets']['asset_missing_history'].data.detachedAt;
  try {
    await initiateAssetDeletion(OWNER_UID, 'asset_missing_history', DEV_ID);
    console.error('FAIL: Should have thrown because asset was recently detached');
  } catch (err: any) {
    const secondDetachedAt = mockDb.collections['managed_assets']['asset_missing_history'].data.detachedAt;
    if (err.message.includes('recently detached') && firstDetachedAt === secondDetachedAt) {
      console.log('PASS: Timestamp preserved and deletion blocked as expected');
    } else {
      console.error('FAIL: Wrong error or timestamp modified:', { message: err.message, firstDetachedAt, secondDetachedAt });
    }
  }

  // 4. Concurrency: Attach vs Delete
  console.log('\n[Test 4] Concurrency: Attach during deletion');
  mockDb.collections['managed_assets']['asset_race'] = {
    id: 'asset_race',
    data: { assetId: 'asset_race', developmentId: DEV_ID, status: 'deletion_pending', createdAt: oldIso }
  };
  try {
    // Simulate reconcileAssetStatuses trying to attach a pending-deletion asset
    await mockDb.runTransaction(async (transaction: any) => {
      await reconcileAssetStatuses(transaction, DEV_ID, [], ['asset_race']);
    });
    console.error('FAIL: reconcileAssetStatuses should have rejected deletion_pending asset');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  // 5. Cloudinary Deletion outside transaction and Error handling
  console.log('\n[Test 5] Provider failure Handling');
  mockDb.collections['managed_assets']['asset_fail'] = {
    id: 'asset_fail',
    data: { assetId: 'asset_fail', publicId: 'fail_me', status: 'deletion_pending' }
  };
  const failedResult = await executeCloudinaryDeletion('asset_fail');
  if (failedResult.status === 'deletion_error') {
    console.log('PASS: Asset marked as deletion_error');
  } else {
    console.error('FAIL: Asset should be in deletion_error state, got:', failedResult.status);
  }

  console.log('\n[Test 5b] Deletion error blocks attachment');
  // Re-seed asset_fail with developmentId so the query finds it
  mockDb.collections['managed_assets']['asset_fail'].data.developmentId = DEV_ID;
  try {
    await mockDb.runTransaction(async (transaction: any) => {
      await reconcileAssetStatuses(transaction, DEV_ID, [], ['asset_fail']);
    });
    console.error('FAIL: reconcileAssetStatuses should have rejected deletion_error asset');
  } catch (err: any) {
    console.log('PASS:', err.message);
  }

  console.log('\n[Test 5c] Retry after failure (Already deleted)');
  mockDb.collections['managed_assets']['asset_retry'] = {
    id: 'asset_retry',
    data: { assetId: 'asset_retry', publicId: 'not_found_me', status: 'deletion_error' }
  };
  const retryResult = await executeCloudinaryDeletion('asset_retry');
  if (retryResult.status === 'deleted') {
    console.log('PASS: Asset marked as deleted after "not found" response');
  } else {
    console.error('FAIL: Asset should be deleted, got:', retryResult.status);
  }

  // 6. Success path
  console.log('\n[Test 6] Successful full cleanup flow');
  mockDb.collections['managed_assets']['asset_ok'] = {
    id: 'asset_ok',
    data: { assetId: 'asset_ok', publicId: 'ok_me', developmentId: DEV_ID, status: 'unattached', createdAt: oldIso }
  };
  // Ensure no refs
  mockDb.collections['developments_drafts'][DEV_ID].data.photos = [];
  mockDb.collections['developments_public'] = {};
  
  const initiated = await initiateAssetDeletion(OWNER_UID, 'asset_ok', DEV_ID);
  if (initiated.status === 'deletion_pending') {
    console.log('Step 1: initiateAssetDeletion PASS');
    const finalized = await executeCloudinaryDeletion('asset_ok');
    if (finalized.status === 'deleted') {
      console.log('Step 2: executeCloudinaryDeletion PASS');
    } else {
      console.error('Step 2 FAIL');
    }
  } else {
    console.error('Step 1 FAIL, status:', initiated.status);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
}

runTests().catch(err => {
  console.error('TEST SUITE CRASHED:', err);
  process.exit(1);
});
