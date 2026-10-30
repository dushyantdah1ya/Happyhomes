import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Initializes Firebase Admin SDK using server environment variables.
 * Never throws uncaught exceptions if configuration is missing.
 */
export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Handle escaped newlines in environment variable strings
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return app;
    } catch (err) {
      console.error('[Firebase Admin] Initialization failed:', (err as Error).message);
      return null;
    }
  }

  // Attempt Application Default Credentials if running in GCP environment
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    try {
      const app = initializeApp();
      return app;
    } catch {
      // Default credentials not available
    }
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  return getFirebaseAdminApp() !== null;
}

export interface VerifyResult {
  ok: boolean;
  status: number;
  error?: string;
  message?: string;
  uid?: string;
  email?: string | null;
}

/**
 * Verifies the incoming Firebase ID token and strictly validates
 * the user ID against the server-only OWNER_FIREBASE_UID_ALLOWLIST.
 */
export async function verifyOwnerToken(authHeader: string | undefined): Promise<VerifyResult> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    return {
      ok: false,
      status: 503,
      error: 'service_unavailable',
      message:
        'Firebase Admin SDK is not configured on the server. Please supply FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in server environment variables.',
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      error: 'unauthorized_missing_token',
      message: 'Missing or malformed Authorization header. Expected Bearer <token>.',
    };
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) {
    return {
      ok: false,
      status: 401,
      error: 'unauthorized_empty_token',
      message: 'Empty ID token provided in Authorization header.',
    };
  }

  let decoded: DecodedIdToken;
  try {
    // checkRevoked: true enforces instantaneous revocation verification
    const auth = getAuth(adminApp);
    decoded = await auth.verifyIdToken(idToken, true);
  } catch (err: any) {
    console.error('[Firebase Admin] Token verification failed:', err.code || err.message);
    
    let error = 'unauthorized_invalid_or_revoked_token';
    let message = 'Token verification failed or token has been revoked.';
    
    if (err.code === 'auth/id-token-expired') {
      error = 'unauthorized_token_expired';
      message = 'Your session has expired. Please sign in again.';
    } else if (err.code === 'auth/id-token-revoked') {
      error = 'unauthorized_token_revoked';
      message = 'Your session has been revoked. Please sign in again.';
    } else if (err.code === 'auth/argument-error') {
      error = 'unauthorized_malformed_token';
      message = 'The provided authentication token is malformed.';
    }

    return {
      ok: false,
      status: 401,
      error,
      message,
    };
  }

  const verifiedUid = decoded.uid;
  const allowlistEnv = process.env.OWNER_FIREBASE_UID_ALLOWLIST || '';
  const allowlist = allowlistEnv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (allowlist.length === 0) {
    return {
      ok: false,
      status: 403,
      error: 'forbidden_empty_allowlist',
      uid: verifiedUid,
      email: decoded.email || null,
      message:
        'Server owner allowlist (OWNER_FIREBASE_UID_ALLOWLIST) is empty. No user accounts are authorized to perform management operations.',
    };
  }

  if (!allowlist.includes(verifiedUid)) {
    return {
      ok: false,
      status: 403,
      error: 'forbidden_non_owner',
      uid: verifiedUid,
      email: decoded.email || null,
      message: 'Authenticated account is not in the authorized owner allowlist.',
    };
  }

  return {
    ok: true,
    status: 200,
    uid: verifiedUid,
    email: decoded.email || null,
  };
}

export interface ConnectionCheckRecord {
  verifiedAt: string;
  verifiedBy: string;
  serverTime: number;
}

export function getFirestoreDb(adminApp: App) {
  const customDbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID;
  if (customDbId && customDbId !== '(default)') {
    return getFirestore(adminApp, customDbId);
  }
  return getFirestore(adminApp);
}

/**
 * Saves a connection check record to Firestore under /system/connection_check.
 */
export async function saveConnectionCheck(uid: string): Promise<ConnectionCheckRecord> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    throw new Error('Firebase Admin SDK is not configured');
  }

  const record: ConnectionCheckRecord = {
    verifiedAt: new Date().toISOString(),
    verifiedBy: uid,
    serverTime: Date.now(),
  };

  const db = getFirestoreDb(adminApp);
  await db.collection('system').doc('connection_check').set(record);
  return record;
}

/**
 * Reads the existing connection check record from Firestore without overwriting.
 */
export async function getConnectionCheck(): Promise<ConnectionCheckRecord | null> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    throw new Error('Firebase Admin SDK is not configured');
  }

  const db = getFirestoreDb(adminApp);
  const doc = await db.collection('system').doc('connection_check').get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as ConnectionCheckRecord;
}
