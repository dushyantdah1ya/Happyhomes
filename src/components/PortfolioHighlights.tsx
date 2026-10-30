import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, AlertCircle, Building, RefreshCw, Phone } from 'lucide-react';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import DevelopmentCard from './DevelopmentCard';
import { isDevelopmentAvailable } from '../utils/canonicalAvailability';
import { projectPublicDevelopment } from '../utils/publicProjection';
import type { DevelopmentPublic } from '../types/development';

interface PortfolioHighlightsProps {
  initialDevelopments?: DevelopmentPublic[];
}

export default function PortfolioHighlights({ initialDevelopments }: PortfolioHighlightsProps) {
  const { initialDevelopments: contextDevs } = usePublicCatalog();

  // Prefer SSR data if available
  const ssrData =
    initialDevelopments ||
    contextDevs ||
    (typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__?.developments : undefined);

  const [developments, setDevelopments] = useState<DevelopmentPublic[]>(() =>
    Array.isArray(ssrData) ? ssrData : []
  );
  const [loading, setLoading] = useState<boolean>(() => !Array.isArray(ssrData));
  const [error, setError] = useState<string | null>(null);

  const fetchDevelopments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/developments');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve published developments.');
      }

      setDevelopments(Array.isArray(data.developments) ? data.developments : []);
    } catch (err: any) {
      console.error('[PortfolioHighlights] Fetch Error:', err);
      setError(err.message || 'Unable to connect to the property registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If not hydrated with initial data, fetch from public API
    if (!ssrData) {
      fetchDevelopments();
    }
  }, [ssrData, fetchDevelopments]);

  // Documented Deterministic Selection Rule:
  // 1. Project through explicit allowlist (projectPublicDevelopment)
  // 2. Rank genuinely Available inventory first (isDevelopmentAvailable)
  // 3. Then by publication date descending (newest published first)
  // 4. Then by stable ID (localeCompare)
  // 5. Capped at at most three unique developments
  const selectedDevelopments = useMemo(() => {
    if (!Array.isArray(developments) || developments.length === 0) return [];

    const validPublic = developments
      .map(projectPublicDevelopment)
      .filter((d): d is DevelopmentPublic => Boolean(d));

    const sorted = [...validPublic].sort((a, b) => {
      const aAvail = isDevelopmentAvailable(a) ? 1 : 0;
      const bAvail = isDevelopmentAvailable(b) ? 1 : 0;
      if (aAvail !== bAvail) {
        return bAvail - aAvail;
      }

      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }

      return a.id.localeCompare(b.id);
    });

    return sorted.slice(0, 3);
  }, [developments]);

  return (
    <section
      id="portfolio"
      className="px-6 md:px-12 pt-24 md:pt-32 pb-20 md:pb-28 w-full max-w-[1600px] mx-auto bg-white"
    >
      {/* Anchor alias for existing backward compatibility */}
      <div id="curated-residences" className="sr-only" aria-hidden="true" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-16">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Direct Builder Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Selected <span className="text-[#B5623A]">Developments.</span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 max-w-md">
          <p className="text-[#666] text-[14px] leading-relaxed font-light">
            Direct-builder residential developments in Jaipur, engineered with structural oversight and published with transparent inventory.
          </p>
          <Link
            to="/developments"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#141414] hover:text-[#B5623A] transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            <span>View All</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && selectedDevelopments.length === 0 && (
        <div className="py-24 text-center bg-[#F9F9F9] rounded-2xl border border-black/5">
          <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[12px] font-mono uppercase tracking-widest text-[#737373]">
            Loading Published Developments...
          </p>
        </div>
      )}

      {/* Database Read Error State: Honest unavailable, not "no developments" */}
      {!loading && error && (
        <div className="p-8 sm:p-12 text-center bg-[#FFF8F5] border border-[#B5623A]/20 rounded-2xl max-w-2xl mx-auto my-6">
          <AlertCircle size={32} className="text-[#B5623A] mx-auto mb-4" />
          <h3 className="text-xl font-medium text-[#141414] mb-2">
            Unable to Load Developments
          </h3>
          <p className="text-[14px] text-[#666] leading-relaxed font-light max-w-md mx-auto mb-6">
            A connection issue occurred while resolving our published portfolio. You can retry the connection or contact our project desk directly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={fetchDevelopments}
              className="inline-flex items-center gap-2 bg-[#141414] text-white hover:bg-black px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-black/20 hover:border-black text-[#141414] px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all"
            >
              <Phone size={13} />
              <span>Contact Project Desk</span>
            </Link>
          </div>
        </div>
      )}

      {/* Zero Public Snapshots Empty State: Truthful and compact */}
      {!loading && !error && selectedDevelopments.length === 0 && (
        <div className="p-10 sm:p-16 text-center bg-[#FBFBFB] border border-black/10 rounded-2xl max-w-2xl mx-auto my-6">
          <Building size={36} className="text-[#888] mx-auto mb-4 stroke-[1.5]" />
          <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-2 tracking-tight">
            No Published Developments Currently Listed
          </h3>
          <p className="text-[14px] text-[#666] leading-relaxed font-light max-w-md mx-auto mb-8">
            Our public portfolio is currently being refreshed. For upcoming releases, off-plan allocations, or private site visits in Jaipur, please connect with our project desk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/developments"
              className="inline-flex items-center gap-2 bg-[#141414] text-white hover:bg-black px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full transition-all"
            >
              <span>Explore All Developments</span>
              <ArrowUpRight size={13} />
            </Link>
            <Link
              to="/contact?intent=visit#enquiry"
              className="inline-flex items-center gap-2 border border-black/20 hover:border-black text-[#141414] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full transition-all"
            >
              <span>Contact the Builder</span>
            </Link>
          </div>
        </div>
      )}

      {/* Populated Developments Grid (capped at at most 3) */}
      {!error && selectedDevelopments.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedDevelopments.map((dev) => (
              <DevelopmentCard key={dev.id} development={dev} />
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Link
              to="/developments"
              className="inline-flex items-center justify-center gap-2 w-full border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
            >
              <span>View All Developments</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
