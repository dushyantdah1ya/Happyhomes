import { useState } from 'react';
import { Link } from 'react-router';
import { 
  CheckSquare, 
  Clock, 
  Eye, 
  FileText, 
  ArrowRight, 
  ArrowUpRight, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  ShieldAlert,
  Compass
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { useSettings } from '../hooks/useSettings';

interface ChecklistItem {
  prompt: string;
  detail: string;
}

interface ChecklistSection {
  id: string;
  phase: string;
  title: string;
  tagline: string;
  items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'before-the-visit',
    phase: 'PHASE 01',
    title: 'Before the Visit',
    tagline: 'Preparation, scheduling, and narrowing down discussion points prior to meeting.',
    items: [
      {
        prompt: 'Identify the development and configuration you want to discuss.',
        detail:
          'Review the published catalogue in advance. Note the specific scheme name, residential typology (villa, independent floor, or plot), and preferred layout or orientation you wish to evaluate.',
      },
      {
        prompt: 'Confirm the appointment, meeting point, and contact person with the team.',
        detail:
          'Reconfirm your appointment date and time slot (IST), exact meeting point or site coordinates, and the name of your Happy Homes contact person before departing. Remember that submitting a visit request requires direct confirmation by our desk.',
      },
      {
        prompt: 'Write down your space, access, and budget questions.',
        detail:
          'List essential priorities for your household, such as required room dimensions, vehicle parking requirements, staircase or lift access, vastu considerations, and overall budget parameters including registration and statutory taxes.',
      },
      {
        prompt: 'Ask what plans or property information are available to review.',
        detail:
          'Inquire ahead of time whether sanctioned layout drawings, key floor plans, or specification sheets are prepared and available for review during or following the viewing.',
      },
    ],
  },
  {
    id: 'during-the-visit',
    phase: 'PHASE 02',
    title: 'During the Visit',
    tagline: 'On-site observations, unit verification, and practical questions during the walkthrough.',
    items: [
      {
        prompt: 'Ask which unit/configuration is being shown and which details apply to it.',
        detail:
          'Verify whether you are inspecting the actual unit under consideration, a comparable model floor, or a staged residence. Confirm which specific specifications and price points belong to that particular allotment.',
      },
      {
        prompt: 'Observe the room arrangement, natural light, access, and immediate surroundings for your own needs.',
        detail:
          'Walk the entire layout during daylight hours. Note natural airflow, sunlight exposure, room proportions, window orientations, internal privacy, approach road width, and adjacent neighborhood conditions.',
      },
      {
        prompt: 'Ask which visible finishes or fixtures are included and which are illustrative or optional.',
        detail:
          'Clarify whether display features—such as woodwork, modular fittings, light fixtures, or sanitary upgrades—are standard contract inclusions or display-only staging elements.',
      },
      {
        prompt: "Ask about the property's actual utility arrangements, current construction stage, and available information.",
        detail:
          'Inquire about water supply sources, electricity connection status, drainage provisions, current structural milestones, and what stage-specific testing records or documentation have been documented.',
      },
      {
        prompt: 'Note questions to discuss with a qualified professional rather than treating visual impressions as proof of structural quality or legal compliance.',
        detail:
          'A pleasant visual impression does not substitute for technical verification. Write down questions regarding structural engineering, material grades, and conversion titles to review with independent advisors.',
      },
    ],
  },
  {
    id: 'after-the-visit',
    phase: 'PHASE 03',
    title: 'After the Visit',
    tagline: 'Recording impressions, seeking clarifications, and conducting independent due diligence.',
    items: [
      {
        prompt: 'Record unanswered questions and request clarification.',
        detail:
          'Document specific questions arising from your walkthrough and request clear written answers through your Happy Homes project contact while observations remain fresh.',
      },
      {
        prompt: 'Reconfirm current availability, price, inclusions, and proposed dates before deciding.',
        detail:
          'Check real-time unit availability, total commercial inclusions, current construction stage, and proposed handover dates directly with the desk before progressing.',
      },
      {
        prompt: 'Arrange appropriate independent review of relevant documents and proposed terms.',
        detail:
          'Ask for the proposed terms in writing and arrange appropriate independent review by a qualified legal advocate and technical professional before making a commitment.',
      },
    ],
  },
];

