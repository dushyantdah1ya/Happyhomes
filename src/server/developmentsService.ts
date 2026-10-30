import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from './firebaseAdmin.ts';
import {
  type DevelopmentDraft,
  type DevelopmentPublic,
  type PublicationStatus,
  type DevelopmentType,
  type PriceMode,
  type AvailabilityStatus,
  type ConstructionStage,
  type SpecificationGroup,
  type DevelopmentConfiguration,
  type DevelopmentLocation,
  type DevelopmentLocationPublic,
  type ProgressUpdate,
  type ProgressUpdatePublic,
  type DevelopmentPhoto,
  type DevelopmentPhotoPublic,
  type DevelopmentFloorPlan,
  type DevelopmentFloorPlanPublic,
  type DevelopmentBrochure,
  type DevelopmentBrochurePublic,
  type PhotoLabel,
  type ManagedAsset,
  generateSlug,
  formatPriceDisplay,
} from '../types/development.ts';
import { projectPublicDevelopment } from '../utils/publicProjection.ts';

function sanitizeSpecifications(groups: any): SpecificationGroup[] {
  if (!Array.isArray(groups)) return [];
  return groups.slice(0, 10).map((g, gIdx) => ({
    id: String(g.id || `spec_g_${gIdx}_${Date.now()}`),
    title: String(g.title || '').trim().slice(0, 100),
    items: Array.isArray(g.items)
      ? g.items.slice(0, 20).map((item: any, iIdx: number) => ({
          id: String(item.id || `spec_i_${iIdx}_${Date.now()}`),
          label: String(item.label || '').trim().slice(0, 100),
          value: String(item.value || '').trim().slice(0, 500),
          type: item.type === 'optional_extra' ? 'optional_extra' : 'inclusion',
        }))
      : [],
  }));
}

function sanitizeConfigurations(configs: any): DevelopmentConfiguration[] {
  if (!Array.isArray(configs)) return [];
  return configs.slice(0, 25).map((c, cIdx) => {
    const priceMode = (c.priceMode as PriceMode) || null;
    const priceAmount = typeof c.priceAmount === 'number' && c.priceAmount > 0 ? c.priceAmount : null;
    return {
      id: String(c.id || `cfg_${cIdx}_${Date.now()}`),
      label: String(c.label || '').trim().slice(0, 100),
      floor: c.floor && String(c.floor).trim() ? String(c.floor).trim().slice(0, 50) : null,
      bedrooms: typeof c.bedrooms === 'number' && c.bedrooms > 0 ? c.bedrooms : null,
      area: c.area && typeof c.area.value === 'number' && c.area.value > 0
        ? {
            value: c.area.value,
            definition: c.area.definition || 'built-up',
            unit: c.area.unit || 'sq ft',
          }
        : null,
      availability: (c.availability as AvailabilityStatus) || 'Available',
      priceMode,
      priceAmount,
      priceDisplay: priceMode ? formatPriceDisplay(priceMode, priceAmount) : null,
    };
  });
}

export function sanitizeFloorPlans(
  plans: any,
  configurations: DevelopmentConfiguration[] = []
): DevelopmentFloorPlan[] {
  if (!Array.isArray(plans)) return [];
  const validConfigIds = new Set(configurations.map((c) => c.id));

  const sanitized: DevelopmentFloorPlan[] = plans.slice(0, 10).map((p: any, idx: number) => {
    const format = String(p.format || 'jpg').trim().toLowerCase();
    const isPdf = format === 'pdf' || p.assetType === 'pdf';
    const configId = p.configurationId && validConfigIds.has(String(p.configurationId))
      ? String(p.configurationId)
      : null;

    return {
      id: String(p.id || `plan_${idx}_${Date.now()}`),
      title: String(p.title || 'Floor Plan').trim().slice(0, 100),
      floor: p.floor && String(p.floor).trim() ? String(p.floor).trim().slice(0, 50) : null,
      configurationId: configId,
      assetType: isPdf ? 'pdf' : 'image',
      cloudinaryPublicId: String(p.cloudinaryPublicId || '').trim(),
      url: String(p.url || p.secureUrl || '').trim(),
      secureUrl: String(p.secureUrl || p.url || '').trim(),
      format,
      bytes: typeof p.bytes === 'number' && p.bytes > 0 ? p.bytes : 0,
      width: isPdf ? null : (typeof p.width === 'number' && p.width > 0 ? p.width : null),
      height: isPdf ? null : (typeof p.height === 'number' && p.height > 0 ? p.height : null),
      sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : idx,
      createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
    };
  });

  sanitized.sort((a, b) => a.sortOrder - b.sortOrder);
  return sanitized;
}

/**
 * Extracts all unique managed asset IDs referenced by a development (draft or public).
 */
export function getAllReferencedAssetIds(dev: Partial<DevelopmentDraft | DevelopmentPublic>): string[] {
  const ids = new Set<string>();

  // 1. Gallery photos
  if (Array.isArray(dev.photos)) {
    dev.photos.forEach((p) => {
      if (p.id) ids.add(p.id);
    });
  }

  // 2. Floor plans
  if (Array.isArray(dev.plans)) {
    dev.plans.forEach((p) => {
      if (p.id) ids.add(p.id);
    });
  }

  // 3. Brochure
  if (dev.brochure && dev.brochure.assetId) {
    ids.add(dev.brochure.assetId);
  }

  // 4. Progress update photos
  if (Array.isArray(dev.progress)) {
    dev.progress.forEach((prog) => {
      if (Array.isArray(prog.photoIds)) {
        prog.photoIds.forEach((pid) => {
          if (pid) ids.add(pid);
        });
      }
    });
  }

  return Array.from(ids);
}

/**
 * Transactional helper to reconcile asset statuses based on current and new references.
 * Marks newly attached assets as 'attached' and newly detached ones as 'detached'.
 * Rejects attachment of any asset that is marked for deletion or already deleted.
 */
