import { useState } from 'react';
import { Link } from 'react-router';
import { 
  MapPin, 
  ArrowRight, 
  ArrowUpRight, 
  Building2, 
  Compass, 
  HelpCircle, 
  AlertCircle,
  FileCheck2,
  Phone,
  Calendar,
  Layers
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import DevelopmentCard from '../components/DevelopmentCard';
import ConsultationModal from '../components/ConsultationModal';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { useSettings } from '../hooks/useSettings';
import { JAIPUR_LOCALITIES } from '../data/jaipurLocalities';

export default function JaipurLocalitiesHub() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const { initialDevelopments = [] } = usePublicCatalog();
  const { settings } = useSettings();

  const jagatpuraGuide = JAIPUR_LOCALITIES['jagatpura'];
  const kusumViharGuide = JAIPUR_LOCALITIES['kusum-vihar'];

  // Honest counting of published developments in these corridors
  const jagatpuraDevs = initialDevelopments.filter((d) =>
    d.locality?.toLowerCase().includes('jagatpura')
  );
  const kusumViharDevs = initialDevelopments.filter((d) =>
    d.locality?.toLowerCase().includes('kusum vihar')
  );

  return (
    <PublicLayout>
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 md:px-16 pt-8 pb-24 md:pb-32">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">
                Home
              </Link>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">
              Jaipur Localities
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Neighbourhood &amp; Sector Field Notes • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Jaipur residential<br />
            <span className="text-[#4B4B4B] font-extralight">localities &amp; sector guides.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-2xl">
            Practical questions and property checklist items for evaluating residential locations across Jaipur. Review access, utilities, surroundings, and documentation to discuss with an appropriate professional.
          </p>
        </div>

        {/* Neutral Advisory Note */}
        <div className="mb-16 p-6 sm:p-8 bg-[#FBFBFB] border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Compass size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-[#141414] tracking-tight mb-1">
                Property-Specific Due Diligence
              </h2>
              <p className="text-[13px] text-[#666] font-light leading-relaxed">
                Conditions such as access, water arrangements, and title documentation vary across individual schemes and plots in Jaipur. Always have documents and site specifics reviewed by an appropriately qualified professional.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              to="/developments"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-black/15 text-[11px] font-mono uppercase tracking-wider text-[#141414] hover:border-black transition-colors"
            >
              <span>Explore All Developments</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Primary Locality Grid: Jagatpura & Kusum Vihar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20 md:mb-28">
          
          {/* Locality Card 1: Jagatpura */}
          <article className="flex flex-col justify-between p-8 sm:p-10 bg-white border border-black/10 rounded-3xl hover:border-black/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full">
                  <MapPin size={11} />
                  {jagatpuraGuide.zone}
                </span>
                <span className="text-[11px] font-mono text-[#737373]">
                  {jagatpuraDevs.length > 0 ? `${jagatpuraDevs.length} Published Development` : 'Portfolio Link'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
                {jagatpuraGuide.name}
              </h2>

              <p className="text-[14px] text-[#555] font-light leading-relaxed mb-6">
                {jagatpuraGuide.characterOverview}
              </p>

              {/* Quick Key Facts */}
              <div className="space-y-3 pt-6 border-t border-black/5 text-[13px] text-[#666] font-light mb-8">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Corridor:</strong> Sector oriented along Mahal Road</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Institutions:</strong> Bombay Hospital (Sitapura) &amp; Suresh Gyan Vihar University (Jagatpura)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Utilities:</strong> Piped water, drainage, and road status vary by colony layout</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Link
                to={`/jaipur-localities/${jagatpuraGuide.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141414] text-white text-[11px] font-mono uppercase tracking-widest hover:bg-[#B5623A] transition-colors"
              >
                <span>Read Jagatpura Guide</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                to={jagatpuraGuide.filterUrl}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#737373] hover:text-[#141414] transition-colors"
              >
                <span>View Filtered Developments</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </article>

          {/* Locality Card 2: Kusum Vihar (Withheld Pending Scheme Layout Records) */}
          <article className="flex flex-col justify-between p-8 sm:p-10 bg-[#FAFAFA] border border-dashed border-black/15 rounded-3xl">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#737373] bg-black/5 px-3 py-1 rounded-full">
                  <MapPin size={11} />
                  {kusumViharGuide.zone}
                </span>
                <span className="text-[11px] font-mono text-[#888]">
                  Evidence Pending
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
                {kusumViharGuide.name}
              </h2>

              <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                Detailed locality guide withheld pending verified scheme layout plans and boundary documentation. Happy Homes adheres strictly to verified primary records and publishes sector guides only when substantiated by official sources.
              </p>

              {/* Status Points */}
              <div className="space-y-3 pt-6 border-t border-black/5 text-[13px] text-[#666] font-light mb-8">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#888] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Status:</strong> Guide withheld pending official scheme layout plan</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#888] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Enquiries:</strong> Property coordinates available on direct consultation</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-[#888] font-mono text-xs mt-0.5">•</span>
                  <span><strong>Site Visits:</strong> Advance confirmation required with the builder desk</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Link
                to="/contact?intent=visit#enquiry"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141414] text-white text-[11px] font-mono uppercase tracking-widest hover:bg-[#B5623A] transition-colors"
              >
                <span>Consult Desk On Specific Plots</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                to={kusumViharGuide.filterUrl}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#737373] hover:text-[#141414] transition-colors"
              >
                <span>View Filtered Developments</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </article>
        </div>

        {/* Practical Buyer Evaluation Checklist */}
        <section className="mb-20 md:mb-28 p-8 sm:p-12 bg-white border border-black/10 rounded-3xl">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-2">
              Buyer Due Diligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight mb-3">
              Four questions to verify for any Jaipur residential property
            </h2>
            <p className="text-[14px] text-[#666] font-light leading-relaxed">
              When evaluating a plot, villa, or apartment in Jaipur, discuss these property-specific questions with the seller and your independent legal or technical advisor:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[#FDFCFB] border border-black/5 rounded-2xl">
              <span className="text-[11px] font-mono text-[#B5623A] uppercase tracking-wider block mb-2">
                01 • Property Access &amp; Road Width
              </span>
              <h3 className="text-base font-medium text-[#141414] mb-2">What is the sanctioned and physical road access?</h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Confirm the sanctioned width of the access road directly serving the plot, its current surfacing status, and how site drainage and finished plinth levels align with the street.
              </p>
            </div>

            <div className="p-6 bg-[#FDFCFB] border border-black/5 rounded-2xl">
              <span className="text-[11px] font-mono text-[#B5623A] uppercase tracking-wider block mb-2">
                02 • Utilities &amp; Water Supply
              </span>
              <h3 className="text-base font-medium text-[#141414] mb-2">What are the active utility arrangements for this site?</h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Verify the actual water source (piped municipal connection, shared scheme borewell, or tanker delivery) and electricity supply arrangements currently serving the specific layout.
              </p>
            </div>

            <div className="p-6 bg-[#FDFCFB] border border-black/5 rounded-2xl">
              <span className="text-[11px] font-mono text-[#B5623A] uppercase tracking-wider block mb-2">
                03 • Surroundings &amp; Micro-Pocket Context
              </span>
              <h3 className="text-base font-medium text-[#141414] mb-2">What immediately borders the property?</h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Examine immediate boundary conditions, neighboring plot usage, open spaces, and ease of daily vehicular turnaround on internal lanes.
              </p>
            </div>

            <div className="p-6 bg-[#FDFCFB] border border-black/5 rounded-2xl">
              <span className="text-[11px] font-mono text-[#B5623A] uppercase tracking-wider block mb-2">
                04 • Documentation &amp; Professional Review
              </span>
              <h3 className="text-base font-medium text-[#141414] mb-2">What documents should be reviewed by a professional?</h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Have the scheme layout approvals, ownership titles, and sanction documentation reviewed by an appropriately qualified legal or property professional before committing.
              </p>
            </div>
          </div>
        </section>

        {/* Closing Action Banner */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Site Walkthroughs &amp; Location Clarifications
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Discuss specific Jaipur locations with our desk
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              If you have questions regarding location suitability or are planning a site visit for an upcoming residential project, connect directly with our project desk.
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
        defaultService="Jaipur Locality Consultation"
      />
    </PublicLayout>
  );
}
