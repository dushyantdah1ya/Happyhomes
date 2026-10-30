import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Compass, ShieldCheck, FileCheck, Users, Globe, Building2, Check, LucideIcon } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const ROTATION_INTERVAL_MS = 8000;

interface AdvisoryPillar {
  number: string;
  discipline: string;
  tagline: string;
  narrative: string;
  deliverables: string[];
  icon: LucideIcon;
}

const ADVISORY_PILLARS: AdvisoryPillar[] = [
  {
    number: '01',
    discipline: 'Turnkey Luxury Villa & Estate Construction',
    tagline: 'Precision Master-Planning & Build',
    narrative: 'The finest residential assets in Jaipur demand rigorous engineering and premium material standards. We represent private families, bespoke architects, and developers with full-cycle construction supervision.',
    deliverables: [
      'High-performance luxury villas & prime structural plots',
      'Direct on-site supervision with uncompromising material standards',
      'Exclusive first-look access to newly sanctioned JDA sector releases'
    ],
    icon: Compass
  },
  {
    number: '02',
    discipline: 'Structural Integrity & Engineering Standards',
    tagline: 'Strictly JDA Section 90-A Freehold',
    narrative: 'Jaipur real estate has historically suffered from rapid developments ignoring foundational quality. We conduct rigorous engineering and legal due diligence before initiating any construction phase.',
    deliverables: [
      '30-year certified title history & JDA compliance check',
      'Structural perimeter verification & municipal water-sanitation standards',
      'Total Station GPS mapping against approved JDA site layouts'
    ],
    icon: ShieldCheck
  },
  {
    number: '03',
    discipline: 'NRI & Remote Client Project Desk',
    tagline: 'End-to-End Construction Management',
    narrative: 'Over 40% of our luxury clients reside in Dubai, North America, the UK, or Mumbai. Our dedicated construction management team handles virtual project walk-throughs, material quality reporting, and milestone compliance.',
    deliverables: [
      'High-definition 4K construction walk-throughs and drone site surveys',
      'FEMA, NRE/NRO banking, and repatriation legal guidance',
      'Dedicated single point of contact with weekly construction reports'
    ],
    icon: Globe
  },
  {
    number: '04',
    discipline: 'Project Financing & Delivery Milestones',
    tagline: 'SBI & HDFC Pre-Approved Portfolio',
    narrative: 'Because our construction inventory undergoes legal forensic vetting, our projects enjoy priority mortgage clearance with India’s leading tier-1 lenders, ensuring phased development milestones.',
    deliverables: [
      'Expedited home loan sanction with SBI, HDFC Bank & ICICI Bank',
      'Formal sale deed drafting by senior Rajasthan High Court advocates',
      'Physical Sub-Registrar registry accompaniment and municipal mutation'
    ],
    icon: Building2
  }
];

