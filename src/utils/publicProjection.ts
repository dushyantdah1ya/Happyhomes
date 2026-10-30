import type {
  DevelopmentPublic,
  DevelopmentArea,
  DevelopmentImage,
  DevelopmentPhotoPublic,
  DevelopmentFloorPlanPublic,
  DevelopmentBrochurePublic,
  SpecificationGroup,
  SpecificationItem,
  DevelopmentConfiguration,
  DevelopmentLocationPublic,
  NearbyPlacePublic,
  ProgressUpdatePublic,
} from '../types/development.js';

/**
 * Explicit allowlist projection for DevelopmentArea
 */
export function projectPublicArea(raw: any): DevelopmentArea | null {
  if (!raw || typeof raw !== 'object') return null;
  const value =
    typeof raw.value === 'number'
      ? raw.value
      : typeof raw.builtUpAreaSqFt === 'number'
      ? raw.builtUpAreaSqFt
      : typeof raw.carpetAreaSqFt === 'number'
      ? raw.carpetAreaSqFt
      : typeof raw.plotAreaSqYd === 'number'
      ? raw.plotAreaSqYd
      : null;
  const definition =
    raw.definition === 'plot' || raw.definition === 'built-up' || raw.definition === 'carpet'
      ? raw.definition
      : typeof raw.plotAreaSqYd === 'number'
      ? 'plot'
      : 'built-up';
  const unit = raw.unit === 'sq yd' || (raw.unit !== 'sq ft' && typeof raw.plotAreaSqYd === 'number') ? 'sq yd' : 'sq ft';
  return { value, definition, unit };
}

/**
 * Explicit allowlist projection for DevelopmentImage
 */
export function projectPublicImage(raw: any): DevelopmentImage | null {
  if (!raw || typeof raw !== 'object' || typeof raw.url !== 'string') return null;
  const allowedLabels = ['Actual photograph', 'Architectural render', 'Representative image'] as const;
  const label = allowedLabels.includes(raw.label) ? raw.label : 'Architectural render';
  return {
    url: String(raw.url),
    altText: typeof raw.altText === 'string' ? raw.altText : '',
    label,
  };
}

/**
 * Explicit allowlist projection for DevelopmentPhotoPublic
 */
export function projectPublicPhoto(raw: any): DevelopmentPhotoPublic | null {
  if (!raw || typeof raw !== 'object' || !raw.url) return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : 'photo_id';
  return {
    id,
    cloudinaryPublicId: typeof raw.cloudinaryPublicId === 'string' ? raw.cloudinaryPublicId : '',
    url: String(raw.url),
    secureUrl: typeof raw.secureUrl === 'string' ? raw.secureUrl : String(raw.url),
    width: typeof raw.width === 'number' ? raw.width : 0,
    height: typeof raw.height === 'number' ? raw.height : 0,
    format: typeof raw.format === 'string' ? raw.format : 'jpg',
    altText: typeof raw.altText === 'string' ? raw.altText : typeof raw.caption === 'string' ? raw.caption : '',
    label: raw.label === 'Architectural visualization' ? 'Architectural visualization' : 'Actual photograph',
    isCover: Boolean(raw.isCover),
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
    version: typeof raw.version === 'number' ? raw.version : null,
  };
}

/**
 * Explicit allowlist projection for DevelopmentFloorPlanPublic
 */
export function projectPublicFloorPlan(raw: any): DevelopmentFloorPlanPublic | null {
  if (!raw || typeof raw !== 'object' || !raw.id || !raw.url) return null;
  return {
    id: String(raw.id),
    title: typeof raw.title === 'string' ? raw.title : 'Floor Plan',
    floor: typeof raw.floor === 'string' ? raw.floor : null,
    configurationId: typeof raw.configurationId === 'string' ? raw.configurationId : null,
    assetType: raw.assetType === 'pdf' ? 'pdf' : 'image',
    cloudinaryPublicId: typeof raw.cloudinaryPublicId === 'string' ? raw.cloudinaryPublicId : '',
    url: String(raw.url),
    secureUrl: typeof raw.secureUrl === 'string' ? raw.secureUrl : String(raw.url),
    format: typeof raw.format === 'string' ? raw.format : 'jpg',
    bytes: typeof raw.bytes === 'number' ? raw.bytes : 0,
    width: typeof raw.width === 'number' ? raw.width : null,
    height: typeof raw.height === 'number' ? raw.height : null,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
  };
}

/**
 * Explicit allowlist projection for DevelopmentBrochurePublic
 */
export function projectPublicBrochure(raw: any): DevelopmentBrochurePublic | null {
  if (!raw || typeof raw !== 'object' || !raw.url) return null;
  const assetId = typeof raw.assetId === 'string' && raw.assetId ? raw.assetId : typeof raw.id === 'string' ? raw.id : 'brochure_asset';
  return {
    assetId,
    title: typeof raw.title === 'string' && raw.title ? raw.title : typeof raw.fileName === 'string' ? raw.fileName : 'Project Brochure',
    editionDate: typeof raw.editionDate === 'string' ? raw.editionDate : null,
    url: String(raw.url),
    secureUrl: typeof raw.secureUrl === 'string' ? raw.secureUrl : String(raw.url),
    format: 'pdf',
    bytes: typeof raw.bytes === 'number' ? raw.bytes : typeof raw.sizeBytes === 'number' ? raw.sizeBytes : 0,
  };
}

