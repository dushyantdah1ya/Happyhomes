import { Link } from 'react-router';
import { ArrowUpRight, Check, Compass, Layers, MapPin } from 'lucide-react';

interface DevelopmentTypeCard {
  id: string;
  category: string;
  title: string;
  href: string;
  image: string;
  summary: string;
  ctaText: string;
  points: string[];
}

const DEVELOPMENT_TYPES: DevelopmentTypeCard[] = [
  {
    id: 'villa',
    category: 'STANDALONE RESIDENCES',
    title: 'Turnkey Luxury Villas',
    href: '/villas',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&auto=format&fit=crop&q=80',
    summary:
      'Detached private residences offering multi-level layouts, dedicated parking bays, private terraces, and structural planning tailored for standalone living in prime Jaipur corridors.',
    ctaText: 'Explore Villas',
    points: [
      'G+1 and G+2 multi-level layouts with independent structural columns',
      'Dedicated multi-car parking bays and private terrace areas',
      'Direct on-site supervision and documented material specifications',
      'Clear title documentation and registered deed execution',
    ],
  },
  {
    id: 'floor',
    category: 'LOW-RISE LIVING',
    title: 'Independent Boutique Floors',
    href: '/independent-floors',
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1400&auto=format&fit=crop&q=80',
    summary:
      'Spacious single-floor private residences offering generous floor plans with stilt parking, elevator access, and low-density community privacy.',
    ctaText: 'Explore Independent Floors',
    points: [
      'Entire-floor private residences with dedicated stilt parking bays',
      'Passenger elevator access directly from parking to apartment levels',
      'Acoustic fenestration and well-ventilated dual-aspect layouts',
      'Individual title deed allocation for each residential floor',
    ],
  },
  {
    id: 'plot',
    category: 'RESIDENTIAL LAND',
    title: 'Residential Plots',
    href: '/plots',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&auto=format&fit=crop&q=80',
    summary:
      'Demarcated residential plots within established and emerging sectors across South-East Jaipur, positioned on wide sector roads ready for bespoke construction.',
    ctaText: 'Explore Residential Plots',
    points: [
      'Demarcated boundary pegs with established sector road frontages',
      'Planned residential sectors with access to municipal water and power lines',
      'Suitable for immediate bespoke villa planning or land bank preservation',
      'Direct developer conveyancing and boundary verification',
    ],
  },
];

export default function DevelopmentTypes() {
  return (
    <section
      id="properties"
      className="px-6 md:px-12 pt-20 md:pt-28 pb-20 md:pb-28 w-full max-w-[1600px] mx-auto bg-[#FAFAFA] border-t border-b border-black/5"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Residential Categories
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Three pathways to <span className="text-[#B5623A]">ownership.</span>
          </h2>
        </div>
        <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
          Whether seeking a ready turnkey villa, an independent boutique floor, or demarcated residential land in planned Jaipur sectors.
        </p>
      </div>

      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {DEVELOPMENT_TYPES.map((type) => (
          <div
            key={type.id}
            className="flex flex-col justify-between bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-black/30 hover:shadow-lg transition-all duration-300 group"
          >
            <div>
              {/* Image Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={type.image}
                  alt={type.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/95 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-[#141414] border border-black/10 rounded-md">
                    {type.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-black/60 backdrop-blur-xs text-white/80 text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded">
                    Illustrative Concept
                  </span>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-light text-[#141414] tracking-tight mb-3">
                  {type.title}
                </h3>
                <p className="text-[13px] text-[#555] font-light leading-relaxed mb-6">
                  {type.summary}
                </p>

                {/* Key Points */}
                <div className="space-y-2.5 pt-4 border-t border-black/5">
                  {type.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[12px] text-[#444] font-light">
                      <Check size={14} className="text-[#B5623A] mt-0.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Footer */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                to={type.href}
                className="w-full inline-flex items-center justify-center gap-2 border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
              >
                <span>{type.ctaText}</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
