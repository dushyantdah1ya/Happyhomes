import { v2 as cloudinary } from 'cloudinary';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from './firebaseAdmin.ts';
import {
  type DevelopmentPhoto,
  type DevelopmentFloorPlan,
  type DevelopmentBrochure,
  type PhotoLabel,
  getOptimizedImageUrl,
} from '../types/development.ts';

export type UploadPurpose = 'gallery' | 'floor_plan' | 'brochure';

function getDb() {
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

/**
 * Checks whether all required Cloudinary environment credentials are set.
 * Never logs or prints secrets.
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * Configures the Cloudinary Node SDK instance with server secrets.
 */
function ensureCloudinaryConfig() {
  if (!isCloudinaryConfigured()) {
    const error: any = new Error(
      'Cloudinary media storage is not configured yet. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in AI Studio environment secrets.'
    );
    error.statusCode = 503;
    error.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// In-memory verification cache to avoid calling Cloudinary Admin API on every request or cold-start
const presetCache = new Map<string, {
  verified: boolean;
  name: string;
  allowedFormats: string[];
  overwriteDisabled: boolean;
  timestamp: number;
}>();

/**
 * Verifies and programmatically ensures that an upload preset enforces its required allowed_formats
 * and overwrite=false, preserving all other preset settings. Caches verification in memory.
 */
export async function verifyAndEnsureCloudinaryPreset(
  presetName: string,
  requiredFormats: string[] = ['jpg', 'jpeg', 'png', 'webp']
): Promise<{
  verified: boolean;
  name: string;
  allowedFormats: string[];
  overwriteDisabled: boolean;
}> {
  ensureCloudinaryConfig();

  const cached = presetCache.get(presetName);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5-minute memory cache
    return cached;
  }

  try {
    let preset: any;
    try {
      preset = await cloudinary.api.upload_preset(presetName);
    } catch (notFoundErr: any) {
      // If preset doesn't exist, create it programmatically with signed settings
      if (
        notFoundErr.error &&
        (notFoundErr.error.http_code === 404 ||
          String(notFoundErr.error.message || '').toLowerCase().includes('not find') ||
          String(notFoundErr.error.message || '').toLowerCase().includes("can't find"))
      ) {
        await cloudinary.api.create_upload_preset({
          name: presetName,
          unsigned: false,
          allowed_formats: requiredFormats.join(','),
          overwrite: false,
        });
        const result = {
          verified: true,
          name: presetName,
          allowedFormats: requiredFormats,
          overwriteDisabled: true,
          timestamp: Date.now(),
        };
        presetCache.set(presetName, result);
        return result;
      }
      throw notFoundErr;
    }

    const settings = preset.settings || {};
    const existingFormats = Array.isArray(settings.allowed_formats)
      ? settings.allowed_formats
      : typeof settings.allowed_formats === 'string'
      ? settings.allowed_formats.split(',')
      : [];

    const hasAll = requiredFormats.every((fmt) => existingFormats.includes(fmt));

    if (!hasAll || settings.overwrite !== false) {
      await cloudinary.api.update_upload_preset(presetName, {
        ...settings,
        allowed_formats: requiredFormats.join(','),
        overwrite: false,
      });
      const result = {
        verified: true,
        name: presetName,
        allowedFormats: requiredFormats,
        overwriteDisabled: true,
        timestamp: Date.now(),
      };
      presetCache.set(presetName, result);
      return result;
    }

    const result = {
      verified: true,
      name: presetName,
      allowedFormats: existingFormats,
      overwriteDisabled: settings.overwrite === false,
      timestamp: Date.now(),
    };
    presetCache.set(presetName, result);
    return result;
  } catch (err: any) {
    console.error(`[Cloudinary Preset Verification Error (${presetName})]`, err.message);
    return {
      verified: false,
      name: presetName,
      allowedFormats: [],
      overwriteDisabled: false,
    };
  }
}

/**
 * Safe public configuration status for owner administration.
 * Verifies live connectivity and preset constraints without exposing credentials.
 */
export async function getCloudinaryPublicConfig(): Promise<{
  isConfigured: boolean;
  cloudName: string | null;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasPreset: boolean;
  presetName: string | null;
  documentPresetName: string | null;
  connected: boolean;
  presetVerified: boolean;
  documentPresetVerified: boolean;
  allowedFormats: string[];
  documentAllowedFormats: string[];
  overwriteDisabled: boolean;
}> {
  const configured = isCloudinaryConfigured();
  if (!configured) {
    return {
      isConfigured: false,
      cloudName: null,
      hasApiKey: false,
      hasApiSecret: false,
      hasPreset: false,
      presetName: null,
      documentPresetName: null,
      connected: false,
      presetVerified: false,
      documentPresetVerified: false,
      allowedFormats: [],
      documentAllowedFormats: [],
      overwriteDisabled: false,
    };
  }

  const presetName = process.env.CLOUDINARY_UPLOAD_PRESET || 'happy_homes_photos';
  const docPresetName = process.env.CLOUDINARY_DOCUMENT_UPLOAD_PRESET || 'happy_homes_documents';
  let connected = false;
  let presetVerified = false;
  let docPresetVerified = false;
  let allowedFormats: string[] = [];
  let docAllowedFormats: string[] = [];
  let overwriteDisabled = false;

  try {
    ensureCloudinaryConfig();
    const ping = await cloudinary.api.ping();
    connected = ping?.status === 'ok';

    if (presetName) {
      const photoStatus = await verifyAndEnsureCloudinaryPreset(presetName, ['jpg', 'jpeg', 'png', 'webp']);
      presetVerified = photoStatus.verified;
      allowedFormats = photoStatus.allowedFormats;
      overwriteDisabled = photoStatus.overwriteDisabled;
    }

    if (docPresetName) {
      const docStatus = await verifyAndEnsureCloudinaryPreset(docPresetName, ['pdf']);
      docPresetVerified = docStatus.verified;
      docAllowedFormats = docStatus.allowedFormats;
    }
  } catch (err) {
    console.error('[Cloudinary Ping/Preset Check Error]', err);
  }

  return {
    isConfigured: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
    hasPreset: Boolean(presetName),
    presetName,
    documentPresetName: docPresetName,
    connected,
    presetVerified,
    documentPresetVerified: docPresetVerified,
    allowedFormats,
    documentAllowedFormats: docAllowedFormats,
    overwriteDisabled,
  };
}

export interface SignUploadOptions {
  purpose?: UploadPurpose;
  format?: string; // 'pdf' | 'jpg' | 'jpeg' | 'png' | 'webp'
  label?: PhotoLabel;
  altText?: string;
  sortOrder?: number;
  planTitle?: string;
  planFloor?: string;
  configurationId?: string;
  brochureTitle?: string;
  brochureEditionDate?: string;
}

export interface SignedUploadPayload {
  intentId: string;
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId: string;
  overwrite: boolean;
  uploadPreset?: string;
  purpose: UploadPurpose;
}

/**
 * Generates a signed direct upload intent for a specific development.
 * Scopes the asset public_id to the development and signs ONLY server-approved parameters.
 */
export async function createUploadIntent(
  actorUid: string,
  developmentId: string,
  options: SignUploadOptions = {}
): Promise<SignedUploadPayload> {
  ensureCloudinaryConfig();

  if (!developmentId || developmentId === 'new') {
    const error: any = new Error(
      'A saved development ID is required. Please save the development overview first before uploading media.'
    );
    error.statusCode = 400;
    throw error;
  }

  const db = getDb();
  const draftRef = db.collection('developments_drafts').doc(developmentId);
  const draftDoc = await draftRef.get();

  if (!draftDoc.exists) {
    const error: any = new Error('Development record not found');
    error.statusCode = 404;
    throw error;
  }

  const draft = draftDoc.data();
  const purpose: UploadPurpose = options.purpose || 'gallery';

  let assetId = '';
  let folder = '';
  let preset = '';
  const timestamp = Math.floor(Date.now() / 1000);

  if (purpose === 'gallery') {
    const existingPhotos = Array.isArray(draft?.photos) ? draft.photos : [];
    if (existingPhotos.length >= 20) {
      const error: any = new Error('Maximum limit of 20 photographs per development reached.');
      error.statusCode = 400;
      throw error;
    }
    assetId = `ph_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    folder = `happy-homes/${developmentId}/photos`;
    preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'happy_homes_photos';
  } else if (purpose === 'floor_plan') {
    const existingPlans = Array.isArray(draft?.plans) ? draft.plans : [];
    if (existingPlans.length >= 10) {
      const error: any = new Error('Maximum limit of 10 floor plans per development reached.');
      error.statusCode = 400;
      throw error;
    }
    const isPdf = Boolean(options.format && options.format.toLowerCase() === 'pdf');
    assetId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    folder = `happy-homes/${developmentId}/plans`;
    preset = isPdf
      ? (process.env.CLOUDINARY_DOCUMENT_UPLOAD_PRESET || 'happy_homes_documents')
      : (process.env.CLOUDINARY_UPLOAD_PRESET || 'happy_homes_photos');
  } else if (purpose === 'brochure') {
    assetId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    folder = `happy-homes/${developmentId}/brochure`;
    preset = process.env.CLOUDINARY_DOCUMENT_UPLOAD_PRESET || 'happy_homes_documents';
  } else {
    const error: any = new Error(`Invalid upload purpose: ${purpose}`);
    error.statusCode = 400;
    throw error;
  }

  // Exact server-approved parameters to sign. Cloudinary uses image resource type for PDFs.
  const paramsToSign: Record<string, any> = {
    folder,
    overwrite: false,
    public_id: assetId,
    timestamp,
  };

  if (preset) {
    paramsToSign.upload_preset = preset;
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  const intentId = `intent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const intentRecord: Record<string, any> = {
    id: intentId,
    developmentId,
    assetId,
    fullPublicId: `${folder}/${assetId}`,
    publicId: assetId,
    folder,
    purpose,
    status: 'pending',
    actorUid,
    preset,
    label: options.label || 'Actual photograph',
    altText: (options.altText || '').trim().slice(0, 200),
    sortOrder: typeof options.sortOrder === 'number' ? options.sortOrder : 0,
    planTitle: options.planTitle ? options.planTitle.trim().slice(0, 100) : null,
    planFloor: options.planFloor ? options.planFloor.trim().slice(0, 50) : null,
    configurationId: options.configurationId || null,
    brochureTitle: options.brochureTitle ? options.brochureTitle.trim().slice(0, 150) : null,
    brochureEditionDate: options.brochureEditionDate ? options.brochureEditionDate.trim().slice(0, 50) : null,
    timestamp,
    createdAt: new Date().toISOString(),
  };

  await db.collection('media_upload_intents').doc(intentId).set(intentRecord);

  return {
    intentId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    publicId: assetId,
    overwrite: false,
    uploadPreset: preset || undefined,
    purpose,
  };
}

export interface FinalizeResult {
  photo?: DevelopmentPhoto;
  plan?: DevelopmentFloorPlan;
  brochure?: DevelopmentBrochure;
  purpose: UploadPurpose;
}

/**
 * Finalizes an upload intent by authenticating directly with Cloudinary's server API.
 * Verifies format, dimensions, size, and identity before saving to managed_assets.
 * Idempotent: repeated calls with the same intentId return the verified asset safely.
 */
export async function finalizeUploadIntent(
  actorUid: string,
  intentId: string,
  developmentId: string
): Promise<FinalizeResult & DevelopmentPhoto> {
  ensureCloudinaryConfig();

  const db = getDb();
  const intentRef = db.collection('media_upload_intents').doc(intentId);
  const intentDoc = await intentRef.get();

  if (!intentDoc.exists) {
    const error: any = new Error('Upload intent not found');
    error.statusCode = 404;
    throw error;
  }

  const intent = intentDoc.data()!;

  // Strict cross-development containment check
  if (intent.developmentId !== developmentId) {
    const error: any = new Error('Upload intent does not belong to the requested development.');
    error.statusCode = 403;
    throw error;
  }

  // Idempotency: return existing asset if already verified and finalized
  if (intent.status === 'finalized' && intent.finalizedAsset) {
    return intent.finalizedAsset;
  }
  if (intent.status === 'finalized' && intent.photo) {
    return {
      photo: intent.photo,
      purpose: 'gallery',
      ...(intent.photo as DevelopmentPhoto),
    };
  }

  if (intent.status !== 'pending') {
    const error: any = new Error(`Upload intent is in invalid state: ${intent.status}`);
    error.statusCode = 400;
    throw error;
  }

  const purpose: UploadPurpose = intent.purpose || 'gallery';

  // Query Cloudinary Admin / Resource API with server credentials
  let resource: any;
  try {
    resource = await cloudinary.api.resource(intent.fullPublicId, {
      resource_type: 'image',
    });
  } catch (err: any) {
    console.error('[Cloudinary Resource Lookup Error]', err);
    const error: any = new Error(
      'Failed to verify uploaded asset on Cloudinary. Asset might not have completed direct upload.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Strict server-side verification of resource attributes
  if (resource.resource_type !== 'image') {
    const error: any = new Error('Asset resource type must be an image/document.');
    error.statusCode = 400;
    throw error;
  }

  const format = String(resource.format || '').toLowerCase();

  // Validate format based on purpose
  if (purpose === 'gallery') {
    const allowedPhotoFormats = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedPhotoFormats.includes(format)) {
      const error: any = new Error(
        `Unsupported photo format: ${format}. Gallery photographs must be JPEG, PNG, or WebP.`
      );
      error.statusCode = 400;
      throw error;
    }
  } else if (purpose === 'floor_plan') {
    const allowedPlanFormats = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!allowedPlanFormats.includes(format)) {
      const error: any = new Error(
        `Unsupported floor plan format: ${format}. Floor plans must be JPEG, PNG, WebP, or PDF.`
      );
      error.statusCode = 400;
      throw error;
    }
  } else if (purpose === 'brochure') {
    if (format !== 'pdf') {
      const error: any = new Error(
        `Unsupported brochure format: ${format}. The development brochure must be a PDF document.`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Reject unprocessable or password-protected PDFs
  if (format === 'pdf') {
    if (resource.pages === 0 || resource.error) {
      const error: any = new Error(
        'The uploaded PDF could not be processed. Password-protected or unprocessable PDF files are rejected.'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Enforce 10 MiB limit
  if (typeof resource.bytes === 'number' && resource.bytes > 10 * 1024 * 1024) {
    const error: any = new Error(
      `Uploaded file exceeds maximum allowed size of 10 MB (${(resource.bytes / (1024 * 1024)).toFixed(2)} MB).`
    );
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();

  let finalizedResult: any;

  if (purpose === 'gallery') {
    const photo: DevelopmentPhoto = {
      id: intent.assetId,
      cloudinaryPublicId: resource.public_id,
      url: getOptimizedImageUrl(resource.secure_url),
      secureUrl: resource.secure_url,
      width: Number(resource.width) || 0,
      height: Number(resource.height) || 0,
      format,
      bytes: Number(resource.bytes) || 0,
      altText: intent.altText || '',
      label: (intent.label as PhotoLabel) || 'Actual photograph',
      isCover: false,
      sortOrder: intent.sortOrder ?? 0,
      version: typeof resource.version === 'number' ? resource.version : null,
      createdAt: now,
    };
    finalizedResult = {
      ...photo,
      photo,
      purpose: 'gallery',
    };
  } else if (purpose === 'floor_plan') {
    const isPdf = format === 'pdf';
    const plan: DevelopmentFloorPlan = {
      id: intent.assetId,
      title: intent.planTitle || 'Floor Plan',
      floor: intent.planFloor || null,
      configurationId: intent.configurationId || null,
      assetType: isPdf ? 'pdf' : 'image',
      cloudinaryPublicId: resource.public_id,
      url: isPdf ? resource.secure_url : getOptimizedImageUrl(resource.secure_url),
      secureUrl: resource.secure_url,
      format,
      bytes: Number(resource.bytes) || 0,
      width: isPdf ? null : (Number(resource.width) || null),
      height: isPdf ? null : (Number(resource.height) || null),
      sortOrder: intent.sortOrder ?? 0,
      createdAt: now,
    };
    finalizedResult = {
      plan,
      purpose: 'floor_plan',
    };
  } else if (purpose === 'brochure') {
    const brochure: DevelopmentBrochure = {
      assetId: intent.assetId,
      title: intent.brochureTitle || 'Official Project Brochure',
      editionDate: intent.brochureEditionDate || null,
      cloudinaryPublicId: resource.public_id,
      url: resource.secure_url,
      secureUrl: resource.secure_url,
      format: 'pdf',
      bytes: Number(resource.bytes) || 0,
      createdAt: now,
    };
    finalizedResult = {
      brochure,
      purpose: 'brochure',
    };
  }

  // Record asset in private managed_assets collection for tracking & future cleanup
  await db.collection('managed_assets').doc(intent.assetId).set({
    assetId: intent.assetId,
    developmentId: intent.developmentId,
    purpose,
    publicId: resource.public_id,
    secureUrl: resource.secure_url,
    width: resource.width || null,
    height: resource.height || null,
    format,
    bytes: resource.bytes,
    version: typeof resource.version === 'number' ? resource.version : null,
    status: 'unattached',
    actorUid,
    createdAt: now,
  });

  // Mark intent as finalized with the verified payload
  await intentRef.update({
    status: 'finalized',
    finalizedAt: now,
    finalizedAsset: finalizedResult,
    photo: finalizedResult.photo || null,
  });

  return finalizedResult;
}