/**
 * Explicit allowlist projection for SpecificationItem
 */
export function projectPublicSpecificationItem(raw: any): SpecificationItem | null {
  if (!raw || typeof raw !== 'object' || typeof raw.label !== 'string') return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : raw.label.toLowerCase().replace(/\s+/g, '_');
  return {
    id,
    label: String(raw.label),
    value: typeof raw.value === 'string' ? raw.value : '',
    type: raw.type === 'optional_extra' ? 'optional_extra' : 'inclusion',
  };
}

/**
 * Explicit allowlist projection for SpecificationGroup
 */
export function projectPublicSpecificationGroup(raw: any): SpecificationGroup | null {
  if (!raw || typeof raw !== 'object') return null;
  const title = typeof raw.title === 'string' && raw.title ? raw.title : typeof raw.group === 'string' ? raw.group : '';
  if (!title) return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : title.toLowerCase().replace(/\s+/g, '_');
  const items: SpecificationItem[] = Array.isArray(raw.items)
    ? raw.items
        .map(projectPublicSpecificationItem)
        .filter((item: any): item is SpecificationItem => Boolean(item))
    : [];
  return {
    id,
    title,
    items,
  };
}

/**
 * Explicit allowlist projection for DevelopmentConfiguration
 */
export function projectPublicConfiguration(raw: any): DevelopmentConfiguration | null {
  if (!raw || typeof raw !== 'object' || !raw.id) return null;
  const label =
    typeof raw.label === 'string' && raw.label
      ? raw.label
      : typeof raw.unitName === 'string' && raw.unitName
      ? raw.unitName
      : 'Configuration';
  const allowedAvail = ['Available', 'Reserved', 'Sold', 'Not specified'] as const;
  const availability = allowedAvail.includes(raw.availability) ? raw.availability : 'Available';

  const allowedPriceModes = ['exact', 'starting_at', 'on_request'] as const;
  const priceMode = allowedPriceModes.includes(raw.priceMode) ? raw.priceMode : null;

  return {
    id: String(raw.id),
    label,
    floor: typeof raw.floor === 'string' ? raw.floor : null,
    bedrooms: typeof raw.bedrooms === 'number' ? raw.bedrooms : null,
    area: projectPublicArea(raw.area),
    availability,
    priceMode,
    priceAmount: typeof raw.priceAmount === 'number' ? raw.priceAmount : null,
    priceDisplay: typeof raw.priceDisplay === 'string' ? raw.priceDisplay : null,
  };
}

/**
 * Explicit allowlist projection for NearbyPlacePublic
 */
export function projectPublicNearbyPlace(raw: any): NearbyPlacePublic | null {
  if (!raw || typeof raw !== 'object' || !raw.id || typeof raw.name !== 'string') return null;
  const status = raw.status === 'Proposed / Upcoming' ? 'Proposed / Upcoming' : 'Existing';
  const publicNote = typeof raw.publicNote === 'string'
    ? raw.publicNote
    : raw.isPublicSourceNote && typeof raw.sourceNote === 'string'
    ? raw.sourceNote
    : null;

  return {
    id: String(raw.id),
    name: String(raw.name),
    category: typeof raw.category === 'string' ? raw.category : 'General',
    distanceValue: typeof raw.distanceValue === 'number' ? raw.distanceValue : null,
    distanceUnit: typeof raw.distanceUnit === 'string' ? raw.distanceUnit : 'km',
    status,
    publicNote,
  };
}

/**
 * Explicit allowlist projection for DevelopmentLocationPublic
 */
export function projectPublicLocation(raw: any): DevelopmentLocationPublic | null {
  if (!raw || typeof raw !== 'object') return null;
  const coordinates =
    raw.coordinates &&
    typeof raw.coordinates === 'object' &&
    typeof raw.coordinates.latitude === 'number' &&
    typeof raw.coordinates.longitude === 'number'
      ? {
          latitude: raw.coordinates.latitude,
          longitude: raw.coordinates.longitude,
        }
      : null;

  const nearbyPlaces: NearbyPlacePublic[] = Array.isArray(raw.nearbyPlaces)
    ? raw.nearbyPlaces
        .map(projectPublicNearbyPlace)
        .filter((place: any): place is NearbyPlacePublic => Boolean(place))
    : [];

  return {
    address: typeof raw.address === 'string' ? raw.address : null,
    coordinates,
    directionsUrl: typeof raw.directionsUrl === 'string' ? raw.directionsUrl : null,
    nearbyPlaces,
  };
}

