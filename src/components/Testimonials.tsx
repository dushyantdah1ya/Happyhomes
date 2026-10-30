import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Quote, ArrowUpRight, ShieldCheck, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

interface CaseStudy {
  id: string;
  project: string;
  location: string;
  client: string;
  clientTitle: string;
  scale: string;
  transactionType: string;
  closingTimeframe: string;
  quote: string;
  image: string;
  statutoryOutcome: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-01',
    project: 'Bespoke Luxury Villa',
    location: 'Kusum Vihar, Jaipur',
    client: 'The Sharma Family',
    clientTitle: 'Sample testimonial (Draft)',
    scale: '300 Sq.Yd G+2 Villa',
    transactionType: 'Residential Construction',
    closingTimeframe: 'Delivered in 12 Months',
    quote: 'Happy Homes delivered our villa with exceptional structural quality. The transparency regarding JDA 90-A documentation and direct builder accountability was refreshing.',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400&auto=format&fit=crop&q=80',
    statutoryOutcome: 'Verified JDA Section 90-A Patta & Structural Audit'
  },
  {
    id: 'case-02',
    project: 'Luxury Independent Floor',
    location: 'Jagatpura, Jaipur',
    client: 'Vikram Singh',
    clientTitle: 'Sample testimonial (Draft)',
    scale: '270 Sq.Yd Independent Floor',
    transactionType: 'Turnkey Construction',
    closingTimeframe: 'Delivered in 10 Months',
    quote: 'As an NRI, I needed a builder I could trust for remote project management. Happy Homes provided weekly technical updates and handled all registry formalities seamlessly.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80',
    statutoryOutcome: 'Zero-Encumbrance Title Clearance & Bank Finance Approved'
  },
  {
    id: 'case-03',
    project: 'JDA Approved Plot Development',
    location: 'Vidhyadhar Nagar, Jaipur',
    client: 'Dr. Aditya Verma',
    clientTitle: 'Sample testimonial (Draft)',
    scale: '250 Sq.Yd Freehold Plot',
    transactionType: 'Development Feasibility',
    closingTimeframe: 'Vetted in 15 Days',
    quote: 'The architectural precision and focus on master-planned communities set Happy Homes apart. Their forensic title vetting ensured my investment was 100% secure.',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&auto=format&fit=crop&q=80',
    statutoryOutcome: '30-Year Sub-Registrar History & Possession Confirmed'
  }
];

const ROTATION_INTERVAL_MS = 8000; // 8-second editorial cadence

