/**
 * Existing legacy development records pending owner validation.
 * Note: These initial records reflect the current baseline website content
 * and serve as the typed data foundation for future detail views and owner management.
 */

export interface Development {
  id: string;
  tag: string;
  title: string;
  price: string;
  location: string;
  sector: string;
  status: string;
  image: string;
  stats: {
    area: string;
    floors: string;
    beds: string;
    baths: string;
  };
  blueprint: {
    dimension: string;
    facing: string;
    roadWidth: string;
    sanction: string;
    highlights: string[];
  };
}

export type Property = Development;

export const developments: Development[] = [
  {
    id: 'villa-kusum',
    tag: 'FEATURED RESIDENCE',
    title: 'The Courtyard Villa',
    price: '₹3.65 Cr',
    location: 'Kusum Vihar, Jagatpura',
    sector: 'Zone 10, South Jaipur',
    status: 'Ready For Interior Fitout',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&auto=format&fit=crop&q=80',
    stats: { area: '4,200 sq ft', floors: '3 levels', beds: '5 suites', baths: '6 baths' },
    blueprint: {
      dimension: '40 ft x 65 ft (288 Sq.yd)',
      facing: 'North-East (Vastu Compliant)',
      roadWidth: '60 ft Paved Sector Avenue',
      sanction: 'JDA Map Sanctioned & Patta 90-A',
      highlights: [
        'Central double-height open-to-sky internal courtyard',
        'Statuario Italian marble across living and dining suites',
        'German double-glazed UPVC sound-insulated fenestration',
        '2 Covered SUV parking bays with dedicated EV charging'
      ]
    }
  },
  {
    id: 'floor-vidhyadhar',
    tag: 'INDEPENDENT FLOOR',
    title: 'The Glass Pavilion Floor',
    price: '₹1.45 Cr',
    location: 'Vidhyadhar Nagar Sector',
    sector: 'North Jaipur Belt',
    status: 'Immediate Handover',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&auto=format&fit=crop&q=80',
    stats: { area: '2,200 sq ft', floors: 'Single floor', beds: '3 suites', baths: '3 baths' },
    blueprint: {
      dimension: '30 ft x 60 ft (200 Sq.yd footprint)',
      facing: 'East Facing',
      roadWidth: '60 ft Wide Sector Road',
      sanction: 'RERA Registered & SBI Pre-Approved',
      highlights: [
        'Private 6-passenger automatic elevator with keycard access',
        'German Häfele soft-close modular kitchen with quartz counter',
        'Floor-to-ceiling soundproof acoustic double glazing',
        'Dedicated staff quarters and separate service entry'
      ]
    }
  },
  {
    id: 'estate-jagatpura',
    tag: 'SANCTUARY ESTATE',
    title: 'The Cantilever Estate',
    price: '₹5.20 Cr',
    location: 'Mahal Road Arterial, Jagatpura',
    sector: 'South-East Growth Belt',
    status: 'Final Finishing Phase',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&auto=format&fit=crop&q=80',
    stats: { area: '6,500 sq ft', floors: '3 levels + pool', beds: '6 suites', baths: '7 baths' },
    blueprint: {
      dimension: '50 ft x 80 ft (444 Sq.yd plot)',
      facing: 'North Facing',
      roadWidth: '80 ft Sector Corridor',
      sanction: '100% Freehold JDA Patta 90-A',
      highlights: [
        'Rooftop heated lap pool with panoramic sunset deck',
        'Full Tata Tiscon Fe-550D cantilever structural engineering',
        'Multi-zone VRV air-conditioning pre-ducted across all rooms',
        '3-car basement garage with high-clearance access'
      ]
    }
  }
];

export const properties = developments;
