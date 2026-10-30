import { 
  submitEnquiry, 
  listEnquiries, 
  getEnquiry, 
  updateEnquiryStatus 
} from '../src/server/enquiryService.ts';
import { type EnquirySubmissionRequest } from '../src/types/enquiry.ts';

// --- Mock Infrastructure (reusing and extending from s05b3-tests) ---

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
      _colName: name,
      doc: (id: string) => {
        if (!this.collections[name][id]) this.collections[name][id] = { id, data: null };
        const docRef = {
          id,
          _colName: name,
          get: async () => ({
            exists: this.collections[name][id].data !== null,
            data: () => this.collections[name][id].data,
            id
          }),
          update: async (data: any) => {
            this.collections[name][id].data = { ...this.collections[name][id].data, ...data };
          },
          set: async (data: any, options?: any) => {
            if (options?.merge) {
              this.collections[name][id].data = { ...this.collections[name][id].data, ...data };
            } else {
              this.collections[name][id].data = data;
            }
          },
          delete: async () => {
            this.collections[name][id].data = null;
          },
          collection: (subName: string) => {
            const fullSubName = `${name}/${id}/${subName}`;
            return this.collection(fullSubName);
          }
        };
        return docRef;
      }
    };
  }

  async runTransaction(cb: any) {
    const pendingUpdates: { col: string, id: string, data: any, merge?: boolean }[] = [];
    const transaction = {
      get: async (refOrQuery: any) => {
        return await refOrQuery.get();
      },
      update: (ref: any, data: any) => {
        pendingUpdates.push({ col: ref._colName, id: ref.id, data, merge: true });
      },
      set: (ref: any, data: any, options?: any) => {
        pendingUpdates.push({ col: ref._colName, id: ref.id, data, merge: options?.merge });
      },
      delete: (ref: any) => {
        pendingUpdates.push({ col: ref._colName, id: ref.id, data: null });
      }
    };

    try {
      const result = await cb(transaction);
      for (const update of pendingUpdates) {
        if (!this.collections[update.col]) this.collections[update.col] = {};
        if (!this.collections[update.col][update.id]) this.collections[update.col][update.id] = { id: update.id, data: null };
        
        if (update.data === null) {
          this.collections[update.col][update.id].data = null;
        } else if (update.merge) {
          this.collections[update.col][update.id].data = { 
            ...this.collections[update.col][update.id].data, 
            ...update.data 
          };
        } else {
          this.collections[update.col][update.id].data = update.data;
        }
      }
      return result;
    } catch (err) {
      throw err;
    }
  }
}

// Override getDb and getFirebaseAdminApp in enquiryService
// We need a way to inject the mock. Since I already added __test_setDb to other services, 
// I should add it to enquiryService.ts too.

import * as enquiryService from '../src/server/enquiryService.ts';

const mockDb = new MockFirestore();
enquiryService.__test_setDb(mockDb);

async function runTests() {
  console.log('--- STARTING S06A ENQUIRY VERIFICATION ---');

  const CLIENT_ID = 'client_123';
  
  // 1. Valid Persistence
  console.log('\n[Test 1] Valid submission');
  const validReq: EnquirySubmissionRequest = {
    idempotencyKey: 'key_1',
    name: 'Vikram Sharma',
    phone: '+91 91660 54964',
    email: 'vikram@example.com',
    message: 'Interested in a site visit.',
    service: 'Luxury Villa Acquisition',
    acknowledgedContact: true,
    marketingConsent: true,
    formVersion: '2026-10-S06A'
  };

  const res1 = await submitEnquiry(validReq, CLIENT_ID);
  const enq1 = mockDb.collections['enquiries'][res1.enquiryId!].data;
  if (res1.enquiryId && enq1.name === 'Vikram Sharma' && enq1.status === 'New') {
    console.log('PASS: Enquiry persisted correctly');
  } else {
    console.error('FAIL: Persistence mismatch', res1, enq1);
  }

  // 2. Invalid Input
  console.log('\n[Test 2] Invalid input (missing phone)');
  const resFail = await submitEnquiry({ ...validReq, phone: '', idempotencyKey: 'key_2' }, CLIENT_ID);
  if (!resFail.ok && resFail.status === 400) {
    console.log('PASS:', resFail.message);
  } else {
    console.error('FAIL: Should have rejected empty phone');
  }

  console.log('\n[Test 2b] Invalid input (honeypot)');
  const resHoney = await submitEnquiry({ ...validReq, honeypot: 'im-a-bot', idempotencyKey: 'key_3' }, CLIENT_ID);
  if (resHoney.ok && resHoney.status === 200) {
    console.log('PASS: Silent reject worked (returned 200)');
  } else {
    console.error('FAIL: Should have silent rejected honeypot');
  }

  // 3. Idempotent Retry
  console.log('\n[Test 3] Idempotent retry');
  const res2 = await submitEnquiry(validReq, CLIENT_ID); // Same key_1
  if (res2.enquiryId === res1.enquiryId) {
    console.log('PASS: Returned existing enquiry for same idempotency key');
  } else {
    console.error('FAIL: Created duplicate for same key', { id1: res1.enquiryId, id2: res2.enquiryId });
  }

  // 4. Rate Limiting
  console.log('\n[Test 4] Rate limiting');
  // We already did 3 successful (or attempted) requests for this window.
  // Let's do 8 more to hit the limit of 10.
  for (let i = 0; i < 15; i++) {
    const resLimit = await submitEnquiry({ ...validReq, idempotencyKey: `key_limit_${i}` }, CLIENT_ID);
    if (!resLimit.ok && resLimit.status === 429) {
      console.log(`PASS: Rate limit caught at request ${i}`);
      break;
    }
    if (i === 14) console.error('FAIL: Should have hit rate limit');
  }

  // 5. Development Context Resolution
  console.log('\n[Test 5] Development context resolution');
  const DEV_ID = 'villa-kusum';
  mockDb.collections['developments_public'] = {
    [DEV_ID]: { 
      id: DEV_ID, 
      data: { id: DEV_ID, name: 'The Courtyard Villa', slug: 'the-courtyard-villa' } 
    }
  };
  
  const res3 = await submitEnquiry({ 
    ...validReq, 
    idempotencyKey: 'key_dev', 
    developmentId: DEV_ID 
  }, 'new_client');
  
  const enq3 = mockDb.collections['enquiries'][res3.enquiryId!].data;
  if (enq3.developmentTitle === 'The Courtyard Villa' && enq3.developmentSlug === 'the-courtyard-villa') {
    console.log('PASS: Resolved development title and slug from server');
  } else {
    console.error('FAIL: Context resolution failed', enq3);
  }

  // 6. Admin Inbox access (simulated)
  console.log('\n[Test 6] Admin listing');
  const result = await listEnquiries();
  if (result.enquiries.length >= 2) {
    console.log(`PASS: Listed ${result.enquiries.length} enquiries`);
  } else {
    console.error('FAIL: Listing failed', result);
  }

  console.log('\n--- VERIFICATION COMPLETE ---');
}

runTests().catch(err => {
  console.error('TEST SUITE CRASHED:', err);
  process.exit(1);
});
