import { useState } from 'react';
import { ArrowUpRight, MessageSquare, Info } from 'lucide-react';
import { Link } from 'react-router';
import { useSettings } from '../hooks/useSettings';

interface CorridorRate {
  id: string;
  name: string;
  shortName: string;
  plotRatePerSqYd: number;
  villaRatePerSqFt: number;
  floorRatePerSqFt: number;
  zone: string;
}

const CORRIDORS: CorridorRate[] = [
  { id: 'jagatpura', name: 'Jagatpura & Mahal Road', shortName: 'Jagatpura', plotRatePerSqYd: 68000, villaRatePerSqFt: 6200, floorRatePerSqFt: 5400, zone: 'South-East Jaipur' },
  { id: 'kusum', name: 'Kusum Vihar', shortName: 'Kusum Vihar', plotRatePerSqYd: 76000, villaRatePerSqFt: 6800, floorRatePerSqFt: 5800, zone: 'South-East Enclave' },
  { id: 'vidhyadhar', name: 'Vidhyadhar Nagar', shortName: 'Vidhyadhar Nagar', plotRatePerSqYd: 88000, villaRatePerSqFt: 7500, floorRatePerSqFt: 6400, zone: 'North Jaipur' },
  { id: 'ringroad', name: 'Ring Road Corridor', shortName: 'Ring Road Axis', plotRatePerSqYd: 48000, villaRatePerSqFt: 5200, floorRatePerSqFt: 4600, zone: 'Emerging Sector' }
];

const ASSET_TYPES = [
  { id: 'plot', name: 'Residential Plot', desc: 'Demarcated residential land' },
  { id: 'villa', name: 'Turnkey Luxury Villa', desc: 'Standalone multi-level residence' },
  { id: 'floor', name: 'Independent Floor', desc: 'Single-floor residence with stilt parking' }
];

const PLOT_SCALES = [
  { sqYd: 200, label: '200 Sq.yd', dim: '30 × 60 ft', builtUpVilla: 3600, builtUpFloor: 2100 },
  { sqYd: 288, label: '288 Sq.yd', dim: '40 × 65 ft', builtUpVilla: 5400, builtUpFloor: 3000 },
  { sqYd: 400, label: '400 Sq.yd', dim: '45 × 80 ft', builtUpVilla: 7800, builtUpFloor: 4200 },
  { sqYd: 500, label: '500+ Sq.yd', dim: '50 × 90 ft', builtUpVilla: 9800, builtUpFloor: 5400 }
];

