import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  verifyOwnerToken,
  saveConnectionCheck,
  getConnectionCheck,
} from './src/server/firebaseAdmin.ts';
import {
  listAdminDevelopments,
  getAdminDevelopment,
  createDevelopmentDraft,
  updateDevelopmentDraft,
  publishDevelopment,
  unpublishDevelopment,
  archiveDevelopment,
  restoreDevelopment,
  getAdminDevelopmentStats,
  updateDevelopmentReview,
  getPublicDevelopmentBySlug,
  getPublicDevelopments,
} from './src/server/developmentsService.ts';
import {
  getBusinessSettings,
  updateBusinessSettings,
} from './src/server/settingsService.ts';
import {
  submitEnquiry,
  listEnquiries,
  getEnquiry,
  updateEnquiryStatus,
  updateEnquiryAdminFields,
  exportEnquiriesCsv,
  getDashboardStats,
} from './src/server/enquiryService.ts';
import {
  getCloudinaryPublicConfig,
  createUploadIntent,
  finalizeUploadIntent,
} from './src/server/cloudinaryService.ts';
import { projectPublicDevelopment } from './src/utils/publicProjection.ts';
import { isDevelopmentSoldOnly } from './src/utils/canonicalAvailability.ts';
import { safeJsonSerialize } from './src/utils/safeJson.ts';
import { getTrustedOrigin, toAbsoluteCanonicalUrl, SITE_NAME } from './src/utils/seoConfig.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const rootDir = process.cwd();

function resolvePort(): number {
  const portArgIndex = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const val = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(val)) return val;
  }
  // In containerized preview (Cloud Run / AI Studio), PORT is 8080 (where nginx listens).
  // The Node dev server must always listen on port 3000 for nginx to proxy into.
  if (process.env.DEV_SERVER_PORT) {
    const val = parseInt(process.env.DEV_SERVER_PORT, 10);
    if (!isNaN(val)) return val;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val)) return val;
  }
  return 3000;
}

const PORT = resolvePort();

