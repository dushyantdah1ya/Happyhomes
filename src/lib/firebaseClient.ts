import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export function isFirebaseClientConfigured(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const env: Record<string, string | undefined> =
    typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  return Boolean(
    env.VITE_FIREBASE_API_KEY &&
      env.VITE_FIREBASE_AUTH_DOMAIN &&
      env.VITE_FIREBASE_PROJECT_ID
  );
}

export function getClientAuth(): Auth | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (auth) {
    return auth;
  }

  if (!isFirebaseClientConfigured()) {
    return null;
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return auth;
  } catch (err) {
    console.error('[Firebase Client] Init error:', err);
    return null;
  }
}

export async function loginWithGoogle(): Promise<User> {
  const clientAuth = getClientAuth();
  if (!clientAuth) {
    throw new Error('Firebase client is not configured with required environment variables.');
  }

  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  const result = await signInWithPopup(clientAuth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  const clientAuth = getClientAuth();
  if (clientAuth) {
    await signOut(clientAuth);
  }
}
