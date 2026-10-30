import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Building2,
  Calendar,
  Phone,
  MessageSquare,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  DevelopmentPublic,
  DevelopmentType,
  ConstructionStage,
  AvailabilityStatus,
} from '../types/development';
import DevelopmentCard from './DevelopmentCard';
import { useSettings } from '../hooks/useSettings';
import { NAVIGATION_REGISTRY } from '../config/navigation';
import { usePublicCatalog } from '../context/PublicCatalogContext';

interface DevelopmentFinderProps {
  /** Fixed type filter (e.g. for /villas, /independent-floors, /plots) */
  fixedType?: DevelopmentType;
  /** Fixed stage filter (e.g. for /completed-projects) */
  fixedStage?: ConstructionStage;
  /** Header title */
  pageTitle: string;
  /** Header subtitle */
  pageSubtitle: string;
  /** Eyebrow tag */
  eyebrowText?: string;
  /** Active category tab identifier */
  activeTab: 'all' | 'villas' | 'floors' | 'plots' | 'completed';
  /** Optional pre-loaded developments from SSR */
  initialDevelopments?: DevelopmentPublic[];
}

const PAGE_SIZE = 12;

export default function DevelopmentFinder({
  fixedType,
  fixedStage,
  pageTitle,
  pageSubtitle,
  eyebrowText = 'Architectural Portfolio • Jaipur',
  activeTab,
  initialDevelopments,
}: DevelopmentFinderProps) {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const { initialDevelopments: contextDevs } = usePublicCatalog();

  // Determine initial data state from context, prop, or window
  const ssrData =
    initialDevelopments ||
    contextDevs ||
    (typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__?.developments : undefined);

  const [developments, setDevelopments] = useState<DevelopmentPublic[]>(() =>
    Array.isArray(ssrData) ? ssrData : []
  );
  const [loading, setLoading] = useState<boolean>(() => !Array.isArray(ssrData));
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL search parameters
  const searchQuery = searchParams.get('q') || '';
  const selectedType = fixedType || (searchParams.get('type') as DevelopmentType | 'All') || 'All';
  const selectedLocality = searchParams.get('locality') || 'All';
  const selectedAvailability = (searchParams.get('status') as AvailabilityStatus | 'All') || 'All';
  const selectedStage = fixedStage || (searchParams.get('stage') as ConstructionStage | 'All') || 'All';
  const selectedBedrooms = searchParams.get('bed') || 'All';
  const selectedMaxBudget = searchParams.get('budget') || 'All';
  const sortBy = (searchParams.get('sort') as 'newest' | 'price-asc' | 'price-desc') || 'newest';
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Helper to update URL search parameters while preserving other params
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || value === 'All' || value === '' || (key === 'page' && value === '1')) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          // Reset to page 1 when changing filters
          if (key !== 'page') {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Fetch developments from public API endpoint
  const fetchDevelopments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fixedType) params.set('type', fixedType);
      if (fixedStage) params.set('stage', fixedStage);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/developments${qs}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve published developments.');
      }

      setDevelopments(Array.isArray(data.developments) ? data.developments : []);
    } catch (err: any) {
      console.error('[DevelopmentFinder] Error:', err);
      setError(err.message || 'Failed to retrieve published developments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not hydrated with initial data or fixed constraints change, fetch
    if (!ssrData || fixedType || fixedStage) {
      fetchDevelopments();
    }
  }, [fixedType, fixedStage]);

  // Derive available localities from dataset
  const availableLocalities = useMemo(() => {
    const locs = new Set<string>();
    developments.forEach((d) => {
      if (d.locality) locs.add(d.locality);
    });
    // Ensure core known Jaipur sectors are available in filter
    ['Jagatpura', 'Kusum Vihar', 'Vidhyadhar Nagar', 'OBC Colony'].forEach((l) => locs.add(l));
    return Array.from(locs).sort();
  }, [developments]);

  // Apply complete filtering and sorting
  const filteredDevelopments = useMemo(() => {
    return developments
      .filter((dev) => {
        // 1. Text search query (name, locality, description, features)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = dev.name?.toLowerCase().includes(q);
          const matchesLoc = dev.locality?.toLowerCase().includes(q);
          const matchesDesc = dev.shortDescription?.toLowerCase().includes(q);
          const matchesType = dev.type?.toLowerCase().includes(q);
          if (!matchesName && !matchesLoc && !matchesDesc && !matchesType) {
            return false;
          }
        }

        // 2. Fixed or selected Category
        const requiredType = fixedType || (selectedType !== 'All' ? selectedType : null);
        if (requiredType && dev.type !== requiredType) {
          return false;
        }

        // 3. Locality filter
        if (selectedLocality !== 'All' && dev.locality !== selectedLocality) {
          return false;
        }

        // 4. Construction stage (fixed or selected)
        const requiredStage = fixedStage || (selectedStage !== 'All' ? selectedStage : null);
        if (requiredStage && dev.constructionStage !== requiredStage) {
          return false;
        }

        // 5. Combined configuration criteria check (Bedrooms + Availability + Budget)
        const reqBeds = selectedBedrooms !== 'All' ? parseInt(selectedBedrooms, 10) : null;
        const reqAvail = selectedAvailability !== 'All' ? selectedAvailability : null;
        const reqMaxBudget =
          selectedMaxBudget !== 'All' ? parseFloat(selectedMaxBudget) : null;

        // Check root development match
        const rootMatchesBed =
          reqBeds === null
            ? true
            : reqBeds === 5
            ? (dev.bedrooms || 0) >= 5
            : dev.bedrooms === reqBeds;

        const rootMatchesAvail = reqAvail === null ? true : dev.availability === reqAvail;

        const rootMatchesBudget =
          reqMaxBudget === null
            ? true
            : typeof dev.priceAmount === 'number' &&
              dev.priceAmount > 0 &&
              dev.priceMode !== 'on_request' &&
              dev.priceAmount <= reqMaxBudget;

        const rootMatchesAll = rootMatchesBed && rootMatchesAvail && rootMatchesBudget;

        // Check if any single sub-configuration satisfies ALL combined criteria
        const configMatchesAll =
          Array.isArray(dev.configurations) &&
          dev.configurations.some((c) => {
            const cBedMatches =
              reqBeds === null
                ? true
                : reqBeds === 5
                ? (c.bedrooms || 0) >= 5
                : c.bedrooms === reqBeds;

            const cAvailMatches = reqAvail === null ? true : c.availability === reqAvail;

            const cBudgetMatches =
              reqMaxBudget === null
                ? true
                : typeof c.priceAmount === 'number' &&
                  c.priceAmount > 0 &&
                  c.priceMode !== 'on_request' &&
                  c.priceAmount <= reqMaxBudget;

            return cBedMatches && cAvailMatches && cBudgetMatches;
          });

        if (!rootMatchesAll && !configMatchesAll) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const pA = a.priceAmount || Number.MAX_SAFE_INTEGER;
          const pB = b.priceAmount || Number.MAX_SAFE_INTEGER;
          return pA - pB;
        }
        if (sortBy === 'price-desc') {
          const pA = a.priceAmount || 0;
          const pB = b.priceAmount || 0;
          return pB - pA;
        }
        // Default: Newest published first
        const tA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const tB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return tB - tA;
      });
  }, [
    developments,
    searchQuery,
    selectedType,
    selectedLocality,
    selectedAvailability,
    selectedStage,
    selectedBedrooms,
    selectedMaxBudget,
    sortBy,
    fixedType,
    fixedStage,
  ]);

  // Pagination calculation
  const totalItems = filteredDevelopments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedDevelopments = useMemo(() => {
    const start = (pageIndex - 1) * PAGE_SIZE;
    return filteredDevelopments.slice(start, start + PAGE_SIZE);
  }, [filteredDevelopments, pageIndex]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    (!fixedType && selectedType !== 'All') ||
    selectedLocality !== 'All' ||
    selectedAvailability !== 'All' ||
    (!fixedStage && selectedStage !== 'All') ||
    selectedBedrooms !== 'All' ||
    selectedMaxBudget !== 'All' ||
    sortBy !== 'newest';

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const whatsappNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '919166054964';

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373]">
          <li>
            <Link to="/" className="hover:text-[#141414] transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-black/30">/</li>
          {activeTab !== 'all' && (
            <>
              <li>
                <Link to="/developments" className="hover:text-[#141414] transition-colors">
                  Developments
                </Link>
              </li>
              <li aria-hidden="true" className="text-black/30">/</li>
            </>
          )}
          <li>
            <span className="text-[#B5623A] font-medium">
              {activeTab === 'all'
                ? 'All Developments'
                : activeTab === 'villas'
                ? 'Villas'
                : activeTab === 'floors'
                ? 'Independent Floors'
                : activeTab === 'plots'
                ? 'Residential Plots'
                : 'Completed Developments'}
            </span>
          </li>
        </ol>
      </nav>

      {/* Page Heading */}
      <div className="max-w-4xl mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
          {eyebrowText}
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.05] text-[#141414] mb-4">
          {pageTitle}
        </h1>
        <p className="text-[#666] text-[14px] sm:text-[16px] leading-relaxed font-light max-w-2xl">
          {pageSubtitle}
        </p>
      </div>

      {/* Reusable Category Switcher Tabs */}
      <div className="mb-8 border-b border-black/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 pb-3 min-w-max">
          <Link
            to="/developments"
            className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all ${
              activeTab === 'all'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-black/10 hover:border-black/30 hover:text-[#141414]'
            }`}
          >
            All Developments
          </Link>
          <Link
            to="/villas"
            className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all ${
              activeTab === 'villas'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-black/10 hover:border-black/30 hover:text-[#141414]'
            }`}
          >
            Villas
          </Link>
          <Link
            to="/independent-floors"
            className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all ${
              activeTab === 'floors'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-black/10 hover:border-black/30 hover:text-[#141414]'
            }`}
          >
            Independent Floors
          </Link>
          <Link
            to="/plots"
            className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all ${
              activeTab === 'plots'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-black/10 hover:border-black/30 hover:text-[#141414]'
            }`}
          >
            Residential Plots
          </Link>
          <Link
            to="/completed-projects"
            className={`px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all ${
              activeTab === 'completed'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-white text-[#737373] border border-black/10 hover:border-black/30 hover:text-[#141414]'
            }`}
          >
            Completed Developments
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white rounded-2xl border border-black/10 p-4 sm:p-6 mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by development name, sector, or keywords..."
              className="w-full pl-11 pr-4 py-3 bg-[#FBFBFB] border border-black/10 rounded-xl text-[13px] text-[#141414] placeholder-[#888] focus:outline-hidden focus:border-[#141414] focus:bg-white transition-all font-light"
            />
            {searchQuery && (
              <button
                onClick={() => updateParam('q', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#141414] p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filters Toggle & Sort */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 border border-black/10 rounded-xl text-[12px] font-mono uppercase tracking-wider text-[#141414] hover:bg-[#F5F5F5] cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Filters {hasActiveFilters && '• Active'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888] hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-3 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-3 text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:text-black transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Attribute Filter Selectors */}
        <div
          className={`pt-4 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 ${
            showFiltersMobile ? 'block' : 'hidden lg:grid'
          }`}
        >
          {/* Category Filter (hidden if fixedType) */}
          {!fixedType && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
                Category
              </label>
              <select
                value={selectedType}
                onChange={(e) => updateParam('type', e.target.value)}
                className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Villa">Villa</option>
                <option value="Independent Floor">Independent Floor</option>
                <option value="Residential Plot">Residential Plot</option>
              </select>
            </div>
          )}

          {/* Locality Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Sector / Corridor
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => updateParam('locality', e.target.value)}
              className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
            >
              <option value="All">All Sectors</option>
              {availableLocalities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Availability
            </label>
            <select
              value={selectedAvailability}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Bedrooms
            </label>
            <select
              value={selectedBedrooms}
              onChange={(e) => updateParam('bed', e.target.value)}
              className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
            >
              <option value="All">Any Bedrooms</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </select>
          </div>

          {/* Total Budget Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Max Budget
            </label>
            <select
              value={selectedMaxBudget}
              onChange={(e) => updateParam('budget', e.target.value)}
              className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
            >
              <option value="All">Any Budget</option>
              <option value="15000000">Up to ₹1.5 Cr</option>
              <option value="25000000">Up to ₹2.5 Cr</option>
              <option value="40000000">Up to ₹4.0 Cr</option>
              <option value="60000000">Up to ₹6.0 Cr</option>
            </select>
          </div>

          {/* Construction Stage Filter (hidden if fixedStage) */}
          {!fixedStage && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
                Construction Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => updateParam('stage', e.target.value)}
                className="w-full bg-[#FBFBFB] border border-black/10 rounded-xl px-3 py-2.5 text-[12px] text-[#141414] focus:outline-hidden focus:border-[#141414] cursor-pointer"
              >
                <option value="All">All Stages</option>
                <option value="Planned">Planned</option>
                <option value="Under construction">Under Construction</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="flex items-center justify-between mb-6 text-[12px] font-mono uppercase tracking-wider text-[#737373]">
        <div>
          {loading ? (
            <span>Loading developments...</span>
          ) : (
            <span>
              Showing {totalItems} published development{totalItems === 1 ? '' : 's'}
              {hasActiveFilters && ' (filtered)'}
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#888]">
          {totalPages > 1 && `Page ${pageIndex} of ${totalPages}`}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-black/10 overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-[#EFEFEF]" />
              <div className="p-6 space-y-4">
                <div className="h-3 w-1/3 bg-[#E5E5E5] rounded-md" />
                <div className="h-6 w-3/4 bg-[#E0E0E0] rounded-md" />
                <div className="h-3 w-full bg-[#EAEAEA] rounded-md" />
                <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                  <div className="h-4 w-1/4 bg-[#E5E5E5] rounded-md" />
                  <div className="h-8 w-20 bg-[#141414]/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Failed Reads: Render explicit error, NOT "no developments" */
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-600 block">
            Retrieval Warning
          </span>
          <h2 className="text-xl font-light text-[#141414]">Unable to Fetch Developments</h2>
          <p className="text-[13px] text-[#666] font-light">{error}</p>
          <button
            onClick={fetchDevelopments}
            className="inline-flex items-center gap-2 bg-[#141414] hover:bg-black text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Retry Retrieval</span>
          </button>
        </div>
      ) : paginatedDevelopments.length > 0 ? (
        /* Populated Grid with Pagination */
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedDevelopments.map((dev) => (
              <DevelopmentCard key={dev.id} development={dev} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-black/10">
              <button
                disabled={pageIndex <= 1}
                onClick={() => updateParam('page', String(pageIndex - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-mono uppercase tracking-wider rounded-full border border-black/10 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <span className="text-[11px] font-mono text-[#737373] px-3">
                {pageIndex} / {totalPages}
              </span>

              <button
                disabled={pageIndex >= totalPages}
                onClick={() => updateParam('page', String(pageIndex + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-mono uppercase tracking-wider rounded-full border border-black/10 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : developments.length > 0 && hasActiveFilters ? (
        /* Filtered Empty State */
        <div className="bg-white rounded-2xl border border-black/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] block">
            Filter Results
          </span>
          <h2 className="text-2xl font-light text-[#141414]">No Matching Developments</h2>
          <p className="text-[13px] text-[#666] font-light leading-relaxed">
            No published developments currently match your active filters. Try adjusting your search query, locality, or criteria.
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 bg-[#141414] hover:bg-black text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : (
        /* Honest, Neutral Empty State: No published developments listed */
        <div className="bg-white rounded-3xl border border-black/10 p-8 sm:p-14 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F8F8F8] border border-black/5 flex items-center justify-center text-[#B5623A]">
            <Building2 size={26} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#888] block">
              Direct Developer Registry
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-[#141414] tracking-tight">
              No published developments are currently listed.
            </h2>
          </div>

          <p className="text-[14px] sm:text-[15px] text-[#666] font-light leading-relaxed max-w-xl mx-auto">
            There are currently no published developments matching this selection. Enquire directly with our project desk for upcoming schedules and private walkthroughs.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={NAVIGATION_REGISTRY.primaryCta.href}
              className="inline-flex items-center gap-2 bg-[#141414] hover:bg-black text-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all shadow-md shadow-black/5"
            >
              <Calendar size={13} />
              <span>{NAVIGATION_REGISTRY.primaryCta.label}</span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-[#141414] border border-black/10 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
            >
              <span>Contact the Builder</span>
              <ArrowUpRight size={13} />
            </Link>

            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-[#141414] border border-black/10 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
              >
                <MessageSquare size={13} />
                <span>WhatsApp Desk</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
