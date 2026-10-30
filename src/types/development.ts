export type DevelopmentType = 'Villa' | 'Independent Floor' | 'Residential Plot';
export type PriceMode = 'exact' | 'starting_at' | 'on_request';
export type AvailabilityStatus = 'Available' | 'Reserved' | 'Sold' | 'Not specified';
export type ConstructionStage = 'Planned' | 'Under construction' | 'Completed' | 'Not specified';
export type AreaDefinition = 'plot' | 'built-up' | 'carpet';
export type AreaUnit = 'sq ft' | 'sq yd';
export type ImageLabel = 'Actual photograph' | 'Architectural render' | 'Representative image';
export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface DevelopmentArea {
  value: number | null;
  definition: AreaDefinition;
  unit: AreaUnit;
}

export interface DevelopmentImage {
  url: string;
  altText: string;
  label: ImageLabel;
}

// --- S05B1: Media & Photograph Models ---

export type PhotoLabel = 'Actual photograph' | 'Architectural visualization';

export interface DevelopmentPhoto {
  id: string; // stable internal identifier (e.g., photo_1728555_abc)
  cloudinaryPublicId: string;
  url: string; // derived optimized delivery URL
  secureUrl: string; // pristine Cloudinary secure_url
  width: number;
  height: number;
  format: string; // jpg, png, webp
  bytes: number;
  altText: string;
  label: PhotoLabel;
  isCover: boolean;
  sortOrder: number;
  version?: number | null;
  createdAt?: string;
}

export interface DevelopmentPhotoPublic {
  id: string;
  cloudinaryPublicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  altText: string;
  label: PhotoLabel;
  isCover: boolean;
  sortOrder: number;
  version?: number | null;
}

// --- S05A: Structured Content Models ---

export type SpecificationType = 'inclusion' | 'optional_extra';

export interface SpecificationItem {
  id: string;
  label: string;
  value: string;
  type: SpecificationType;
}

export interface SpecificationGroup {
  id: string;
  title: string;
  items: SpecificationItem[];
}

export interface DevelopmentConfiguration {
  id: string;
  label: string;
  floor?: string | null;
  bedrooms?: number | null;
  area?: DevelopmentArea | null;
  availability: AvailabilityStatus;
  priceMode?: PriceMode | null;
  priceAmount?: number | null;
  priceDisplay?: string | null;
}

export type NearbyPlaceStatus = 'Existing' | 'Proposed / Upcoming';

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  distanceValue?: number | null;
  distanceUnit?: string;
  status: NearbyPlaceStatus;
  sourceNote?: string | null;
  isPublicSourceNote?: boolean;
  checkedDate?: string | null;
}

export interface DevelopmentLocation {
  address?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  directionsUrl?: string | null;
  nearbyPlaces?: NearbyPlace[];
}

export interface NearbyPlacePublic {
  id: string;
  name: string;
  category: string;
  distanceValue?: number | null;
  distanceUnit?: string;
  status: NearbyPlaceStatus;
  publicNote?: string | null;
}

export interface DevelopmentLocationPublic {
  address?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
  directionsUrl?: string | null;
  nearbyPlaces?: NearbyPlacePublic[];
}

export type ProgressUpdateStage = 'Completed work' | 'Future planned activity';

export interface ProgressUpdate {
  id: string;
  date: string;
  title: string;
  stage: ProgressUpdateStage;
  description: string;
  photoIds?: string[];
}

export interface ProgressUpdatePublic {
  id: string;
  date: string;
  title: string;
  stage: ProgressUpdateStage;
  description: string;
  photoIds?: string[];
  photos?: DevelopmentPhotoPublic[];
}

// --- S05B2: Floor Plans & Documents Models ---

export interface DevelopmentFloorPlan {
  id: string; // stable internal identifier (e.g. plan_1728555_abc)
  title: string; // required descriptive title (e.g. Ground Floor Layout)
  floor?: string | null; // optional floor label
  configurationId?: string | null; // optional link to an existing configuration ID
  assetType: 'image' | 'pdf';
  cloudinaryPublicId: string;
  url: string;
  secureUrl: string;
  format: string; // jpg, png, webp, pdf
  bytes: number;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  createdAt?: string;
}

export interface DevelopmentFloorPlanPublic {
  id: string;
  title: string;
  floor?: string | null;
  configurationId?: string | null;
  assetType: 'image' | 'pdf';
  cloudinaryPublicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
}

export interface DevelopmentBrochure {
  assetId: string;
  title: string; // owner-entered title (e.g. Official Project Brochure)
  editionDate?: string | null; // optional edition date (e.g. October 2026)
  cloudinaryPublicId: string;
  url: string; // pristine PDF delivery URL
  secureUrl: string;
  format: 'pdf';
  bytes: number;
  createdAt?: string;
}

export interface DevelopmentBrochurePublic {
  assetId: string;
  title: string;
  editionDate?: string | null;
  url: string;
  secureUrl: string;
  format: 'pdf';
  bytes: number;
}

// --- S05B3: Asset Registry and Cleanup ---

export type AssetStatus = 'unattached' | 'attached' | 'detached' | 'deletion_pending' | 'deleted' | 'deletion_error';