export async function reconcileAssetStatuses(
  transaction: FirebaseFirestore.Transaction,
  developmentId: string,
  currentAssetIds: string[],
  proposedAssetIds: string[]
): Promise<void> {
  const db = getDb();
  const currentSet = new Set(currentAssetIds);
  const proposedSet = new Set(proposedAssetIds);

  // We only care about assets registered for this development in managed_assets
  const assetsQuery = db.collection('managed_assets').where('developmentId', '==', developmentId);
  const assetsSnap = await transaction.get(assetsQuery);

  const now = new Date().toISOString();

  for (const assetDoc of assetsSnap.docs) {
    const assetId = assetDoc.id;
    const asset = assetDoc.data() as ManagedAsset;
    const isProposed = proposedSet.has(assetId);
    const isCurrentlyAttached = currentSet.has(assetId);

    if (isProposed) {
      // Trying to attach/retain an asset
      if (asset.status === 'deletion_pending' || asset.status === 'deleted' || asset.status === 'deletion_error') {
        throw new Error(`Critical race condition: Asset ${assetId} is unavailable for attachment (Status: ${asset.status}).`);
      }
      if (asset.status !== 'attached') {
        transaction.update(assetDoc.ref, {
          status: 'attached',
          detachedAt: null,
          updatedAt: now
        });
      }
    } else if (isCurrentlyAttached) {
      // Asset was attached but is no longer in the proposed set
      if (asset.status === 'attached') {
        transaction.update(assetDoc.ref, {
          status: 'detached',
          detachedAt: now,
          updatedAt: now
        });
      }
    }
  }
}

export function sanitizeBrochure(brochure: any): DevelopmentBrochure | null {
  if (!brochure || typeof brochure !== 'object') return null;
  const secureUrl = String(brochure.secureUrl || brochure.url || '').trim();
  const cloudinaryPublicId = String(brochure.cloudinaryPublicId || '').trim();
  if (!secureUrl || !cloudinaryPublicId) return null;

  return {
    assetId: String(brochure.assetId || `doc_${Date.now()}`).trim(),
    title: String(brochure.title || 'Official Project Brochure').trim().slice(0, 150),
    editionDate: brochure.editionDate && String(brochure.editionDate).trim()
      ? String(brochure.editionDate).trim().slice(0, 50)
      : null,
    cloudinaryPublicId,
    url: secureUrl,
    secureUrl,
    format: 'pdf',
    bytes: typeof brochure.bytes === 'number' && brochure.bytes > 0 ? brochure.bytes : 0,
    createdAt: brochure.createdAt ? String(brochure.createdAt) : new Date().toISOString(),
  };
}


function sanitizeLocation(loc: any): DevelopmentLocation | null {
  if (!loc || typeof loc !== 'object') return null;

  const address = loc.address && String(loc.address).trim() ? String(loc.address).trim().slice(0, 300) : null;

  let coordinates: { latitude: number; longitude: number } | null = null;
  if (loc.coordinates && typeof loc.coordinates.latitude === 'number' && typeof loc.coordinates.longitude === 'number') {
    const lat = loc.coordinates.latitude;
    const lng = loc.coordinates.longitude;
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      coordinates = { latitude: lat, longitude: lng };
    }
  }

  let directionsUrl: string | null = null;
  if (typeof loc.directionsUrl === 'string' && loc.directionsUrl.trim().startsWith('https://')) {
    directionsUrl = loc.directionsUrl.trim().slice(0, 500);
  }

  const nearbyPlaces = Array.isArray(loc.nearbyPlaces)
    ? loc.nearbyPlaces.slice(0, 25).map((p: any, pIdx: number) => ({
        id: String(p.id || `place_${pIdx}_${Date.now()}`),
        name: String(p.name || '').trim().slice(0, 100),
        category: String(p.category || 'Civic').trim().slice(0, 50),
        distanceValue: typeof p.distanceValue === 'number' && p.distanceValue >= 0 ? p.distanceValue : null,
        distanceUnit: p.distanceUnit ? String(p.distanceUnit).trim().slice(0, 20) : 'km',
        status: p.status === 'Proposed / Upcoming' ? 'Proposed / Upcoming' : 'Existing',
        sourceNote: p.sourceNote && String(p.sourceNote).trim() ? String(p.sourceNote).trim().slice(0, 500) : null,
        isPublicSourceNote: Boolean(p.isPublicSourceNote),
        checkedDate: p.checkedDate && String(p.checkedDate).trim() ? String(p.checkedDate).trim().slice(0, 20) : null,
      }))
    : [];

  const isCompletelyBlank = !address && !coordinates && !directionsUrl && nearbyPlaces.length === 0;
  if (isCompletelyBlank) {
    return null;
  }

  return {
    address,
    coordinates,
    directionsUrl,
    nearbyPlaces,
  };
}

export function sanitizeProgress(updates: any, availablePhotos: DevelopmentPhoto[] = []): ProgressUpdate[] {
  if (!Array.isArray(updates)) return [];
  const validPhotoIds = new Set(availablePhotos.map((p) => p.id));

  return updates.slice(0, 25).map((u, uIdx) => {
    let photoIds: string[] = [];
    if (Array.isArray(u.photoIds)) {
      const uniqueIds: string[] = Array.from(
        new Set<string>(
          u.photoIds
            .map((pid: any) => String(pid).trim())
            .filter((pid: string) => pid.length > 0 && (validPhotoIds.size === 0 || validPhotoIds.has(pid)))
        )
      );
      photoIds = uniqueIds.slice(0, 6);
    }

    return {
      id: String(u.id || `prog_${uIdx}_${Date.now()}`),
      date: String(u.date || new Date().toISOString().slice(0, 10)).trim().slice(0, 20),
      title: String(u.title || '').trim().slice(0, 100),
      stage: u.stage === 'Future planned activity' ? 'Future planned activity' : 'Completed work',
      description: String(u.description || '').trim().slice(0, 1000),
      photoIds,
    };
  });
}

