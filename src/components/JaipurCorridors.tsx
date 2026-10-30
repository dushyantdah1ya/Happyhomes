import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, ArrowUpRight, Compass, ShieldCheck, Clock, ExternalLink, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

interface Corridor {
  id: string;
  code: string;
  number: string;
  name: string;
  zone: string;
  coordinates: string;
  roadWidth: string;
  airportEta: string;
  jdaStatus: string;
  image: string;
  description: string;
  investmentThesis: string;
  landmarks: string[];
}

const CORRIDORS: Corridor[] = [
  {
    id: 'jagatpura',
    code: 'SECTOR 01',
    number: '01',
    name: 'Jagatpura Core & Mahal Road',
    zone: 'South-East Growth Vector',
    coordinates: '26.8184° N, 75.8752° E',
    roadWidth: '60 – 120 Ft Arterials',
    airportEta: '12 Mins to Airport',
    jdaStatus: 'Zone 10 Freehold 90-A',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&auto=format&fit=crop&q=80',
    description: 'Jaipur’s premier luxury growth corridor. Backed by 120-foot arterial dividers, subterranean utility lines, and premier healthcare campuses (Bombay Hospital, Apex), Jagatpura commands the highest rental yield and capital appreciation in South Jaipur.',
    investmentThesis: 'Highest liquidity corridor with constant demand from medical specialists, university faculty, and HNIs.',
    landmarks: ['Suresh Gyan Vihar University', 'Bombay Hospital', 'Apex Medical Center', 'Jagatpura Rail Station', '120ft Mahal Road']
  },
  {
    id: 'kusum-vihar',
    code: 'SECTOR 02',
    number: '02',
    name: 'Kusum Vihar & OBC Colony',
    zone: 'Low-Density Villa Sanctuary',
    coordinates: '26.8220° N, 75.8690° E',
    roadWidth: '40 – 60 Ft Internal Roads',
    airportEta: '14 Mins to Airport',
    jdaStatus: 'Approved JDA Freehold',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1400&auto=format&fit=crop&q=80',
    description: 'An exclusive, serene residential enclave characterized by deep, high-frontage villa plots, private cul-de-sacs, and strict low-rise residential zoning. Prohibits commercial encroachment, preserving privacy for private estate owners.',
    investmentThesis: 'Ultra-low density villa micro-market with mature tree canopy and multi-generational family residences.',
    landmarks: ['3 Public Sector Parks', 'Near Gyan Vihar Campus', 'OBC Colony Main Gate', 'Mahal Road Bypass', 'Sweet Water Grid']
  },
  {
    id: 'vidhyadhar-nagar',
    code: 'SECTOR 03',
    number: '03',
    name: 'Vidhyadhar Nagar Sector',
    zone: 'Planned Heritage-Adjacent Axis',
    coordinates: '26.9654° N, 75.7761° E',
    roadWidth: '60 – 80 Ft Sector Roads',
    airportEta: '25 Mins (Direct Bypass)',
    jdaStatus: 'Mature Freehold Allotment',
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1400&auto=format&fit=crop&q=80',
    description: 'A masterpiece of urban grid planning conceived in tribute to Vidyadhar Bhattacharya, Jaipur’s original master architect. Characterized by wide boulevards, central sector greens, and immediate proximity to Central Spine commercial amenities.',
    investmentThesis: 'Established high-net-worth North Jaipur hub with zero land replenishment, creating continuous upward price pressure.',
    landmarks: ['Central Spine Commercial Plaza', 'Manipal Hospital', 'Sikar Road Link', 'Sector Playgrounds', 'Dronacharya Stadium']
  },
  {
    id: 'ring-road',
    code: 'SECTOR 04',
    number: '04',
    name: 'Ring Road & Tonk Axis',
    zone: 'High-Appreciation Capital Frontier',
    coordinates: '26.7621° N, 75.8450° E',
    roadWidth: '80 – 200 Ft Super-Corridors',
    airportEta: '18 Mins via Express',
    jdaStatus: 'JDA Masterplan Schemes',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=80',
    description: 'Jaipur’s 6-lane orbital transport super-corridor connecting Tonk Road directly to the Delhi-Mumbai Expressway and RIICO industrial hubs. The primary target for medium-term capital compounding and multi-acre private estate acquisition.',
    investmentThesis: 'Major institutional infrastructure belt with projected 18-22% annualized capital compounding over 3–5 year horizons.',
    landmarks: ['Ring Road Cloverleaf', 'Tonk Road NH-52', 'Sitapura Commercial Zone', 'Chokhi Dhani Corridor', 'New JDA Allotment Belts']
  }
];

const ROTATION_INTERVAL_MS = 8000; // 8-second editorial cadence

