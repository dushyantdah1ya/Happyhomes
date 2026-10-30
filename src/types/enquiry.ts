export type EnquiryStatus = 'New' | 'Contacted' | 'Visit Arranged' | 'Closed' | 'Archived';

export interface Enquiry {
  id: string;
  idempotencyKey: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  service: string;
  locality: string | null;
  developmentId: string | null;
  developmentTitle: string | null;
  developmentSlug: string | null;
  status: EnquiryStatus;
  createdAt: string;
  marketingConsent: boolean;
  acknowledgedContact: boolean;
  formVersion: string;
  source?: string | null;
  // Visit Request Fields
  visitDate?: string | null;
  visitTimeSlot?: string | null;
  visitType?: 'In-person' | 'Video' | null;
  // Private Admin Fields
  internalNotes?: string | null;
  followUpDate?: string | null; // ISO Date String (YYYY-MM-DD)
  updatedAt?: string | null;
  updatedByUID?: string | null;
  revision?: number;
}

export interface EnquirySubmissionRequest {
  idempotencyKey: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  service: string;
  locality?: string;
  developmentId?: string;
  marketingConsent: boolean;
  acknowledgedContact: boolean;
  formVersion: string;
  honeypot?: string; // Should be empty
  source?: string;
  // Visit Request Fields
  visitDate?: string;
  visitTimeSlot?: string;
  visitType?: 'In-person' | 'Video';
}

export interface RateLimitRecord {
  count: number;
  expiresAt: string;
}