function sanitizePhotos(photos: any): DevelopmentPhoto[] {
  if (!Array.isArray(photos)) return [];
  const sanitized: DevelopmentPhoto[] = photos.slice(0, 20).map((p: any, idx: number) => ({
    id: String(p.id || `ph_${idx}_${Date.now()}`),
    cloudinaryPublicId: String(p.cloudinaryPublicId || '').trim(),
    url: String(p.url || p.secureUrl || '').trim(),
    secureUrl: String(p.secureUrl || p.url || '').trim(),
    width: typeof p.width === 'number' && p.width > 0 ? p.width : 0,
    height: typeof p.height === 'number' && p.height > 0 ? p.height : 0,
    format: String(p.format || 'jpg').trim().toLowerCase(),
    bytes: typeof p.bytes === 'number' && p.bytes > 0 ? p.bytes : 0,
    altText: String(p.altText || '').trim().slice(0, 200),
    label: (p.label === 'Architectural visualization' ? 'Architectural visualization' : 'Actual photograph') as PhotoLabel,
    isCover: Boolean(p.isCover),
    sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : idx,
    version: typeof p.version === 'number' ? p.version : null,
    createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
  }));

  sanitized.sort((a, b) => a.sortOrder - b.sortOrder);

  if (sanitized.length > 0) {
    const hasCover = sanitized.some((p) => p.isCover);
    if (!hasCover) {
      sanitized[0].isCover = true;
    } else {
      let coverFound = false;
      for (const p of sanitized) {
        if (p.isCover) {
          if (!coverFound) {
            coverFound = true;
          } else {
            p.isCover = false;
          }
        }
      }
    }
  }

  return sanitized;
}

/**
 * Recursively inspects an object to ensure no `undefined` values exist.
 * Replaces any undefined with null, while preserving valid false, 0, "", and [].
 */
export function cleanUndefinedRecursively<T>(val: T): T {
  if (val === undefined) {
    return null as any;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => cleanUndefinedRecursively(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v === undefined) {
      result[k] = null;
    } else {
      result[k] = cleanUndefinedRecursively(v);
    }
  }
  return result as T;
}

/**
 * Validates that an object contains absolutely no `undefined` values at any nesting level.
 * Throws an explicit error if any undefined is found.
 */
export function assertNoUndefinedInDocument(obj: any, path = ''): void {
  if (obj === undefined) {
    throw new Error(`Persistence invariant violation: undefined found at path "${path}"`);
  }
  if (obj === null || typeof obj !== 'object') {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertNoUndefinedInDocument(item, `${path}[${idx}]`));
    return;
  }
  for (const [key, value] of Object.entries(obj)) {
    assertNoUndefinedInDocument(value, path ? `${path}.${key}` : key);
  }
}

/**
 * Schema-aware normalization for DevelopmentDraft before Firestore write.
 * Guarantees every optional field is a Firestore-safe value (null, never undefined).
 */
export function normalizeDraftForPersistence(draft: DevelopmentDraft): DevelopmentDraft {
  const normalized: DevelopmentDraft = {
    id: draft.id,
    slug: draft.slug,
    name: draft.name,
    type: draft.type,
    locality: draft.locality,
    shortDescription: draft.shortDescription,
    priceMode: draft.priceMode,
    priceAmount: typeof draft.priceAmount === 'number' && draft.priceAmount > 0 ? draft.priceAmount : null,
    availability: draft.availability,
    constructionStage: draft.constructionStage,
    area: draft.area
      ? {
          value: typeof draft.area.value === 'number' ? draft.area.value : null,
          definition: draft.area.definition || 'built-up',
          unit: draft.area.unit || 'sq ft',
        }
      : null,
    bedrooms: typeof draft.bedrooms === 'number' ? draft.bedrooms : null,
    image: draft.image
      ? {
          url: draft.image.url || '',
          altText: draft.image.altText || '',
          label: draft.image.label || 'Representative image',
        }
      : null,
    photos: Array.isArray(draft.photos) ? draft.photos : [],
    plans: Array.isArray(draft.plans) ? draft.plans : [],
    brochure: draft.brochure || null,
    specifications: Array.isArray(draft.specifications) ? draft.specifications : [],
    configurations: Array.isArray(draft.configurations) ? draft.configurations : [],
    location: draft.location
      ? {
          address: draft.location.address && draft.location.address.trim() ? draft.location.address.trim() : null,
          coordinates: draft.location.coordinates && typeof draft.location.coordinates.latitude === 'number' && typeof draft.location.coordinates.longitude === 'number'
            ? {
                latitude: draft.location.coordinates.latitude,
                longitude: draft.location.coordinates.longitude,
              }
            : null,
          directionsUrl: draft.location.directionsUrl && draft.location.directionsUrl.trim() ? draft.location.directionsUrl.trim() : null,
          nearbyPlaces: Array.isArray(draft.location.nearbyPlaces) ? draft.location.nearbyPlaces : [],
        }
      : null,
    progress: Array.isArray(draft.progress) ? draft.progress : [],
    status: draft.status || 'draft',
    version: draft.version || 1,
    hasUnpublishedChanges: Boolean(draft.hasUnpublishedChanges),
    publishedSlug: draft.publishedSlug || null,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    publishedAt: draft.publishedAt || null,
    lastModifiedBy: draft.lastModifiedBy,
    lastAvailabilityCheck: draft.lastAvailabilityCheck || null,
    lastBrochureReview: draft.lastBrochureReview || null,
    publishedVersion: draft.publishedVersion || null,
  };

  return cleanUndefinedRecursively(normalized);
}

/**
 * Schema-aware normalization for DevelopmentPublic before Firestore write.
 */
export function normalizePublicSnapshotForPersistence(snapshot: DevelopmentPublic): DevelopmentPublic {
  const normalized: DevelopmentPublic = {
    id: snapshot.id,
    slug: snapshot.slug,
    name: snapshot.name,
    type: snapshot.type,
    locality: snapshot.locality,
    shortDescription: snapshot.shortDescription,
    priceMode: snapshot.priceMode,
    priceAmount: typeof snapshot.priceAmount === 'number' && snapshot.priceAmount > 0 ? snapshot.priceAmount : null,
    priceDisplay: snapshot.priceDisplay || 'Price on Request',
    availability: snapshot.availability,
    constructionStage: snapshot.constructionStage,
    area: snapshot.area || null,
    bedrooms: typeof snapshot.bedrooms === 'number' ? snapshot.bedrooms : null,
    image: snapshot.image || null,
    photos: Array.isArray(snapshot.photos) ? snapshot.photos : [],
    plans: Array.isArray(snapshot.plans) ? snapshot.plans : [],
    brochure: snapshot.brochure || null,
    specifications: Array.isArray(snapshot.specifications) ? snapshot.specifications : [],
    configurations: Array.isArray(snapshot.configurations) ? snapshot.configurations : [],
    location: snapshot.location
      ? {
          address: snapshot.location.address || null,
          coordinates: snapshot.location.coordinates || null,
          directionsUrl: snapshot.location.directionsUrl || null,
          nearbyPlaces: Array.isArray(snapshot.location.nearbyPlaces) ? snapshot.location.nearbyPlaces : [],
        }
      : null,
    progress: Array.isArray(snapshot.progress) ? snapshot.progress : [],
    publishedAt: snapshot.publishedAt,
    version: snapshot.version || 1,
  };

  return cleanUndefinedRecursively(normalized);
}