export default function Testimonials() {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  // Reliable auto-rotation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveCaseIndex((prev) => (prev + 1) % CASE_STUDIES.length);
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
  }, [isPaused, activeCaseIndex]);

  const handleNext = () => {
    setActiveCaseIndex((prev) => (prev + 1) % CASE_STUDIES.length);
  };

  const handlePrev = () => {
    setActiveCaseIndex((prev) => (prev - 1 + CASE_STUDIES.length) % CASE_STUDIES.length);
  };

  const active = CASE_STUDIES[activeCaseIndex];

  return (
    <section id="testimonials" className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1600px] mx-auto bg-[#F8F8F8]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A5A5A5] block mb-3">
            Case Study Archive • Sample testimonials (Draft)
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Trust built through <span className="text-[#B5623A]">delivered titles.</span>
          </h2>
        </div>
        
        {/* Metric Badges & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-6 text-[12px] font-mono text-[#141414]">
            <div>
              <span className="font-semibold block text-[16px]">Jaipur</span>
              <span className="text-[#737373] text-[11px]">Core Operations</span>
            </div>
            <span className="text-[#A5A5A5]">•</span>
            <div>
              <span className="font-semibold block text-[#141414] text-[16px]">JDA 90-A</span>
              <span className="text-[#737373] text-[11px]">Structural Focus</span>
            </div>
            <span className="text-[#A5A5A5]">•</span>
            <div>
              <span className="font-semibold block text-[16px]">Jagatpura</span>
              <span className="text-[#737373] text-[11px]">Primary Sector</span>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:border-l sm:border-black/10 sm:pl-6">
            <button
              onClick={handlePrev}
              className="w-9 h-9 border border-black/15 bg-white hover:bg-[#141414] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="h-9 px-3 border border-black/15 bg-white hover:bg-neutral-100 flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#737373] transition-colors cursor-pointer"
              title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? <Play size={10} /> : <Pause size={10} />}
              <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Auto'}</span>
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 border border-black/15 bg-white hover:bg-[#141414] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Editorial Journal Layout with Smooth Auto-Crossfade */}
      <div className="bg-white border border-black/10 overflow-hidden mb-8 relative rounded-[2rem]">
        
        {/* Subtle Ambient Timeline Bar */}
        <div className="w-full h-1 bg-black/5 relative overflow-hidden">
          <motion.div
            key={activeCaseIndex + (isPaused ? '-paused' : '-running')}
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? '0%' : '100%' }}
            transition={{ duration: isPaused ? 0 : ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
            className="h-full bg-[#B5623A]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Left Photographic Feature with Stamp (5 cols) - Stacked Crossfade */}
          <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-[500px] bg-neutral-900 overflow-hidden rounded-l-[2rem]">
            {CASE_STUDIES.map((c, idx) => {
              const isCurrent = activeCaseIndex === idx;
              return (
                <div
                  key={c.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isCurrent ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img 
                    src={c.image} 
                    alt={c.project} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    TRANSACTION PROFILE #{idx + 1} OF {CASE_STUDIES.length}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 block">
                      {c.transactionType}
                    </span>
                    <h4 className="text-xl font-light">{c.project}</h4>
                    <p className="text-[12px] font-mono text-white/80 flex items-center gap-1.5 pt-1">
                      <MapPin size={12} /> {c.location} • {c.scale}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Editorial Review & Transcript (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B5623A] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373]">
                    ARCHIVAL CASE STUDY
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2.5 py-1 border border-[#B5623A]/25 rounded-md">
                  {active.closingTimeframe}
                </span>
              </div>

              {/* Large Pull Quote */}
              <div className="relative">
                {active.id !== 'verification' && <Quote size={32} className="text-black/10 absolute -top-4 -left-2 -z-0" />}
                <p className={`text-lg sm:text-2xl font-light leading-relaxed text-[#141414] relative z-10 min-h-[90px] sm:min-h-[110px] ${active.id !== 'verification' ? 'italic' : ''}`}>
                  {active.id === 'verification' ? active.quote : `"${active.quote}"`}
                </p>
              </div>

              {/* Client Credentials */}
              {active.id !== 'verification' && (
                <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-[16px] font-medium text-[#141414]">
                      {active.client}
                    </h4>
                    <p className="text-[13px] text-[#666] font-light">
                      {active.clientTitle}
                    </p>
                  </div>

                  <div className="text-[12px] font-mono text-[#737373] bg-[#F8F8F8] px-3.5 py-2 border border-black/10">
                    {active.scale}
                  </div>
                </div>
              )}

              {/* Statutory Outcome Banner */}
              <div className="p-3.5 bg-[#F8F8F8] border border-black/10 flex items-center gap-2.5 text-[12px] font-mono text-[#141414]">
                <ShieldCheck size={16} className="text-[#B5623A] shrink-0" />
                <span><strong>Outcome:</strong> {active.statutoryOutcome}</span>
              </div>

            </motion.div>

            {/* Bottom Consultation CTA */}
            <div className="pt-8 mt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-[#8E8E8E]">
                Case Study Archive (Draft) • Rotates automatically
              </span>
              <button
                type="button"
                onClick={() => setIsConsultOpen(true)}
                className="w-full sm:w-auto border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
              >
                <span>Schedule Private Consultation</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Case Selector Strip: Clickable tabs with individual active indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CASE_STUDIES.map((c, idx) => {
          const isSelected = activeCaseIndex === idx;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCaseIndex(idx)}
              className={`p-4 text-left border transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                isSelected
                  ? 'bg-[#141414] text-white border-[#141414]'
                  : 'bg-white text-[#141414] border-black/10 hover:border-black/30'
              }`}
            >
              <div>
                <span className={`text-[10px] font-mono block ${isSelected ? 'text-white/60' : 'text-[#8E8E8E]'}`}>
                  Case Study 0{idx + 1}
                </span>
                <span className="text-[13px] font-medium block leading-snug mt-0.5">
                  {c.client.split('&')[0]}
                </span>
                <span className={`text-[11px] font-mono block mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#737373]'}`}>
                  {c.location.split(',')[0]}
                </span>
              </div>

              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent border border-black/20'}`} />
            </button>
          );
        })}
      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Case Study Inquiry (${active.project})`}
      />
    </section>
  );
}
