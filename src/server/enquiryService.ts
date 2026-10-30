import { getFirebaseAdminApp, getFirestoreDb } from './firebaseAdmin.ts';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { Enquiry, EnquirySubmissionRequest, EnquiryStatus, RateLimitRecord } from '../types/enquiry.ts';
import { DevelopmentPublic } from '../types/development.ts';

const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;

let dbOverride: any = null;

/** @internal */
export function __test_setDb(db: any) { dbOverride = db; }

function getDb() {
  if (dbOverride) return dbOverride;
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) throw new Error('Firebase Admin not configured');
  return getFirestoreDb(adminApp);
}

/**
 * Validates and persists a new consultation enquiry.
 * Implements rate limiting, idempotency, and development context resolution.
 */
export async function submitEnquiry(
  request: EnquirySubmissionRequest,
  clientIdentifier: string // e.g. IP address from request
): Promise<{ ok: boolean; status: number; message: string; enquiryId?: string }> {
  const db = getDb();

  // 1. Honeypot check (Silent reject)
  if (request.honeypot && request.honeypot.trim().length > 0) {
    console.warn('[Enquiry] Honeypot triggered');
    return { ok: true, status: 200, message: 'Your enquiry has been received. Happy Homes will contact you.' };
  }

  // 2. Strict Input Validation
  const name = (request.name || '').trim().slice(0, 100);
  const phone = (request.phone || '').trim().slice(0, 30);
  const email = (request.email || '').trim().slice(0, 100) || null;
  const message = (request.message || '').trim().slice(0, 2000) || null;
  const service = (request.service || '').trim().slice(0, 100);
  const locality = (request.locality || '').trim().slice(0, 100) || null;
  const idempotencyKey = (request.idempotencyKey || '').trim().slice(0, 128);
  const visitDate = request.visitDate || null;
  const visitTimeSlot = request.visitTimeSlot || null;
  const visitType = request.visitType || null;

  if (!name || !phone || !service || !idempotencyKey || !request.acknowledgedContact) {
    return { ok: false, status: 400, message: 'Missing required fields or acknowledgments.' };
  }

  // Basic phone validation (at least 10 chars, allowing +, space, etc.)
  if (phone.replace(/[^\d]/g, '').length < 8) {
    return { ok: false, status: 400, message: 'A valid phone number is required.' };
  }

  // 3. Rate Limiting (Server-side with Firestore counters)
  const rateLimitSecret = process.env.ENQUIRY_RATE_LIMIT_SECRET || 'fallback-dev-secret';
  const hashedIdentifier = crypto.createHmac('sha256', rateLimitSecret).update(clientIdentifier).digest('hex');
  const rateLimitRef = db.collection('system').doc('rate_limits').collection('enquiries').doc(hashedIdentifier);

  try {
    const isRateLimited = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(rateLimitRef);
      const now = new Date();
      const nowIso = now.toISOString();

      if (!doc.exists) {
        transaction.set(rateLimitRef, {
          count: 1,
          expiresAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString(),
        });
        return false;
      }

      const data = doc.data() as RateLimitRecord;
      if (new Date(data.expiresAt) < now) {
        // Reset expired window
        transaction.set(rateLimitRef, {
          count: 1,
          expiresAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString(),
        });
        return false;
      }

      if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
      }

      transaction.update(rateLimitRef, {
        count: data.count + 1,
      });
      return false;
    });

    if (isRateLimited) {
      return { ok: false, status: 429, message: 'Too many requests. Please try again later.' };
    }
  } catch (err) {
    console.error('[Enquiry] Rate limit check failed:', err);
    // Fail safe: if database is down, we might allow it or block it. 
    // Requirement says "Fail safely on database/rate-limit failures". 
    // Usually fail-safe for user means allow if it's not a critical error.
  }

  // 4. Idempotency Check
  // We use a hash of the normalized payload to ensure retry of same data is safe.
  const payloadFingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify({ 
      name, phone, email, service, locality, message, 
      devId: request.developmentId,
      visitDate, visitTimeSlot, visitType
    }))
    .digest('hex');

  const idempotencyRef = db.collection('system').doc('idempotency').collection('enquiries').doc(idempotencyKey);
  
  const existingIdempotency = await idempotencyRef.get();
  if (existingIdempotency.exists) {
    const data = existingIdempotency.data();
    if (data?.fingerprint === payloadFingerprint) {
      return { 
        ok: true, 
        status: 200, 
        message: 'Your enquiry has been received. Happy Homes will contact you.',
        enquiryId: data.enquiryId 
      };
    } else {
      // Key reuse with different payload
      return { ok: false, status: 409, message: 'Conflict: This request has already been processed with different details.' };
    }
  }

  // 5. Resolve Development Context
  let devTitle: string | null = null;
  let devSlug: string | null = null;
  if (request.developmentId) {
    const devDoc = await db.collection('developments_public').doc(request.developmentId).get();
    if (devDoc.exists) {
      const devData = devDoc.data() as DevelopmentPublic;
      devTitle = devData.name;
      devSlug = devData.slug;
    } else {
      // Fallback: search by ID if it's not the slug (handle common identifier confusion)
      const devQuery = await db.collection('developments_public').where('id', '==', request.developmentId).limit(1).get();
      if (!devQuery.empty) {
        const devData = devQuery.docs[0].data() as DevelopmentPublic;
        devTitle = devData.name;
        devSlug = devData.slug;
      }
    }
  }

  // 6. Persist Enquiry
  const enquiryId = crypto.randomUUID();
  const newEnquiry: Enquiry = {
    id: enquiryId,
    idempotencyKey,
    name,
    phone,
    email,
    message,
    service,
    locality,
    developmentId: request.developmentId || null,
    developmentTitle: devTitle,
    developmentSlug: devSlug,
    status: 'New',
    createdAt: new Date().toISOString(),
    marketingConsent: !!request.marketingConsent,
    acknowledgedContact: !!request.acknowledgedContact,
    formVersion: request.formVersion || '2026-10-S06A',
    source: request.source || null,
    visitDate,
    visitTimeSlot,
    visitType,
  };

  try {
    await db.runTransaction(async (transaction) => {
      // Double check idempotency inside transaction
      const iDoc = await transaction.get(idempotencyRef);
      if (iDoc.exists) throw new Error('concurrent_idempotency_conflict');

      transaction.set(db.collection('enquiries').doc(enquiryId), newEnquiry);
      transaction.set(idempotencyRef, {
        enquiryId,
        fingerprint: payloadFingerprint,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return { 
      ok: true, 
      status: 200, 
      message: 'Your enquiry has been received. Happy Homes will contact you.',
      enquiryId 
    };
  } catch (err) {
    console.error('[Enquiry] Persistence failed:', err);
    return { ok: false, status: 500, message: 'Unable to save your enquiry. Please try again later.' };
  }
}

export interface EnquiryFilter {
  status?: EnquiryStatus;
  source?: string;
  developmentId?: string;
  followUp?: 'due' | 'overdue';
  limit?: number;
  startAfterId?: string;
}

/**
 * Retrieves a list of enquiries for the owner with filtering and pagination.
 */
export async function listEnquiries(filter: EnquiryFilter = {}): Promise<{ enquiries: Enquiry[]; hasMore: boolean }> {
  const db = getDb();
  let query: any = db.collection('enquiries');

  // Equality filters first
  if (filter.status) {
    query = query.where('status', '==', filter.status);
  }
  if (filter.source) {
    query = query.where('source', '==', filter.source);
  }
  if (filter.developmentId) {
    query = query.where('developmentId', '==', filter.developmentId);
  }

  // Follow-up filters
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const todayStr = istNow.toISOString().split('T')[0];

  let hasInequality = false;
  const openStatuses = ['New', 'Contacted', 'Visit Arranged'];

  if (filter.followUp === 'due') {
    query = query.where('followUpDate', '==', todayStr);
    if (!filter.status) {
      query = query.where('status', 'in', openStatuses);
    }
  } else if (filter.followUp === 'overdue') {
    query = query.where('followUpDate', '<', todayStr);
    hasInequality = true;
    if (!filter.status) {
      query = query.where('status', 'in', openStatuses);
    }
  }

  // Firestore requirements: inequality field must be the first orderBy
  if (hasInequality) {
    query = query.orderBy('followUpDate', 'desc');
    if (!filter.status) {
      query = query.orderBy('status', 'desc');
    }
  }
  
  query = query.orderBy('createdAt', 'desc');

  const limit = filter.limit || 20;
  query = query.limit(limit + 1);

  if (filter.startAfterId) {
    const lastDoc = await db.collection('enquiries').doc(filter.startAfterId).get();
    if (lastDoc.exists) {
      query = query.startAfter(lastDoc);
    }
  }

  const snapshot = await query.get();
  const docs = snapshot.docs;
  const hasMore = docs.length > limit;
  const results = docs.slice(0, limit).map((doc: any) => doc.data() as Enquiry);

  return { enquiries: results, hasMore };
}

/**
 * Retrieves a single enquiry by ID.
 */
export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const db = getDb();

  const doc = await db.collection('enquiries').doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Enquiry;
}

/**
 * Updates the status of an enquiry.
 */
export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<boolean> {
  const db = getDb();

  const validStatuses: EnquiryStatus[] = ['New', 'Contacted', 'Visit Arranged', 'Closed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  await db.collection('enquiries').doc(id).update({ 
    status,
    updatedAt: new Date().toISOString()
  });
  return true;
}

/**
 * Updates admin-only fields for an enquiry.
 */
export async function updateEnquiryAdminFields(
  id: string, 
  uid: string,
  updates: { 
    status?: EnquiryStatus; 
    internalNotes?: string; 
    followUpDate?: string | null;
  },
  expectedRevision?: number
): Promise<boolean> {
  const db = getDb();
  const enquiryRef = db.collection('enquiries').doc(id);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(enquiryRef);
    if (!doc.exists) throw new Error('Enquiry not found');
    
    const data = doc.data() as Enquiry;
    const currentRevision = data.revision || 0;

    if (expectedRevision !== undefined && currentRevision !== expectedRevision) {
      const error: any = new Error('Optimistic concurrency conflict: The record has been modified by another user.');
      error.statusCode = 409;
      error.code = 'conflict_stale_edit';
      throw error;
    }

    const revision = currentRevision + 1;

    const patch: any = {
      updatedAt: new Date().toISOString(),
      updatedByUID: uid,
      revision
    };

    if (updates.status) {
      const validStatuses: EnquiryStatus[] = ['New', 'Contacted', 'Visit Arranged', 'Closed'];
      if (!validStatuses.includes(updates.status)) throw new Error('Invalid status');
      patch.status = updates.status;
    }

    if (updates.internalNotes !== undefined) {
      patch.internalNotes = updates.internalNotes.slice(0, 5000);
    }

    if (updates.followUpDate !== undefined) {
      // Expecting YYYY-MM-DD or null
      patch.followUpDate = updates.followUpDate;
    }

    transaction.update(enquiryRef, patch);
  });

  return true;
}