let dbOverride: any = null;
export function __test_setDb(db: any) { dbOverride = db; }

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

/**
 * Ensures slug is unique across drafts and public documents.
 */
async function ensureUniqueSlug(db: any, baseSlug: string, currentId?: string): Promise<string> {
  let candidate = baseSlug || 'development';
  let counter = 1;

  while (true) {
    const draftQuery = await db.collection('developments_drafts')
      .where('slug', '==', candidate)
      .limit(1)
      .get();

    let conflict = false;
    if (!draftQuery.empty) {
      const doc = draftQuery.docs[0];
      if (doc.id !== currentId) {
        conflict = true;
      }
    }

    if (!conflict) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export interface DevelopmentAdminFilter {
  status?: PublicationStatus;
  needsReview?: 'availability' | 'brochure';
}

/**
 * List all development drafts for authorized owner console with optional filtering.
 */
export async function listAdminDevelopments(filter: DevelopmentAdminFilter = {}): Promise<DevelopmentDraft[]> {
  const db = getDb();
  let query: any = db.collection('developments_drafts');

  if (filter.status) {
    query = query.where('status', '==', filter.status);
  } else if (filter.needsReview) {
    // Optimization: Review eligibility is strictly limited to published records
    query = query.where('status', '==', 'published');
  }

  const snapshot = await query.get();
  let list: DevelopmentDraft[] = [];

  snapshot.forEach((doc: any) => {
    list.push(doc.data() as DevelopmentDraft);
  });

  // Handle "Needs Review" filter in memory to reuse dashboard logic accurately
  if (filter.needsReview) {
    // Fetch public snapshot IDs to establish ground-truth publication, not just the draft label
    const publicSnap = await db.collection('developments_public').select('id').get();
    const publicIds = new Set(publicSnap.docs.map(d => d.data().id));

    const { getBusinessSettings } = await import('./settingsService.ts');
    const settings = await getBusinessSettings();
    const availInterval = settings.operationalSettings?.availabilityReviewIntervalDays || 30;
    const brochureInterval = settings.operationalSettings?.brochureReviewIntervalDays || 90;

    const now = new Date();
    const availThreshold = new Date(now.getTime() - availInterval * 24 * 60 * 60 * 1000).toISOString();
    const brochureThreshold = new Date(now.getTime() - brochureInterval * 24 * 60 * 60 * 1000).toISOString();

    list = list.filter(dev => {
      // Only developments with a genuine public presence need review
      if (!publicIds.has(dev.id)) return false;
      const pubVersion = dev.publishedVersion || 0;

      if (filter.needsReview === 'availability') {
        const lastAvail = dev.lastAvailabilityCheck;
        return !lastAvail || 
               typeof lastAvail === 'string' ||
               lastAvail.revision !== pubVersion || 
               lastAvail.timestamp <= availThreshold;
      } else {
        const lastBrochure = dev.lastBrochureReview;
        const currentAssetId = dev.brochure?.assetId || null;
        return !lastBrochure || 
               typeof lastBrochure === 'string' ||
               lastBrochure.revision !== pubVersion || 
               lastBrochure.assetId !== currentAssetId ||
               lastBrochure.timestamp <= brochureThreshold;
      }
    });
  }

  // Sort by updatedAt descending
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Retrieve single development draft by ID.
 */
export async function getAdminDevelopment(id: string): Promise<DevelopmentDraft | null> {
  const db = getDb();
  const doc = await db.collection('developments_drafts').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as DevelopmentDraft;
}

/**
 * Create a new development draft.
 * Transactional to ensure asset reference safety and race condition avoidance.
 */
export async function createDevelopmentDraft(
  actorUid: string,
  input: Partial<DevelopmentDraft>
): Promise<DevelopmentDraft> {
  const db = getDb();
  const id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  return await db.runTransaction(async (transaction) => {
    const name = (input.name || '').trim();
    const initialSlug = generateSlug(name || id);
    const slug = await ensureUniqueSlug(db, initialSlug, id);

    const configurations = input.configurations ? sanitizeConfigurations(input.configurations) : [];
    const photos = input.photos ? sanitizePhotos(input.photos) : [];
    const plans = input.plans ? sanitizeFloorPlans(input.plans, configurations) : [];
    const brochure = input.brochure !== undefined ? sanitizeBrochure(input.brochure) : null;
    const progress = input.progress ? sanitizeProgress(input.progress, photos) : [];

    let image = input.image || null;
    if (photos && photos.length > 0) {
      const cover = photos.find((p) => p.isCover) || photos[0];
      image = {
        url: cover.url || cover.secureUrl,
        altText: cover.altText || name,
        label: cover.label === 'Actual photograph' ? 'Actual photograph' : 'Architectural render',
      };
    }

    const draft: DevelopmentDraft = {
      id,
      slug,
      name,
      type: (input.type as DevelopmentType) || 'Villa',
      locality: (input.locality || '').trim(),
      shortDescription: (input.shortDescription || '').trim(),
      priceMode: (input.priceMode as PriceMode) || 'on_request',
      priceAmount: typeof input.priceAmount === 'number' && input.priceAmount > 0 ? input.priceAmount : null,
      availability: (input.availability as AvailabilityStatus) || 'Available',
      constructionStage: (input.constructionStage as ConstructionStage) || 'Planned',
      area: input.area || null,
      bedrooms: input.type === 'Residential Plot' ? null : (typeof input.bedrooms === 'number' ? input.bedrooms : null),
      image,
      photos,
      plans,
      brochure,
      specifications: input.specifications ? sanitizeSpecifications(input.specifications) : [],
      configurations,
      location: input.location !== undefined ? sanitizeLocation(input.location) : null,
      progress,
      status: 'draft',
      version: 1,
      hasUnpublishedChanges: false,
      publishedSlug: null,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      lastModifiedBy: actorUid,
      publishedVersion: null,
    };

    const proposedAssetIds = getAllReferencedAssetIds(draft);

    // Transactionally reconcile asset statuses
    // For a new draft, currentAssetIds is empty
    await reconcileAssetStatuses(transaction, id, [], proposedAssetIds);

    const normalized = normalizeDraftForPersistence(draft);
    assertNoUndefinedInDocument(normalized, 'createDevelopmentDraft');
    transaction.set(db.collection('developments_drafts').doc(id), normalized);
    
    return normalized;
  });
}

/**
 * Update an existing development draft with optimistic concurrency protection.
 * Transactional to ensure asset reference safety and race condition avoidance.
 */
export async function updateDevelopmentDraft(
  actorUid: string,
  id: string,
  input: Partial<DevelopmentDraft>,
  expectedVersion?: number
): Promise<DevelopmentDraft> {
  const db = getDb();

  return await db.runTransaction(async (transaction) => {
    const docRef = db.collection('developments_drafts').doc(id);
    const doc = await transaction.get(docRef);

    if (!doc.exists) {
      const error: any = new Error('Development not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = doc.data() as DevelopmentDraft;

    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      const error: any = new Error('Stale editor submission. The record was modified in another session.');
      error.statusCode = 409;
      throw error;
    }

    // Get public snapshot if it exists for combined reference check
    const publicRef = db.collection('developments_public').where('id', '==', id).limit(1);
    const publicSnap = await transaction.get(publicRef);
    const publicData = publicSnap.empty ? null : (publicSnap.docs[0].data() as DevelopmentPublic);

    const currentAssetIds = [
      ...getAllReferencedAssetIds(existing),
      ...(publicData ? getAllReferencedAssetIds(publicData) : [])
    ];

    const now = new Date().toISOString();
    let slug = existing.slug;

    // Once published, slug is kept fixed for consistency
    if (!existing.publishedSlug && input.slug && input.slug !== existing.slug) {
      const candidateSlug = generateSlug(input.slug);
      slug = await ensureUniqueSlug(db, candidateSlug, id);
    }

    const updatedType = (input.type as DevelopmentType) || existing.type;
    const priceMode = input.priceMode !== undefined ? (input.priceMode as PriceMode) : existing.priceMode;
    let priceAmount = existing.priceAmount;
    if (priceMode === 'on_request') {
      priceAmount = null;
    } else if (input.priceAmount !== undefined) {
      priceAmount = typeof input.priceAmount === 'number' && input.priceAmount > 0 ? input.priceAmount : null;
    }

    const configurations = input.configurations !== undefined
      ? sanitizeConfigurations(input.configurations)
      : (existing.configurations || []);

    const photos = input.photos !== undefined ? sanitizePhotos(input.photos) : (existing.photos || []);

    // Floor plans: clean any configurationId that no longer exists in configurations
    const plans = input.plans !== undefined
      ? sanitizeFloorPlans(input.plans, configurations)
      : (existing.plans ? sanitizeFloorPlans(existing.plans, configurations) : []);

    // Brochure: if input.brochure is passed (even null), sanitize/clear it; else preserve existing
    const brochure = input.brochure !== undefined
      ? sanitizeBrochure(input.brochure)
      : (existing.brochure || null);

    const progress = input.progress !== undefined
      ? sanitizeProgress(input.progress, photos)
      : (existing.progress ? sanitizeProgress(existing.progress, photos) : []);

    let image = input.image !== undefined ? input.image : existing.image;
    if (photos && photos.length > 0) {
      const cover = photos.find((p) => p.isCover) || photos[0];
      image = {
        url: cover.url || cover.secureUrl,
        altText: cover.altText || (input.name !== undefined ? input.name.trim() : existing.name),
        label: cover.label === 'Actual photograph' ? 'Actual photograph' : 'Architectural render',
      };
    }

    const updatedDraft: DevelopmentDraft = {
      ...existing,
      name: input.name !== undefined ? input.name.trim() : existing.name,
      slug,
      type: updatedType,
      locality: input.locality !== undefined ? input.locality.trim() : existing.locality,
      shortDescription: input.shortDescription !== undefined ? input.shortDescription.trim() : existing.shortDescription,
      priceMode,
      priceAmount,
      availability: (input.availability as AvailabilityStatus) || existing.availability,
      constructionStage: (input.constructionStage as ConstructionStage) || existing.constructionStage,
      area: input.area !== undefined ? (input.area || null) : existing.area,
      bedrooms: updatedType === 'Residential Plot'
        ? null
        : (input.bedrooms !== undefined ? (typeof input.bedrooms === 'number' ? input.bedrooms : null) : existing.bedrooms),
      image: image || null,
      photos: photos || [],
      plans: plans || [],
      brochure: brochure || null,
      specifications: input.specifications !== undefined ? sanitizeSpecifications(input.specifications) : (existing.specifications || []),
      configurations,
      location: input.location !== undefined ? sanitizeLocation(input.location) : existing.location,
      progress: progress || [],
      version: existing.version + 1,
      hasUnpublishedChanges: existing.status === 'published',
      updatedAt: now,
      lastModifiedBy: actorUid,
      lastAvailabilityCheck: input.lastAvailabilityCheck !== undefined ? input.lastAvailabilityCheck : existing.lastAvailabilityCheck,
      lastBrochureReview: input.lastBrochureReview !== undefined ? input.lastBrochureReview : existing.lastBrochureReview,
      publishedVersion: existing.publishedVersion,
    };

    const proposedAssetIds = [
      ...getAllReferencedAssetIds(updatedDraft),
      ...(publicData ? getAllReferencedAssetIds(publicData) : [])
    ];

    // Transactionally reconcile asset statuses
    await reconcileAssetStatuses(transaction, id, currentAssetIds, proposedAssetIds);

    const normalized = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalized, 'updateDevelopmentDraft');
    transaction.set(docRef, normalized);
    
    return normalized;
  });
}

/**
 * Validates and atomically publishes a draft to developments_public/{slug}.
 * Transactional to ensure asset reference safety and race condition avoidance.
 */
export async function publishDevelopment(actorUid: string, id: string): Promise<DevelopmentDraft> {
  const db = getDb();

  return await db.runTransaction(async (transaction) => {
    const draftRef = db.collection('developments_drafts').doc(id);
    const draftDoc = await transaction.get(draftRef);

    if (!draftDoc.exists) {
      const error: any = new Error('Development draft not found');
      error.statusCode = 404;
      throw error;
    }

    const draft = draftDoc.data() as DevelopmentDraft;

    // Publishing Validations
    if (!draft.name || draft.name.trim().length === 0) {
      throw new Error('Development name is required for publication.');
    }
    if (!draft.type) {
      throw new Error('Development type is required for publication.');
    }
    if (!draft.locality || draft.locality.trim().length === 0) {
      throw new Error('Locality is required for publication.');
    }
    if (!draft.shortDescription || draft.shortDescription.trim().length === 0) {
      throw new Error('Short description is required for publication.');
    }
    if (!draft.priceMode) {
      throw new Error('Price mode must be selected.');
    }
    if (draft.priceMode !== 'on_request' && (!draft.priceAmount || draft.priceAmount <= 0)) {
      throw new Error('A positive INR price amount is required for exact or starting price modes.');
    }

    const now = new Date().toISOString();
    const slug = draft.slug || generateSlug(draft.name);

    // Get current public snapshot if it exists for combined reference check
    const publicQuery = db.collection('developments_public').where('id', '==', id).limit(1);
    const publicSnap = await transaction.get(publicQuery);
    const existingPublicData = publicSnap.empty ? null : (publicSnap.docs[0].data() as DevelopmentPublic);

    const currentAssetIds = [
      ...getAllReferencedAssetIds(draft),
      ...(existingPublicData ? getAllReferencedAssetIds(existingPublicData) : [])
    ];

    let locationPublic: DevelopmentLocationPublic | null = null;
    if (draft.location) {
      locationPublic = {
        address: draft.location.address || null,
        coordinates: draft.location.coordinates || null,
        directionsUrl: draft.location.directionsUrl || null,
        nearbyPlaces: Array.isArray(draft.location.nearbyPlaces)
          ? draft.location.nearbyPlaces.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              distanceValue: typeof p.distanceValue === 'number' ? p.distanceValue : null,
              distanceUnit: p.distanceUnit || 'km',
              status: p.status,
              publicNote: p.isPublicSourceNote && p.sourceNote ? p.sourceNote : null,
            }))
          : [],
      };
    }

    const publicSnapshot: DevelopmentPublic = {
      id: draft.id,
      slug,
      name: draft.name,
      type: draft.type,
      locality: draft.locality,
      shortDescription: draft.shortDescription,
      priceMode: draft.priceMode,
      priceAmount: draft.priceAmount ?? null,
      priceDisplay: formatPriceDisplay(draft.priceMode, draft.priceAmount ?? null),
      availability: draft.availability,
      constructionStage: draft.constructionStage,
      area: draft.area ?? null,
      bedrooms: draft.type === 'Residential Plot' ? null : (draft.bedrooms ?? null),
      image: draft.image ?? null,
      photos: Array.isArray(draft.photos)
        ? draft.photos.map((p) => ({
            id: p.id,
            cloudinaryPublicId: p.cloudinaryPublicId,
            url: p.url,
            secureUrl: p.secureUrl,
            width: p.width,
            height: p.height,
            format: p.format,
            altText: p.altText,
            label: p.label,
            isCover: p.isCover,
            sortOrder: p.sortOrder,
            version: typeof p.version === 'number' ? p.version : null,
          }))
        : [],
      plans: Array.isArray(draft.plans)
        ? draft.plans.map((p) => ({
            id: p.id,
            title: p.title,
            floor: p.floor || null,
            configurationId: p.configurationId || null,
            assetType: p.assetType,
            cloudinaryPublicId: p.cloudinaryPublicId,
            url: p.url,
            secureUrl: p.secureUrl,
            format: p.format,
            bytes: p.bytes,
            width: p.width || null,
            height: p.height || null,
            sortOrder: p.sortOrder,
          }))
        : [],
      brochure: draft.brochure
        ? {
            assetId: draft.brochure.assetId,
            title: draft.brochure.title,
            editionDate: draft.brochure.editionDate || null,
            url: draft.brochure.url,
            secureUrl: draft.brochure.secureUrl,
            format: 'pdf',
            bytes: draft.brochure.bytes,
          }
        : null,
      specifications: draft.specifications || [],
      configurations: draft.configurations || [],
      location: locationPublic,
      progress: Array.isArray(draft.progress)
        ? draft.progress.map((prog) => {
            const photoIds = Array.isArray(prog.photoIds) ? prog.photoIds : [];
            const resolvedPhotos: DevelopmentPhotoPublic[] = [];
            if (Array.isArray(draft.photos)) {
              for (const pid of photoIds) {
                const found = draft.photos.find((p) => p.id === pid);
                if (found) {
                  resolvedPhotos.push({
                    id: found.id,
                    cloudinaryPublicId: found.cloudinaryPublicId,
                    url: found.url,
                    secureUrl: found.secureUrl,
                    width: found.width,
                    height: found.height,
                    format: found.format,
                    altText: found.altText,
                    label: found.label,
                    isCover: found.isCover,
                    sortOrder: found.sortOrder,
                    version: typeof found.version === 'number' ? found.version : null,
                  });
                }
              }
            }
            return {
              id: prog.id,
              date: prog.date,
              title: prog.title,
              stage: prog.stage,
              description: prog.description,
              photoIds,
              photos: resolvedPhotos,
            };
          })
        : [],
      publishedAt: draft.publishedAt || now,
      version: draft.version,
    };

    const updatedDraft: DevelopmentDraft = {
      ...draft,
      status: 'published',
      publishedSlug: slug,
      publishedAt: draft.publishedAt || now,
      hasUnpublishedChanges: false,
      publishedVersion: draft.version,
      version: draft.version + 1,
      updatedAt: now,
      lastModifiedBy: actorUid,
    };

    const proposedAssetIds = [
      ...getAllReferencedAssetIds(updatedDraft),
      ...getAllReferencedAssetIds(publicSnapshot)
    ];

    // Transactionally reconcile asset statuses
    await reconcileAssetStatuses(transaction, id, currentAssetIds, proposedAssetIds);

    const normalizedSnapshot = normalizePublicSnapshotForPersistence(publicSnapshot);
    assertNoUndefinedInDocument(normalizedSnapshot, 'publicSnapshot');

    const normalizedUpdatedDraft = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalizedUpdatedDraft, 'publishUpdatedDraft');

    const publicRef = db.collection('developments_public').doc(slug);
    
    // If slug changed, remove old public doc
    if (existingPublicData && existingPublicData.slug !== slug) {
      transaction.delete(db.collection('developments_public').doc(existingPublicData.slug));
    }

    transaction.set(publicRef, normalizedSnapshot);
    transaction.set(draftRef, normalizedUpdatedDraft);

    return normalizedUpdatedDraft;
  });
}