export interface ManagedAsset {
  assetId: string;
  developmentId: string;
  purpose: 'gallery' | 'floor_plan' | 'brochure';
  publicId: string;
  secureUrl: string;
  width?: number | null;
  height?: number | null;
  format: string;
  bytes: number;
  version?: number | null;
  status: AssetStatus;
  actorUid: string;
  createdAt: string;
  detachedAt?: string | null;
  deletionRequestedAt?: string | null;
  deletedAt?: string | null;
  deletionError?: string | null;
}

export interface DevelopmentDraft {
  id: string;
  slug: string;
  name: string;
  type: DevelopmentType;
  locality: string;
  shortDescription: string;
  priceMode: PriceMode;
  priceAmount: number | null; // INR amount, e.g. 36500000 for 3.65 Cr
  availability: AvailabilityStatus;
  constructionStage: ConstructionStage;
  area: DevelopmentArea | null;
  bedrooms: number | null; // Only applicable for Villa / Independent Floor
  image: DevelopmentImage | null;

  // S05A Structured details
  specifications?: SpecificationGroup[];
  configurations?: DevelopmentConfiguration[];
  location?: DevelopmentLocation | null;
  progress?: ProgressUpdate[];

  // S05B1 Media / Photos
  photos?: DevelopmentPhoto[];

  // S05B2 Plans & Brochure
  plans?: DevelopmentFloorPlan[];
  brochure?: DevelopmentBrochure | null;
  
  // Internal lifecycle metadata
  status: PublicationStatus;
  version: number;
  hasUnpublishedChanges: boolean;
  publishedSlug: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  lastModifiedBy: string;

  // S07C Review Reminders
  lastAvailabilityCheck?: {
    timestamp: string;
    actorUid: string;
    revision: number;
  } | null;
  lastBrochureReview?: {
    timestamp: string;
    actorUid: string;
    revision: number;
    assetId: string;
  } | null;
  publishedVersion?: number | null;
}

/**
 * Public snapshot stored in `developments_public/{slug}`.
 * Exposes strictly necessary public attributes.
 */
export interface DevelopmentPublic {
  id: string;
  slug: string;
  name: string;
  type: DevelopmentType;
  locality: string;
  shortDescription: string;
  priceMode: PriceMode;
  priceAmount: number | null;
  priceDisplay: string;
  availability: AvailabilityStatus;
  constructionStage: ConstructionStage;
  area: DevelopmentArea | null;
  bedrooms: number | null;
  image: DevelopmentImage | null;

  // S05A Structured details (public representation)
  specifications?: SpecificationGroup[];
  configurations?: DevelopmentConfiguration[];
  location?: DevelopmentLocationPublic | null;
  progress?: ProgressUpdatePublic[];

  // S05B1 Media / Photos (public representation)
  photos?: DevelopmentPhotoPublic[];

  // S05B2 Plans & Brochure (public representation)
  plans?: DevelopmentFloorPlanPublic[];
  brochure?: DevelopmentBrochurePublic | null;

  publishedAt: string;
  version?: number;
}

/**
 * Converts a string to a URL-safe lowercase slug.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formats INR currency according to standard Indian numeric presentation.
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Cr`;
  }
  if (amount >= 100000) {
    const lk = amount / 100000;
    return `₹${lk.toFixed(lk % 1 === 0 ? 0 : 2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Computes display label for pricing mode and amount.
 */
export function formatPriceDisplay(mode: PriceMode, amount: number | null): string {
  if (mode === 'on_request' || amount === null || amount <= 0) {
    return 'Price on Request';
  }
  const formatted = formatINR(amount);
  if (mode === 'starting_at') {
    return `Starting from ${formatted}`;
  }
  return formatted;
}

/**
 * Derives optimized delivery URL using Cloudinary transformations (f_auto, q_auto, w_X).
 * Gracefully preserves non-Cloudinary legacy URLs and PDF documents untouched.
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return '';
  // PDFs should NEVER receive image transformation parameters
  if (url.toLowerCase().endsWith('.pdf') || url.includes('/pdf/')) {
    return url;
  }
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }
  const parts = url.split('/image/upload/');
  if (parts.length !== 2) return url;
  
  // Prevent duplicate transformations if already present
  if (parts[1].startsWith('f_auto') || parts[1].startsWith('w_') || parts[1].startsWith('c_')) {
    return url;
  }
  
  const transform = width ? `f_auto,q_auto,w_${width},c_limit` : 'f_auto,q_auto';
  return `${parts[0]}/image/upload/${transform}/${parts[1]}`;
}

/**
 * Builds responsive srcset string for high-DPI displays and responsive viewports.
 */
export function getCloudinarySrcSet(url: string, widths: number[] = [640, 960, 1280, 1920]): string {
  if (!url || !url.includes('res.cloudinary.com') || url.toLowerCase().endsWith('.pdf')) return '';
  return widths.map((w) => `${getOptimizedImageUrl(url, w)} ${w}w`).join(', ');
}

/**
 * Formats byte size into human-readable representation (e.g., 2.4 MB, 850 KB).
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}


