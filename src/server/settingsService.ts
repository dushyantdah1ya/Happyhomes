import { getFirebaseAdminApp, getFirestoreDb } from './firebaseAdmin.ts';
import { type BusinessSettings, DEFAULT_SETTINGS } from '../types/settings.ts';

/**
 * Retrieves the shared business contact settings.
 * Returns defaults if not yet established in database.
 */
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    return DEFAULT_SETTINGS;
  }

  try {
    const db = getFirestoreDb(adminApp);
    const doc = await db.collection('system').doc('business_settings').get();
    
    if (!doc.exists) {
      return DEFAULT_SETTINGS;
    }

    return doc.data() as BusinessSettings;
  } catch (err: any) {
    console.error('[Settings Service] Failed to retrieve settings:', err);
    // Only return defaults if it's a "not found" style error if not already handled by !doc.exists
    // If it's a permission or connectivity error, we should probably throw so the caller knows it failed.
    throw new Error('Database error occurred while fetching business settings.');
  }
}

/**
 * Updates business contact settings.
 * Validates required fields and normalization.
 */
export async function updateBusinessSettings(uid: string, settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    throw new Error('Firebase Admin SDK not configured');
  }

  // Basic validation
  if (!settings.phone || !settings.email) {
    throw new Error('Phone and Email are required business contact fields.');
  }

  const updated: BusinessSettings = {
    ...DEFAULT_SETTINGS, // Ensure defaults for missing fields
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: uid,
  };

  try {
    const db = getFirestoreDb(adminApp);
    await db.collection('system').doc('business_settings').set(updated);
    return updated;
  } catch (err: any) {
    console.error('[Settings Service] Update failed:', err);
    throw new Error('Failed to persist business settings to database.');
  }
}
