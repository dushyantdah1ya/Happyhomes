# Factual Evidence Inventory - Happy Homes Jaipur

This document records the actual implementation details of data collection, processing, and operational practices as of October 2026. This is a developer-facing inventory for transparency and policy alignment.

## 1. Data Collection & Enquiry Workflow

### Public Enquiry Fields (Collected via /api/enquiries)
| Field | Status | Purpose |
| :--- | :--- | :--- |
| `name` | Required | Identity for consultation |
| `phone` | Required | Primary contact method for follow-up |
| `email` | Optional | Secondary contact/documentation delivery |
| `message` | Optional | Context for the enquiry |
| `service` | Required | Interest classification (e.g. Luxury Villa Construction) |
| `locality` | Required | Target area in Jaipur (e.g. Jagatpura) |
| `marketingConsent` | Optional | Opt-in for occasional updates |
| `acknowledgedContact` | Required | Consent for direct response to the enquiry |
| `idempotencyKey` | Required | Client-side generated key for duplicate prevention |
| `honeypot` | Hidden | Silent bot protection |
| `visitDate` | Optional | Preferred date for site visit |
| `visitTimeSlot` | Optional | Preferred time (IST) for site visit |
| `visitType` | Optional | Site Visit or Video Viewing |

### Visit Coordination
- **Time Windows:** All preferred visit slots operate in **Indian Standard Time (IST)**.
- **Acknowledgement:** Submitting a request does not confirm an appointment; all requests require team confirmation via phone or email.

## 2. Security & Data Protection

### Rate Limiting
- **Identifier:** Client IP address.
- **Anonymization:** Identifiers are hashed using **HMAC SHA-256** with a server-side secret (`ENQUIRY_RATE_LIMIT_SECRET`) before storage.
- **Threshold:** Maximum 5 requests per 1-hour window per identifier.
- **Storage:** Rate limit counters are persisted in Firestore (`system/rate_limits/enquiries`).

### Idempotency
- Uses a unique client-side key and a SHA-256 fingerprint of the normalized payload.
- Prevents duplicate entries from network retries or double-clicks.
- Records stored in `system/idempotency/enquiries`.

### Access Control
- **Admin Access:** All enquiry management and development editing is guarded by **Firebase Authentication**.
- **Owner Allowlist:** Only specific UIDs verified via the owner token service are permitted to access `/api/admin/*`.

## 3. Storage & Processors

| Provider | Service | Purpose |
| :--- | :--- | :--- |
| **Google Cloud / Firebase** | Firestore | Primary persistent database for enquiries, developments, and settings. |
| **Google Cloud / Firebase** | Authentication | Owner identity management and session verification. |
| **Cloudinary** | Media API | Managed storage and delivery for architectural photos and documents. |
| **AI Studio** | Hosting/Editor | Application runtime environment and development interface. |

## 4. Operational Practices

### Data Retention & Deletion
- **Enquiry Records:** Persisted in Firestore until manually archived or deleted by an authorized owner via the Admin Dashboard.
- **Logs:** Server logs and rate-limit hashes are subject to standard provider retention (typically 30-90 days).
- **No Automated Deletion:** There is currently no automated cleanup mechanism for stale enquiry data.

### Cookies & Local Storage
- **Firebase Auth:** Standard browser persistence for authentication sessions.
- **Application State:** No tracking pixels, third-party analytics (e.g., GA), or invasive profiling cookies are implemented in the current codebase.

## 5. External Integrations (Outbound Only)
- **WhatsApp:** Direct links to `wa.me/919166054964` with pre-filled messages.
- **Telephony:** `tel:` links for direct dialing.
- **Email:** `mailto:` links for project desk coordinates.
- **Maps:** Outbound links to external navigation services for site coordinates.

## 6. Missing Legal Disclosures
- **Operator Identity:** Registered business name and legal address for the operator of Happy Homes is not yet publicly disclosed in a dedicated policy.
- **Privacy Contact:** A specific point of contact for data-related inquiries is not yet defined.