export default function StudioGuild() {
  const [activePillar, setActivePillar] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused) {
      timer = setInterval(() => {
        setActivePillar((prev) => (prev + 1) % ADVISORY_PILLARS.length);
      }, ROTATION_INTERVAL_MS);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused]);

  // Auto-resume timer after manual interaction
  useEffect(() => {
    if (!isPaused) return;
    
    const resumeTimer = setTimeout(() => {
      setIsPaused(false);
    }, 15000); // Resume auto-rotation after 15 seconds of inactivity

    return () => clearTimeout(resumeTimer);
  }, [isPaused, activePillar]);

  return (
    <section 
      id="guild" 
      className="px-6 md:px-12 pt-24 md:pt-32 pb-24 md:pb-32 w-full max-w-[1600px] mx-auto bg-[#F8F8F8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666] block mb-3">
            Construction Project Desk
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.05] text-[#141414]">
            Why discerning families choose Happy Homes construction.<br />
            <span className="text-[#4B4B4B] font-extralight"><span className="text-[#B5623A]">Integrity</span> in every brick.</span>
          </h2>
        </div>

        <p className="text-[#555] text-[14px] leading-relaxed max-w-md font-light">
          We are not rapid-development contractors. Happy Homes operates as a disciplined construction firm, ensuring your home is built with structural foresight and premium material standards.
        </p>
      </div>

      {/* Main Studio Profile Card */}
      <div className="bg-white border border-black/10 overflow-hidden mb-16 rounded-[2rem]">
        
        {/* Top Half: Studio Atmosphere & Photographic Anchor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-black/10">
          
          {/* Left Narrative: The Construction Difference (6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block">
                THE CONSTRUCTION ADVANTAGE
              </span>

              <h3 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight">
                Direct material control. Zero layout violations. Complete structural protection.
              </h3>

              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Most developers in Jaipur prioritize speed over structural integrity, often ignoring municipal layout norms or compromising on foundational quality to inflate margins.
              </p>

              <p className="text-[14px] text-[#555] font-light leading-relaxed">
                Happy Homes works exclusively on a client-centric build model. We represent your interests on-site, audit construction phases with our engineering team, and ensure every rupee is deployed into durable, high-value, and structurally sound real estate.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="pt-8 mt-8 border-t border-black/10 grid grid-cols-3 gap-6">
              <div>
                <span className="text-2xl sm:text-3xl font-light font-mono text-[#141414] block">100%</span>
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">JDA 90-A Only</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light font-mono text-[#141414] block">30-Yr</span>
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Title Audits</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-light font-mono text-[#141414] block">₹0</span>
                <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Hidden Fees</span>
              </div>
            </div>
          </div>

          {/* Right Photographic Showcase (6 cols) */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-[auto] bg-neutral-900 overflow-hidden group rounded-tr-[2rem]">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80" 
              alt="Curated Luxury Estate in Jaipur" 
              className="w-full h-full object-cover group-hover:scale-105 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
              FEATURED CONSTRUCTION ASSET • JAGATPURA
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 text-[#141414] border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#666] block">PRIVATE ASSET SEARCH</span>
                <span className="text-[12px] font-light text-[#141414]">Custom property mandates tailored to your exact budget & sector preference</span>
              </div>
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                className="w-full sm:w-auto shrink-0 border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
              >
                <span>Schedule Private Consultation</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Half: The 4 Core Disciplines */}
        <div className="p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-black/10 gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] block mb-1">
                OUR SERVICES
              </span>
              <h4 className="text-xl sm:text-2xl font-light text-[#141414]">
                Four Specialized Brokerage & Advisory Divisions
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#666]">
              Select service to inspect scope
            </span>
          </div>

          {/* Category Filter Chips (Tier 1) */}
          <div className="flex overflow-x-auto lg:flex-wrap gap-2 mb-10 pb-4 no-scrollbar">
            {ADVISORY_PILLARS.map((pillar, idx) => {
              const isSelected = activePillar === idx;
              return (
                <button
                  key={pillar.number}
                  type="button"
                  onClick={() => {
                    setActivePillar(idx);
                    setIsPaused(true);
                  }}
                  className={`px-6 py-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap rounded-full relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#141414] text-white border-[#141414]'
                      : 'bg-[#F8F8F8] text-[#666] border-black/10 hover:border-black/30'
                  }`}
                >
                  <span className="relative z-10">{pillar.number} {pillar.discipline.split(' ')[0]}</span>
                  
                  {/* Progress Indicator for active chip */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B5623A]/30 overflow-hidden">
                      <motion.div
                        key={idx + (isPaused ? '-paused' : '-running')}
                        initial={{ width: '0%' }}
                        animate={{ width: isPaused ? '0%' : '100%' }}
                        transition={{ duration: isPaused ? 0 : ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
                        className="h-full bg-[#B5623A]"
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Service Detail Card (Tier 2) */}
          <div className="bg-[#F8F8F8] border border-black/10 p-8 sm:p-10 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {(() => {
                    const Icon = ADVISORY_PILLARS[activePillar].icon;
                    return <Icon size={32} className="text-[#B5623A]" />;
                  })()}
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-1">
                      Division {ADVISORY_PILLARS[activePillar].number}
                    </span>
                    <h5 className="text-2xl font-light text-[#141414] tracking-tight">{ADVISORY_PILLARS[activePillar].discipline}</h5>
                  </div>
                </div>
                <p className="text-[12px] font-mono text-[#B5623A] mb-4 uppercase tracking-wider">{ADVISORY_PILLARS[activePillar].tagline}</p>
                <p className="text-[14px] text-[#555] font-light leading-relaxed">{ADVISORY_PILLARS[activePillar].narrative}</p>
              </div>

              <div className="lg:border-l lg:border-black/10 lg:pl-10 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-2">Service Deliverables & Mandate Scope:</span>
                {ADVISORY_PILLARS[activePillar].deliverables.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white p-4 border border-black/5 rounded-lg">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#B5623A]" />
                    <span className="text-[13px] font-light text-[#333] leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="Private Client Property Search in Jagatpura"
      />
    </section>
  );
}
