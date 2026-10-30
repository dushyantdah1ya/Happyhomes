import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Compass, ShieldCheck, Ruler, Clock, Check, FileCheck, Key, ChevronRight } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const ROTATION_INTERVAL_MS = 8000;

interface Step {
  number: string;
  phase: string;
  timeline: string;
  headline: string;
  description: string;
  deliverables: string[];
}

const STEPS: Step[] = [
  {
    number: '01',
    phase: 'MANDATE & DISCOVERY',
    timeline: 'Days 1 – 7',
    headline: 'Client Mandate & Master-Plan Shortlisting',
    description: 'Establish your residential requirements, preferred sector corridor, and budget range before initiating direct discussions. Explore available architectural villas, luxury floors, and residential plots in our catalogue.',
    deliverables: [
      'Matching JDA 90-A assets in prime corridors',
      'Direct pricing information for available inventory',
      'Guided on-site or video walkthrough requests'
    ]
  },
  {
    number: '02',
    phase: 'DUE DILIGENCE & VERIFICATION',
    timeline: 'Practical Review',
    headline: 'Documentation & Independent Professional Review',
    description: 'We recommend arranging appropriate independent review of available technical drawings, layout sanctions, and title records through your own qualified legal and technical professionals.',
    deliverables: [
      'Review of available JDA Section 90-A Patta documentation',
      'Verification of revenue receipts and sanctioned layout maps',
      'Independent title history search at the Sub-Registrar office'
    ]
  },
  {
    number: '03',
    phase: 'COMMERCIALS & TERMS',
    timeline: 'Commercial Phase',
    headline: 'Discuss Terms, Inclusions & Finalize Written Agreement',
    description: 'Align on specific pricing, structural and interior inclusions, payment milestones, and proposed handover timelines directly with the builder desk before executing a written agreement.',
    deliverables: [
      'Direct builder dialogue regarding specific property inclusions',
      'Institutional tier-1 bank loan coordination for qualified buyers',
      'Execution of formal written agreement detailing all terms'
    ]
  },
  {
    number: '04',
    phase: 'HANDOVER & POSSESSION',
    timeline: 'Final Stage',
    headline: 'Pre-Handover Inspection, Snagging & Key Delivery',
    description: 'Conduct a thorough physical walkthrough prior to final handover to inspect finishes, test utilities, and complete formal possession as per your contractual agreement.',
    deliverables: [
      'Guided pre-handover walkthrough and snagging list creation',
      'Physical site handover and boundary peg confirmation',
      'Handover of utility access, warranties, and keys'
    ]
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % STEPS.length);
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
  }, [isPaused, activeStep]);

  const step = STEPS[activeStep];

  return (
    <section 
      id="how-it-works" 
      className="px-6 md:px-12 pt-24 md:pt-32 pb-0 w-full max-w-[1600px] mx-auto bg-white"
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Acquisition Protocol • 30-Day Roadmap
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            From initial enquiry to <span className="text-[#B5623A]">property handover.</span>
          </h2>
        </div>
        <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
          A practical roadmap for prospective homebuyers, explaining the typical sequence of defining requirements, site inspections, documentation review, and final handover.
        </p>
      </div>

      {/* Connected Architectural Stepper Line (NOT card boxes) */}
      <div className="relative mb-12">
        {/* Continuous Hairline Track */}
        <div className="hidden lg:block absolute top-[28px] left-0 right-0 h-[1px] bg-black/15 z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {STEPS.map((s, idx) => {
            const isSelected = activeStep === idx;
            const isPast = activeStep > idx;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  setActiveStep(idx);
                  setIsPaused(true);
                }}
                className="text-left group cursor-pointer relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#141414] text-white border-[#B5623A] shadow-md scale-105'
                      : isPast
                      ? 'bg-[#F8F8F8] text-[#141414] border-black/30'
                      : 'bg-white text-[#666] border-black/15 group-hover:border-black/40'
                  }`}>
                    <span className="font-mono text-[16px] font-semibold relative z-10">{s.number}</span>
                    
                    {/* Progress Indicator for active step */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                        <motion.div
                          key={idx + (isPaused ? '-paused' : '-running')}
                          initial={{ width: '0%' }}
                          animate={{ width: isPaused ? '0%' : '100%' }}
                          transition={{ duration: isPaused ? 0 : ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
                          className="h-full bg-[#B5623A]"
                        />
                      </div>
                    )}
                  </div>
                  <div className="lg:hidden flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#666] block">{s.timeline}</span>
                    <span className="text-[12px] font-medium text-[#141414]">{s.phase}</span>
                  </div>
                </div>

                <div className="hidden lg:block pt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${isSelected ? 'text-[#141414] font-semibold' : 'text-[#666]'}`}>
                      {s.timeline}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A] animate-pulse"></span>}
                  </div>
                  <h4 className={`text-[13px] font-medium leading-snug transition-colors ${isSelected ? 'text-[#141414]' : 'text-[#666] group-hover:text-[#141414]'}`}>
                    {s.phase}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Phase Command Center (Split Architectural View) */}
      <div className="border border-black/10 bg-[#F8F8F8] p-8 sm:p-12 lg:p-16 rounded-[2rem]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Scope & Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666] bg-white px-3 py-1 border border-black/10 rounded-md">
                PHASE {step.number} OF 04
              </span>
              <span className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2.5 py-1 border border-[#B5623A]/25 rounded-md">
                {step.timeline}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-[#141414] leading-tight tracking-tight">
              {step.headline}
            </h3>

            <p className="text-[14px] text-[#555] font-light leading-relaxed">
              {step.description}
            </p>

            <div className="p-4 bg-white border border-black/10 text-[12px] font-mono text-[#141414] flex items-center gap-3">
              <Clock size={16} className="text-[#666] shrink-0" />
              <span>Standard Execution Window: <strong>{step.timeline}</strong></span>
            </div>
          </div>

          {/* Right Column: Binding Statutory Deliverables (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-black/10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#666]">
                  PHASE {step.number} STATUTORY DELIVERABLES
                </span>
                <span className="text-[10px] font-mono text-[#B5623A] uppercase tracking-wider flex items-center gap-1">
                  <Check size={12} className="text-[#B5623A]" /> Verified Protocol
                </span>
              </div>

              <div className="space-y-4">
                {step.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-[13px] text-[#333]">
                    <div className="w-5 h-5 rounded-full bg-[#F8F8F8] border border-black/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-mono text-[#141414]">{idx + 1}</span>
                    </div>
                    <p className="font-light leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Navigation & CTA */}
            <div className="pt-8 mt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveStep(i);
                      setIsPaused(true);
                    }}
                    className={`h-1.5 transition-all cursor-pointer relative overflow-hidden ${
                      activeStep === i ? 'w-10 bg-[#B5623A]/20' : 'w-3 bg-black/10 hover:bg-black/30'
                    }`}
                    aria-label={`Go to phase ${i + 1}`}
                  >
                    {activeStep === i && (
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#141414] hover:bg-black text-white px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap rounded-full"
              >
                <span>Schedule Private Consultation</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

          </div>

        </div>
      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Acquisition Protocol - Phase ${step.number}: ${step.headline}`}
      />
    </section>
  );
}
