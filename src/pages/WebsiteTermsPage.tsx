import PublicLayout from '../components/PublicLayout';
import { FileText, CheckCircle2, AlertCircle, HelpCircle, ShieldAlert, Scale } from 'lucide-react';
import { Link } from 'react-router';

export default function WebsiteTermsPage() {
  return (
    <PublicLayout>
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 md:px-16 pt-8 pb-24 md:pb-32">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">Home</Link>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">Website Terms</li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-8 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3.5 text-[12px] text-amber-900">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Draft for Owner Review</strong>
              <p className="font-light leading-relaxed">
                This document is a source-maintained operational draft for Happy Homes Jaipur. Formal legal operator identity and policy contact details remain subject to final owner confirmation prior to public launch.
              </p>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[#141414] mb-4">
            Website Terms of Use
          </h1>
          <p className="text-[11px] font-mono text-[#737373] uppercase tracking-widest mb-12">
            Last Revised: October 2026
          </p>

          <div className="space-y-12 text-[#555] font-light leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <FileText size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">1. Informational Purpose of this Website</h2>
              </div>
              <p>
                This website is operated by Happy Homes as an informational resource to present our residential developments, architectural categories (villas, independent floors, and plots), and builder advisory services in Jaipur.
              </p>
              <p>
                Content on this site is provided for general guidance and initial exploration. Browsing or interacting with this website does not create a binding contractual relationship or sales agreement between you and Happy Homes.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <CheckCircle2 size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">2. Property Details & Verification</h2>
              </div>
              <p>
                Property details—including listed availability, estimated pricing, floor plans, specifications, and locality descriptions—reflect our project information at the time of publication.
              </p>
              <p>
                Because residential inventory and site conditions evolve, all property details, pricing, inclusions, and proposed arrangements must be reconfirmed directly with the Happy Homes project desk before making any financial or logistical commitments.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <HelpCircle size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">3. Enquiries & Viewing Requests</h2>
              </div>
              <p>
                Submitting an enquiry, site visit request, or video viewing request through our online forms or contact desk logs your interest with our project team.
              </p>
              <p>
                <strong>Notice:</strong> An enquiry receipt or visit request does not constitute an automatically confirmed appointment, property reservation, or purchase contract. All site visits and video viewings require explicit confirmation by our project desk team. Preferred time windows submitted on the website operate in Indian Standard Time (IST).
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <ShieldAlert size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">4. Architectural Imagery & Visuals</h2>
              </div>
              <p>
                Visual assets displayed across our catalogue include photographs of delivered developments, actual site images, and architectural renderings or concepts.
              </p>
              <p>
                Illustrative images and renderings are intended to convey design direction and spatial concepts. Project-specific finishes, elevations, landscaping, and boundary details are defined strictly in individual development documentation and written agreements.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Scale size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">5. Written Terms & Independent Advice</h2>
              </div>
              <p>
                All commercial commitments, specifications, payment schedules, warranties, and handover targets are governed exclusively by executed written contracts. Informal website estimates, verbal discussions, or brochure samples do not alter signed agreements.
              </p>
              <p>
                Ask for the proposed terms in writing and arrange appropriate independent review before making a commitment.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <FileText size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">6. External Links & Contact Routes</h2>
              </div>
              <p>
                This website includes outbound links to external tools and services, such as WhatsApp messaging and Google Maps location coordinates, for user convenience. External services operate under their own terms and privacy practices.
              </p>
              <p>
                For questions regarding our developments, site visits, or website terms, please connect with our project desk via our <Link to="/contact" className="text-[#B5623A] underline font-medium">Contact Page</Link>.
              </p>
            </section>

            <div className="pt-8 border-t border-black/10">
              <p className="text-[12px] text-[#888]">
                Note: These terms are maintained as an operational draft. Nothing in these terms is intended to exclude or limit consumer rights guaranteed under applicable Indian law.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
