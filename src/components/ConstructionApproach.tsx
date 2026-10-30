import { Shield, Layers, HardHat, CheckCircle2, Ruler, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router';

interface ApproachPillar {
  icon: typeof Shield;
  title: string;
  description: string;
}

const PILLARS: ApproachPillar[] = [
  {
    icon: HardHat,
    title: 'Direct Builder Oversight',
    description:
      'We manage our residential construction projects directly on-site in Jaipur, maintaining personal supervision across civil works, reinforced concrete framing, and final architectural finishes.',
  },
  {
    icon: CalendarCheck,
    title: 'Milestone-Based Progress',
    description:
      'Development progress is recorded across concrete stages—from foundation and structure completion to MEP rough-ins and finishing—allowing buyers to verify progress transparently.',
  },
  {
    icon: Ruler,
    title: 'Documented Specifications',
    description:
      'Each development includes clear specification schedules detailing flooring materials, sanitary fittings, structural column configurations, and joinery standards prior to commitment.',
  },
  {
    icon: CheckCircle2,
    title: 'On-Site Site Inspections',
    description:
      'Prospective buyers are welcome to schedule private site walkthroughs to inspect actual structural framing, room proportions, and sector connectivity before making decisions.',
  },
];

export default function ConstructionApproach() {
  return (
    <section
      id="about"
      className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1600px] mx-auto bg-white"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Narrative Headline */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block">
            Construction Approach
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.03em] leading-[1.1] text-[#141414]">
            Direct builder oversight at <span className="text-[#B5623A]">every stage.</span>
          </h2>
          <p className="text-[14px] text-[#555] font-light leading-relaxed">
            Happy Homes develops standalone residences and boutique low-rise communities in Jaipur with an emphasis on structural honesty. We operate as active builders—managing construction directly on site and maintaining open communication with our homeowners.
          </p>

          <div className="pt-4">
            <Link
              to="/contact?intent=visit#enquiry"
              className="inline-flex items-center justify-center gap-2 border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] rounded-full transition-all"
            >
              <span>Schedule a Site Walkthrough</span>
            </Link>
          </div>
        </div>

        {/* Right Column: 4 Pillar Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 bg-[#F9F9F9] border border-black/5 rounded-2xl hover:border-black/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center mb-5 text-[#B5623A]">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-medium text-[#141414] mb-2 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="text-[13px] text-[#666] font-light leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
