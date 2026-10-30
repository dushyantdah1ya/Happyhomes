import { v2 as cloudinary } from 'cloudinary';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from './firebaseAdmin.ts';
import { getAllReferencedAssetIds } from './developmentsService.ts';
import {
  type ManagedAsset,
  type AssetStatus,
  type DevelopmentDraft,
  type DevelopmentPublic,
} from '../types/development.ts';

let dbOverride: any = null;
let cloudinaryOverride: any = null;

export function __test_setDb(db: any) { dbOverride = db; }
export function __test_setCloudinary(c: any) { cloudinaryOverride = c; }

function getDb() {
  if (dbOverride) return dbOverride;
  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error('Firebase Admin SDK is not configured');
  }
  const customDbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID;
  if (customDbId && customDbId !== '(default)') {
    return getFirestore(app, customDbId);
  }
  return getFirestore(app);
}

function ensureCloudinaryConfig() {
  if (cloudinaryOverride) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function getCloudinary() {
  return cloudinaryOverride || cloudinary;
}

/**
 * Lists managed assets for a development that are potential candidates for cleanup.
 * Includes those already deleted (as tombstones) and those in error state.
 */
export async function listDevelopmentAssets(
  developmentId: string,
  limit = 20,
  startAfterId?: string
): Promise<{ assets: (ManagedAsset & { eligibility?: { eligible: boolean; reason: string } })[]; hasMore: boolean }> {
  const db = getDb();
  let query = db
    .collection('managed_assets')
    .where('developmentId', '==', developmentId)
    .orderBy('createdAt', 'desc')
    .limit(limit + 1);

  if (startAfterId) {
    const startDoc = await db.collection('managed_assets').doc(startAfterId).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  const snap = await query.get();
  
  // To determine local eligibility (unreferenced in THIS development), we need its current refs
  const draftRef = db.collection('developments_drafts').doc(developmentId);
  const draftSnap = await draftRef.get();
  const draft = draftSnap.exists ? draftSnap.data() as DevelopmentDraft : null;

  const publicQuery = db.collection('developments_public').where('id', '==', developmentId).limit(1);
  const publicSnap = await publicQuery.get();
  const publicData = publicSnap.empty ? null : publicSnap.docs[0].data() as DevelopmentPublic;

  const localRefs = new Set<string>();
  if (draft) getAllReferencedAssetIds(draft).forEach(id => localRefs.add(id));
  if (publicData) getAllReferencedAssetIds(publicData).forEach(id => localRefs.add(id));

  const now = new Date();
  const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;

  const assets = snap.docs.slice(0, limit).map((doc) => {
    const asset = doc.data() as ManagedAsset;
    let eligible = true;
    let reason = 'Eligible for cleanup';

    if (asset.status === 'deleted') {
      eligible = false;
      reason = 'Already deleted';
    } else if (asset.status === 'deletion_pending') {
      eligible = false;
      reason = 'Deletion in progress';
    } else if (asset.status === 'attached' || localRefs.has(asset.assetId)) {
      eligible = false;
      reason = 'Currently in use';
    } else {
      const createdAt = new Date(asset.createdAt);
      if (now.getTime() - createdAt.getTime() < gracePeriodMs) {
        eligible = false;
        reason = `Wait period: ${Math.ceil(7 - (now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000))} days left`;
      } else if (asset.status === 'detached') {
        if (asset.detachedAt) {
          const detachedAt = new Date(asset.detachedAt);
          if (now.getTime() - detachedAt.getTime() < gracePeriodMs) {
            eligible = false;
            reason = `Detached recently: ${Math.ceil(7 - (now.getTime() - detachedAt.getTime()) / (24 * 60 * 60 * 1000))} days left`;
          }
        } else {
          // No history: start waiting period now
          eligible = false;
          reason = 'Reference history unknown; wait period started now';
        }
      }
    }

    return {
      ...asset,
      eligibility: { eligible, reason }
    };
  });

  return {
    assets,
    hasMore: snap.docs.length > limit,
  };
}

export type DeletionInitiationResult = {
  status: 'deletion_pending' | 'waiting_period_started';
  asset: ManagedAsset;
  message: string;
};

/**
 * Transactionally initiates deletion of an asset.
 * Re-verifies eligibility (age, lack of references, active intents).
 */
export async function initiateAssetDeletion(
  actorUid: string,
  assetId: string,
  developmentId: string
): Promise<DeletionInitiationResult> {
  const db = getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  const gracePeriodMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  return await db.runTransaction(async (transaction) => {
    // --- 1. READS ---
    const assetRef = db.collection('managed_assets').doc(assetId);
    const assetSnap = await transaction.get(assetRef);

    if (!assetSnap.exists) {
      throw new Error('Asset record not found');
    }

    const asset = assetSnap.data() as ManagedAsset;

    // Check references across ALL developments (drafts and public)
    const draftRefsQuery = db.collection('developments_drafts');
    const draftsSnap = await transaction.get(draftRefsQuery);

    const publicRefsQuery = db.collection('developments_public');
    const publicSnap = await transaction.get(publicRefsQuery);

    const intentQuery = db.collection('media_upload_intents').where('assetId', '==', assetId).where('status', '==', 'pending');
    const intentSnap = await transaction.get(intentQuery);

    // --- 2. VALIDATION ---
    if (asset.developmentId !== developmentId) {
      throw new Error('Asset does not belong to the requested development');
    }

    if (asset.status === 'deleted' || asset.status === 'deletion_pending') {
      throw new Error(`Asset is already ${asset.status}`);
    }

    // Age check (at least 7 days old)
    const createdAt = new Date(asset.createdAt);
    if (now.getTime() - createdAt.getTime() < gracePeriodMs) {
      throw new Error('Asset is too young for deletion. Must be at least 7 days old.');
    }

    // Reference Protection
    if (asset.status === 'attached') {
      throw new Error('Asset is currently attached to the development and cannot be deleted.');
    }

    for (const doc of draftsSnap.docs) {
      const refs = getAllReferencedAssetIds(doc.data() as DevelopmentDraft);
      if (refs.includes(assetId)) {
        throw new Error(`Integrity violation: Asset is referenced by development draft "${doc.id}"`);
      }
    }

    for (const doc of publicSnap.docs) {
      const refs = getAllReferencedAssetIds(doc.data() as DevelopmentPublic);
      if (refs.includes(assetId)) {
        throw new Error(`Integrity violation: Asset is referenced by public snapshot "${doc.id}"`);
      }
    }

    // Active Intent check
    if (!intentSnap.empty) {
      throw new Error('Asset has an active upload intent and cannot be deleted.');
    }

    // --- 3. DECISION & WRITES ---
    if (asset.status === 'detached') {
      if (!asset.detachedAt) {
        // Missing history: start the waiting period and COMMIT (do not throw)
        transaction.update(assetRef, { detachedAt: nowIso });
        return {
          status: 'waiting_period_started',
          asset: { ...asset, detachedAt: nowIso },
          message: 'Asset reference history unknown. Waiting period started now. Try again in 7 days.'
        };
      }
      
      const detachedAt = new Date(asset.detachedAt);
      if (now.getTime() - detachedAt.getTime() < gracePeriodMs) {
        throw new Error('Asset was recently detached. Must wait at least 7 days before deletion.');
      }
    }

    // Success: mark as deletion_pending
    const updatedAsset: Partial<ManagedAsset> = {
      status: 'deletion_pending',
      deletionRequestedAt: nowIso,
      actorUid,
    };

    transaction.update(assetRef, updatedAsset);
    return {
      status: 'deletion_pending',
      asset: { ...asset, ...updatedAsset } as ManagedAsset,
      message: 'Asset marked for deletion.'
    };
  });
}

/**
 * Performs actual Cloudinary API call for a deletion-pending asset.
 * Idempotent and audit-safe.
 */
export async function executeCloudinaryDeletion(assetId: string): Promise<ManagedAsset> {
  const db = getDb();
  const assetRef = db.collection('managed_assets').doc(assetId);
  const assetSnap = await assetRef.get();

  if (!assetSnap.exists) {
    throw new Error('Asset not found');
  }

  const asset = assetSnap.data() as ManagedAsset;
  if (asset.status !== 'deletion_pending' && asset.status !== 'deletion_error') {
    return asset; // Already handled or invalid state
  }

  ensureCloudinaryConfig();
  const nowIso = new Date().toISOString();

  try {
    // Determine resource type. Floor plans/photos use 'image', brochures use 'image' (Cloudinary PDF handling)
    // Actually, Cloudinary PDF uploads typically use resource_type: 'image'.
    // If it was 'raw' or 'video', we would have stored it.
    
    const result = await getCloudinary().uploader.destroy(asset.publicId, {
      resource_type: 'image', // We only support image/pdf in this app currently
      invalidate: true,       // Request CDN invalidation as requested
    });

    if (result.result === 'ok' || result.result === 'not found') {
      const finalAsset: Partial<ManagedAsset> = {
        status: 'deleted',
        deletedAt: nowIso,
        deletionError: null,
      };
      await assetRef.update(finalAsset);
      return { ...asset, ...finalAsset } as ManagedAsset;
    } else {
      throw new Error(result.result || 'Unknown Cloudinary error');
    }
  } catch (err: any) {
    console.error(`[Cloudinary Deletion Error] ${assetId}:`, err.message);
    const errorAsset: Partial<ManagedAsset> = {
      status: 'deletion_error',
      deletionError: err.message || 'Cloudinary API failure',
    };
    await assetRef.update(errorAsset);
    return { ...asset, ...errorAsset } as ManagedAsset;
  }
}
