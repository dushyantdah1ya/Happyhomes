import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, ArrowUpRight, Check, FileCheck, Landmark, CheckCircle2, FileText, Scale, Building2, type LucideIcon } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const ROTATION_INTERVAL_MS = 8000;

interface DueDiligenceStandard {
  id: string;
  icon: LucideIcon;
  name: string;
  authority: string;
  statutoryAct: string;
  coreMetric: string;
  riskEliminated: string;
  verifiedDeliverables: string[];
}

const STANDARDS: DueDiligenceStandard[] = [
  {
    id: 'patta',
    icon: ShieldCheck,
    name: 'Statutory JDA Section 90-A Freehold Patta',
    authority: 'Jaipur Development Authority (JDA)',
    statutoryAct: 'Rajasthan Land Revenue Act 1956, Sec. 90-A',
    coreMetric: '100% Non-Agricultural Freehold Title',
    riskEliminated: 'Zero Society Patta Demolition or Seizure Risk',
    verifiedDeliverables: [
      'Certified agricultural surrender order & revenue conversion clearance',
      'Direct municipal freehold patta conferring perpetual ownership with registry rights',
      'Total Station GPS boundary pegging strictly aligned with JDA sector masterplan maps'
    ]
  },
  {
    id: 'title',
    icon: FileText,
    name: '30-Year Sub-Registrar Title History Chain',
    authority: 'Rajasthan State Registration Department',
    statutoryAct: 'Indian Registration Act 1908, Sec. 17 & 49',
    coreMetric: 'Clean 30-Year Unbroken Chain of Deeds',
    riskEliminated: 'Zero Undisclosed Heirs, Prior Mortgages or Civil Injunctions',
    verifiedDeliverables: [
      'Full physical search of registered mother deeds at the Jaipur Sub-Registrar registry',
      'Certified Non-Encumbrance Certificate (NEC) verifying zero court attachments',
      'Direct Jamabandi revenue record cross-examination verifying sole lawful khatedari'
    ]
  },
  {
    id: 'banking',
    icon: Building2,
    name: 'Tier-1 Institutional Bank Pre-Approval',
    authority: 'State Bank of India (SBI) & HDFC Bank Panel',
    statutoryAct: 'SARFAESI & RBI Institutional Mortgage Standards',
    coreMetric: 'Pre-Approved for 80% Institutional LTV',
    riskEliminated: 'Guaranteed Unencumbered Property & Fair Valuation',
    verifiedDeliverables: [
      'Pre-vetted by senior empaneled Rajasthan High Court advocates of SBI and HDFC Bank',
      'Institutional engineering valuation confirming transaction aligns with fair market rate',
      'Confirm financing arrangements and timelines with your lender'
    ]
  },
  {
    id: 'infrastructure',
    icon: Landmark,
    name: 'Civic Infrastructure & 40ft+ Sector Road Audit',
    authority: 'PHED Rajasthan & JVVNL Masterplan Division',
    statutoryAct: 'Jaipur Masterplan 2025 Sector Avenue Norms',
    coreMetric: 'Direct 40ft – 120ft Paved Avenue Frontage',
    riskEliminated: 'Zero Water Tanker Dependence & Narrow Cul-de-sac Encroachment',
    verifiedDeliverables: [
      'Bisalpur sweet water pipeline connection verified with municipal PHED division',
      'Underground drainage, stormwater lines, and subterranean electric cables installed',
      'Wide asphalt road frontage ensuring heavy emergency vehicle access & high resale liquidity'
    ]
  }
];

