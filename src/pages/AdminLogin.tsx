import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const {
    user,
    loading,
    authState,
    isOwner,
    unauthorizedUid,
    serverMessage,
    isClientConfigured,
    signIn,
    signOut,
  } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [runtimeInfo, setRuntimeInfo] = useState<{
    hostname: string;
    isIframe: boolean;
  }>({
    hostname: '',
    isIframe: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRuntimeInfo({
        hostname: window.location.hostname,
        isIframe: window.self !== window.top,
      });
    }
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      await signIn();
      // If authorized owner, navigate to /admin
      if (isOwner) {
        navigate('/admin');
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'Google sign-in failed. Please check popup permissions.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#F8F8F8] text-[#141414] flex flex-col justify-between p-6 sm:p-10 selection:bg-[#141414] selection:text-white">
      {/* Top Header */}
      <header className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
        <Link to="/" className="inline-block">
          <Logo variant="dark" size="sm" subtitle="BUILDER ADMIN" />
        </Link>
        <Link
          to="/"
          className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] hover:text-[#141414] transition-colors"
        >
          ← Public Site
        </Link>
      </header>

      {/* Main Container */}
      <section className="max-w-md w-full mx-auto my-12 bg-white border border-black/10 rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B5623A] block mb-2">
            Restricted Access
          </span>
          <h1 className="text-3xl font-light tracking-tight text-[#141414]">
            Owner Sign-in
          </h1>
          <p className="text-[13px] text-[#666] font-light mt-1.5 leading-relaxed">
            Authorized management workspace for Happy Homes developments and database operations.
          </p>
        </div>

        {/* State: Initial Loading */}
        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-[#666]">
            <Loader2 size={24} className="animate-spin text-[#141414]" />
            <span className="text-[12px] font-mono uppercase tracking-wider">Verifying session...</span>
          </div>
        )}

        {/* State: Client Config Missing */}
        {!loading && !isClientConfigured && (
          <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-[12px] text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={15} className="text-amber-700 shrink-0" />
              <span>Firebase Web Configuration Needed</span>
            </div>
            <p className="font-light text-amber-800 leading-relaxed text-[11px]">
              The public website remains fully accessible. To enable owner sign-in, add the client-side Firebase variables (e.g. <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">VITE_FIREBASE_API_KEY</code>, <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">VITE_FIREBASE_AUTH_DOMAIN</code>) to your environment.
            </p>
          </div>
        )}

        {/* State: Authenticated Owner */}
        {!loading && isOwner && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[12px] text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium block">Authorized Owner Session Active</span>
                <span className="text-[11px] text-emerald-700 block font-mono mt-0.5">{user?.email}</span>
              </div>
            </div>
            <Link
              to="/admin"
              className="w-full bg-[#141414] hover:bg-black text-white py-3.5 px-6 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all"
            >
              <span>Enter Owner Workspace</span>
              <ArrowRight size={13} />
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full border border-black/10 hover:border-black/30 text-[#666] hover:text-[#141414] py-2.5 text-[11px] font-mono uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* State: Authenticated but NOT on Owner Allowlist (403) */}
        {!loading && authState === 'authenticated_unauthorized' && (
          <div className="space-y-5">
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-[12px] text-rose-900 space-y-2.5">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span>Account Not Authorized (403)</span>
              </div>
              <p className="font-light text-rose-800 leading-relaxed text-[11px]">
                Your Google account is verified, but your User ID is not on the server owner allowlist.
              </p>
              <div className="bg-white/80 p-2.5 border border-rose-200 rounded-lg">
                <span className="block text-[9px] font-mono uppercase text-rose-600 tracking-wider">Your Firebase User ID (UID):</span>
                <code className="text-[11px] font-mono font-bold text-[#141414] select-all break-all block mt-0.5">
                  {unauthorizedUid}
                </code>
              </div>
              <p className="text-[10px] text-rose-700 font-light leading-relaxed">
                To grant access, add this exact UID to <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">OWNER_FIREBASE_UID_ALLOWLIST</code> in your server environment secrets.
              </p>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full bg-[#141414] hover:bg-black text-white py-3 px-6 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        )}

        {/* State: Server Unconfigured (503) */}
        {!loading && authState === 'server_unconfigured' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-2xl text-[12px] text-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle size={15} className="text-neutral-700 shrink-0" />
                <span>Server Firebase Admin Pending</span>
              </div>
              <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                {serverMessage || 'Server requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full border border-black/10 text-[#666] py-2.5 text-[11px] font-mono uppercase tracking-wider rounded-full hover:border-black/30"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* State: Unauthenticated (Ready for Google Sign-In) */}
        {!loading && authState === 'unauthenticated' && (
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isSigningIn || !isClientConfigured}
              className={`w-full py-4 px-6 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-3 transition-all cursor-pointer ${
                isClientConfigured
                  ? 'bg-[#141414] hover:bg-black text-white shadow-sm'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {isSigningIn ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-black/5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A5A5A5] flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} />
                Enforces Server Allowlist Check
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Temporary Development-Only Diagnostic Panel (Excluded in production) */}
      {import.meta.env.DEV && (
        <div className="max-w-md w-full mx-auto mb-8 p-5 bg-neutral-900 text-white rounded-2xl text-[11px] font-mono space-y-2.5 shadow-sm border border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-[10px] uppercase text-[#B5623A] font-bold tracking-wider">
              Runtime Diagnostic (Dev Only)
            </span>
            <span className="text-[9px] text-neutral-400">Read-Only</span>
          </div>

          <div className="space-y-1.5 text-neutral-300">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Runtime Hostname:</span>
              <span className="text-emerald-400 font-bold break-all">{runtimeInfo.hostname || 'Detecting...'}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Iframe Environment:</span>
              <span>{runtimeInfo.isIframe ? 'Inside Iframe (parent window controls popup)' : 'Top-level Window (standalone)'}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Active Firebase Project ID:</span>
              <span className="text-white">{import.meta.env.VITE_FIREBASE_PROJECT_ID || 'UNSET'}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Active Auth Domain:</span>
              <span className="text-white">{import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'UNSET'}</span>
            </div>

            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">Active App ID:</span>
              <span className="text-white">{import.meta.env.VITE_FIREBASE_APP_ID || 'UNSET'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
        Happy Homes Jaipur • Architectural Builders & Direct Developers
      </footer>
    </main>
  );
}