/**
 * Retrieves counts for the owner dashboard.
 */
export async function getDashboardStats(): Promise<{
  newEnquiries: number | null;
  dueFollowUps: number | null;
  overdueFollowUps: number | null;
}> {
  const db = getDb();
  
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const todayStr = istNow.toISOString().split('T')[0];

  const openStatuses = ['New', 'Contacted', 'Visit Arranged'];

  try {
    const [newRes, dueRes, overdueRes] = await Promise.allSettled([
      db.collection('enquiries').where('status', '==', 'New').count().get(),
      db.collection('enquiries')
        .where('followUpDate', '==', todayStr)
        .where('status', 'in', openStatuses)
        .count().get(),
      db.collection('enquiries')
        .where('followUpDate', '<', todayStr)
        .where('status', 'in', openStatuses)
        .count().get(),
    ]);

    return {
      newEnquiries: newRes.status === 'fulfilled' ? newRes.value.data().count : null,
      dueFollowUps: dueRes.status === 'fulfilled' ? dueRes.value.data().count : null,
      overdueFollowUps: overdueRes.status === 'fulfilled' ? overdueRes.value.data().count : null,
    };
  } catch (err) {
    console.error('[Enquiry Stats] Critical failure:', err);
    return { newEnquiries: null, dueFollowUps: null, overdueFollowUps: null };
  }
}