export async function createServerApp() {
  const app = express();
  app.use(express.json());

  let vite: any;
  if (!isProduction) {
    vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const clientDist = path.resolve(rootDir, 'dist/client');
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist, { index: false }));
    }
  }

  // Private Admin API routes (mounted before SSR catch-all)
  app.use('/api/admin', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  // Session verification & owner status check
  app.get('/api/admin/status', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
          uid: authResult.uid || null,
        });
      }

      return res.status(200).json({
        ok: true,
        isOwner: true,
        uid: authResult.uid,
        email: authResult.email,
      });
    } catch (err) {
      console.error('[API Status] Unexpected error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Internal server error processing authentication status.',
      });
    }
  });

  // Read connection check record
  app.get('/api/admin/connection-check', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
          uid: authResult.uid || null,
        });
      }

      const record = await getConnectionCheck();
      return res.status(200).json({
        success: true,
        record,
      });
    } catch (err) {
      console.error('[API Connection Check Read] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: 'Failed to read connection record from Firestore.',
      });
    }
  });

  // Write connection check record
  app.post('/api/admin/connection-check', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
          uid: authResult.uid || null,
        });
      }

      const record = await saveConnectionCheck(authResult.uid!);
      return res.status(200).json({
        success: true,
        record,
      });
    } catch (err) {
      console.error('[API Connection Check Write] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: 'Failed to write connection record to Firestore.',
      });
    }
  });

  // --- S04: Development Management Endpoints (Guarded by Owner Allowlist) ---

  // 0. Dashboard Stats
  app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const [enquiryStats, devStats] = await Promise.all([
        getDashboardStats(),
        getAdminDevelopmentStats()
      ]);
      return res.status(200).json({
        success: true,
        enquiryStats,
        devStats
      });
    } catch (err: any) {
      console.error('[API Admin Dashboard Stats] Error:', err);
      return res.status(500).json({ error: 'internal_error', message: 'Failed to fetch dashboard stats.' });
    }
  });

  // 1. List all development drafts
  app.get('/api/admin/developments', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { status, needsReview } = req.query;
      const list = await listAdminDevelopments({
        status: status as any,
        needsReview: needsReview as any
      });
      return res.status(200).json({ success: true, developments: list });
    } catch (err: any) {
      console.error('[API List Developments] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: err.message || 'Failed to list developments from database.',
      });
    }
  });

  // 2. Get single development draft
  app.get('/api/admin/developments/:id', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const dev = await getAdminDevelopment(req.params.id);
      if (!dev) {
        return res.status(404).json({
          error: 'not_found',
          message: 'Development draft not found.',
        });
      }
      return res.status(200).json({ success: true, development: dev });
    } catch (err: any) {
      console.error('[API Get Development] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: err.message || 'Failed to get development from database.',
      });
    }
  });

  // 3. Create new development draft
  app.post('/api/admin/developments', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const created = await createDevelopmentDraft(authResult.uid!, req.body);
      return res.status(201).json({ success: true, development: created });
    } catch (err: any) {
      console.error('[API Create Development Error]', err.message || err);
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: 'database_error',
        message: err.statusCode
          ? err.message
          : 'Unable to save development draft. Your entered values have been preserved in the editor. Please try saving again.',
      });
    }
  });

  // 4. Update development draft (with optimistic concurrency protection)
  app.put('/api/admin/developments/:id', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const draftInput = req.body.draft || req.body;
      const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;
      const updated = await updateDevelopmentDraft(
        authResult.uid!,
        req.params.id,
        draftInput,
        expectedVersion
      );
      return res.status(200).json({ success: true, development: updated });
    } catch (err: any) {
      console.error('[API Update Development Error]', err.message || err);
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: status === 409 ? 'conflict_stale_edit' : 'database_error',
        message: status === 409
          ? 'This record was modified in another session. Please reload to review current data.'
          : (err.statusCode
              ? err.message
              : 'Unable to save development draft. Your entered values have been preserved in the editor. Please try saving again.'),
      });
    }
  });

  // 5. Publish development
  app.post('/api/admin/developments/:id/publish', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const published = await publishDevelopment(authResult.uid!, req.params.id);
      return res.status(200).json({ success: true, development: published });
    } catch (err: any) {
      console.error('[API Publish Development] Error:', err);
      return res.status(400).json({
        error: 'validation_error',
        message: err.message || 'Failed to publish development.',
      });
    }
  });

  // 6. Unpublish development
  app.post('/api/admin/developments/:id/unpublish', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const unpublished = await unpublishDevelopment(authResult.uid!, req.params.id);
      return res.status(200).json({ success: true, development: unpublished });
    } catch (err: any) {
      console.error('[API Unpublish Development] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: err.message || 'Failed to unpublish development.',
      });
    }
  });

  // 7. Archive development
  app.post('/api/admin/developments/:id/archive', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const archived = await archiveDevelopment(authResult.uid!, req.params.id);
      return res.status(200).json({ success: true, development: archived });
    } catch (err: any) {
      console.error('[API Archive Development] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: err.message || 'Failed to archive development.',
      });
    }
  });

  // 8. Restore development
  app.post('/api/admin/developments/:id/restore', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const restored = await restoreDevelopment(authResult.uid!, req.params.id);
      return res.status(200).json({ success: true, development: restored });
    } catch (err: any) {
      console.error('[API Restore Development] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: err.message || 'Failed to restore development.',
      });
    }
  });

  // 9. Update development review timestamp
  app.post('/api/admin/developments/:id/review', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { type, revision, assetId } = req.body; // 'availability' | 'brochure'
      if (type !== 'availability' && type !== 'brochure') {
        return res.status(400).json({ error: 'invalid_request', message: 'Invalid review type.' });
      }
      if (typeof revision !== 'number') {
        return res.status(400).json({ error: 'invalid_request', message: 'Revision number is required.' });
      }

      await updateDevelopmentReview(authResult.uid!, req.params.id, type, revision, assetId);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('[API Admin Development Review] Error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to update review timestamp.',
      });
    }
  });

  // --- Cloudinary Media Upload Endpoints ---
  // 1. Get Cloudinary configuration status
  app.get('/api/admin/media/config', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const config = await getCloudinaryPublicConfig();
      return res.status(200).json({ ok: true, config });
    } catch (err: any) {
      console.error('[API Media Config] Error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to retrieve media configuration.',
      });
    }
  });

  // 2. Sign direct upload intent for browser upload to Cloudinary
  app.post('/api/admin/media/sign-upload', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const {
        developmentId,
        purpose,
        format,
        label,
        altText,
        sortOrder,
        planTitle,
        planFloor,
        configurationId,
        brochureTitle,
        brochureEditionDate,
      } = req.body;
      const payload = await createUploadIntent(authResult.uid!, developmentId, {
        purpose,
        format,
        label,
        altText,
        sortOrder,
        planTitle,
        planFloor,
        configurationId,
        brochureTitle,
        brochureEditionDate,
      });

      return res.status(200).json({ success: true, ...payload });
    } catch (err: any) {
      console.error('[API Sign Upload] Error:', err);
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: err.code || 'sign_upload_error',
        message: err.message || 'Failed to sign upload intent.',
      });
    }
  });

  // 3. Finalize direct upload by verifying resource directly with Cloudinary
  app.post('/api/admin/media/finalize-upload', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { intentId, developmentId } = req.body;
      if (!intentId || !developmentId) {
        return res.status(400).json({
          error: 'invalid_request',
          message: 'Both intentId and developmentId are required for finalization.',
        });
      }

      const finalized = await finalizeUploadIntent(authResult.uid!, intentId, developmentId);
      return res.status(200).json({ success: true, ...finalized });
    } catch (err: any) {
      console.error('[API Finalize Upload] Error:', err);
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: err.code || 'finalize_upload_error',
        message: err.message || 'Failed to finalize uploaded media.',
      });
    }
  });

  // 4. List managed assets for a development (Cleanup Registry)
  app.get('/api/admin/media/assets', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const developmentId = req.query.developmentId as string;
      if (!developmentId) {
        return res.status(400).json({ error: 'bad_request', message: 'developmentId is required' });
      }

      const limit = parseInt(req.query.limit as string || '20', 10);
      const startAfterId = req.query.startAfterId as string;

      const { listDevelopmentAssets } = await import('./src/server/assetCleanupService.ts');
      const result = await listDevelopmentAssets(developmentId, limit, startAfterId);
      
      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      console.error('[API List Assets] Error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to retrieve asset registry.',
      });
    }
  });

  // 5. Delete an unused asset permanently
  app.post('/api/admin/media/assets/:assetId/delete', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { assetId } = req.params;
      const { developmentId } = req.body;
      if (!developmentId) {
        return res.status(400).json({ error: 'bad_request', message: 'developmentId is required in body' });
      }

      const { initiateAssetDeletion, executeCloudinaryDeletion } = await import('./src/server/assetCleanupService.ts');
      
      // Step 1: Transactional claim (re-verifies references)
      const result = await initiateAssetDeletion(authResult.uid!, assetId, developmentId);
      
      if (result.status === 'waiting_period_started') {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          asset: result.asset 
        });
      }
      
      // Step 2: Execute Cloudinary API call (outside transaction)
      // Only for deletion_pending status
      const finalized = await executeCloudinaryDeletion(assetId);
      
      return res.status(200).json({ success: true, asset: finalized });
    } catch (err: any) {
      console.error('[API Delete Asset] Error:', err);
      const status = err.statusCode || 400;
      return res.status(status).json({
        error: 'deletion_failed',
        message: err.message || 'Failed to delete asset.',
      });
    }
  });

  // --- S07A: Business Settings Endpoints ---

  // 1. Public: Get shared settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await getBusinessSettings();
      // Omit internal operational settings from public projection
      const { operationalSettings, ...publicSettings } = settings;
      return res.status(200).json({ success: true, settings: publicSettings });
    } catch (err) {
      console.error('[API Public Settings] Error:', err);
      return res.status(500).json({ error: 'internal_error', message: 'Failed to retrieve settings' });
    }
  });

  // 2. Admin: Get settings
  app.get('/api/admin/settings', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const settings = await getBusinessSettings();
      return res.status(200).json({ success: true, settings });
    } catch (err) {
      console.error('[API Admin Get Settings] Error:', err);
      return res.status(500).json({ error: 'internal_error', message: 'Failed to retrieve settings' });
    }
  });

  // 3. Admin: Update settings
  app.put('/api/admin/settings', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const updated = await updateBusinessSettings(authResult.uid!, req.body);
      return res.status(200).json({ success: true, settings: updated });
    } catch (err: any) {
      console.error('[API Admin Update Settings] Error:', err);
      return res.status(400).json({
        error: 'update_failed',
        message: err.message || 'Failed to update business settings.',
      });
    }
  });

  // --- S06A: Enquiry Endpoints ---

  // 1. Public submission
  app.post('/api/enquiries', async (req, res) => {
    try {
      const clientIdentifier = req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';
      const result = await submitEnquiry(req.body, clientIdentifier);
      
      if (!result.ok) {
        return res.status(result.status).json({
          error: 'submission_error',
          message: result.message,
        });
      }

      return res.status(result.status).json({
        success: true,
        message: result.message,
        enquiryId: result.enquiryId,
      });
    } catch (err: any) {
      console.error('[API Submit Enquiry] Error:', err.message);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to submit enquiry. Please try again later.',
      });
    }
  });

  // 2. Admin: List enquiries
  app.get('/api/admin/enquiries', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { status, source, developmentId, followUp, limit, startAfterId } = req.query;
      const result = await listEnquiries({
        status: status as any,
        source: source as string,
        developmentId: developmentId as string,
        followUp: followUp as any,
        limit: limit ? parseInt(limit as string, 10) : 20,
        startAfterId: startAfterId as string,
      });

      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      console.error('[API Admin List Enquiries] Error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to retrieve enquiries.',
      });
    }
  });

  // 2.1 Admin: Export enquiries CSV
  app.get('/api/admin/enquiries/export', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { status, source, developmentId, followUp, includeNotes } = req.query;
      const csv = await exportEnquiriesCsv({
        status: status as any,
        source: source as string,
        developmentId: developmentId as string,
        followUp: followUp as any
      }, includeNotes === 'true');

      const filename = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      return res.status(200).send(csv);
    } catch (err: any) {
      console.error('[API Admin Export Enquiries] Error:', err);
      const status = err.statusCode || 500;
      return res.status(status).json({
        error: err.code || 'internal_error',
        message: err.message || 'Failed to export enquiries.',
      });
    }
  });

  // 3. Admin: Get enquiry detail
  app.get('/api/admin/enquiries/:id', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const enquiry = await getEnquiry(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ error: 'not_found', message: 'Enquiry not found' });
      }
      return res.status(200).json({ success: true, enquiry });
    } catch (err: any) {
      console.error('[API Admin Get Enquiry] Error:', err);
      return res.status(500).json({
        error: 'internal_error',
        message: 'Failed to retrieve enquiry details.',
      });
    }
  });

  // 4. Admin: Update enquiry status
  app.patch('/api/admin/enquiries/:id/status', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { status } = req.body;
      const success = await updateEnquiryStatus(req.params.id, status);
      return res.status(200).json({ success });
    } catch (err: any) {
      console.error('[API Admin Update Enquiry Status] Error:', err);
      return res.status(400).json({
        error: 'update_failed',
        message: err.message || 'Failed to update enquiry status.',
      });
    }
  });

  // 5. Admin: Update enquiry admin fields (Notes, follow-up, status)
  app.patch('/api/admin/enquiries/:id', async (req, res) => {
    try {
      const authResult = await verifyOwnerToken(req.headers.authorization);
      if (!authResult.ok) {
        return res.status(authResult.status).json({
          error: authResult.error,
          message: authResult.message,
        });
      }

      const { status, internalNotes, followUpDate, revision } = req.body;
      const success = await updateEnquiryAdminFields(req.params.id, authResult.uid!, {
        status,
        internalNotes,
        followUpDate
      }, revision);
      return res.status(200).json({ success });
    } catch (err: any) {
      console.error('[API Admin Update Enquiry Details] Error:', err);
      const status = err.statusCode || 400;
      return res.status(status).json({
        error: err.code || 'update_failed',
        message: err.message || 'Failed to update enquiry details.',
      });
    }
  });

  // --- Public Developments Collection Endpoint ---
  app.get('/api/developments', async (req, res) => {
    try {
      const type = req.query.type as any;
      const stage = req.query.stage as any;
      const availability = req.query.availability as any;
      const rawDevelopments = await getPublicDevelopments({ type, stage, availability });
      const developments = rawDevelopments
        .map(projectPublicDevelopment)
        .filter((d): d is any => Boolean(d));
      return res.status(200).json({ success: true, developments });
    } catch (err: any) {
      console.error('[API Public Developments List] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: 'Failed to retrieve published developments.',
      });
    }
  });

  // --- Public Development Snapshot Endpoint ---
  app.get('/api/developments/:slug', async (req, res) => {
    try {
      const dev = await getPublicDevelopmentBySlug(req.params.slug);
      if (!dev) {
        return res.status(404).json({
          error: 'not_found',
          message: 'Development not found or not published.',
        });
      }
      const cleanDev = projectPublicDevelopment(dev);
      return res.status(200).json({ success: true, development: cleanDev });
    } catch (err: any) {
      console.error('[API Public Development] Error:', err);
      return res.status(500).json({
        error: 'database_error',
        message: 'Failed to retrieve development from database.',
      });
    }
  });

  // API 404 handler: ensure API failures return JSON, NEVER HTML!
  app.use('/api/*', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.status(404).json({
      error: 'not_found',
      message: 'API endpoint not found',
    });
  });

  // Pre-launch robots.txt policy: allow crawlers to read pre-launch noindex directives while disallowing private admin/api paths
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('User-agent: *\nDisallow: /admin/\nDisallow: /api/\n');
  });

  // Pre-launch sitemap policy: while site-wide noindex is active, do not advertise or serve public launch sitemap
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Sitemap unavailable: Site is in pre-launch mode with site-wide noindex active.');
  });

  // Handle SSR for all application routes
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes or static asset requests
    if (url.startsWith('/api') || url.startsWith('/assets/')) {
      return next();
    }

    // Canonical redirect: prevent direct access to /index.html and ensure / is canonical
    if (url === '/index.html' || url.startsWith('/index.html?')) {
      return res.redirect(301, '/');
    }

    const cleanPath = url.split('?')[0].split('#')[0].replace(/\/+$/, '');

    // Canonical 301 redirects: /completed and /completed-developments -> /completed-projects
    if (cleanPath === '/completed' || cleanPath === '/completed-developments') {
      const qs = url.includes('?') ? '?' + url.split('?')[1] : '';
      return res.redirect(301, `/completed-projects${qs}`);
    }

    try {
      let template: string;
      let render: (url: string, context?: any) => any;

      if (!isProduction) {
        template = fs.readFileSync(path.resolve(rootDir, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const serverEntry = await vite.ssrLoadModule('/src/entry.server.tsx');
        render = serverEntry.render;
      } else {
        const prodTemplatePath = fs.existsSync(path.resolve(rootDir, 'dist/template.html'))
          ? path.resolve(rootDir, 'dist/template.html')
          : path.resolve(rootDir, 'dist/client/index.html');
        template = fs.readFileSync(prodTemplatePath, 'utf-8');
        const serverBundlePath = pathToFileURL(path.resolve(rootDir, 'dist/server/entry.server.js')).href;
        const serverEntry = await import(serverBundlePath);
        render = serverEntry.render;
      }

      // Fetch public snapshots safely for SSR injection
      let publicCatalogue: any[] = [];
      try {
        publicCatalogue = await getPublicDevelopments();
      } catch (catErr) {
        console.error('[SSR Catalogue Retrieval] Warning:', catErr);
      }

      // Public detail route validation: verify published status from database
      let currentDevelopment: any = null;
      const isDetailPage = cleanPath.startsWith('/developments/') && cleanPath !== '/developments';
      if (isDetailPage) {
        const slug = cleanPath.slice('/developments/'.length);
        if (slug) {
          try {
            currentDevelopment = await getPublicDevelopmentBySlug(slug);
          } catch (dbErr) {
            console.error('[SSR Development Lookup] DB Error:', dbErr);
            return res.status(500).set({ 'Content-Type': 'text/html' }).end('<!doctype html><html><head><title>500 Service Unavailable</title></head><body><h1>Service Unavailable</h1><p>Database error occurred while resolving property catalog.</p></body></html>');
          }
        }
      }

      // Project public snapshots with explicit allowlist to prevent exposing private draft or audit metadata
      const sanitizedCatalogue = Array.isArray(publicCatalogue)
        ? publicCatalogue.map(projectPublicDevelopment).filter((d): d is any => Boolean(d))
        : [];
      const sanitizedCurrentDev = currentDevelopment ? projectPublicDevelopment(currentDevelopment) : null;

      const trustedOrigin = getTrustedOrigin();

      let { html, statusCode, meta } = (isDetailPage && !currentDevelopment)
        ? render('/404-not-found', { explicitOrigin: trustedOrigin })
        : render(url, { developments: sanitizedCatalogue, currentDevelopment: sanitizedCurrentDev, explicitOrigin: trustedOrigin });

      if (isDetailPage && !currentDevelopment) {
        statusCode = 404;
      }

      let fullHtml = template;

      // Update route-specific title
      if (fullHtml.includes('<title>')) {
        fullHtml = fullHtml.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <title>${meta.title}</title>\n  </head>`);
      }

      // Update route-specific description
      if (fullHtml.includes('<meta name="description"')) {
        fullHtml = fullHtml.replace(
          /<meta name="description" content=".*?" \/>/i,
          `<meta name="description" content="${meta.description}" />`
        );
      } else {
        fullHtml = fullHtml.replace(
          '</head>',
          `  <meta name="description" content="${meta.description}" />\n  </head>`
        );
      }

      // Inject robots meta tag in head
      if (meta.robots) {
        if (fullHtml.includes('<meta name="robots"')) {
          fullHtml = fullHtml.replace(
            /<meta name="robots" content=".*?" \/>/i,
            `<meta name="robots" content="${meta.robots}" />`
          );
        } else {
          fullHtml = fullHtml.replace(
            '</head>',
            `  <meta name="robots" content="${meta.robots}" />\n  </head>`
          );
        }
      }

      // Canonical link: absolute URL when trusted origin is configured; omitted if unconfigured or 404
      const canonicalUrl = meta.canonicalPath ? toAbsoluteCanonicalUrl(meta.canonicalPath, trustedOrigin) : null;
      if (canonicalUrl) {
        if (fullHtml.includes('<link rel="canonical"')) {
          fullHtml = fullHtml.replace(/<link rel="canonical".*?\/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
        } else {
          fullHtml = fullHtml.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`);
        }
      } else {
        fullHtml = fullHtml.replace(/<link rel="canonical".*?\/>\n?/gi, '');
      }

      // OpenGraph metadata
      if (fullHtml.includes('<meta property="og:title"')) {
        fullHtml = fullHtml.replace(/<meta property="og:title".*?\/>/i, `<meta property="og:title" content="${meta.title}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta property="og:title" content="${meta.title}" />\n  </head>`);
      }

      if (fullHtml.includes('<meta property="og:description"')) {
        fullHtml = fullHtml.replace(/<meta property="og:description".*?\/>/i, `<meta property="og:description" content="${meta.description}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta property="og:description" content="${meta.description}" />\n  </head>`);
      }

      if (fullHtml.includes('<meta property="og:type"')) {
        fullHtml = fullHtml.replace(/<meta property="og:type".*?\/>/i, `<meta property="og:type" content="${meta.ogType || 'website'}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta property="og:type" content="${meta.ogType || 'website'}" />\n  </head>`);
      }

      if (fullHtml.includes('<meta property="og:site_name"')) {
        fullHtml = fullHtml.replace(/<meta property="og:site_name".*?\/>/i, `<meta property="og:site_name" content="${SITE_NAME}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta property="og:site_name" content="${SITE_NAME}" />\n  </head>`);
      }

      if (canonicalUrl) {
        if (fullHtml.includes('<meta property="og:url"')) {
          fullHtml = fullHtml.replace(/<meta property="og:url".*?\/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
        } else {
          fullHtml = fullHtml.replace('</head>', `  <meta property="og:url" content="${canonicalUrl}" />\n  </head>`);
        }
      } else {
        fullHtml = fullHtml.replace(/<meta property="og:url".*?\/>\n?/gi, '');
      }

      if (meta.ogImage) {
        if (fullHtml.includes('<meta property="og:image"')) {
          fullHtml = fullHtml.replace(/<meta property="og:image".*?\/>/i, `<meta property="og:image" content="${meta.ogImage}" />`);
        } else {
          fullHtml = fullHtml.replace('</head>', `  <meta property="og:image" content="${meta.ogImage}" />\n  </head>`);
        }
        if (meta.ogImageAlt) {
          if (fullHtml.includes('<meta property="og:image:alt"')) {
            fullHtml = fullHtml.replace(/<meta property="og:image:alt".*?\/>/i, `<meta property="og:image:alt" content="${meta.ogImageAlt}" />`);
          } else {
            fullHtml = fullHtml.replace('</head>', `  <meta property="og:image:alt" content="${meta.ogImageAlt}" />\n  </head>`);
          }
        }
      } else {
        fullHtml = fullHtml.replace(/<meta property="og:image".*?\/>\n?/gi, '');
        fullHtml = fullHtml.replace(/<meta property="og:image:alt".*?\/>\n?/gi, '');
      }

      // Twitter card metadata
      if (fullHtml.includes('<meta name="twitter:card"')) {
        fullHtml = fullHtml.replace(/<meta name="twitter:card".*?\/>/i, `<meta name="twitter:card" content="summary_large_image" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta name="twitter:card" content="summary_large_image" />\n  </head>`);
      }

      if (fullHtml.includes('<meta name="twitter:title"')) {
        fullHtml = fullHtml.replace(/<meta name="twitter:title".*?\/>/i, `<meta name="twitter:title" content="${meta.title}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta name="twitter:title" content="${meta.title}" />\n  </head>`);
      }

      if (fullHtml.includes('<meta name="twitter:description"')) {
        fullHtml = fullHtml.replace(/<meta name="twitter:description".*?\/>/i, `<meta name="twitter:description" content="${meta.description}" />`);
      } else {
        fullHtml = fullHtml.replace('</head>', `  <meta name="twitter:description" content="${meta.description}" />\n  </head>`);
      }

      if (meta.ogImage) {
        if (fullHtml.includes('<meta name="twitter:image"')) {
          fullHtml = fullHtml.replace(/<meta name="twitter:image".*?\/>/i, `<meta name="twitter:image" content="${meta.ogImage}" />`);
        } else {
          fullHtml = fullHtml.replace('</head>', `  <meta name="twitter:image" content="${meta.ogImage}" />\n  </head>`);
        }
        if (meta.ogImageAlt) {
          if (fullHtml.includes('<meta name="twitter:image:alt"')) {
            fullHtml = fullHtml.replace(/<meta name="twitter:image:alt".*?\/>/i, `<meta name="twitter:image:alt" content="${meta.ogImageAlt}" />`);
          } else {
            fullHtml = fullHtml.replace('</head>', `  <meta name="twitter:image:alt" content="${meta.ogImageAlt}" />\n  </head>`);
          }
        }
      } else {
        fullHtml = fullHtml.replace(/<meta name="twitter:image".*?\/>\n?/gi, '');
        fullHtml = fullHtml.replace(/<meta name="twitter:image:alt".*?\/>\n?/gi, '');
      }

      // Structured data JSON-LD (safe serialization)
      let structuredDataScript = '';
      if (meta.jsonLd) {
        structuredDataScript = `\n  <script type="application/ld+json" id="happy-homes-schema">${safeJsonSerialize(meta.jsonLd)}</script>`;
      }

      // Inject SSR initial data for hydration
      const initialDataScript = `<script>window.__INITIAL_DATA__ = ${safeJsonSerialize({
        developments: sanitizedCatalogue,
        currentDevelopment: sanitizedCurrentDev,
      })};</script>`;
      fullHtml = fullHtml.replace('</head>', `  ${initialDataScript}${structuredDataScript}\n  </head>`);

      // Inject server-rendered HTML into the root DOM node
      fullHtml = fullHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

      // Mandate no-store for admin SSR routes
      if (url.startsWith('/admin')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      }

      // Pre-launch HTTP header: disallow indexing at protocol layer
      res.setHeader('X-Robots-Tag', meta.robots || 'noindex, nofollow');

      res.status(statusCode).set({ 'Content-Type': 'text/html' }).end(fullHtml);
    } catch (e: any) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('SSR Rendering Error:', e);
      next(e);
    }
  });

  return app;
}

// Local development & standalone container listener (AI Studio Preview on Port 3000)
const isMainScript = !process.env.VERCEL && (!process.argv[1] || process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMainScript) {
  createServerApp().then((app) => {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  });
}

export default createServerApp;
