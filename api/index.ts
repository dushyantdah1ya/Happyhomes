import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServerApp } from '../server.ts';

let appPromise: Promise<any> | null = null;

function getApp(): Promise<any> {
  if (!appPromise) {
    appPromise = createServerApp();
  }
  return appPromise;
}

/**
 * Vercel Serverless Function entry point.
 * Ensures cold-start initialization is safely awaited and shared across
 * simultaneous first requests, and reuses the warm Express app instance.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return app(req, res);
}
