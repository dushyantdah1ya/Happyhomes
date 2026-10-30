import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router';
import ConsultationModal from './ConsultationModal';

interface AssetClass {
  id: string;
  category: string;
  title: string;
  budgetRange: string;
  timeline: string;
  image: string;
  summary: string;
  ctaText: string;
  features: string[];
}

const ASSET_CLASSES: AssetClass[] = [
  {
    id: 'villa',
    category: 'LANDMARK RESIDENCES',
    title: 'Turnkey Luxury Villa',
    budgetRange: '₹3.25 Cr – ₹6.50 Cr',
    timeline: 'Discuss possession timing',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80',
    summary: 'Bespoke turnkey residential estates in gated and prime sector avenues. Designed with master-planned structural standards and uncompromising build quality.',
    ctaText: 'REQUEST CONSTRUCTION FEASIBILITY',
    features: [
      'Discuss registration requirements and title clearance',
      'Italian Statuario / Botticino marble flooring & private elevator',
      'Independent terrace garden & multi-car covered garage bays',
      'Confirm financing arrangements and timelines with your lender'
    ]
  },
  {
    id: 'floor',
    category: 'BOUTIQUE LIVING',
    title: 'Independent Luxury Floor',
    budgetRange: '₹1.15 Cr – ₹1.85 Cr',
    timeline: 'Discuss possession timing',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&auto=format&fit=crop&q=80',
    summary: 'Spacious single-floor private residences offering villa-scale proportions without multi-floor maintenance. Features dedicated stilt parking and secure private elevator access.',
    ctaText: 'REQUEST DEVELOPMENT FEASIBILITY',
    features: [
      'Private 6-passenger automatic card-access elevator',
      '2 Designated covered car parking bays per floor',
      'Acoustic UPVC double-glazed soundproof windows',
      'Confirm financing arrangements and timelines with your lender'
    ]
  },
  {
    id: 'plot',
    category: 'FREEHOLD ASSETS',
    title: 'JDA Approved Freehold Plot',
    budgetRange: '₹85 Lakh – ₹2.50 Cr',
    timeline: 'Discuss registration requirements',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&auto=format&fit=crop&q=80',
    summary: 'Demarcated residential land in planned, low-density colonies across Jagatpura and Kusum Vihar. All plots possess Section 90-A Patta with wide paved sector roads and water connections.',
    ctaText: 'REQUEST JDA DEVELOPMENT',
    features: [
      'Direct Section 90-A Patta from Jaipur Development Authority',
      '40 ft to 80 ft blacktop paved sector avenue frontage',
      'Underground PHED sweet water & electrical infrastructure',
      'Discuss registration requirements and boundary possession'
    ]
  }
];

export default function Investment() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('Turnkey Luxury Villa');

  const handleOpenConsult = (assetTitle: string) => {
    setSelectedService(assetTitle);
    setIsConsultOpen(true);
  };

  return (
    <section id="properties" className="px-6 md:px-12 pt-24 md:pt-32 pb-0 w-full max-w-[1600px] mx-auto bg-white">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Asset Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Three pathways to <span className="text-[#B5623A]">prime ownership.</span>
          </h2>
        </div>
        <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
          Whether acquiring a ready bespoke villa, an independent boutique floor, or banking a prime JDA freehold plot in South Jaipur.
        </p>
      </div>

      {/* 3-Column Card Layout matching the original clean design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ASSET_CLASSES.map((asset) => (
          <div 
            key={asset.id} 
            className="border border-black/10 bg-white flex flex-col justify-between rounded-2xl"
          >
            <div>
              {/* Image with Tag Overlay */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 rounded-t-2xl">
                <img 
                  src={asset.image} 
                  alt={asset.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    {asset.category}
                  </span>
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    {asset.timeline}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-7 sm:p-8">
                <h3 className="text-2xl font-light text-[#141414] tracking-tight mb-2">
                  {asset.title}
                </h3>

                <div className="text-[12px] font-mono text-[#555] mb-4">
                  <span>{asset.budgetRange}</span>
                  <span className="mx-2">•</span>
                  <span>{asset.timeline}</span>
                </div>

                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-6">
                  {asset.summary}
                </p>

                {/* Features Divider & List */}
                <div className="border-t border-black/10 pt-6 space-y-3">
                  {asset.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[12px] text-[#444]">
                      <Check size={14} className="text-[#B5623A] mt-0.5 shrink-0" />
                      <span className="font-light leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-7 sm:p-8 pt-0 space-y-2.5">
              <Link
                to={asset.id === 'villa' ? '/villas' : asset.id === 'floor' ? '/independent-floors' : '/plots'}
                className="w-full bg-[#141414] hover:bg-black text-white py-3.5 px-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
              >
                <span>Explore {asset.id === 'villa' ? 'Villas' : asset.id === 'floor' ? 'Independent Floors' : 'Residential Plots'}</span>
                <ArrowUpRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => handleOpenConsult(asset.title)}
                className="w-full border border-black/15 hover:border-black text-[#141414] py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
              >
                <span>Request Feasibility</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService={`Acquisition Feasibility: ${selectedService}`}
      />
    </section>
  );
}