/**
 * Retracts public visibility, removes from developments_public, preserves draft.
 */
export async function unpublishDevelopment(actorUid: string, id: string): Promise<DevelopmentDraft> {
  const db = getDb();

  return await db.runTransaction(async (transaction) => {
    const draftRef = db.collection('developments_drafts').doc(id);
    const draftDoc = await transaction.get(draftRef);

    if (!draftDoc.exists) {
      const error: any = new Error('Development draft not found');
      error.statusCode = 404;
      throw error;
    }

    const draft = draftDoc.data() as DevelopmentDraft;
    
    // Get public snapshot if it exists for combined reference check
    const publicQuery = db.collection('developments_public').where('id', '==', id).limit(1);
    const publicSnap = await transaction.get(publicQuery);
    const existingPublicData = publicSnap.empty ? null : (publicSnap.docs[0].data() as DevelopmentPublic);

    const currentAssetIds = [
      ...getAllReferencedAssetIds(draft),
      ...(existingPublicData ? getAllReferencedAssetIds(existingPublicData) : [])
    ];

    const now = new Date().toISOString();

    const updatedDraft: DevelopmentDraft = {
      ...draft,
      status: 'draft',
      hasUnpublishedChanges: false,
      version: draft.version + 1,
      updatedAt: now,
      lastModifiedBy: actorUid,
    };

    const proposedAssetIds = getAllReferencedAssetIds(updatedDraft);

    // Transactionally reconcile asset statuses
    await reconcileAssetStatuses(transaction, id, currentAssetIds, proposedAssetIds);

    const normalizedUpdatedDraft = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalizedUpdatedDraft, 'unpublishUpdatedDraft');

    if (draft.publishedSlug) {
      transaction.delete(db.collection('developments_public').doc(draft.publishedSlug));
    }
    transaction.set(draftRef, normalizedUpdatedDraft);

    return normalizedUpdatedDraft;
  });
}

