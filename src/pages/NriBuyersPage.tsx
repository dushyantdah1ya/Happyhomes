import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Globe, 
  Video, 
  Clock, 
  Calendar, 
  FileText, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2,
  Building2,
  Phone,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { useSettings } from '../hooks/useSettings';

export default function NriBuyersPage() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const { settings } = useSettings();

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
            <li>
              <span className="text-[#737373]">Buyer Guide</span>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">
              Remote &amp; NRI Buyers
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-14 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Remote &amp; Outstation Coordination • Jaipur Property Desk
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Planning your purchase from<br />
            <span className="text-[#B5623A]">outside Jaipur.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-3xl">
            A practical coordination guide for non-resident Indian (NRI) purchasers, overseas clients, and 
            outstation buyers evaluating residential properties in Jaipur. How to research listings, coordinate 
            guided video walkthroughs, and conduct independent due diligence from a distance.
          </p>
        </div>

        {/* Primary Action Callout Strip */}
        <div className="mb-16 p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
              Virtual Inspection
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-[#141414]">
              Inspect properties remotely via guided video viewing.
            </h2>
            <p className="text-[13px] text-[#666] font-light leading-relaxed">
              Coordinate an on-site walkthrough with a representative to inspect road frontage, structural progress, 
              and immediate neighborhood surroundings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/contact?intent=video#enquiry"
              className="px-7 py-3.5 rounded-full bg-[#141414] text-white text-[11px] font-mono uppercase tracking-widest hover:bg-[#B5623A] transition-colors text-center font-medium"
            >
              Request a video viewing
            </Link>
            <Link
              to="/contact#enquiry"
              className="px-7 py-3.5 rounded-full border border-black/15 text-[#141414] text-[11px] font-mono uppercase tracking-widest hover:bg-black/5 transition-colors text-center font-medium"
            >
              Contact the team
            </Link>
          </div>
        </div>

        {/* Five Practical Coordination Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          
          {/* Card 1: Shortlisting & Requirement Definition */}
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center">
                <Search size={18} />
              </div>
              <h3 className="text-xl font-light text-[#141414]">
                1. Shortlisting Published Developments
              </h3>
              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Before reaching out, review active listings in our public catalogue. Note specific property 
                typologies (villas, floors, or plots), target localities, and preferred configurations.
              </p>
              <ul className="space-y-2 text-[13px] text-[#666] font-light pt-2">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                  <span>Identify specific unit types or plot orientations of interest.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#B5623A] font-mono text-xs mt-0.5">•</span>
                  <span>Formulate clear questions regarding access, handover dates, and pricing.</span>
                </li>
              </ul>
            </div>

            <Link
              to="/developments"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
            >
              <span>Browse Active Catalogue</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 2: Video Walkthroughs & Time Zone Protocol */}
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center">
                <Video size={18} />
              </div>
              <h3 className="text-xl font-light text-[#141414]">
                2. Scheduling Video Viewings &amp; IST Time Standard
              </h3>
              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Request a dedicated video viewing through our website form. Our on-site representative conducts 
                a live walkthrough showing the property, internal layouts, and access roads.
              </p>
              <div className="p-4 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl space-y-1.5 text-[12px] text-[#555] font-light">
                <div className="flex items-center gap-2 font-mono text-[#B5623A] font-medium uppercase text-[10px] tracking-wider">
                  <Clock size={12} />
                  <span>Indian Standard Time (IST)</span>
                </div>
                <p>
                  All preferred time slots operate strictly under Indian Standard Time (IST, UTC+05:30). Outstation 
                  buyers should verify local time differences. All requested appointments require confirmation.
                </p>
              </div>
            </div>

            <Link
              to="/contact?intent=video#enquiry"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] font-medium hover:underline"
            >
              <span>Request a video viewing</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 3: Inquiring About Available Photographs & Plans */}
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h3 className="text-xl font-light text-[#141414]">
                3. Requesting Available Project Records &amp; Plans
              </h3>
              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Inquire about high-resolution photographs, sanctioned floor plans, layout drawings, or technical 
                specifications available for your shortlisted property.
              </p>
              <p className="text-[13px] text-[#777] font-light leading-relaxed">
                Materials are shared where available for the specific site. Happy Homes does not guarantee automated 
                live video feeds, continuous drone surveillance, or uniform marketing packages for every development.
              </p>
            </div>

            <Link
              to="/contact#enquiry"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
            >
              <span>Inquire with Project Desk</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Card 4: In-Person Verification & Local Representative */}
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-[2rem] flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h3 className="text-xl font-light text-[#141414]">
                4. On-Ground Verification Prior to Commitment
              </h3>
              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                While remote viewings assist early evaluation, we encourage planning an in-person visit or 
                authorizing a trusted local representative or family member to inspect the physical site.
              </p>
              <p className="text-[13px] text-[#777] font-light leading-relaxed">
                Physical inspection confirms approach road paving, sunlight exposure, boundary demarcation, and 
                neighborhood character before entering binding contractual commitments.
              </p>
            </div>

            <Link
              to="/contact?intent=visit#enquiry"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
            >
              <span>Schedule In-Person Visit</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Legal, Tax & Banking Advisory Notice Box */}
        <div className="mb-20 p-8 sm:p-12 bg-white border border-black/10 rounded-3xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#141414]">
              Independent Legal, Banking &amp; Tax Diligence Notice
            </h3>
          </div>

          <div className="space-y-4 text-[14px] text-[#555] font-light leading-relaxed max-w-4xl">
            <p>
              Regulatory eligibility, property acquisition authorization, banking arrangements, inward remittance 
              pathways, and taxation liabilities depend entirely on the individual purchaser’s legal residency, 
              citizenship status, and banking jurisdiction.
            </p>
            <p>
              Happy Homes operates strictly as a direct property developer and builder in Jaipur. We do not provide 
              statutory legal representation, power-of-attorney execution services, tax advisory, or bank 
              financing assurances. Prospective outstation and overseas buyers should consult appropriately qualified 
              legal advocates, chartered accountants, or authorized banking partners regarding their specific 
              regulatory compliance and financial requirements.
            </p>
          </div>

          <div className="pt-4 border-t border-black/5 flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] font-mono text-[#777]">
            <span>• Direct Builder Dialogue</span>
            <span>• Independent Professional Diligence Recommended</span>
            <span>• Contractual Terms Governed by Written Agreement</span>
          </div>
        </div>

        {/* Closing Action Banner */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Remote Desk Support
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Planning your evaluation from outside Jaipur?
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Connect directly with our desk to request a guided video walkthrough or discuss currently listed 
              developments across Jaipur corridors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/contact?intent=video#enquiry"
              className="px-8 py-4 rounded-full bg-[#B5623A] text-white text-[12px] font-mono uppercase tracking-widest hover:bg-[#A3522C] transition-colors text-center font-medium"
            >
              Request a video viewing
            </Link>
            <Link
              to="/contact#enquiry"
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center font-medium"
            >
              Contact the team
            </Link>
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
        defaultService="Remote & NRI Client Inquiry"
      />
    </PublicLayout>
  );
}