/**
 * Explicit allowlist projection for ProgressUpdatePublic
 */
export function projectPublicProgressUpdate(raw: any): ProgressUpdatePublic | null {
  if (!raw || typeof raw !== 'object' || typeof raw.title !== 'string') return null;
  const id = typeof raw.id === 'string' && raw.id ? raw.id : 'progress_update';
  const stage = raw.stage === 'Future planned activity' ? 'Future planned activity' : 'Completed work';
  const photoIds = Array.isArray(raw.photoIds)
    ? raw.photoIds.filter((pid: any) => typeof pid === 'string')
    : undefined;
  const photos = Array.isArray(raw.photos)
    ? raw.photos
        .map(projectPublicPhoto)
        .filter((photo: any): photo is DevelopmentPhotoPublic => Boolean(photo))
    : undefined;

  return {
    id: String(raw.id),
    date: typeof raw.date === 'string' ? raw.date : '',
    title: String(raw.title),
    stage,
    description: typeof raw.description === 'string' ? raw.description : '',
    photoIds,
    photos,
  };
}

/**
 * Shared explicit allowlist projection for DevelopmentPublic.
 *
 * Excludes unknown and private fields by construction. Only explicitly
 * supported public attributes and nested sub-objects are projected.
 */
export function projectPublicDevelopment(dev: any): DevelopmentPublic | null {
  if (!dev || typeof dev !== 'object') return null;

  // Basic required identity
  if (!dev.id || !dev.slug || !dev.name) return null;

  let type: 'Villa' | 'Independent Floor' | 'Residential Plot' = 'Villa';
  if (dev.type === 'Independent Floor' || dev.type === 'independent-floor' || dev.type === 'independent floor') {
    type = 'Independent Floor';
  } else if (dev.type === 'Residential Plot' || dev.type === 'residential-plot' || dev.type === 'residential plot' || dev.type === 'plots' || dev.type === 'plot') {
    type = 'Residential Plot';
  } else {
    type = 'Villa';
  }

  const allowedPriceModes = ['exact', 'starting_at', 'on_request'] as const;
  const priceMode = allowedPriceModes.includes(dev.priceMode) ? dev.priceMode : 'on_request';

  const allowedAvail = ['Available', 'Reserved', 'Sold', 'Not specified'] as const;
  const availability = allowedAvail.includes(dev.availability) ? dev.availability : 'Available';

  const allowedStages = ['Planned', 'Under construction', 'Completed', 'Not specified'] as const;
  const constructionStage = allowedStages.includes(dev.constructionStage) ? dev.constructionStage : 'Under construction';

  const photos: DevelopmentPhotoPublic[] = Array.isArray(dev.photos)
    ? dev.photos
        .map(projectPublicPhoto)
        .filter((p: any): p is DevelopmentPhotoPublic => Boolean(p))
    : [];

  const plans: DevelopmentFloorPlanPublic[] = Array.isArray(dev.plans)
    ? dev.plans
        .map(projectPublicFloorPlan)
        .filter((p: any): p is DevelopmentFloorPlanPublic => Boolean(p))
    : [];

  const specifications: SpecificationGroup[] = Array.isArray(dev.specifications)
    ? dev.specifications
        .map(projectPublicSpecificationGroup)
        .filter((g: any): g is SpecificationGroup => Boolean(g))
    : [];

  const configurations: DevelopmentConfiguration[] = Array.isArray(dev.configurations)
    ? dev.configurations
        .map(projectPublicConfiguration)
        .filter((c: any): c is DevelopmentConfiguration => Boolean(c))
    : [];

  const progress: ProgressUpdatePublic[] = Array.isArray(dev.progress)
    ? dev.progress
        .map(projectPublicProgressUpdate)
        .filter((u: any): u is ProgressUpdatePublic => Boolean(u))
    : [];

  const clean: DevelopmentPublic = {
    id: String(dev.id),
    slug: String(dev.slug),
    name: String(dev.name),
    type,
    locality: typeof dev.locality === 'string' ? dev.locality : '',
    shortDescription:
      typeof dev.shortDescription === 'string'
        ? dev.shortDescription
        : typeof dev.description === 'string'
        ? dev.description
        : '',
    priceMode,
    priceAmount: typeof dev.priceAmount === 'number' ? dev.priceAmount : null,
    priceDisplay: typeof dev.priceDisplay === 'string' ? dev.priceDisplay : 'Price on Request',
    availability,
    constructionStage,
    area: projectPublicArea(dev.area),
    bedrooms: typeof dev.bedrooms === 'number' ? dev.bedrooms : null,
    image: projectPublicImage(dev.image),
    specifications,
    configurations,
    location: projectPublicLocation(dev.location),
    progress,
    photos,
    plans,
    brochure: projectPublicBrochure(dev.brochure),
    publishedAt: typeof dev.publishedAt === 'string' ? dev.publishedAt : new Date().toISOString(),
    version: typeof dev.version === 'number' ? dev.version : 1,
  };

  return clean;
}
