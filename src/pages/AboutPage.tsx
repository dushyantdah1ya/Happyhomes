import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  ArrowRight, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  MapPin, 
  Info
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { useSettings } from '../hooks/useSettings';

export default function AboutPage() {
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
            <li className="text-[#141414] font-medium" aria-current="page">
              About Happy Homes
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-16 md:mb-20 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Residential Builder & Developer • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Residential builder &amp;<br />
            <span className="text-[#4B4B4B] font-extralight">developer in Jaipur.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-2xl">
            Happy Homes develops, plans, and builds residential properties in Jaipur, focusing on 
            villas, independent floors, and residential plots. We work directly with homebuyers to provide 
            clear project information, site updates, and direct coordination.
          </p>
        </div>

        {/* Primary Asymmetric Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch mb-20 md:mb-28">
          
          {/* Left Column: Direct Builder Approach (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-black/10 p-8 sm:p-12 rounded-[2rem]">
            <div className="space-y-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block">
                Direct Builder Model
              </span>

              <h2 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight">
                Direct builder coordination from initial inquiry to handover.
              </h2>

              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Happy Homes operates as a direct residential builder and developer in Jaipur. When you 
                reach out regarding any of our developments, you connect directly with the team responsible 
                for planning, site coordination, and project delivery.
              </p>

              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Our portfolio spans custom villas, low-rise independent floors, and residential plots in 
                established residential areas of Jaipur. We believe in providing straightforward project 
                details so buyers can evaluate developments thoroughly and transparently.
              </p>
            </div>

            {/* Three Core Builder Focus Points */}
            <div className="pt-8 mt-8 border-t border-black/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-black/5">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="text-[15px] font-medium text-[#141414]">Direct Builder Dialogue</h3>
                </div>
                <p className="text-[13px] text-[#555] font-light sm:max-w-xs">
                  Discuss layouts, construction progress, and handover timelines directly with the builder team.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b border-black/5">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-[15px] font-medium text-[#141414]">Project Documentation</h3>
                </div>
                <p className="text-[13px] text-[#555] font-light sm:max-w-xs">
                  Request available sanctioned layout maps, structural drawings, and material schedules for active projects.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#B5623A]/10 flex items-center justify-center text-[#B5623A]">
                    <Building2 size={16} />
                  </div>
                  <h3 className="text-[15px] font-medium text-[#141414]">Site Inspection Visits</h3>
                </div>
                <p className="text-[13px] text-[#555] font-light sm:max-w-xs">
                  Request an on-site visit to inspect project locations and neighborhood infrastructure in-person (subject to confirmation).
                </p>
              </div>
            </div>

            {/* CTA action in card */}
            <div className="pt-8 mt-8 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[12px] font-mono text-[#666]">
                Residential developments across Jaipur
              </span>
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-[#141414] hover:bg-black text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all cursor-pointer"
              >
                <span>Builder Consultation</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Imagery & Owner Contact (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visual Card */}
            <div className="border border-black/10 bg-white rounded-[2rem] overflow-hidden flex flex-col">
              <div className="relative aspect-[16/11] overflow-hidden bg-neutral-900">
                <img 
                  src="https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1400&auto=format&fit=crop&q=80" 
                  alt="Architectural residential villa development in Jaipur" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                  Architectural Study
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] mb-1">
                  Representative Design
                </p>
                <p className="text-[13px] text-[#555] font-light leading-relaxed">
                  Representative study of modern residential architecture in Jaipur. Project-specific 
                  drawings, elevations, and finishes vary by individual development.
                </p>
              </div>
            </div>

            {/* Project Desk & Owner Contact Card */}
            <div className="border border-black/10 bg-white rounded-[2rem] p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                  Direct Contact
                </span>
                <h3 className="text-lg font-light text-[#141414] mb-3">
                  Project Desk Coordinates
                </h3>
                
                <div className="space-y-3 text-[13px] text-[#555] font-light">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#B5623A] shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-[#B5623A] shrink-0" />
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="font-mono text-[#141414] hover:text-[#B5623A] transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail size={15} className="text-[#B5623A] shrink-0" />
                    <a href={`mailto:${settings.email}`} className="text-[#141414] hover:text-[#B5623A] transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-black/10 flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-[#888]">
                  {settings.officeHours}
                </span>
                <Link
                  to="/contact?intent=visit#enquiry"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B5623A] hover:text-[#141414] transition-colors"
                >
                  <span>Request a Site Visit</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Website Workflow (Clear actions without promises) */}
        <section className="mb-20 md:mb-28">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-2">
              Website Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#141414] mb-4">
              How to explore our developments.
            </h2>
            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              Use this website to review published residential projects, request available documentation, 
              and schedule an in-person site visit with the builder desk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#B5623A] block mb-3 font-semibold">01</span>
                <h3 className="text-lg font-light text-[#141414] mb-2 tracking-tight">
                  Browse Published Projects
                </h3>
                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-4">
                  Explore available residential categories—including villas, independent floors, and plots—with photographs, floor plans, and overview details.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#737373] pt-4 border-t border-black/5">
                <Link to="/developments" className="text-[#B5623A] hover:underline">
                  View developments →
                </Link>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#B5623A] block mb-3 font-semibold">02</span>
                <h3 className="text-lg font-light text-[#141414] mb-2 tracking-tight">
                  Request Project Details
                </h3>
                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-4">
                  Ask our team for project-specific drawings, specifications, and handover documentation to review with your independent advisors.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#737373] pt-4 border-t border-black/5">
                <Link to="/contact" className="text-[#B5623A] hover:underline">
                  Contact project desk →
                </Link>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#B5623A] block mb-3 font-semibold">03</span>
                <h3 className="text-lg font-light text-[#141414] mb-2 tracking-tight">
                  Request a Site Visit
                </h3>
                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-4">
                  Submit a visit request to walk the site in-person, inspect the surrounding area, and examine physical construction progress (requests require confirmation).
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#737373] pt-4 border-t border-black/5">
                <Link to="/contact?intent=visit#enquiry" className="text-[#B5623A] hover:underline">
                  Plan a visit →
                </Link>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#B5623A] block mb-3 font-semibold">04</span>
                <h3 className="text-lg font-light text-[#141414] mb-2 tracking-tight">
                  Direct Builder Consultation
                </h3>
                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-4">
                  Discuss layout adjustments, payment milestones, and documentation questions directly with the Happy Homes project desk.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#737373] pt-4 border-t border-black/5">
                <button 
                  onClick={() => setIsConsultOpen(true)}
                  className="text-[#B5623A] hover:underline cursor-pointer text-left"
                >
                  Schedule consultation →
                </button>
              </div>
            </div>

          </div>

          {/* Neutral Professional Review Notice */}
          <div className="mt-8 p-5 bg-white border border-black/10 rounded-2xl flex items-start gap-3.5">
            <Info size={18} className="text-[#B5623A] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#666] font-light leading-relaxed">
              <strong className="text-[#141414] font-medium">Independent Review:</strong> We encourage all prospective buyers to have project documents, sanctioned layout maps, and agreements independently reviewed by an appropriately qualified legal or engineering professional.
            </p>
          </div>
        </section>

        {/* Section 3: Residential Portfolio Pathways */}
        <section className="mb-20 md:mb-28 bg-white border border-black/10 rounded-[2rem] p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-2">
              Portfolio Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414] tracking-tight">
              Three residential pathways in Jaipur.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-3">
              <h3 className="text-lg font-light text-[#141414] flex items-center justify-between">
                <span>Villas</span>
                <Link to="/villas" className="text-[#B5623A] hover:text-[#141414] transition-colors">
                  <ArrowUpRight size={15} />
                </Link>
              </h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Freestanding multi-level residences designed with private layouts, dedicated parking, and custom architectural detailing.
              </p>
              <Link to="/villas" className="inline-block text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:underline pt-2">
                Explore Villas →
              </Link>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-light text-[#141414] flex items-center justify-between">
                <span>Independent Floors</span>
                <Link to="/independent-floors" className="text-[#B5623A] hover:text-[#141414] transition-colors">
                  <ArrowUpRight size={15} />
                </Link>
              </h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Low-rise, boutique residential floors providing single-floor privacy, dedicated access, and independent title registration.
              </p>
              <Link to="/independent-floors" className="inline-block text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:underline pt-2">
                Explore Floors →
              </Link>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-light text-[#141414] flex items-center justify-between">
                <span>Residential Plots</span>
                <Link to="/plots" className="text-[#B5623A] hover:text-[#141414] transition-colors">
                  <ArrowUpRight size={15} />
                </Link>
              </h3>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Planned residential plots across established sectors with demarcated boundaries and clear registry documentation.
              </p>
              <Link to="/plots" className="inline-block text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:underline pt-2">
                Explore Plots →
              </Link>
            </div>

          </div>
        </section>

        {/* Section 4: Direct Action & Portfolio Pathways */}
        <section className="bg-[#141414] text-white rounded-[2rem] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/50 block">
              Direct Builder Engagement
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight">
              Ready to explore developments or request a visit?
            </h2>
            <p className="text-[13px] text-white/60 font-light leading-relaxed">
              Connect directly with our project desk in Jaipur to discuss available developments, 
              request project drawings, or submit a site visit request (all visits subject to confirmation).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <Link
              to="/developments"
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-[#B5623A] hover:text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
            >
              <span>Explore Portfolio</span>
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