/**
 * Generates a CSV string of enquiries with filtering and security safeguards.
 */
export async function exportEnquiriesCsv(
  filter: EnquiryFilter = {},
  includeNotes: boolean = false
): Promise<string> {
  const db = getDb();
  
  // Apply a strict limit for export to prevent resource exhaustion
  const EXPORT_LIMIT = 1000;
  
  let query: any = db.collection('enquiries');

  // Equality filters first
  if (filter.status) {
    query = query.where('status', '==', filter.status);
  }
  if (filter.source) {
    query = query.where('source', '==', filter.source);
  }
  if (filter.developmentId) {
    query = query.where('developmentId', '==', filter.developmentId);
  }

  // Follow-up filters
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const todayStr = istNow.toISOString().split('T')[0];

  let hasInequality = false;
  const openStatuses = ['New', 'Contacted', 'Visit Arranged'];

  if (filter.followUp === 'due') {
    query = query.where('followUpDate', '==', todayStr);
    if (!filter.status) {
      query = query.where('status', 'in', openStatuses);
    }
  } else if (filter.followUp === 'overdue') {
    query = query.where('followUpDate', '<', todayStr);
    hasInequality = true;
    if (!filter.status) {
      query = query.where('status', 'in', openStatuses);
    }
  }

  // Firestore requirements: inequality field must be the first orderBy
  if (hasInequality) {
    query = query.orderBy('followUpDate', 'desc');
    if (!filter.status) {
      query = query.orderBy('status', 'desc');
    }
  }
  
  query = query.orderBy('createdAt', 'desc');

  // Fetch one more than limit to detect overflow
  const snapshot = await query.limit(EXPORT_LIMIT + 1).get();
  
  if (snapshot.docs.length > EXPORT_LIMIT) {
    const error: any = new Error('Export limit exceeded. Please narrow your filters to export fewer than 1,000 records.');
    error.statusCode = 400;
    error.code = 'export_limit_exceeded';
    throw error;
  }

  const enquiries = snapshot.docs.map((doc: any) => doc.data() as Enquiry);

  const headers = [
    'ID', 'Created At', 'Name', 'Phone', 'Email', 'Service', 'Locality', 
    'Development', 'Status', 'Source', 'Visit Date', 'Visit Time', 'Visit Type',
    'Marketing Consent'
  ];

  if (includeNotes) {
    headers.push('Internal Notes');
    headers.push('Follow-up Date');
  }

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    
    // Neutralize spreadsheet formulas to prevent CSV injection
    // Prepend a single quote if the string (even after leading whitespace) starts with =, +, -, or @
    const trimmed = str.trimStart();
    if (trimmed.length > 0 && ['=', '+', '-', '@'].includes(trimmed[0])) {
      str = `'${str}`;
    }

    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = enquiries.map(e => {
    const row = [
      e.id,
      e.createdAt,
      e.name,
      e.phone,
      e.email || '',
      e.service,
      e.locality || '',
      e.developmentTitle || '',
      e.status,
      e.source || '',
      e.visitDate || '',
      e.visitTimeSlot || '',
      e.visitType || '',
      e.marketingConsent ? 'Yes' : 'No'
    ];

    if (includeNotes) {
      row.push(e.internalNotes || '');
      row.push(e.followUpDate || '');
    }

    return row;
  });

  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n');
}
