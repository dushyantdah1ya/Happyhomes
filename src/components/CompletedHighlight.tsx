import { useMemo } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { projectPublicDevelopment } from '../utils/publicProjection';
import type { DevelopmentPublic } from '../types/development';

interface CompletedHighlightProps {
  initialDevelopments?: DevelopmentPublic[];
}

export default function CompletedHighlight({ initialDevelopments }: CompletedHighlightProps) {
  const { initialDevelopments: contextDevs } = usePublicCatalog();

  const ssrData =
    initialDevelopments ||
    contextDevs ||
    (typeof window !== 'undefined' ? (window as any).__INITIAL_DATA__?.developments : undefined);

  // Search for any published development whose construction stage is strictly 'Completed'
  const completedDevelopment = useMemo(() => {
    if (!Array.isArray(ssrData) || ssrData.length === 0) return null;

    const validPublic = ssrData
      .map(projectPublicDevelopment)
      .filter((d): d is DevelopmentPublic => Boolean(d));

    // Find the latest completed project
    return validPublic.find((d) => d.constructionStage === 'Completed') || null;
  }, [ssrData]);

  // Gracefully omit the section if no genuine published completed developments exist
  if (!completedDevelopment) {
    return null;
  }

  const coverPhoto =
    completedDevelopment.photos?.find((p) => p.isCover) ||
    completedDevelopment.photos?.[0] ||
    completedDevelopment.image;

  return (
    <section className="px-6 md:px-12 py-20 md:py-28 w-full max-w-[1600px] mx-auto bg-white border-t border-black/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Construction Milestone
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Completed <span className="text-[#B5623A]">development.</span>
          </h2>
        </div>
        <Link
          to="/completed-projects"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#141414] hover:text-[#B5623A] transition-colors font-medium"
        >
          <span>View All Completed</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="bg-[#F9F9F9] border border-black/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Visual Frame */}
        <div className="lg:col-span-7 relative aspect-[16/10] bg-gray-100 overflow-hidden">
          {coverPhoto?.url ? (
            <img
              src={coverPhoto.url}
              alt={coverPhoto.altText || completedDevelopment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-xs font-mono uppercase tracking-wider">Completed Structure</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
              {completedDevelopment.type}
            </span>
            <span className="bg-emerald-600 text-white px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Narrative & Metrics */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-[#666] text-[13px]">
              <MapPin size={14} className="text-[#B5623A]" />
              <span>{completedDevelopment.locality}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight">
              {completedDevelopment.name}
            </h3>

            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              {completedDevelopment.shortDescription}
            </p>
          </div>

          <div className="pt-8 border-t border-black/10 mt-8">
            <Link
              to={`/developments/${completedDevelopment.slug}`}
              className="inline-flex items-center justify-center gap-2 bg-[#141414] hover:bg-black text-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full transition-all"
            >
              <span>View Development Dossier</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