export default function Craftsmanship() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % STANDARDS.length);
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
  }, [isPaused, activeTab]);

  const active = STANDARDS[activeTab];

  return (
    <section 
      id="advisory" 
      className="px-6 md:px-12 pt-24 md:pt-32 pb-0 w-full max-w-[1600px] mx-auto bg-[#F8F8F8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A5A5A5] block mb-3">
            Construction Vetting Protocol
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Four <span className="text-[#B5623A]">construction standards</span> to consider for every project.
          </h2>
        </div>
        <p className="text-[#737373] text-[14px] leading-relaxed max-w-md font-light">
          We recommend that prospective buyers evaluate properties against rigorous statutory inspections. Before progressing with a project, consider these four key verification standards.
        </p>
      </div>

      {/* Forensic Audit Docket Console (Distinct Architectural Grid, Not Image Cards) */}
      <div className="bg-white border border-black/10 rounded-[2rem] overflow-hidden">
        
        {/* Top Audit Selector Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-black/10">
          {STANDARDS.map((std, idx) => {
            const isSelected = activeTab === idx;
            const Icon = std.icon;
            return (
              <button
                key={std.id}
                type="button"
                onClick={() => {
                  setActiveTab(idx);
                  setIsPaused(true);
                }}
                className={`p-6 sm:p-7 text-left transition-all cursor-pointer border-r last:border-r-0 border-black/10 relative overflow-hidden ${
                  isSelected 
                    ? 'bg-[#141414] text-white' 
                    : 'hover:bg-black/5 text-[#141414]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={18} className={isSelected ? 'text-[#B5623A]' : 'text-[#8E8E8E]'} />
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#B5623A]' : 'bg-transparent border border-black/20'}`} />
                </div>

                <h4 className="text-[14px] sm:text-[15px] font-medium leading-snug tracking-tight">
                  {std.name.split('&')[0]}
                </h4>

                <span className={`text-[11px] font-mono block mt-2 truncate ${isSelected ? 'text-white/70' : 'text-[#737373]'}`}>
                  {std.authority.split('&')[0]}
                </span>

                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
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

        {/* Audit Inspection Certificate Viewport */}
        <div className="p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Statutory Certificate Passport (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] bg-[#F8F8F8] px-3 py-1 border border-black/10 rounded-md">
                  STATUTORY PROTOCOL
                </span>
                <span className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2.5 py-0.5 border border-[#B5623A]/25 flex items-center gap-1.5 rounded-md">
                  <ShieldCheck size={13} className="text-[#B5623A]" />
                  <span>Mandatory Vetting</span>
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-4xl font-light text-[#141414] tracking-tight leading-tight mb-2">
                  {active.name}
                </h3>
                <p className="text-[13px] font-mono text-[#737373]">
                  Sanctioning Body: <strong className="text-[#141414] font-medium">{active.authority}</strong>
                </p>
              </div>

              {/* Statutory Framework Highlight */}
              <div className="p-5 bg-[#F8F8F8] border border-black/10 space-y-3 rounded-xl">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#737373]">
                  <Scale size={14} className="text-[#141414]" />
                  <span>Statutory Governing Law:</span>
                </div>
                <div className="text-[14px] font-mono font-medium text-[#141414]">
                  {active.statutoryAct}
                </div>
              </div>

              {/* Risk Mitigation Stamp */}
              <div className="p-5 bg-[#B5623A]/10 border border-[#B5623A]/25 text-[13px] rounded-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B5623A] block mb-1">
                  RISK ELIMINATED FOR BUYER:
                </span>
                <p className="text-[#141414] font-medium leading-snug">
                  {active.riskEliminated}
                </p>
              </div>

            </div>

            {/* Right Column: Physical & Legal Verification Checklist (6 cols) */}
            <div className="lg:col-span-6 bg-[#F8F8F8] p-8 sm:p-10 border border-black/10 flex flex-col justify-between rounded-2xl">
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373]">
                    NON-NEGOTIABLE VERIFICATION CHECKLIST
                  </span>
                  <FileCheck size={16} className="text-[#B5623A]" />
                </div>

                <div className="space-y-4">
                  {active.verifiedDeliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-4 border border-black/5 text-[13px] text-[#333] rounded-xl">
                      <CheckCircle2 size={16} className="text-[#B5623A] shrink-0 mt-0.5" />
                      <span className="font-light leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Core Benchmark Guarantee */}
                <div className="pt-4 border-t border-black/10 flex items-center justify-between text-[12px] font-mono text-[#555]">
                  <span>Key Statutory Metric:</span>
                  <span className="font-semibold text-[#141414]">{active.coreMetric}</span>
                </div>
              </div>

              {/* Action Button & Phase Indicators */}
              <div className="pt-8 mt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                  {STANDARDS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTab(i);
                        setIsPaused(true);
                      }}
                      className={`h-1.5 transition-all cursor-pointer relative overflow-hidden ${
                        activeTab === i ? 'w-10 bg-[#B5623A]/20' : 'w-3 bg-black/10 hover:bg-black/30'
                      }`}
                      aria-label={`Go to audit ${i + 1}`}
                    >
                      {activeTab === i && (
                        <motion.div
                          key={i + (isPaused ? '-paused' : '-running')}
                          initial={{ width: '0%' }}
                          animate={{ width: isPaused ? '0%' : '100%' }}
                          transition={{ duration: isPaused ? 0 : ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
                          className="absolute inset-0 bg-[#B5623A]"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsConsultOpen(true)}
                  className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center gap-2 bg-[#141414] hover:bg-black text-white py-3.5 px-8 text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap rounded-full"
                >
                  <span>Schedule Builder Consultation</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Title Due Diligence Mandate (${active.name})`}
      />
    </section>
  );
}
