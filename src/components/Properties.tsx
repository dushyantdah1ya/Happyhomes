import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, MapPin, Building, AlertCircle, RefreshCw, Phone } from 'lucide-react';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { isDevelopmentAvailable } from '../utils/canonicalAvailability';
import { projectPublicDevelopment } from '../utils/publicProjection';
import type { DevelopmentPublic } from '../types/development';

interface PropertiesProps {
  showHeader?: boolean;
  initialDevelopments?: DevelopmentPublic[];
}

export default function Properties({ showHeader = true, initialDevelopments }: PropertiesProps = {}) {
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
      console.error('[Properties] Fetch Error:', err);
      setError(err.message || 'Unable to connect to the property registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ssrData) {
      fetchDevelopments();
    }
  }, [ssrData, fetchDevelopments]);

  // Deterministic Selection Rule:
  // 1. Project through explicit allowlist
  // 2. Rank genuinely Available inventory first
  // 3. Newest published first
  // 4. Stable id
  // 5. Capped at 3 developments for the asymmetric layout
  const selectedDevelopments = useMemo(() => {
    if (!Array.isArray(developments) || developments.length === 0) return [];

    const validPublic = developments
      .map(projectPublicDevelopment)
      .filter((d): d is DevelopmentPublic => Boolean(d));

    const sorted = [...validPublic].sort((a, b) => {
      const aAvail = isDevelopmentAvailable(a) ? 1 : 0;
      const bAvail = isDevelopmentAvailable(b) ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;

      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;

      return (a.id || '').localeCompare(b.id || '');
    });

    return sorted.slice(0, 3);
  }, [developments]);

  const heroDev = selectedDevelopments[0];
  const sideDevs = selectedDevelopments.slice(1);

  return (
    <section id="curated-residences" className="px-6 md:px-12 pt-24 md:pt-32 pb-24 md:pb-32 w-full max-w-[1600px] mx-auto bg-white">
      {/* Anchor alias */}
      <div id="portfolio" className="sr-only" aria-hidden="true" />

      {/* Editorial Header */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
              Our Construction Portfolio
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
              Architectural residences & bespoke <span className="text-[#B5623A]">freehold developments.</span>
            </h2>
          </div>
          <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
            Each development is engineered with structural foresight, 100% clear JDA Section 90-A compliance, and prime sector connectivity.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && selectedDevelopments.length === 0 && (
        <div className="py-24 text-center bg-[#F9F9F9] rounded-2xl border border-black/5">
          <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[12px] font-mono uppercase tracking-widest text-[#737373]">
            Loading Published Developments...
          </p>
        </div>
      )}

      {/* Error State */}
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

      {/* Honest Empty State: Zero Public Snapshots */}
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

      {/* Asymmetric Architectural Grid (Restored Visual Layout with Real Data) */}
      {!error && selectedDevelopments.length > 0 && heroDev && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Large Hero Estate (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between group">
            <Link to={`/developments/${heroDev.slug}`} className="block">
              <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden bg-gray-100 mb-6 rounded-2xl">
                {heroDev.image?.url ? (
                  <img
                    src={heroDev.image.url}
                    alt={heroDev.image.alt || heroDev.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#F4F4F4] text-[#888]">
                    <Building size={48} className="stroke-[1.2] opacity-40 mb-2" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#737373]">
                      Architectural Visualization
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    {heroDev.type}
                  </span>
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    {heroDev.availability}
                  </span>
                </div>
              </div>
            </Link>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
                <div>
                  <Link to={`/developments/${heroDev.slug}`}>
                    <h3 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight hover:text-[#B5623A] transition-colors">
                      {heroDev.name}
                    </h3>
                  </Link>
                  <p className="text-[13px] text-[#666] mt-1 flex items-center gap-1.5">
                    <MapPin size={12} /> {heroDev.locality || 'Jaipur'}
                  </p>
                </div>
                <span className="text-2xl font-light font-mono text-[#141414]">
                  {heroDev.priceDisplay || 'Price on Application'}
                </span>
              </div>

              {/* Quick Stats & Detail Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-black/10">
                <div className="flex items-center gap-4 text-[12px] text-[#555]">
                  {heroDev.area && <span>{heroDev.area.value} {heroDev.area.unit}</span>}
                  {heroDev.bedrooms && (
                    <>
                      <span>•</span>
                      <span>{heroDev.bedrooms} Beds</span>
                    </>
                  )}
                  {heroDev.constructionStage && (
                    <>
                      <span>•</span>
                      <span>{heroDev.constructionStage}</span>
                    </>
                  )}
                </div>

                <Link
                  to={`/developments/${heroDev.slug}`}
                  className="w-full sm:w-auto border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
                >
                  <span>View Development</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Complementary Estates (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-8 justify-between">
            {sideDevs.length > 0 ? (
              sideDevs.map((prop) => (
                <div key={prop.id} className="flex flex-col group border-b lg:border-b-0 pb-8 lg:pb-0 border-black/10">
                  <Link to={`/developments/${prop.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 mb-4 rounded-2xl">
                      {prop.image?.url ? (
                        <img
                          src={prop.image.url}
                          alt={prop.image.alt || prop.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#F4F4F4] text-[#888]">
                          <Building size={32} className="stroke-[1.2] opacity-40 mb-1" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#737373]">
                            Architectural Spec
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                          {prop.type}
                        </span>
                        <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                          {prop.availability}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <Link to={`/developments/${prop.slug}`}>
                      <h4 className="text-xl font-light text-[#141414] tracking-tight hover:text-[#B5623A] transition-colors">
                        {prop.name}
                      </h4>
                    </Link>
                    <span className="font-mono text-lg font-light text-[#141414]">
                      {prop.priceDisplay || 'Price on Application'}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#666] mb-3">
                    {prop.locality || 'Jaipur'}{prop.area ? ` • ${prop.area.value} ${prop.area.unit}` : ''}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-black/5">
                    <span className="text-[#666] font-mono">
                      {prop.bedrooms ? `${prop.bedrooms} Beds • ` : ''}{prop.constructionStage || prop.type}
                    </span>
                    <Link
                      to={`/developments/${prop.slug}`}
                      className="border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap rounded-full"
                    >
                      <span>View Details</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 border border-black/5 bg-[#FAFAFA] rounded-2xl flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2">
                    Builder Portfolio
                  </span>
                  <h4 className="text-xl font-light text-[#141414] mb-3">
                    Additional private releases underway
                  </h4>
                  <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                    We maintain exclusive off-market allocations and upcoming developments across Jagatpura and Vidhyadhar Nagar.
                  </p>
                </div>
                <Link
                  to="/developments"
                  className="inline-flex items-center justify-center gap-2 border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
                >
                  <span>Explore Full Catalogue</span>
                  <ArrowUpRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