export default function JaipurCorridors() {
  const [activeCorridorIndex, setActiveCorridorIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  // Reliable auto-rotation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isPaused) {
      timer = setInterval(() => {
        setActiveCorridorIndex((prev) => (prev + 1) % CORRIDORS.length);
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
  }, [isPaused, activeCorridorIndex]);

  const handleNext = () => {
    setActiveCorridorIndex((prev) => (prev + 1) % CORRIDORS.length);
  };

  const handlePrev = () => {
    setActiveCorridorIndex((prev) => (prev - 1 + CORRIDORS.length) % CORRIDORS.length);
  };

  const active = CORRIDORS[activeCorridorIndex];

  return (
    <section id="corridors" className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1600px] mx-auto bg-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Spatial Cartography
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Prime <span className="text-[#B5623A]">development</span> belts.
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <p className="text-[#666] text-[14px] leading-relaxed max-w-sm font-light">
            We focus our brokerage exclusively on verified, flood-safe sectors backed by JDA Section 90-A tenure and municipal Bisalpur sweet-water pipelines.
          </p>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2 pt-4 sm:pt-0 sm:border-l sm:border-black/10 sm:pl-6 shrink-0">
            <button
              onClick={handlePrev}
              className="w-9 h-9 border border-black/15 bg-white hover:bg-[#141414] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous sector"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="h-9 px-3 border border-black/15 bg-white hover:bg-neutral-100 flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#666] transition-colors cursor-pointer"
              title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? <Play size={10} /> : <Pause size={10} />}
              <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Auto'}</span>
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 border border-black/15 bg-white hover:bg-[#141414] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next sector"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Cartographic Matrix & Interactive Sector Console with Auto-Rotation */}
      <div className="border border-black/10 bg-[#F8F8F8] relative overflow-hidden rounded-[2rem]">
        
        {/* Top Horizontal Sector Selector Tabs with Real-time Progress Bar */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 border-b border-black/10 bg-white no-scrollbar p-2 gap-2 lg:gap-4">
          {CORRIDORS.map((c, idx) => {
            const isSelected = activeCorridorIndex === idx;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveCorridorIndex(idx);
                  setIsPaused(true);
                }}
                className={`p-4 sm:p-5 text-left transition-colors duration-300 cursor-pointer border relative overflow-hidden min-w-[160px] sm:min-w-0 flex-shrink-0 lg:flex-shrink rounded-xl ${
                  isSelected ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white hover:bg-black/5 text-[#141414] border-black/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono ${isSelected ? 'text-white/60' : 'text-[#666]'}`}>
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#555]'}`}>
                    {c.airportEta.split(' ')[0]} {c.airportEta.split(' ')[1]}
                  </span>
                </div>

                <h3 className="text-[15px] sm:text-[16px] font-medium leading-snug tracking-tight">
                  {c.name.split('&')[0]}
                </h3>

                <span className={`text-[11px] font-mono block mt-1 ${isSelected ? 'text-white/70' : 'text-[#888]'}`}>
                  {c.zone.split(' ')[0]} Belt
                </span>

                {/* Animated Timeline Progress Bar on Active Tab */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
                    <motion.div
                      key={activeCorridorIndex + (isPaused ? '-paused' : '-running')}
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

        {/* Selected Corridor Deep-Dive Console */}
        <div className="p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            
            {/* Left Narrative & Key Infrastructure Metrics (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-mono text-[#666]">
                      {active.coordinates}
                    </span>
                    <span className="text-black/20">•</span>
                    <span className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2 py-0.5 border border-[#B5623A]/25">
                      {active.jdaStatus}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-light text-[#141414] tracking-tight leading-tight mb-3">
                    {active.name}
                  </h3>

                  <p className="text-[14px] text-[#666] font-mono mb-4">
                    {active.zone}
                  </p>

                  <p className="text-[14px] text-[#444] font-light leading-relaxed mb-6 min-h-[70px]">
                    {active.description}
                  </p>

                  {/* Investment Thesis Callout */}
                  <div className="p-4 bg-white border-l-2 border-[#141414] border-y border-r border-black/10 mb-6 rounded-r-xl rounded-l-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#666] block mb-1">
                      BROKERAGE THESIS
                    </span>
                    <p className="text-[13px] text-[#141414] font-light italic leading-snug">
                      "{active.investmentThesis}"
                    </p>
                  </div>
                </div>

                {/* Technical Specifications Strip */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
                      Sector Arterials
                    </span>
                    <span className="text-[13px] font-mono font-medium text-[#141414] mt-0.5 block">
                      {active.roadWidth}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
                      Airport Proximity
                    </span>
                    <span className="text-[13px] font-mono font-medium text-[#141414] mt-0.5 block">
                      {active.airportEta}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
                      Water Grid
                    </span>
                    <span className="text-[13px] font-mono font-medium text-[#141414] mt-0.5 block">
                      Bisalpur PHED
                    </span>
                  </div>
                </div>

                {/* Nearby Key Landmarks */}
                <div className="pt-4 border-t border-black/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666] block mb-2.5">
                    Strategic Civic & Institutional Landmarks:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {active.landmarks.map((lm, i) => (
                      <span key={i} className="text-[11px] bg-white border border-black/10 px-3 py-1 text-[#444] font-light rounded-md">
                        {lm}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Inquiry Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
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

            {/* Right Panoramic Photography (6 cols) with Seamless Stacked Crossfade */}
            <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-[560px] bg-neutral-900 border border-black/10 overflow-hidden rounded-[2rem]">
              {CORRIDORS.map((c, idx) => {
                const isCurrent = activeCorridorIndex === idx;
                return (
                  <div
                    key={c.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isCurrent ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img 
                      src={c.image} 
                      alt={c.name} 
                      className="w-full h-full object-cover rounded-[12px]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10">
                      SECTOR STUDY • {c.code}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-[#141414]/90 backdrop-blur-sm p-4 text-white border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 block">JDA ALLOTMENT STATUS</span>
                        <span className="text-[13px] font-light">{c.jdaStatus}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 block">DRIVE TIME</span>
                        <span className="text-[13px] font-mono text-[#E88C61]">{c.airportEta}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Land Inquiry for ${active.name}`}
      />
    </section>
  );
}
