import { Link } from 'react-router';
import { MapPin, ArrowUpRight, Bed, Square } from 'lucide-react';
import type { DevelopmentPublic } from '../types/development';
import { getEffectiveAvailability } from '../utils/canonicalAvailability';

interface DevelopmentCardProps {
  key?: string;
  development: DevelopmentPublic;
}

export default function DevelopmentCard({ development }: DevelopmentCardProps) {
  // Determine primary display image
  const coverPhoto =
    development.photos?.find((p) => p.isCover) ||
    development.photos?.[0];
  const imageUrl = coverPhoto?.url || development.image?.url;
  const imageAlt = coverPhoto?.altText || development.image?.altText || development.name;
  const imageLabel = coverPhoto?.label || development.image?.label;

  // Format neutral type label
  const typeLabel =
    development.type === 'Villa'
      ? 'Villa'
      : development.type === 'Independent Floor'
      ? 'Independent Floor'
      : 'Residential Plot';

  // Format area display using supplied definition only
  const areaDisplay = development.area?.value
    ? `${development.area.value.toLocaleString('en-IN')} ${development.area.unit || 'sq ft'}`
    : null;

  const effectiveAvailability = getEffectiveAvailability(development);
  const areaTitle = development.area?.definition
    ? `${development.area.definition} area`
    : 'Area';

  // Check if this record explicitly supplies tenure or approval notes
  const hasApprovalDetails =
    development.specifications?.some((g) =>
      g.items?.some((i) => /jda|rera|patta|90-a|approval|approved/i.test(`${i.label} ${i.value}`))
    ) ||
    (/jda|rera|90-a|approved/i.test(development.shortDescription || ''));

  return (
    <article className="group bg-white rounded-2xl border border-black/10 overflow-hidden flex flex-col hover:border-black/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      {/* Visual Presentation / Photograph */}
      <div className="relative aspect-[16/10] bg-[#F4F4F4] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F5F5F5] to-[#EAEAEA]">
            <Square size={28} className="text-black/20 mb-2" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
              Architectural Presentation
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md shadow-xs">
              {typeLabel}
            </span>
            {imageLabel && (
              <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-white rounded-md shadow-xs hidden sm:inline-block">
                {imageLabel}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-md backdrop-blur-md border shadow-xs ${
                effectiveAvailability === 'Available'
                  ? 'bg-white/95 text-[#141414] border-black/10'
                  : effectiveAvailability === 'Reserved'
                  ? 'bg-[#B5623A]/10 text-[#B5623A] border-[#B5623A]/30'
                  : 'bg-black/70 text-white border-transparent'
              }`}
            >
              {effectiveAvailability}
            </span>
          </div>
        </div>

        {/* Bottom Floating Stage Badge */}
        {development.constructionStage && development.constructionStage !== 'Not specified' && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-md text-[#141414] text-[9px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border border-black/10">
              {development.constructionStage}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Locality & Explicit Approval if present */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] tracking-wider uppercase">
            <span className="flex items-center gap-1 truncate">
              <MapPin size={12} className="shrink-0 text-[#B5623A]" />
              <span className="truncate">{development.locality || 'Jaipur, Rajasthan'}</span>
            </span>
            {hasApprovalDetails && (
              <span className="text-[10px] text-[#737373] shrink-0 font-normal">
                Approval details
              </span>
            )}
          </div>

          {/* Development Name */}
          <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight group-hover:text-[#B5623A] transition-colors leading-snug">
            <Link to={`/developments/${development.slug}`}>
              {development.name}
            </Link>
          </h3>

          {/* Short Description */}
          {development.shortDescription && (
            <p className="text-[13px] text-[#666] font-light leading-relaxed line-clamp-2">
              {development.shortDescription}
            </p>
          )}

          {/* Architectural Specifications */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-black/5 text-[12px] text-[#555]">
            {areaDisplay && (
              <span className="flex items-center gap-1.5 font-light" title={areaTitle}>
                <Square size={13} className="text-[#888]" />
                <span>{areaDisplay}</span>
              </span>
            )}
            {typeof development.bedrooms === 'number' && development.bedrooms > 0 && (
              <span className="flex items-center gap-1.5 font-light" title="Bedrooms">
                <Bed size={13} className="text-[#888]" />
                <span>{development.bedrooms} BHK</span>
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Call to Actions */}
        <div className="pt-6 mt-6 border-t border-black/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
              Investment
            </span>
            <span className="text-lg sm:text-xl font-light font-mono text-[#141414]">
              {development.priceDisplay || 'Price on Request'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/developments/${development.slug}`}
              className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-black text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] rounded-full transition-all group-hover:shadow-md"
            >
              <span>Dossier</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
