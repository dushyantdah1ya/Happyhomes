import { MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

interface LocalityItem {
  id: string;
  name: string;
  zone: string;
  description: string;
  connectivity: string[];
  filterUrl: string;
}

const LOCALITIES: LocalityItem[] = [
  {
    id: 'jagatpura',
    name: 'Jagatpura & Mahal Road',
    zone: 'South-East Jaipur Sector',
    description:
      'A rapidly expanding residential and institutional corridor in South-East Jaipur characterized by 60ft to 120ft arterial roads, established medical facilities, and active residential developments.',
    connectivity: [
      'Connected via Mahal Road and Ring Road arterial links',
      'Proximity to Jagatpura Railway Station & airport bypass',
      'Access to established healthcare and academic campuses',
    ],
    filterUrl: '/developments?locality=Jagatpura',
  },
  {
    id: 'kusum-vihar',
    name: 'Kusum Vihar',
    zone: 'South-East Residential Colony',
    description:
      'An established low-density residential enclave situated off Mahal Road, known for quiet residential lanes, standalone family villas, and neighborhood parks.',
    connectivity: [
      'Direct access to Mahal Road sector avenue',
      'Predominantly low-rise residential zoning',
      'Close to local markets, schools, and green spaces',
    ],
    filterUrl: '/developments?locality=Kusum+Vihar',
  },
  {
    id: 'vidhyadhar-nagar',
    name: 'Vidhyadhar Nagar',
    zone: 'North Jaipur Planned Sector',
    description:
      'A master-planned residential sector in North Jaipur laid out in a grid pattern with wide boulevards, central sector greens, and comprehensive civic infrastructure.',
    connectivity: [
      'Wide planned sector avenues with underground utilities',
      'Central Spine commercial and healthcare amenities nearby',
      'Direct road connections to Sikar Road and Jaipur city bypass',
    ],
    filterUrl: '/developments?locality=Vidhyadhar+Nagar',
  },
];

export default function LocalityGuide() {
  return (
    <section
      id="corridors"
      className="px-6 md:px-12 py-20 md:py-28 w-full max-w-[1600px] mx-auto bg-[#FBFBFB] border-t border-black/5"
    >
      {/* Anchor alias */}
      <div id="localities" className="sr-only" aria-hidden="true" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-16">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Jaipur Sectors
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Key residential <span className="text-[#B5623A]">locations.</span>
          </h2>
        </div>
        <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
          Substantiated sector introductions covering our active development corridors across South-East and North Jaipur.
        </p>
      </div>

      {/* 3-Column Locality Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LOCALITIES.map((loc) => (
          <div
            key={loc.id}
            className="flex flex-col justify-between p-8 bg-white border border-black/10 rounded-2xl hover:border-black/30 transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-2 text-[#B5623A] mb-3">
                <MapPin size={16} />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
                  {loc.zone}
                </span>
              </div>

              <h3 className="text-2xl font-light text-[#141414] tracking-tight mb-4">
                {loc.name}
              </h3>

              <p className="text-[13px] text-[#555] font-light leading-relaxed mb-6">
                {loc.description}
              </p>

              <div className="space-y-2 pt-4 border-t border-black/5 text-[12px] text-[#666] font-light">
                {loc.connectivity.map((conn, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#B5623A] font-mono text-[10px] mt-0.5">•</span>
                    <span>{conn}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                to={loc.filterUrl}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#141414] hover:text-[#B5623A] transition-colors font-medium"
              >
                <span>View Developments in {loc.name.split('&')[0].trim()}</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