export default function VisitChecklistPage() {
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
              <Link to="/buying-process" className="hover:text-[#141414] transition-colors">
                Buyer Guide
              </Link>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">
              Visit Checklist
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-14 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Practical Viewing Guide • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Make the most of<br />
            <span className="text-[#B5623A]">your property visit.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-3xl">
            A practical reading guide for prospective homebuyers preparing questions and observations 
            before, during, and after an in-person or remote property viewing. Use this checklist to keep 
            your evaluation structured, objective, and thorough.
          </p>
        </div>

        {/* Prominent Advisory Note */}
        <div className="mb-16 p-6 sm:p-8 bg-[#FAF8F5] border border-[#B5623A]/20 rounded-2xl flex flex-col sm:flex-row items-start gap-5">
          <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-2 text-[13px] text-[#555] font-light leading-relaxed">
            <p className="font-medium text-[#141414] text-sm">
              Advisory Note — General Practical Guide, Not Professional Advice
            </p>
            <p>
              This checklist is a general practical reading guide designed to assist prospective buyers in organizing 
              their questions and observations. It does <strong>not</strong> constitute technical, engineering, structural, 
              valuation, architectural, or legal advice. Happy Homes recommends independent professional inspections, 
              expert technical reviews, and independent document verification by qualified legal and engineering consultants 
              for any property under consideration.
            </p>
          </div>
        </div>

        {/* Three Clearly Differentiated Sections */}
        <div className="space-y-12 md:space-y-16 mb-20 md:mb-28">
          {CHECKLIST_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Section Header */}
                <div className="lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                        {section.phase}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                      {section.title}
                    </h2>
                    <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                      {section.tagline}
                    </p>
                  </div>

                  <div className="hidden lg:block pt-4">
                    <div className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                      {section.items.length} Guided Prompts
                    </div>
                  </div>
                </div>

                {/* Section Prompts & Questions */}
                <div className="lg:col-span-8 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                  <div className="space-y-6">
                    {section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-5 sm:p-6 bg-[#FAFAFA] border border-black/5 rounded-2xl hover:border-black/15 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-[11px] font-mono tracking-wider text-[#B5623A] font-semibold mt-0.5 shrink-0 bg-white border border-black/10 rounded-md w-6 h-6 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="space-y-2">
                            <h3 className="text-base sm:text-lg font-medium text-[#141414] leading-snug">
                              {item.prompt}
                            </h3>
                            <p className="text-[13px] text-[#555] font-light leading-relaxed">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Short Video-Viewing Note */}
        <div className="mb-16 p-6 sm:p-8 bg-[#FAF8F5] border border-[#B5623A]/20 rounded-2xl flex flex-col sm:flex-row items-start gap-5">
          <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0 mt-0.5">
            <Eye size={20} />
          </div>
          <div className="space-y-3 text-[13px] text-[#555] font-light leading-relaxed flex-1">
            <h3 className="font-medium text-[#141414] text-sm">
              Video-Viewing Considerations
            </h3>
            <ul className="space-y-2 list-disc list-inside text-[#555]">
              <li>Ask which property/configuration is being shown and which areas can be viewed.</li>
              <li>A video may not reveal every condition, finish nuance, or surrounding environmental factor.</li>
              <li>Existing form time windows are in Indian Standard Time (IST); all requests require team confirmation before an appointment is scheduled.</li>
              <li>A video consultation does not promise a live tour, recording, or comprehensive engineering inspection.</li>
            </ul>
            <div className="pt-2">
              <Link
                to="/contact?intent=video#enquiry"
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline font-medium"
              >
                <span>Request a Video Viewing</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Contextual Guides Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Materials &amp; Verification
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Construction Quality
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Review structural documentation, core civil materials, waterproofing, and pre-handover snagging questions before your visit.
              </p>
            </div>
            <Link
              to="/construction-quality"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Explore Construction Standards</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Purchase Roadmap
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Buying Process Guide
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Explore our six-stage purchase guidance covering requirements definition, site inspections, independent document review, and handover.
              </p>
            </div>
            <Link
              to="/buying-process"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Read Buying Process</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Considered Exploration
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Our Approach
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Understand how you can use our published property information, ask direct questions, and make a considered choice for your next home.
              </p>
            </div>
            <Link
              to="/our-approach"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Explore Our Approach</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Primary Viewing CTA Box */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              On-Site &amp; Remote Viewings
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Ready to view a development in person?
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Connect with our project desk to check real-time availability and request a guided on-site visit or remote video walkthrough. Please note that submitting a viewing request does not confirm an appointment; all requests require team confirmation.
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
              Request a Video Viewing
            </Link>
            <button
              type="button"
              onClick={() => setIsConsultOpen(true)}
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              General Inquiry
            </button>
          </div>
        </div>

        {/* Contact Coordinates Reference */}
        <div className="mt-8 text-center text-[12px] font-mono text-[#737373]">
          Project Desk: <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="underline hover:text-[#141414]">{settings.phone}</a> • <a href={`mailto:${settings.email}`} className="underline hover:text-[#141414]">{settings.email}</a> • {settings.address}
        </div>
      </div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="Viewing Preparation Consultation"
      />
    </PublicLayout>
  );
}