/**
 * Archives development, retracts public visibility, preserves private record.
 */
export async function archiveDevelopment(actorUid: string, id: string): Promise<DevelopmentDraft> {
  const db = getDb();

  return await db.runTransaction(async (transaction) => {
    const draftRef = db.collection('developments_drafts').doc(id);
    const draftDoc = await transaction.get(draftRef);

    if (!draftDoc.exists) {
      const error: any = new Error('Development draft not found');
      error.statusCode = 404;
      throw error;
    }

    const draft = draftDoc.data() as DevelopmentDraft;

    // Get public snapshot if it exists for combined reference check
    const publicQuery = db.collection('developments_public').where('id', '==', id).limit(1);
    const publicSnap = await transaction.get(publicQuery);
    const existingPublicData = publicSnap.empty ? null : (publicSnap.docs[0].data() as DevelopmentPublic);

    const currentAssetIds = [
      ...getAllReferencedAssetIds(draft),
      ...(existingPublicData ? getAllReferencedAssetIds(existingPublicData) : [])
    ];

    const now = new Date().toISOString();

    const updatedDraft: DevelopmentDraft = {
      ...draft,
      status: 'archived',
      hasUnpublishedChanges: false,
      version: draft.version + 1,
      updatedAt: now,
      lastModifiedBy: actorUid,
    };

    const proposedAssetIds = getAllReferencedAssetIds(updatedDraft);

    // Transactionally reconcile asset statuses
    await reconcileAssetStatuses(transaction, id, currentAssetIds, proposedAssetIds);

    const normalizedUpdatedDraft = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalizedUpdatedDraft, 'archiveUpdatedDraft');

    if (draft.publishedSlug) {
      transaction.delete(db.collection('developments_public').doc(draft.publishedSlug));
    }
    transaction.set(draftRef, normalizedUpdatedDraft);

    return normalizedUpdatedDraft;
  });
}

