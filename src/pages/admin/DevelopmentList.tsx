import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Plus,
  Search,
  Building2,
  Calendar,
  ExternalLink,
  Edit3,
  Loader2,
  AlertCircle,
  Archive,
  RefreshCw,
  Home,
  Layers,
} from 'lucide-react';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { type DevelopmentDraft, formatPriceDisplay } from '../../types/development';
import type { BusinessSettings } from '../../types/settings';

export default function DevelopmentList() {
  const { user, isOwner, loading: authLoading, getIdToken } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [developments, setDevelopments] = useState<DevelopmentDraft[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [needsReviewFilter, setNeedsReviewFilter] = useState<'all' | 'availability' | 'brochure'>('all');
  const [isFilterInitialized, setIsFilterInitialized] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Initialize filters from URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const status = params.get('status') as any;
    const review = params.get('needsReview') as any;

    if (status && ['all', 'published', 'draft', 'archived'].includes(status)) {
      setStatusFilter(status);
    }
    if (review && ['all', 'availability', 'brochure'].includes(review)) {
      setNeedsReviewFilter(review);
      if (review !== 'all') {
        setStatusFilter('published');
      }
    }
    setIsFilterInitialized(true);
  }, [search]);

  useEffect(() => {
    if (!authLoading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [authLoading, user, isOwner, navigate]);

  const fetchData = useCallback(async () => {
    if (!isFilterInitialized) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (needsReviewFilter !== 'all') params.append('needsReview', needsReviewFilter);

      const [devRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/developments?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/settings')
      ]);

      const [devData, settingsData] = await Promise.all([
        devRes.json(),
        settingsRes.json()
      ]);

      if (devRes.ok && devData.developments) {
        setDevelopments(devData.developments);
      } else {
        setErrorMessage(devData.message || 'Failed to retrieve developments.');
      }

      if (settingsRes.ok && settingsData.settings) {
        setSettings(settingsData.settings);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error fetching data.');
    } finally {
      setLoading(false);
    }
  }, [getIdToken, statusFilter, needsReviewFilter]);

  useEffect(() => {
    if (isOwner) {
      fetchData();
    }
  }, [isOwner, statusFilter, needsReviewFilter, fetchData]);

  const handleMarkReviewed = async (dev: DevelopmentDraft, type: 'availability' | 'brochure') => {
    try {
      setReviewingId(`${dev.id}-${type}`);
      const token = await getIdToken();
      if (!token) return;

      const revision = dev.publishedVersion;
      if (revision === undefined || revision === null) {
        throw new Error('Development must be published to be reviewed.');
      }

      const body: any = { type, revision };
      if (type === 'brochure') {
        body.assetId = dev.brochure?.assetId;
      }

      const res = await fetch(`/api/admin/developments/${dev.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Update local state
        setDevelopments(prev => prev.map(d => {
          if (d.id === dev.id) {
            const now = new Date().toISOString();
            const audit = { timestamp: now, actorUid: user?.uid || 'unknown', revision };
            return {
              ...d,
              [type === 'availability' ? 'lastAvailabilityCheck' : 'lastBrochureReview']: 
                type === 'availability' ? audit : { ...audit, assetId: dev.brochure?.assetId || '' }
            };
          }
          return d;
        }));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to mark reviewed.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  const isReviewDue = (
    type: 'availability' | 'brochure',
    dev: DevelopmentDraft,
    intervalDays: number
  ) => {
    const pubVersion = dev.publishedVersion || 0;
    
    if (type === 'availability') {
      const check = dev.lastAvailabilityCheck;
      if (!check || check.revision !== pubVersion) return true;
      const last = new Date(check.timestamp).getTime();
      const now = new Date().getTime();
      const diff = (now - last) / (1000 * 60 * 60 * 24);
      return diff >= intervalDays;
    } else {
      const check = dev.lastBrochureReview;
      const currentAssetId = dev.brochure?.assetId || null;
      if (!check || check.revision !== pubVersion || check.assetId !== currentAssetId) return true;
      const last = new Date(check.timestamp).getTime();
      const now = new Date().getTime();
      const diff = (now - last) / (1000 * 60 * 60 * 24);
      return diff >= intervalDays;
    }
  };

  const filtered = developments.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : dev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="w-full min-h-screen bg-[#F8F8F8] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Admin Header */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin">
              <Logo variant="dark" size="sm" subtitle="OWNER WORKSPACE" />
            </Link>

            <nav className="hidden sm:flex items-center gap-1 border-l border-black/10 pl-6 text-[12px] font-mono uppercase tracking-wider">
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-full text-[#737373] hover:text-[#141414] transition-colors"
              >
                Overview
              </Link>
              <span className="px-3 py-1.5 rounded-full bg-[#141414] text-white font-medium">
                Developments
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/developments/new"
              className="bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus size={13} />
              <span>New Development</span>
            </Link>
            <Link
              to="/"
              className="hidden md:inline-block text-[11px] font-mono uppercase tracking-[0.15em] text-[#737373] hover:text-[#141414] transition-colors"
            >
              Public Site →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-10 flex-1">
        {/* Title and Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B5623A] block mb-1.5">
              Portfolio Management
            </span>
            <h1 className="text-3xl font-light tracking-tight text-[#141414]">
              Developments Manager
            </h1>
            <p className="text-[13px] text-[#666] font-light mt-1">
              Create, edit drafts, and publish verified residential listings.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-black/10 p-1 rounded-full text-[11px] font-mono">
              {(['all', 'published', 'draft', 'archived'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setStatusFilter(filter);
                    // Clear review filter if changing status, as reviews only apply to published
                    if (filter !== 'published' && filter !== 'all') setNeedsReviewFilter('all');
                  }}
                  className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-[#141414] text-white font-medium'
                      : 'text-[#666] hover:text-[#141414]'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-black/10 p-1 rounded-full text-[11px] font-mono">
              {(['all', 'availability', 'brochure'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setNeedsReviewFilter(filter);
                    if (filter !== 'all') setStatusFilter('published');
                  }}
                  className={`px-3 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                    needsReviewFilter === filter
                      ? 'bg-[#B5623A] text-white font-medium'
                      : 'text-[#666] hover:text-[#141414]'
                  }`}
                >
                  {filter === 'all' ? 'Review: Any' : filter === 'availability' ? 'Due: Availability' : 'Due: Brochure'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-4 py-3 shadow-xs">
          <Search size={16} className="text-[#888] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by development name, type, or locality..."
            className="w-full text-[13px] text-[#141414] placeholder-[#999] outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-mono uppercase text-[#888] hover:text-[#141414]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[12px] text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#737373]">
            <Loader2 size={24} className="animate-spin text-[#141414]" />
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Loading developments catalog...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-black/10 rounded-3xl p-12 text-center my-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F8F8F8] border border-black/10 flex items-center justify-center mx-auto text-[#737373]">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-[#141414]">No developments found</h2>
              <p className="text-[12px] text-[#666] font-light max-w-sm mx-auto mt-1">
                {searchQuery
                  ? 'No listings match your search criteria. Try clearing the filter.'
                  : statusFilter !== 'all'
                  ? `No developments currently in ${statusFilter} state.`
                  : 'Get started by creating your first residential development draft.'}
              </p>
            </div>
            <Link
              to="/admin/developments/new"
              className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-black text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all"
            >
              <Plus size={13} />
              <span>Create Development</span>
            </Link>
          </div>
        )}

        {/* Listings Cards / Rows */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((dev) => (
              <div
                key={dev.id}
                className="bg-white border border-black/10 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-black/25 transition-all"
              >
                {/* Details Column */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F8F8F8] border border-black/10 text-[#555]">
                      {dev.type}
                    </span>

                    {/* Publication State Badge */}
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-medium ${
                        dev.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : dev.status === 'draft'
                          ? 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {dev.status}
                    </span>

                    {/* Unpublished Changes Warning Badge */}
                    {dev.hasUnpublishedChanges && dev.status === 'published' && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                        Unpublished Edits
                      </span>
                    )}

                    {/* Availability Badge */}
                    <span className="text-[10px] font-mono uppercase text-[#737373]">
                      • {dev.availability}
                    </span>
                  </div>

                  <h3 className="text-xl font-medium tracking-tight text-[#141414]">
                    {dev.name || 'Untitled Draft'}
                  </h3>

                  <p className="text-[12px] text-[#666] font-light flex items-center gap-4">
                    <span>{dev.locality || 'No locality specified'}</span>
                    <span>•</span>
                    <span className="font-mono font-medium text-[#141414]">
                      {formatPriceDisplay(dev.priceMode, dev.priceAmount)}
                    </span>
                  </p>

                  {/* Review Reminders UI */}
                  {dev.status === 'published' && settings && (
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {/* Availability Review */}
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
                        isReviewDue('availability', dev, settings.operationalSettings?.availabilityReviewIntervalDays || 30)
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-white border-black/5 text-[#888]'
                      }`}>
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Availability</span>
                        <span className="text-[10px] font-light">
                          {dev.lastAvailabilityCheck ? new Date(dev.lastAvailabilityCheck.timestamp).toLocaleDateString() : 'Never'}
                        </span>
                        <button
                          onClick={() => handleMarkReviewed(dev, 'availability')}
                          disabled={reviewingId === `${dev.id}-availability`}
                          className="ml-1 p-1 hover:bg-black/5 rounded-md transition-colors disabled:opacity-30"
                          title="Mark as checked today"
                        >
                          <RefreshCw size={10} className={reviewingId === `${dev.id}-availability` ? 'animate-spin' : ''} />
                        </button>
                      </div>

                      {/* Brochure Review */}
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${
                        isReviewDue('brochure', dev, settings.operationalSettings?.brochureReviewIntervalDays || 90)
                          ? 'bg-orange-50 border-orange-200 text-orange-700'
                          : 'bg-white border-black/5 text-[#888]'
                      }`}>
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Brochure</span>
                        <span className="text-[10px] font-light">
                          {dev.lastBrochureReview ? new Date(dev.lastBrochureReview.timestamp).toLocaleDateString() : 'Never'}
                        </span>
                        <button
                          onClick={() => handleMarkReviewed(dev, 'brochure')}
                          disabled={reviewingId === `${dev.id}-brochure`}
                          className="ml-1 p-1 hover:bg-black/5 rounded-md transition-colors disabled:opacity-30"
                          title="Mark as reviewed today"
                        >
                          <RefreshCw size={10} className={reviewingId === `${dev.id}-brochure` ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata & Actions Column */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:border-l md:border-black/10 md:pl-6 shrink-0">
                  <div className="text-[10px] font-mono text-[#888] space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Updated: {new Date(dev.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span>v{dev.version}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Public Detail Page Link (if published) */}
                    {dev.status === 'published' && dev.publishedSlug && (
                      <Link
                        to={`/developments/${dev.publishedSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View Live Public Page"
                        className="p-2 border border-black/10 hover:border-black/30 rounded-full text-[#666] hover:text-[#141414] transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}

                    {/* Edit Button */}
                    <Link
                      to={`/admin/developments/${dev.id}`}
                      className="bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Edit3 size={12} />
                      <span>Edit Draft</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white py-4 px-6 md:px-12 text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
        Happy Homes Jaipur • Internal Portfolio Editor
      </footer>
    </main>
  );
}
