import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShieldCheck,
  LogOut,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  UserCheck,
  Home,
  Users,
  Plus,
  ArrowRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  enquiryStats: {
    newEnquiries: number | null;
    dueFollowUps: number | null;
    overdueFollowUps: number | null;
  };
  devStats: {
    totalPublished: number | null;
    availablePublished: number | null;
    needsAvailabilityReview: number | null;
    needsBrochureReview: number | null;
  };
}

interface ConnectionRecord {
  verifiedAt: string;
  verifiedBy: string;
  serverTime: number;
}

export default function AdminDashboard() {
  const { user, loading, isOwner, signOut, getIdToken } = useAuth();
  const navigate = useNavigate();

  // Stats State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Connection Check State
  const [connRecord, setConnRecord] = useState<ConnectionRecord | null>(null);
  const [isConnLoading, setIsConnLoading] = useState<boolean>(true);
  const [isConnWriting, setIsConnWriting] = useState<boolean>(false);
  const [connError, setConnError] = useState<string | null>(null);

  // Redirect unauthenticated or unauthorized users to login
  useEffect(() => {
    if (!loading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [loading, user, isOwner, navigate]);

  useEffect(() => {
    if (isOwner) {
      fetchStats();
      fetchConnectionRecord();
    }
  }, [isOwner]);

  const fetchStats = async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.status === 200) {
        setStats(data);
        setLastRefreshed(new Date());
      } else {
        setStatsError(data.message || 'Failed to fetch dashboard stats.');
        setStats(null); // Clear on failure to avoid "0" display
      }
    } catch (err) {
      setStatsError('Network error fetching dashboard stats.');
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchConnectionRecord = async () => {
    setIsConnLoading(true);
    setConnError(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch('/api/admin/connection-check', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.status === 200) {
        setConnRecord(data.record);
      } else {
        setConnError(data.message || 'Failed to read connection record.');
      }
    } catch (err) {
      setConnError('Network error reading connection record.');
    } finally {
      setIsConnLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setIsConnWriting(true);
    setConnError(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch('/api/admin/connection-check', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.status === 200 && data.record) {
        setConnRecord(data.record);
      } else {
        setConnError(data.message || 'Connection check failed.');
      }
    } catch (err) {
      setConnError('Network error writing connection record.');
    } finally {
      setIsConnWriting(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6 text-[#141414]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#141414]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Verifying Owner Credentials...
          </span>
        </div>
      </main>
    );
  }

  if (!user || !isOwner) {
    return null;
  }

  const StatValue = ({ 
    value, 
    loading, 
    onRetry 
  }: { 
    value: number | null | undefined; 
    loading: boolean; 
    onRetry?: () => void; 
  }) => {
    if (loading) return <Loader2 size={24} className="animate-spin inline-block text-black/10" />;
    if (value === null || value === undefined) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="text-[#A5A5A5]">—</span>
          {onRetry && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRetry();
              }}
              className="text-[10px] font-mono uppercase tracking-wider text-[#B5623A] hover:underline cursor-pointer py-0.5 px-1.5 rounded bg-[#B5623A]/10"
              title="Metric unavailable. Click to retry query."
            >
              Retry
            </button>
          )}
        </span>
      );
    }
    return <span>{value}</span>;
  };

  return (
    <main className="w-full min-h-screen bg-[#F8F8F8] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Top Admin Navbar */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin">
              <Logo variant="dark" size="sm" subtitle="OWNER WORKSPACE" />
            </Link>

            <nav className="hidden sm:flex items-center gap-1 border-l border-black/10 pl-6 text-[12px] font-mono uppercase tracking-wider">
              <span className="px-3 py-1.5 rounded-full bg-[#141414] text-white font-medium">
                Overview
              </span>
              <Link to="/admin/developments" className="px-3 py-1.5 rounded-full text-[#737373] hover:text-[#141414] transition-colors font-medium">
                Developments
              </Link>
              <Link to="/admin/enquiries" className="px-3 py-1.5 rounded-full text-[#737373] hover:text-[#141414] transition-colors font-medium">
                Enquiries
              </Link>
              <Link to="/admin/settings" className="px-3 py-1.5 rounded-full text-[#737373] hover:text-[#141414] transition-colors font-medium">
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#F8F8F8] border border-black/10 px-3 py-1.5 rounded-full text-[11px] font-mono text-[#555]">
              <ShieldCheck size={13} className="text-[#B5623A]" />
              <span className="truncate max-w-[200px]">{user.email}</span>
            </div>

            <button
              onClick={() => signOut()}
              className="border border-black/15 hover:border-black/40 text-[#141414] px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <section className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-12 flex-1">
        
        {/* Workspace Title & Orientation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B5623A] block mb-2">
              Operational Intelligence
            </span>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-[#141414]">
              Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <p className="text-[13px] text-[#666] font-light leading-relaxed">
                Real-time snapshot of Happy Homes operations.
              </p>
              {lastRefreshed && (
                <span className="text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-full">
                  Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isStatsLoading}
              className="p-2.5 border border-black/10 hover:border-black/30 rounded-full text-[#666] hover:text-[#141414] transition-colors cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw size={16} className={isStatsLoading ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/admin/developments/new"
              className="bg-[#141414] hover:bg-black text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>Add Development</span>
            </Link>
          </div>
        </div>

        {statsError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[12px] text-rose-800 flex items-start gap-2 max-w-2xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold mb-0.5">Stats Retrieval Failed</p>
              <p className="opacity-80">{statsError}</p>
            </div>
            <button onClick={fetchStats} className="text-[10px] font-bold uppercase tracking-wider underline hover:no-underline">Retry</button>
          </div>
        )}

        {!statsError && stats && (
          Object.values(stats.enquiryStats).includes(null) || 
          Object.values(stats.devStats).includes(null)
        ) && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-800 flex items-center justify-between max-w-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>Some operational metrics are currently unavailable. Click retry to refresh.</span>
            </div>
            <button onClick={fetchStats} className="text-[10px] font-bold uppercase tracking-wider underline hover:no-underline ml-4">Retry</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          <Link 
            to="/admin/enquiries?status=New"
            className="group bg-white border border-black/10 rounded-3xl p-8 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Users size={20} />
                </div>
                <ArrowRight size={16} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">New Enquiries</h2>
              <div className="text-4xl font-light tracking-tight text-[#141414]">
                <StatValue value={stats?.enquiryStats.newEnquiries} loading={isStatsLoading} onRetry={fetchStats} />
              </div>
            </div>
            <p className="text-[12px] text-[#666] mt-4 font-light">
              Prospective clients awaiting initial response.
            </p>
          </Link>

          <Link 
            to="/admin/enquiries?followUp=due"
            className="group bg-white border border-black/10 rounded-3xl p-8 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock size={20} />
                </div>
                <ArrowRight size={16} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">Due Follow-ups</h2>
              <div className="text-4xl font-light tracking-tight text-[#141414] flex items-baseline gap-2">
                <StatValue value={stats?.enquiryStats.dueFollowUps} loading={isStatsLoading} onRetry={fetchStats} />
                {stats && stats.enquiryStats.overdueFollowUps !== null && stats.enquiryStats.overdueFollowUps > 0 && (
                  <span className="text-[12px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    +{stats.enquiryStats.overdueFollowUps} Overdue
                  </span>
                )}
                {stats && stats.enquiryStats.overdueFollowUps === null && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#A5A5A5] uppercase bg-black/5 px-2 py-0.5 rounded-full">
                    <span>Overdue Unavailable</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fetchStats();
                      }}
                      className="text-[#B5623A] underline hover:no-underline cursor-pointer"
                    >
                      Retry
                    </button>
                  </span>
                )}
              </div>
            </div>
            <p className="text-[12px] text-[#666] mt-4 font-light">
              Client callbacks and site visits scheduled for today.
            </p>
          </Link>

          <Link 
            to="/admin/developments?status=published"
            className="group bg-white border border-black/10 rounded-3xl p-8 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Home size={20} />
                </div>
                <ArrowRight size={16} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">Live Developments</h2>
              <div className="text-4xl font-light tracking-tight text-[#141414] flex items-baseline gap-2">
                <StatValue value={stats?.devStats.totalPublished} loading={isStatsLoading} onRetry={fetchStats} />
                {stats && stats.devStats.availablePublished !== null && (
                  <span className="text-[12px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stats.devStats.availablePublished} Available
                  </span>
                )}
              </div>
            </div>
            <p className="text-[12px] text-[#666] mt-4 font-light">
              Properties currently visible on the public website.
            </p>
          </Link>

          <Link 
            to="/admin/developments?needsReview=availability"
            className="group bg-white border border-black/10 rounded-3xl p-8 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stats?.devStats.needsAvailabilityReview ? 'bg-orange-50 text-orange-600' : 'bg-[#F8F8F8] text-[#737373]'}`}>
                  <AlertTriangle size={20} />
                </div>
                <ArrowRight size={16} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">Availability Checks</h2>
              <div className="text-4xl font-light tracking-tight text-[#141414]">
                <StatValue value={stats?.devStats.needsAvailabilityReview} loading={isStatsLoading} onRetry={fetchStats} />
              </div>
            </div>
            <p className="text-[12px] text-[#666] mt-4 font-light leading-relaxed">
              {!stats && !isStatsLoading ? "Check status unavailable." : (stats?.devStats.needsAvailabilityReview === null
                ? "Availability verification status is currently unavailable."
                : (stats?.devStats.needsAvailabilityReview 
                  ? "Developments needing current unit availability confirmation."
                  : "All live development unit statuses are up-to-date."))}
            </p>
          </Link>

          <Link 
            to="/admin/developments?needsReview=brochure"
            className="group bg-white border border-black/10 rounded-3xl p-8 shadow-xs hover:shadow-md hover:border-black/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stats?.devStats.needsBrochureReview ? 'bg-orange-50 text-orange-600' : 'bg-[#F8F8F8] text-[#737373]'}`}>
                  <FileText size={20} />
                </div>
                <ArrowRight size={16} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#737373] mb-1">Brochure Reviews</h2>
              <div className="text-4xl font-light tracking-tight text-[#141414]">
                <StatValue value={stats?.devStats.needsBrochureReview} loading={isStatsLoading} onRetry={fetchStats} />
              </div>
            </div>
            <p className="text-[12px] text-[#666] mt-4 font-light leading-relaxed">
              {!stats && !isStatsLoading ? "Check status unavailable." : (stats?.devStats.needsBrochureReview === null
                ? "Brochure verification status is currently unavailable."
                : (stats?.devStats.needsBrochureReview 
                  ? "Brochures needing verification against latest site records."
                  : "All project brochures are within their review period."))}
            </p>
          </Link>

          <div className="bg-[#141414] text-white border border-black/10 rounded-3xl p-8 shadow-md flex flex-col justify-between">
            <div>
              <h2 className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-6">Operations Shortcuts</h2>
              <nav className="space-y-4">
                <Link to="/admin/developments" className="flex items-center justify-between group">
                  <span className="text-[13px] font-medium group-hover:translate-x-1 transition-all">Manage Developments</span>
                  <ArrowRight size={14} className="opacity-50" />
                </Link>
                <Link to="/admin/enquiries" className="flex items-center justify-between group">
                  <span className="text-[13px] font-medium group-hover:translate-x-1 transition-all">Open Inbox</span>
                  <ArrowRight size={14} className="opacity-50" />
                </Link>
                <Link to="/admin/settings" className="flex items-center justify-between group">
                  <span className="text-[13px] font-medium group-hover:translate-x-1 transition-all">Business Settings</span>
                  <ArrowRight size={14} className="opacity-50" />
                </Link>
              </nav>
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-white/40">
              <ShieldCheck size={12} />
              <span>Restricted Owner Access</span>
            </div>
          </div>
        </div>

        {/* Database Connection Verification Module */}
        <div className="max-w-2xl bg-white border border-black/10 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database size={16} className="text-[#B5623A]" />
                <h2 className="text-lg font-medium text-[#141414]">Connection Check</h2>
              </div>
              <p className="text-[12px] text-[#666] font-light">Verifies end-to-end read and write connectivity between the authorized server and Firestore.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchConnectionRecord}
                disabled={isConnLoading || isConnWriting}
                className="p-2 border border-black/10 hover:border-black/30 rounded-full text-[#666] transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={isConnLoading ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={handleCheckConnection}
                disabled={isConnWriting || isConnLoading}
                className="bg-[#141414] hover:bg-black text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 transition-all cursor-pointer disabled:bg-neutral-300"
              >
                {isConnWriting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>{isConnWriting ? 'Writing...' : 'Check Connection'}</span>
              </button>
            </div>
          </div>

          {connError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[12px] text-rose-800 flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{connError}</span>
            </div>
          )}

          <div className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-6 space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block">NAMESPACED VERIFICATION RECORD</span>

            {isConnLoading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-[#737373]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[11px] font-mono uppercase">Querying Firestore...</span>
              </div>
            ) : connRecord ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-black/5 rounded-xl text-[10px] font-mono">
                  <div className="text-[#737373] mb-1 flex items-center gap-1.5"><Clock size={11} /> TIMESTAMP (ISO)</div>
                  <span className="text-[#141414] font-medium break-all">{connRecord.verifiedAt}</span>
                </div>
                <div className="p-3 bg-white border border-black/5 rounded-xl text-[10px] font-mono">
                  <div className="text-[#737373] mb-1 flex items-center gap-1.5"><UserCheck size={11} /> VERIFIED BY UID</div>
                  <code className="text-[#141414] font-bold break-all">{connRecord.verifiedBy}</code>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/70 border border-dashed border-black/15 rounded-xl text-center text-[12px] text-[#737373] font-light">
                No connection record stored yet. Click "Check Connection" to perform verification.
              </div>
            )}
          </div>
        </div>

      </section>

      <footer className="border-t border-black/10 bg-white py-4 px-6 md:px-12 text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
        Happy Homes Jaipur • Internal Administrative Environment
      </footer>
    </main>
  );
}
