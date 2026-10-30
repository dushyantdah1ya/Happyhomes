import { useState } from 'react';
import { ArrowUpRight, ShieldCheck, Key, FileCheck } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

export default function AboutUs() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  return (
    <section id="about" className="px-6 md:px-12 pt-24 md:pt-32 pb-24 md:pb-32 w-full max-w-[1600px] mx-auto bg-[#F8F8F8]">
      
      {/* Top Editorial Kicker & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666] block mb-3">
            Architectural Construction • Jagatpura, Jaipur
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.05] text-[#141414]">
            Not ordinary property dealers.<br />
            <span className="text-[#4B4B4B] font-extralight">A private <span className="text-[#B5623A] font-light">architectural construction</span> firm.</span>
          </h2>
        </div>

        <p className="text-[#555] text-[14px] leading-relaxed max-w-md font-light">
          Founded in Jagatpura, Happy Homes was established to replace unvetted middlemen with rigorous legal title due diligence, direct-seller negotiations, and Jaipur’s most exclusive residential portfolio.
        </p>
      </div>

      {/* Main Architectural Spread: 2-Column Asymmetric Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch mb-20">
        
        {/* Left: Narrative & 3 Core Principles (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-black/10 p-8 sm:p-12 rounded-[2rem]">
          
          <div className="space-y-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block">
              OUR CONSTRUCTION PHILOSOPHY
            </span>

            <h3 className="text-2xl sm:text-3xl font-light text-[#141414] leading-snug tracking-tight">
              In a market crowded with speculative builders, we operate with architectural precision.
            </h3>

            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              Jaipur’s booming real estate market is often filled with rapid developments sacrificing structural integrity, undocumented land extensions, and inflated costs. For families, choosing a home without rigorous construction standards carries immense risk.
            </p>

            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              Happy Homes takes a different approach. We focus on master-planned communities, presenting 100% authentic JDA Section 90-A freehold plots, bespoke luxury villas, and independent floors built on prime 40ft to 60ft sector avenues across Jagatpura, Kusum Vihar, and Vidhyadhar Nagar.
            </p>
          </div>

          {/* Clean Editorial Ledger: 3 Non-Negotiable Standards */}
          <div className="pt-8 mt-8 border-t border-black/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-5 border-b border-black/5">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#B5623A] shrink-0" />
                <h4 className="text-[15px] font-medium text-[#141414]">Master-Planned Engineering</h4>
              </div>
              <p className="text-[13px] text-[#555] font-light sm:max-w-xs sm:text-right">
                Every project is designed with structural foresight, verified Khasra boundary demarcation, and JDA 90-A compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-5 border-b border-black/5">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-[#B5623A] shrink-0" />
                <h4 className="text-[15px] font-medium text-[#141414]">Uncompromising Craftsmanship</h4>
              </div>
              <p className="text-[13px] text-[#555] font-light sm:max-w-xs sm:text-right">
                Direct control over construction phases, material selection, and site supervision from ground-break to final delivery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="flex items-center gap-3">
                <FileCheck size={18} className="text-[#B5623A] shrink-0" />
                <h4 className="text-[15px] font-medium text-[#141414]">Legacy-Driven Delivery</h4>
              </div>
              <p className="text-[13px] text-[#555] font-light sm:max-w-xs sm:text-right">
                Zero compromise on structural quality. Full mortgage clearance with major banks and end-to-end registry conveyancing.
              </p>
            </div>

          </div>

          {/* Quantitative Metric Bar */}
          <div className="pt-8 mt-8 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <span className="text-xl font-light font-mono text-[#141414] block">Jaipur</span>
              <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Core Focus</span>
            </div>
            <div>
              <span className="text-xl font-light font-mono text-[#141414] block">Jagatpura</span>
              <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Prime Corridors</span>
            </div>
            <div>
              <span className="text-xl font-light font-mono text-[#141414] block">JDA 90-A</span>
              <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Patta Verification</span>
            </div>
            <div>
              <span className="text-xl font-light font-mono text-[#141414] block">Direct</span>
              <span className="text-[10px] text-[#666] uppercase tracking-wider font-mono">Builder Delivery</span>
            </div>
          </div>

        </div>

        {/* Right: Master Architectural Residence (5 cols) */}
        <div className="lg:col-span-5 relative flex flex-col border border-black/10 bg-white overflow-hidden group rounded-[2rem]">
          
          <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:h-[460px] overflow-hidden bg-neutral-900 rounded-t-[2rem]">
            <img 
              src="https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1400&auto=format&fit=crop&q=80" 
              alt="Curated Private Luxury Villa in Jagatpura" 
              className="w-full h-full object-cover group-hover:scale-105 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
              FEATURED DEVELOPMENT • KUSUM VIHAR
            </div>
          </div>

          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-white border-t border-black/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-1">
                BUILDER & PROJECT DESK
              </span>
              <h4 className="text-lg font-light text-[#141414] tracking-tight leading-snug mb-2">
                Turnkey estates, bespoke plots, and private floors.
              </h4>
              <p className="text-[13px] text-[#555] font-light leading-relaxed">
                Whether acquiring a ready-to-move architectural villa or securing a high-appreciation 200–500 sq.yd corner plot, our design team ensures safe, direct construction control, and structural excellence.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-[#666]">Jagatpura Sector 10</span>
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                className="w-full sm:w-auto bg-[#141414] hover:bg-black text-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap rounded-full"
              >
                <span>Schedule Builder Consultation</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="Private Client Property Search & Valuation"
      />
    </section>
  );
}