/**
 * Restores development from archived state back to draft without automatically republishing.
 */
export async function restoreDevelopment(actorUid: string, id: string): Promise<DevelopmentDraft> {
  const db = getDb();

  return await db.runTransaction(async (transaction) => {
    const draftRef = db.collection('developments_drafts').doc(id);
    const draftDoc = await transaction.get(draftRef);

    if (!draftDoc.exists) {
      const error: any = new Error('Development draft not found');
      error.statusCode = 404;
      throw error;
    }

    const draft = draftDoc.data() as DevelopmentDraft;
    const currentAssetIds = getAllReferencedAssetIds(draft);
    const now = new Date().toISOString();

    const updatedDraft: DevelopmentDraft = {
      ...draft,
      status: 'draft',
      hasUnpublishedChanges: false,
      version: draft.version + 1,
      updatedAt: now,
      lastModifiedBy: actorUid,
    };

    const proposedAssetIds = getAllReferencedAssetIds(updatedDraft);

    // Transactionally reconcile asset statuses
    await reconcileAssetStatuses(transaction, id, currentAssetIds, proposedAssetIds);

    const normalizedUpdatedDraft = normalizeDraftForPersistence(updatedDraft);
    assertNoUndefinedInDocument(normalizedUpdatedDraft, 'restoreUpdatedDraft');

    transaction.set(draftRef, normalizedUpdatedDraft);

    return normalizedUpdatedDraft;
  });
}

