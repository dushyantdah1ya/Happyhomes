import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Compass, 
  Search, 
  MessageSquare, 
  Calendar, 
  FileCheck2, 
  FileText, 
  KeyRound, 
  ArrowRight, 
  ArrowUpRight, 
  AlertCircle, 
  Video, 
  CheckCircle2,
  Building2,
  HelpCircle
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { useSettings } from '../hooks/useSettings';

interface ProcessStage {
  step: string;
  title: string;
  summary: string;
  details: string[];
  keyAdvice: string;
  action?: {
    label: string;
    href: string;
  };
}

const STAGES: ProcessStage[] = [
  {
    step: '01',
    title: 'Define Requirements & Explore the Portfolio',
    summary:
      'Identify your preferred residential typology, target location within Jaipur, and approximate budget before initiating direct builder discussions.',
    details: [
      'Evaluate your requirements across private turnkey villas, boutique low-rise independent floors, or master-planned residential plots.',
      'Consider practical daily connectivity, corridor orientation (such as Jagatpura and South-East Jaipur sectors), and required plot or carpet area.',
      'Browse our public catalogue of direct builder developments to understand current architectural specifications, layouts, and indicative price points.',
    ],
    keyAdvice:
      'Review published floor plans and location maps to narrow your preferences prior to scheduling site inspections.',
    action: {
      label: 'Explore Listed Developments',
      href: '/developments',
    },
  },
  {
    step: '02',
    title: 'Confirm Current Property Availability',
    summary:
      'Connect with our project desk to verify real-time status and specific plot or unit configurations for your shortlisted property.',
    details: [
      'Published website information provides an overview of active and planned schemes, but availability changes as units are allotted or placed into contract.',
      'Inquire about specific orientations, plot dimensions, corner positions, or floor levels.',
      'Reconfirm current availability directly with our desk before making travel arrangements or financial commitments; published availability does not constitute a reservation.',
    ],
    keyAdvice:
      'Direct communication with the builder desk ensures you receive up-to-date specifications and availability before proceeding.',
    action: {
      label: 'Inquire with the Desk',
      href: '/contact#enquiry',
    },
  },
  {
    step: '03',
    title: 'Request a Site Visit or Guided Video Walkthrough',
    summary:
      'Inspect physical ground conditions, approach road paving, and surrounding neighborhood infrastructure in person or remotely.',
    details: [
      'Submit a visit request specifying your preferred date and time slot using our dedicated contact intents.',
      'For outstation or overseas buyers unable to travel immediately, request a guided video walkthrough to inspect the site and surroundings remotely.',
      'Note that all preferred viewing time windows operate in Indian Standard Time (IST, UTC+05:30).',
      'Important: Submitting a request logs your preference with our desk, but it is not an automatically confirmed appointment. An enquiry receipt is not a confirmed booking. Our team will contact you to verify coordinates and confirm scheduling.',
    ],
    keyAdvice:
      'Walk the approach roads, verify frontage widths, and observe boundary demarcations during daytime hours.',
    action: {
      label: 'Request a Site Visit',
      href: '/contact?intent=visit#enquiry',
    },
  },
  {
    step: '04',
    title: 'Request Documentation & Independent Professional Review',
    summary:
      'Examine available technical drawings, layout sanctions, and title records through qualified independent professionals.',
    details: [
      'Ask the project desk for documentation available for the selected property, including architectural drawings, sanctioned layout maps, conversion/patta documents, and draft agreements.',
      'Documents are shared where prepared and available for that specific site; Happy Homes does not promise every document exists for every scheme.',
      'Engage an independent legal advocate and qualified technical consultant to review land revenue records, layout sanctions, and draft contract terms.',
      'Happy Homes provides available documentation upon request but does not conduct legal compliance verification on behalf of the buyer or substitute for independent counsel.',
    ],
    keyAdvice:
      'Never rely on oral assurances regarding approvals, easements, or boundaries; have your independent adviser review primary records.',
  },
  {
    step: '05',
    title: 'Discuss Terms, Inclusions & Finalize Written Agreement',
    summary:
      'Agree on specific pricing, structural and interior inclusions, payment milestones, and proposed handover timelines directly with the builder.',
    details: [
      'Review what is included in the base figure and clarify additional statutory costs (such as stamp duty, registration charges, and municipal electricity/water meter deposits).',
      'Align on a staged payment schedule tied to verifiable construction milestones or documentation releases rather than arbitrary dates.',
      'Ask for the proposed terms in writing and arrange appropriate independent review before making a commitment.',
      'Rely on the specific terms of your agreement once finalized; informal discussions or website estimates do not form part of the contractual arrangement.',
    ],
    keyAdvice:
      'Ensure every agreed specification and payment stage is documented in writing and reviewed by your independent advisor before proceeding.',
  },
  {
    step: '06',
    title: 'Pre-Handover Inspection, Snagging & Key Delivery',
    summary:
      'Conduct a thorough physical walkthrough prior to final handover to inspect finishes, test utilities, and complete formal possession.',
    details: [
      'Schedule a pre-handover walkthrough with our site supervisor to verify that all work matches the contractual specifications.',
      'Document any outstanding items or touch-ups on a shared snagging list with an agreed rectification schedule.',
      'Confirm the handover of electrical meter connections, water source access, structural warranties, keys, and possession documentation.',
      'Ensure final settlement balances correspond accurately with completed milestones as agreed in your written contract.',
    ],
    keyAdvice:
      'Take possession only after completing the physical walkthrough and ensuring all documented contractual items are satisfied.',
  },
];

