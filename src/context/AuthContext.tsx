import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getClientAuth, isFirebaseClientConfigured, loginWithGoogle, logoutUser } from '../lib/firebaseClient';

export type AuthState =
  | 'loading'
  | 'unauthenticated'
  | 'authenticated_owner'
  | 'authenticated_unauthorized'
  | 'server_unconfigured';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authState: AuthState;
  isOwner: boolean;
  unauthorizedUid: string | null;
  serverMessage: string | null;
  isClientConfigured: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authState: 'loading',
  isOwner: false,
  unauthorizedUid: null,
  serverMessage: null,
  isClientConfigured: false,
  signIn: async () => {},
  signOut: async () => {},
  refreshAuth: async () => {},
  getIdToken: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [unauthorizedUid, setUnauthorizedUid] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const isClientConfigured = isFirebaseClientConfigured();

  const verifyWithServer = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setAuthState('unauthenticated');
      setUnauthorizedUid(null);
      setServerMessage(null);
      setLoading(false);
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 200) {
        setAuthState('authenticated_owner');
        setUnauthorizedUid(null);
        setServerMessage(null);
      } else if (res.status === 403) {
        setAuthState('authenticated_unauthorized');
        setUnauthorizedUid(currentUser.uid);
        setServerMessage(data.message || 'Authenticated account is not in the server owner allowlist.');
      } else if (res.status === 503) {
        setAuthState('server_unconfigured');
        setUnauthorizedUid(currentUser.uid);
        setServerMessage(data.message || 'Firebase Admin is not configured on the server.');
      } else {
        setAuthState('unauthenticated');
        setServerMessage(data.message || 'Authentication check failed.');
      }
    } catch (err) {
      console.error('[AuthContext] Verification error:', err);
      setAuthState('unauthenticated');
      setServerMessage('Failed to contact server verification endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isClientConfigured) {
      setLoading(false);
      setAuthState('unauthenticated');
      return;
    }

    const authInstance = getClientAuth();
    if (!authInstance) {
      setLoading(false);
      setAuthState('unauthenticated');
      return;
    }

    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      await verifyWithServer(firebaseUser);
    });

    return () => unsubscribe();
  }, [isClientConfigured]);

  const signIn = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      await verifyWithServer(loggedUser);
    } catch (err) {
      console.error('[AuthContext] Sign-in error:', err);
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    await logoutUser();
    setUser(null);
    setAuthState('unauthenticated');
    setUnauthorizedUid(null);
    setServerMessage(null);
    setLoading(false);
  };

  const refreshAuth = async () => {
    if (user) {
      await verifyWithServer(user);
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authState,
        isOwner: authState === 'authenticated_owner',
        unauthorizedUid,
        serverMessage,
        isClientConfigured,
        signIn,
        signOut,
        refreshAuth,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