export default function CostEstimator() {
  const { settings } = useSettings();
  const [corridorIndex, setCorridorIndex] = useState(0);
  const [assetTypeIndex, setAssetTypeIndex] = useState(1);
  const [scaleIndex, setScaleIndex] = useState(1);

  const corridor = CORRIDORS[corridorIndex];
  const assetType = ASSET_TYPES[assetTypeIndex];
  const scale = PLOT_SCALES[scaleIndex];

  // Financial calculations
  let baseAssetValue = 0;
  let areaLabel = '';

  if (assetType.id === 'plot') {
    baseAssetValue = scale.sqYd * corridor.plotRatePerSqYd;
    areaLabel = `${scale.sqYd} Sq.yd (${scale.dim})`;
  } else if (assetType.id === 'villa') {
    baseAssetValue = scale.builtUpVilla * corridor.villaRatePerSqFt;
    areaLabel = `${scale.builtUpVilla.toLocaleString()} sq.ft covered on ${scale.sqYd} sq.yd`;
  } else {
    baseAssetValue = scale.builtUpFloor * corridor.floorRatePerSqFt;
    areaLabel = `${scale.builtUpFloor.toLocaleString()} sq.ft single-floor residence`;
  }

  // Stamp duty in Rajasthan ~6.5% indicative estimation
  const stampDutyAndRegistry = Math.round(baseAssetValue * 0.065);
  const totalOutlay = baseAssetValue + stampDutyAndRegistry;
  const maxBankFinancing = Math.round(baseAssetValue * 0.80);
  const requiredEquity = totalOutlay - maxBankFinancing;

  const formatCr = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;

  const whatsappMessage = encodeURIComponent(
    `Hello Happy Homes, I am planning a project with your illustrative budget estimator:\n\n` +
    `• Location: ${corridor.name}\n` +
    `• Category: ${assetType.name}\n` +
    `• Scale: ${scale.label} (${scale.dim})\n` +
    `• Indicative Outlay: ${formatCr(totalOutlay)}\n\n` +
    `Could you share current developments or construction opportunities in this segment?`
  );

  const cleanWhatsapp = settings.whatsapp.replace(/\D/g, '') || '919166054964';

  return (
    <section id="estimator" className="px-6 md:px-12 py-20 md:py-28 w-full max-w-[1600px] mx-auto bg-[#F8F8F8]">
      {/* Anchor alias */}
      <div id="calculator" className="sr-only" aria-hidden="true" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-16">
        <div className="max-w-xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#666] block mb-3">
            Budget Planning
          </span>
          <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Illustrative <span className="text-[#B5623A]">Cost Estimator.</span>
          </h2>
        </div>
        <p className="text-[#555] text-[14px] leading-relaxed max-w-md font-light">
          Calibrate indicative project budgets across key Jaipur corridors for preliminary planning purposes.
        </p>
      </div>

      {/* Calculator Container */}
      <div className="bg-white border border-black/10 rounded-[2rem] p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Corridor */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] block mb-3">
                01. Select Jaipur Sector
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CORRIDORS.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCorridorIndex(idx)}
                    className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                      corridorIndex === idx
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-[#F8F8F8] text-[#141414] border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-[13px] font-medium block leading-snug">{c.shortName}</span>
                    <span className={`text-[10px] font-mono block mt-1 ${corridorIndex === idx ? 'text-white/70' : 'text-[#737373]'}`}>
                      {c.zone}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Category */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] block mb-3">
                02. Select Development Category
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ASSET_TYPES.map((a, idx) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAssetTypeIndex(idx)}
                    className={`p-4 text-left border rounded-xl transition-all cursor-pointer ${
                      assetTypeIndex === idx
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-[#F8F8F8] text-[#141414] border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-[14px] font-medium block">{a.name}</span>
                    <span className={`text-[11px] font-light block mt-1 ${assetTypeIndex === idx ? 'text-white/70' : 'text-[#666]'}`}>
                      {a.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Scale */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] block mb-3">
                03. Plot & Area Footprint
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PLOT_SCALES.map((s, idx) => (
                  <button
                    key={s.sqYd}
                    type="button"
                    onClick={() => setScaleIndex(idx)}
                    className={`p-3 text-center border rounded-xl transition-all cursor-pointer ${
                      scaleIndex === idx
                        ? 'bg-[#141414] text-white border-[#141414]'
                        : 'bg-[#F8F8F8] text-[#141414] border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-[14px] font-mono block">{s.label}</span>
                    <span className={`text-[10px] font-mono block mt-0.5 ${scaleIndex === idx ? 'text-white/70' : 'text-[#666]'}`}>
                      {s.dim}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Output (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-black/10 pt-8 lg:pt-0 lg:pl-10">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] block mb-1">
                  Indicative Property Estimate
                </span>
                <div className="text-3xl sm:text-5xl font-light font-mono text-[#141414] tracking-tight">
                  {formatCr(baseAssetValue)}
                </div>
                <p className="text-[12px] text-[#666] font-light mt-1">
                  {areaLabel} in {corridor.shortName}.
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 pt-5 border-t border-black/10 text-[13px]">
                <div className="flex justify-between items-baseline text-[#555]">
                  <span>Est. Stamp Duty & Registry (~6.5%):</span>
                  <span className="font-mono text-[#141414]">{formatCr(stampDutyAndRegistry)}</span>
                </div>
                <div className="flex justify-between items-baseline text-[#555]">
                  <span>Total Indicative Outlay:</span>
                  <span className="font-mono text-[#141414] font-medium">{formatCr(totalOutlay)}</span>
                </div>
                <div className="flex justify-between items-baseline text-[#555]">
                  <span>Typical Bank Financing (80% LTV):</span>
                  <span className="font-mono text-[#B5623A]">{formatCr(maxBankFinancing)}</span>
                </div>
                <div className="flex justify-between items-baseline text-[#555]">
                  <span>Estimated Equity / Margin:</span>
                  <span className="font-mono text-[#141414]">{formatCr(requiredEquity)}</span>
                </div>
              </div>

              {/* Disclaimer callout */}
              <div className="p-3.5 bg-[#F9F9F9] rounded-xl border border-black/5 flex items-start gap-2.5 text-[11px] text-[#737373] leading-relaxed">
                <Info size={14} className="text-[#888] shrink-0 mt-0.5" />
                <span>
                  <strong>Indicative Guide:</strong> Calculations are representative approximations for budget planning. Formal pricing, government duties, and structural specifications are finalized per project upon site inspection.
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-8 space-y-2.5">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#141414] hover:bg-black text-white py-3 px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 rounded-full"
              >
                <MessageSquare size={13} />
                <span>Enquire on WhatsApp</span>
              </a>

              <Link
                to="/contact?intent=visit#enquiry"
                className="w-full border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] py-3 px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 rounded-full"
              >
                <span>Plan a Site Visit</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