/**
 * Reads public development snapshot by slug from developments_public.
 * Only returns active published records.
 */
export async function getPublicDevelopmentBySlug(slug: string): Promise<DevelopmentPublic | null> {
  const db = getDb();
  const doc = await db.collection('developments_public').doc(slug).get();
  if (!doc.exists) {
    return null;
  }
  return projectPublicDevelopment(doc.data());
}

/**
 * Reads all published development snapshots from developments_public.
 * Applies optional filters and sorts with newest published first.
 */
export async function getPublicDevelopments(filters?: {
  type?: DevelopmentType;
  stage?: ConstructionStage;
  availability?: AvailabilityStatus;
}): Promise<DevelopmentPublic[]> {
  const db = getDb();
  const snapshot = await db.collection('developments_public').get();
  let items = snapshot.docs
    .map((doc: any) => projectPublicDevelopment(doc.data()))
    .filter((d: any): d is DevelopmentPublic => Boolean(d));

  if (filters?.type) {
    items = items.filter((d) => d.type === filters.type);
  }
  if (filters?.stage) {
    items = items.filter((d) => d.constructionStage === filters.stage);
  }
  if (filters?.availability) {
    items = items.filter((d) => d.availability === filters.availability);
  }

  // Sort by publishedAt descending
  items.sort((a, b) => {
    const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  return items;
}

/**
 * Retrieves counts for the owner dashboard.
 */
export async function getAdminDevelopmentStats(): Promise<{
  totalPublished: number | null;
  availablePublished: number | null;
  needsAvailabilityReview: number | null;
  needsBrochureReview: number | null;
}> {
  const db = getDb();
  
  try {
    const { getBusinessSettings } = await import('./settingsService.ts');
    const settings = await getBusinessSettings();
    
    const availInterval = settings.operationalSettings?.availabilityReviewIntervalDays || 30;
    const brochureInterval = settings.operationalSettings?.brochureReviewIntervalDays || 90;

    const now = new Date();
    const availThreshold = new Date(now.getTime() - availInterval * 24 * 60 * 60 * 1000).toISOString();
    const brochureThreshold = new Date(now.getTime() - brochureInterval * 24 * 60 * 60 * 1000).toISOString();

    // Fetch public snapshot IDs to establish ground-truth publication
    const publicSnap = await db.collection('developments_public').select('id').get();
    const publicIds = new Set(publicSnap.docs.map(d => d.data().id));

    const snapshot = await db.collection('developments_drafts').where('status', '==', 'published').get();
    const developments = snapshot.docs.map((doc: any) => doc.data() as DevelopmentDraft);

    let totalPublished = 0;
    let availablePublished = 0;
    let needsAvailabilityReview = 0;
    let needsBrochureReview = 0;

    for (const dev of developments) {
      // Only count if public presence exists
      if (!publicIds.has(dev.id)) continue;

      totalPublished++;
      if (dev.availability === 'Available') {
        availablePublished++;
      }

      const pubVersion = dev.publishedVersion || 0;
      
      // Availability Review Check
      const lastAvail = dev.lastAvailabilityCheck;
      const isAvailStale = !lastAvail || 
                          typeof lastAvail === 'string' ||
                          lastAvail.revision !== pubVersion || 
                          lastAvail.timestamp <= availThreshold;
      
      if (isAvailStale) {
        needsAvailabilityReview++;
      }

      // Brochure Review Check
      const lastBrochure = dev.lastBrochureReview;
      const currentAssetId = dev.brochure?.assetId || null;
      
      const isBrochureStale = !lastBrochure || 
                             typeof lastBrochure === 'string' ||
                             lastBrochure.revision !== pubVersion || 
                             lastBrochure.assetId !== currentAssetId ||
                             lastBrochure.timestamp <= brochureThreshold;

      if (isBrochureStale) {
        needsBrochureReview++;
      }
    }

    return {
      totalPublished,
      availablePublished,
      needsAvailabilityReview,
      needsBrochureReview,
    };
  } catch (err) {
    console.error('[Development Stats] Failure:', err);
    return {
      totalPublished: null,
      availablePublished: null,
      needsAvailabilityReview: null,
      needsBrochureReview: null,
    };
  }
}

/**
 * Updates the last review timestamp for a development.
 */
export async function updateDevelopmentReview(
  actorUid: string,
  id: string,
  type: 'availability' | 'brochure',
  expectedRevision: number,
  assetId?: string
): Promise<boolean> {
  const db = getDb();
  const now = new Date().toISOString();

  await db.runTransaction(async (transaction) => {
    const draftRef = db.collection('developments_drafts').doc(id);
    const draftDoc = await transaction.get(draftRef);

    if (!draftDoc.exists) throw new Error('Development not found');

    const draft = draftDoc.data() as DevelopmentDraft;
    
    if (draft.status !== 'published') {
      throw new Error('Only published developments can be marked as reviewed.');
    }

    if (draft.publishedVersion !== expectedRevision) {
      const error: any = new Error('Published revision mismatch. The content has been updated since the review started.');
      error.statusCode = 409;
      error.code = 'revision_mismatch';
      throw error;
    }

    const patch: any = {
      updatedAt: now,
      lastModifiedBy: actorUid,
    };

    if (type === 'availability') {
      patch.lastAvailabilityCheck = {
        timestamp: now,
        actorUid,
        revision: expectedRevision
      };
    } else {
      const currentAssetId = draft.brochure?.assetId;
      if (assetId && assetId !== currentAssetId) {
        throw new Error('Brochure asset mismatch. The brochure has been replaced.');
      }
      patch.lastBrochureReview = {
        timestamp: now,
        actorUid,
        revision: expectedRevision,
        assetId: currentAssetId || ''
      };
    }

    transaction.update(draftRef, patch);
  });

  return true;
}
