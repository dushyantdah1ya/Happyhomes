import type { AvailabilityStatus, DevelopmentPublic } from '../types/development.js';

/**
 * Checks whether a record is a private draft or non-public entity.
 */
export function isPrivateRecord(dev: any): boolean {
  if (!dev || typeof dev !== 'object') return true;
  if (dev.isDraft === true || dev.isPrivate === true || dev.archived === true || dev.isArchived === true) return true;
  if (dev.status === 'draft' || dev.status === 'archived') return true;
  if (dev.publicationStatus && dev.publicationStatus !== 'published') return true;
  if (dev.draft !== undefined && dev.draft !== null) return true;
  return false;
}

/**
 * Canonical helper to determine if a development has genuinely available inventory.
 *
 * Rules:
 * 1. Must be a legitimate public record (not private or draft).
 * 2. Multi-configuration developments derive availability from their configurations:
 *    At least one configuration must have availability === 'Available'.
 * 3. Single-unit / non-configuration developments require root availability === 'Available'.
 * 4. Explicitly excludes Reserved, Coming Soon, Sold, Not specified, unknown and private records.
 */
export function isDevelopmentAvailable(
  dev: {
    availability?: string | null;
    configurations?: Array<{ availability?: string | null }> | null;
    publicationStatus?: string | null;
    status?: string | null;
    isDraft?: boolean;
    isPrivate?: boolean;
    draft?: any;
  } | null | undefined
): boolean {
  if (!dev || isPrivateRecord(dev)) {
    return false;
  }

  // Multi-configuration check (matching catalogue logic)
  if (Array.isArray(dev.configurations) && dev.configurations.length > 0) {
    return dev.configurations.some((c) => c && c.availability === 'Available');
  }

  // Single inventory / parent record check
  return dev.availability === 'Available';
}

/**
 * Canonical helper to determine if a development is sold-out / sold-only.
 *
 * Rules:
 * 1. A development with an available configuration must NEVER be treated as sold-only,
 *    even if the parent record has a stale 'Sold' label.
 * 2. Multi-configuration developments:
 *    - Sold-only if no configuration is 'Available' and all configurations are 'Sold',
 *      or if parent is marked 'Sold' and no configuration is 'Available' or 'Reserved'.
 * 3. Single-unit developments:
 *    - Sold-only if root availability === 'Sold'.
 */
export function isDevelopmentSoldOnly(
  dev: {
    availability?: string | null;
    configurations?: Array<{ availability?: string | null }> | null;
  } | null | undefined
): boolean {
  if (!dev) return false;

  // Multi-configuration check
  if (Array.isArray(dev.configurations) && dev.configurations.length > 0) {
    const hasAvailable = dev.configurations.some((c) => c && c.availability === 'Available');
    if (hasAvailable) {
      // Must NOT be treated as sold-only because of a stale parent label
      return false;
    }

    const allSold = dev.configurations.every((c) => c && c.availability === 'Sold');
    if (allSold) return true;

    const hasReserved = dev.configurations.some((c) => c && c.availability === 'Reserved');
    if (hasReserved) return false;

    return dev.availability === 'Sold';
  }

  return dev.availability === 'Sold';
}

/**
 * Resolves the effective public availability status for display.
 * Resolves stale parent labels when child configurations provide ground-truth.
 */
export function getEffectiveAvailability(
  dev: {
    availability?: string | null;
    configurations?: Array<{ availability?: string | null }> | null;
  } | null | undefined
): AvailabilityStatus {
  if (!dev) return 'Not specified';

  if (Array.isArray(dev.configurations) && dev.configurations.length > 0) {
    if (dev.configurations.some((c) => c && c.availability === 'Available')) {
      return 'Available';
    }
    if (dev.configurations.some((c) => c && c.availability === 'Reserved')) {
      return 'Reserved';
    }
    if (dev.configurations.every((c) => c && c.availability === 'Sold')) {
      return 'Sold';
    }
  }

  const root = dev.availability;
  if (root === 'Available' || root === 'Reserved' || root === 'Sold') {
    return root;
  }
  return 'Not specified';
}
