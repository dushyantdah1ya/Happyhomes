import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Compass, 
  Search, 
  HelpCircle, 
  FileCheck2, 
  ArrowRight, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { useSettings } from '../hooks/useSettings';

export default function OurApproachPage() {
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
              <span className="text-[#737373]">About Us</span>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">
              Our Approach
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-14 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Buyer Exploration &amp; Information Standards • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            A clearer way to explore<br />
            <span className="text-[#B5623A]">your next home.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-3xl">
            Choosing a residential property is a significant decision that deserves clarity and straightforward 
            facts. Here is how prospective buyers can use Happy Homes' published property information and direct 
            contact flow to evaluate available developments, ask direct questions, and make a considered choice.
          </p>
        </div>

        {/* Scope Notice */}
        <div className="mb-16 p-6 sm:p-8 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-2xl flex flex-col sm:flex-row items-start gap-5">
          <div className="w-10 h-10 rounded-full bg-[#B5623A]/10 text-[#B5623A] flex items-center justify-center shrink-0 mt-0.5">
            <Compass size={20} />
          </div>
          <div className="space-y-2 text-[13px] text-[#555] font-light leading-relaxed">
            <p className="font-medium text-[#141414]">
              Direct Builder Information Model
            </p>
            <p>
              Happy Homes provides direct builder project information for our own developments in Jaipur. 
              Published details reflect specific properties under development or planning, allowing you 
              to assess tangible layouts, locations, and documented specifications.
            </p>
          </div>
        </div>

        {/* Four Concise Editorial Sections */}
        <div className="space-y-12 md:space-y-16 mb-20 md:mb-28">
          
          {/* Section 1: Start with your requirements */}
          <section
            id="requirements"
            className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                      SECTION 01
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                    Start with your requirements
                  </h2>
                  <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                    Clarify your family's space needs, location preferences, and approximate budget before arranging on-site inspections.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to="/developments"
                    className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
                  >
                    <span>Explore Our Developments</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                <div className="space-y-4 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                    What to Consider
                  </span>
                  <ul className="space-y-3 text-[14px] text-[#555] font-light leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Residential Typology:</strong> Consider whether your needs align with a private turnkey villa, a low-rise independent floor with dedicated level access, or a residential plot for future construction.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Location &amp; Corridors:</strong> Evaluate daily connectivity, school and medical access, and road frontage in prime Jaipur sectors such as Jagatpura and South-East growth corridors.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Space &amp; Budget Parameters:</strong> Determine essential room counts, carpet area requirements, and an indicative budget range to help narrow down suitable schemes.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-medium mb-1">
                    Catalogue Exploration
                  </div>
                  <p className="text-[13px] text-[#555] font-light leading-relaxed">
                    Our catalogue presents specific planned and under-construction residences across Jaipur, allowing you to explore available schemes, locations, and layouts directly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Look at the particular property */}
          <section
            id="particular-property"
            className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                      SECTION 02
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                    Look at the particular property
                  </h2>
                  <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                    Each development has its own specifications, architectural drawings, and unit configurations. Evaluate each scheme on its specific merits.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to="/construction-quality"
                    className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
                  >
                    <span>Review Construction Standards</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                <div className="space-y-4 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                    Property-Specific Facts
                  </span>
                  <ul className="space-y-3 text-[14px] text-[#555] font-light leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Specific Plans &amp; Specifications:</strong> Floor layouts, room dimensions, structural specifications, and exterior photos are specific to each individual scheme and site orientation.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Transparent Availability:</strong> Unit availability changes as allotments proceed. When a property or unit configuration is active or sold, that status is noted on its project record.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Optional Information Appears When Available:</strong> Additional documentation—such as detailed finishing schedules or construction stage updates—is provided when prepared for that specific property.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-medium mb-1">
                    Property-Specific Documentation
                  </div>
                  <p className="text-[13px] text-[#555] font-light leading-relaxed">
                    Supplied plans, specifications, photographs, and configuration details are property-specific. Optional documentation and milestone updates appear as they become available for that development.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Ask direct questions */}
          <section
            id="direct-questions"
            className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                      SECTION 03
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                    Ask direct questions
                  </h2>
                  <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                    Connect directly with our project desk to confirm real-time availability, schedule viewing appointments, and ask detailed questions.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to="/contact#enquiry"
                    className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
                  >
                    <span>Connect with Project Desk</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                <div className="space-y-4 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                    Direct Inquiry Workflow
                  </span>
                  <ul className="space-y-3 text-[14px] text-[#555] font-light leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Specific Inclusions:</strong> Ask which visible finishes, fittings, and utility provisions are included in the base figure, and which elements are illustrative or optional upgrades.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Proposed Handover &amp; Staging:</strong> Inquire about current construction progress, milestone expectations, and proposed possession timelines for under-construction units.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Viewing Request Confirmation:</strong> Submitting a site visit or video consultation request logs your preference with our team. All viewing requests require direct confirmation by our desk before an appointment is scheduled.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-medium mb-1">
                    Viewing Request Confirmation
                  </div>
                  <p className="text-[13px] text-[#555] font-light leading-relaxed">
                    Viewing requests require team confirmation before an appointment is scheduled. All requests are coordinated individually with no automated booking or fixed response-time guarantee.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Make an informed decision */}
          <section
            id="informed-decision"
            className="bg-white border border-black/10 p-8 sm:p-12 md:p-14 rounded-[2rem] hover:border-black/20 transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-mono tracking-widest text-[#B5623A] bg-[#B5623A]/10 px-3 py-1 rounded-full font-medium">
                      SECTION 04
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight mb-4">
                    Make an informed decision
                  </h2>
                  <p className="text-[14px] text-[#666] font-light leading-relaxed mb-6">
                    Take time to conduct independent due diligence, examine written contracts, and verify primary title documents before committing.
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to="/buying-process"
                    className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#141414] hover:text-[#B5623A] font-medium transition-colors"
                  >
                    <span>Read Buying Process Roadmap</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between pt-6 lg:pt-0 lg:pl-8 lg:border-l border-black/10">
                <div className="space-y-4 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                    Independent Due Diligence
                  </span>
                  <ul className="space-y-3 text-[14px] text-[#555] font-light leading-relaxed">
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Independent Professional Review:</strong> We invite buyers to have their own legal advocate, architect, or technical advisor examine available revenue records, sanctioned layout plans, and agreements.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Written Terms &amp; Review:</strong> Ask for the proposed terms in writing and arrange appropriate independent review before making a commitment.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#B5623A] font-mono text-xs mt-1 shrink-0">•</span>
                      <span>
                        <strong>Clear Documentation:</strong> Review documented specifications, proposed payment milestones, and written arrangements carefully with your independent advisor before proceeding.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-[#FAF8F5] border border-[#B5623A]/15 rounded-xl">
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-medium mb-1">
                    Independent Professional Advice
                  </div>
                  <p className="text-[13px] text-[#555] font-light leading-relaxed">
                    We recommend arranging independent professional review of all relevant property records, title documents, and proposed written terms before making a financial or legal commitment.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Related Contextual Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Materials &amp; Standards
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Construction Quality
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Understand how we handle structural documentation, core civil materials, waterproofing records, and pre-handover snagging inspections.
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
                A six-stage roadmap explaining requirements definition, property verification, site viewings, documentation review, and handover.
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
        </div>

        {/* Closing Action Banner */}
        <div className="p-8 sm:12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Explore Our Developments
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Take the next step in evaluating your home.
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Explore active villas, low-rise independent floors, and residential plots in our catalogue, or connect directly with our project desk for specific property inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/developments"
              className="px-8 py-4 rounded-full bg-[#B5623A] text-white text-[12px] font-mono uppercase tracking-widest hover:bg-[#A3522C] transition-colors text-center font-medium"
            >
              Explore Developments
            </Link>
            <Link
              to="/contact#enquiry"
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center font-medium"
            >
              Contact the Team
            </Link>
            <button
              type="button"
              onClick={() => setIsConsultOpen(true)}
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center cursor-pointer"
            >
              Consult Desk
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
        defaultService="General Project Exploration"
      />
    </PublicLayout>
  );
}
