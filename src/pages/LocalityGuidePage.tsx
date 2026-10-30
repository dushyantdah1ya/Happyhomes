import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router';
import { 
  MapPin, 
  ArrowRight, 
  ArrowUpRight, 
  HelpCircle, 
  Calendar,
  Building2,
  Compass,
  AlertCircle
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import DevelopmentCard from '../components/DevelopmentCard';
import ConsultationModal from '../components/ConsultationModal';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { useSettings } from '../hooks/useSettings';
import { JAIPUR_LOCALITIES, type LocalityGuideData } from '../data/jaipurLocalities';

interface LocalityGuidePageProps {
  forcedSlug?: 'jagatpura' | 'kusum-vihar';
}

export default function LocalityGuidePage({ forcedSlug }: LocalityGuidePageProps) {
  const params = useParams<{ slug?: string }>();
  const slug = forcedSlug || params.slug || 'jagatpura';
  const guide: LocalityGuideData = JAIPUR_LOCALITIES[slug] || JAIPUR_LOCALITIES['jagatpura'];

  if (!guide || guide.status === 'withheld') {
    return <Navigate to="/jaipur-localities" replace />;
  }

  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const { initialDevelopments = [] } = usePublicCatalog();
  const { settings } = useSettings();

  // Filter public developments matching this specific locality
  const matchingDevelopments = initialDevelopments.filter((d) => {
    const loc = (d.locality || '').toLowerCase();
    if (guide.id === 'kusum-vihar') {
      return loc.includes('kusum vihar');
    }
    return loc.includes('jagatpura') && !loc.includes('kusum vihar');
  });

  return (
    <PublicLayout>
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 md:px-16 pt-8 pb-24 md:pb-32">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#737373]">
            {guide.breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-[#A5A5A5]">•</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-[#141414] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#141414] font-medium" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero Header */}
        <div className="mb-14 md:mb-18 max-w-4xl">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full mb-4">
            <MapPin size={12} />
            {guide.shortTag}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            {guide.headline}
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-2xl">
            {guide.subheadline}
          </p>
        </div>

        {/* Neutral Advisory Note */}
        <div className="mb-14 p-6 sm:p-7 bg-[#FBFBFB] border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-9 h-9 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-[#141414] tracking-tight mb-1">
                Factual Overview for Prospective Buyers
              </h2>
              <p className="text-[12px] text-[#666] font-light leading-relaxed">
                This guide provides verified planning observations and objective sector conditions. It is not an endorsement of third-party schemes or an investment forecast.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              to="/jaipur-localities"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#141414] hover:text-[#B5623A] transition-colors"
            >
              <span>← All Jaipur Localities</span>
            </Link>
          </div>
        </div>

        {/* Section 1: Spatial & Corridor Context */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 md:mb-24">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block">
              Spatial Geography
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight">
              Location boundaries &amp; sector connectivity
            </h2>
            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              {guide.characterOverview}
            </p>
          </div>

          <div className="lg:col-span-7 bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-6">
            <div>
              <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#B5623A] mb-1">
                Sector Roads &amp; Arterials
              </h3>
              <p className="text-[14px] text-[#444] font-light leading-relaxed">
                {guide.geographyContext.sectorRoads}
              </p>
            </div>

            <div className="pt-6 border-t border-black/5">
              <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#B5623A] mb-1">
                Position Within Jaipur
              </h3>
              <p className="text-[14px] text-[#444] font-light leading-relaxed">
                {guide.geographyContext.corridorPosition}
              </p>
            </div>

            <div className="pt-6 border-t border-black/5">
              <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#B5623A] mb-1">
                Boundary &amp; Micro-Pocket Variation
              </h3>
              <p className="text-[14px] text-[#444] font-light leading-relaxed">
                {guide.geographyContext.boundaryNotes}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Civic Infrastructure & Realities */}
        <div className="mb-16 md:mb-24">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
              Civic Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
              Civic utilities and site considerations
            </h2>
            <p className="text-[14px] text-[#666] font-light leading-relaxed">
              Practical infrastructure questions and site parameters to consider when evaluating properties in this area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guide.civicObservations.map((obs, idx) => (
              <div
                key={idx}
                className="p-8 bg-white border border-black/10 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono text-[#B5623A] uppercase tracking-wider block mb-2">
                    0{idx + 1} • {obs.title}
                  </span>
                  <p className="text-[14px] text-[#444] font-light leading-relaxed mb-4">
                    {obs.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-black/5 bg-[#FAFAFA] -mx-8 -mb-8 p-6 rounded-b-2xl">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5623A] shrink-0 mt-0.5">
                      Site Note:
                    </span>
                    <span className="text-[12px] text-[#666] font-light leading-snug">
                      {obs.nuance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Buyer Fit Considerations & Trade-offs */}
        <div className="mb-16 md:mb-24 p-8 sm:p-12 bg-[#FBFBFB] border border-black/10 rounded-3xl">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
              Suitability Analysis
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
              Who is this location suited for?
            </h2>
            <p className="text-[14px] text-[#666] font-light leading-relaxed">
              Every residential sector presents specific operational balances between convenience, privacy, and plot costs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {guide.buyerFitConsiderations.map((fit, idx) => (
              <div key={idx} className="p-8 bg-white border border-black/5 rounded-2xl space-y-4">
                <h3 className="text-lg font-medium text-[#141414] tracking-tight">
                  {fit.fitFor}
                </h3>
                <div className="space-y-3 text-[13px] font-light">
                  <div className="flex items-start gap-2">
                    <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                    <div>
                      <strong className="text-[#141414] font-normal">Trade-off to accept:</strong>{' '}
                      <span className="text-[#666]">{fit.tradeoffs}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                    <div>
                      <strong className="text-[#141414] font-normal">Practical consideration:</strong>{' '}
                      <span className="text-[#666]">{fit.guidance}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Specific Buyer Questions for this Locality */}
        <div className="mb-16 md:mb-24 p-8 sm:p-12 bg-white border border-black/10 rounded-3xl">
          <div className="max-w-2xl mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
              Buyer Checklist
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
              Questions to ask when evaluating a property in {guide.name}
            </h2>
            <p className="text-[14px] text-[#666] font-light leading-relaxed">
              Bring these practical questions to any site inspection or builder meeting:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {guide.questionsToAsk.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-5 bg-[#FDFCFB] border border-black/5 rounded-xl">
                <HelpCircle size={18} className="text-[#B5623A] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#444] font-light leading-snug">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Developments in this Locality */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
                Published Portfolio
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight">
                Happy Homes developments in {guide.name}
              </h2>
            </div>
            <Link
              to={guide.filterUrl}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:text-[#141414] transition-colors font-medium"
            >
              <span>View In Full Catalogue</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {matchingDevelopments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {matchingDevelopments.map((dev) => (
                <DevelopmentCard key={dev.id} development={dev} />
              ))}
            </div>
          ) : (
            <div className="p-10 sm:p-14 bg-[#FAFAFA] border border-dashed border-black/15 rounded-3xl text-center max-w-2xl mx-auto">
              <Building2 size={32} className="text-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-light text-[#141414] mb-2">
                No developments currently published in {guide.name}
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                We periodically acquire and develop plots, villas, and independent floors in {guide.name}. You can review our full portfolio across Jaipur or register your specific site requirements directly.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/developments"
                  className="px-6 py-3 rounded-full bg-[#141414] text-white text-[11px] font-mono uppercase tracking-wider hover:bg-[#B5623A] transition-colors"
                >
                  View All Developments
                </Link>
                <Link
                  to="/contact?intent=visit#enquiry"
                  className="px-6 py-3 rounded-full border border-black/20 text-[#141414] text-[11px] font-mono uppercase tracking-wider hover:border-black transition-colors"
                >
                  Request Upcoming Inquiries
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Verified Primary Sources & Official References */}
        {guide.sources && guide.sources.length > 0 && (
          <div className="mb-16 md:mb-24 p-8 sm:p-10 bg-white border border-black/10 rounded-3xl">
            <div className="max-w-2xl mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
                Primary Sources
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight mb-2">
                Verified institutional directory references
              </h2>
              <p className="text-[13px] text-[#666] font-light leading-relaxed">
                Retained local reference points are substantiated exclusively by primary institutional directories. Happy Homes does not infer arterial road widths, commute times, or utility handovers without independent property-specific documentation.
              </p>
            </div>

            <div className="space-y-4">
              {guide.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-[#FAFAFA] border border-black/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#B5623A] block">
                      {src.title}
                    </span>
                    <p className="text-[13px] text-[#444] font-light leading-relaxed">
                      {src.verifiedFact}
                    </p>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#141414] hover:text-[#B5623A] underline underline-offset-4 shrink-0 transition-colors"
                  >
                    <span>View primary source</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing Action Banner */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Site Walkthroughs &amp; Location Clarifications
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Planning a visit or property evaluation in {guide.name}?
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Connect directly with our desk. Site visit requests require advance confirmation to ensure representatives and site coordinates are prepared.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/contact?intent=visit#enquiry"
              className="px-8 py-4 rounded-full bg-[#B5623A] text-white text-[12px] font-mono uppercase tracking-widest hover:bg-[#A3522C] transition-colors text-center font-medium"
            >
              Request a Site Visit
            </Link>
            <button
              type="button"
              onClick={() => setIsConsultOpen(true)}
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              Direct Inquiry
            </button>
          </div>
        </div>

        {/* Contact Reference */}
        <div className="mt-8 text-center text-[12px] font-mono text-[#737373]">
          Contact: <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="underline hover:text-[#141414]">{settings.phone}</a> • <a href={`mailto:${settings.email}`} className="underline hover:text-[#141414]">{settings.email}</a> • {settings.address}
        </div>
      </div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Locality Consultation — ${guide.name}`}
      />
    </PublicLayout>
  );
}