export default function BuyingProcessPage() {
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
              Buying Process
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-14 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Buyer Due Diligence &amp; Workflow • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Buying a home with<br />
            <span className="text-[#B5623A]">Happy Homes.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-3xl">
            A practical, step-by-step roadmap for prospective purchasers evaluating residential properties 
            in Jaipur. From initial specification planning and physical site inspections to independent 
            documentation review and final handover.
          </p>
        </div>

        {/* Advisory Scope & Disclaimer Box */}
        <div className="mb-16 p-6 sm:p-8 bg-[#F8F8F8] border border-black/10 rounded-2xl flex flex-col sm:flex-row items-start gap-5">
          <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-2 text-[13px] text-[#555] font-light leading-relaxed">
            <p className="font-medium text-[#141414]">
              Planning Guide Notice — Not a Contractual Commitment
            </p>
            <p>
              This sequence is provided as an objective planning guide for prospective buyers, not as a guaranteed 
              company procedure, fixed 30-day timeline, or service-level commitment. Happy Homes does not impose 
              arbitrary reservation deadlines or provide universal document warranties. All property allotments, 
              pricing, payment milestones, and handover terms are governed exclusively by the formal written 
              agreement executed between the parties.
            </p>
          </div>
        </div>

        {/* Six Practical Stages: Clean Vertical Editorial Sequence */}
        <div className="space-y-12 md:space-y-16 mb-20 md:mb-28">
          {STAGES.map((stage) => (
            <section
              key={stage.step}
              id={`stage-${stage.step}`}
              className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Stage Indicator & Title */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                        {`STAGE ${stage.step}`}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                      {stage.title}
                    </h2>
                    <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                      {stage.summary}
                    </p>
                  </div>

                  {/* Contextual Action Button */}
                  {stage.action && (
                    <div className="pt-4">
                      <Link
                        to={stage.action.href}
                        className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
                      >
                        <span>{stage.action.label}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Detailed Steps & Key Advice */}
                <div className="lg:col-span-7 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                  <div className="space-y-4 mb-8">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                      Key Practical Considerations
                    </span>
                    <ul className="space-y-3 text-[14px] text-[#555] font-light leading-relaxed">
                      {stage.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation Highlight */}
                  <div className="p-5 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-medium mb-1">
                      Buyer Recommendation
                    </div>
                    <p className="text-[13px] text-[#444] font-light leading-relaxed">
                      {stage.keyAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Related Guides Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Remote Purchasing
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Planning your purchase from outside Jaipur
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Guidelines for NRI, outstation, and remote buyers coordinating property evaluations, video viewings, 
                and independent local representation.
              </p>
            </div>
            <Link
              to="/nri-buyers"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Read Remote &amp; NRI Guide</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Client Advisory
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Frequently asked questions
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Clear answers regarding published inventory, viewing confirmations, documentation review, and 
                appointment scheduling.
              </p>
            </div>
            <Link
              to="/faqs"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Browse All Questions</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Closing Action Banner */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Direct Builder Dialogue
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Discuss your property requirements with our desk.
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Whether you are evaluating a specific villa layout, residential plot, or construction specification, 
              our team provides direct coordinates, transparent updates, and guided site inspections.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/contact?intent=visit#enquiry"
              className="px-8 py-4 rounded-full bg-[#B5623A] text-white text-[12px] font-mono uppercase tracking-widest hover:bg-[#A3522C] transition-colors text-center font-medium"
            >
              Request a Site Visit
            </Link>
            <Link
              to="/contact?intent=video#enquiry"
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center font-medium"
            >
              Request Video Viewing
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
        defaultService="Buying Process Consultation"
      />
    </PublicLayout>
  );
}
