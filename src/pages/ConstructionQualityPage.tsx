import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Building2, 
  FileText, 
  Layers, 
  Droplets, 
  CheckCircle2, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';

export default function ConstructionQualityPage() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

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
              Construction Quality
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Buyer Assessment Guide • Jaipur Residences
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Construction quality &amp;<br />
            <span className="text-[#4B4B4B] font-extralight">buyer documentation.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-2xl">
            A practical reference for prospective buyers evaluating residential construction in Jaipur. 
            Understand what questions to ask, what documentation to request, and how to assess 
            project specifications with qualified professionals.
          </p>
        </div>

        {/* Four Concise Non-Prescriptive Buyer Questions */}
        <section className="mb-20 md:mb-28">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
              Buyer Evaluation Checklist
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#141414] mb-4">
              Key questions to ask when evaluating a development.
            </h2>
            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              Every residential project has unique characteristics. Rather than relying on generic claims, 
              we encourage buyers to ask these focused questions for any development under consideration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Question 1 */}
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <Building2 size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    Documentation 01
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight">
                  What structural documentation is available for this development?
                </h3>

                <p className="text-[14px] text-[#555] font-light leading-relaxed">
                  Ask to review the project-specific structural drawings, column grid layout, and foundation 
                  design prepared by the structural engineer for that development. Inquire whether a structural 
                  stability certificate or soil test report was conducted for the site.
                </p>

                <ul className="space-y-2 pt-2 text-[13px] text-[#555] font-light border-t border-black/5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Structural engineer stamped column and footing drawings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Foundation type and design suitable for local soil conditions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Structural engineer certification of design stability</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <Layers size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    Documentation 02
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight">
                  Which materials and finishes are included in its specification?
                </h3>

                <p className="text-[14px] text-[#555] font-light leading-relaxed">
                  Request the specific material schedule outlining the structure, masonry, and finishes 
                  for that project. Ask which brands and grades are used for cement, reinforcement steel, 
                  electrical wiring, and sanitary fittings, and confirm what is included in the purchase price.
                </p>

                <ul className="space-y-2 pt-2 text-[13px] text-[#555] font-light border-t border-black/5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Reinforcement steel and concrete grade schedule</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Masonry wall specifications and thermal insulation details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Approved brand list for electrical and sanitary fittings</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Question 3 */}
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <Droplets size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    Documentation 03
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight">
                  What waterproofing and services-testing records can the team provide?
                </h3>

                <p className="text-[14px] text-[#555] font-light leading-relaxed">
                  Inquire about the treatment methods used for sunken bathroom floors, balconies, and roof 
                  terraces. Ask what testing procedures were followed—such as water ponding tests before tiling 
                  or pressure testing for concealed plumbing lines—and what warranty records exist.
                </p>

                <ul className="space-y-2 pt-2 text-[13px] text-[#555] font-light border-t border-black/5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Waterproofing barrier specifications for wet areas and roofs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Plumbing pressure tests and drainage slope verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Concealed conduit testing and electrical protection circuits</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Question 4 */}
            <div className="bg-white border border-black/10 rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    Documentation 04
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight">
                  What inspection or handover documentation is available?
                </h3>

                <p className="text-[14px] text-[#555] font-light leading-relaxed">
                  Ask about the process followed during construction milestones and final handover. 
                  Inquire whether stage-wise inspection notes, completion certificates, and snag-list 
                  resolution procedures are documented for the residence.
                </p>

                <ul className="space-y-2 pt-2 text-[13px] text-[#555] font-light border-t border-black/5">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Milestone inspection records and civil completion notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>Pre-handover walkthrough and snag-list rectification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A]" />
                    <span>As-built layout drawings and fixture warranty documents</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Neutral Professional Review Suggestion */}
        <section className="mb-20 md:mb-28 bg-[#FBFBFB] border border-black/10 rounded-[2rem] p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0">
              <ShieldAlert size={22} className="text-[#B5623A]" />
            </div>

            <div className="space-y-3 max-w-3xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block">
                Independent Professional Guidance
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight">
                Have project documents reviewed by qualified professionals.
              </h3>
              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Construction methods, structural calculations, and statutory requirements vary across 
                different residential developments. We recommend that prospective buyers have all technical drawings, 
                specifications, and title documentation reviewed by an appropriately qualified architect, 
                structural engineer, or legal advisor before entering into any purchase commitment.
              </p>
              <p className="text-[12px] font-mono text-[#888] pt-1">
                This page is provided as a general reference guide and does not constitute formal engineering or legal advice.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Development-Specific Notice */}
        <section className="mb-20 md:mb-28 bg-white border border-black/10 rounded-[2rem] p-8 sm:p-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0 mt-1">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-medium text-[#141414]">
              Development-Specific Details
            </h3>
            <p className="text-[13px] text-[#555] font-light leading-relaxed">
              Material brands, finish schedules, ceiling heights, and layout plans vary by individual 
              development. Prospective buyers can request the relevant project drawings and specifications 
              directly from the Happy Homes desk for any active project.
            </p>
          </div>
        </section>

        {/* Section 4: Action Banner */}
        <section className="bg-[#141414] text-white rounded-[2rem] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 block">
              Direct Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight">
              Have questions regarding a development?
            </h2>
            <p className="text-[13px] text-white/60 font-light leading-relaxed">
              Connect directly with our project desk in Jaipur. You can request available project drawings, 
              clarify specifications, or submit a site visit request (all site visits require confirmation).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <Link
              to="/developments"
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-[#B5623A] hover:text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
            >
              <span>View Developments</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/contact?intent=visit#enquiry"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-colors"
            >
              <Calendar size={13} />
              <span>Request a Site Visit</span>
            </Link>
          </div>
        </section>

      </div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="Builder Consultation"
      />
    </PublicLayout>
  );
}
