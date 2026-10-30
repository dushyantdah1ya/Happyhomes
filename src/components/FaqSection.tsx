import { useState } from 'react';
import { ChevronDown, ArrowUpRight, HelpCircle, ShieldCheck, Phone, MessageSquare, FileCheck } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

interface FaqItem {
  id: string;
  category: 'title' | 'brokerage' | 'nri' | 'conveyancing';
  question: string;
  answer: string;
  keyPoint: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'jda-patta',
    category: 'title',
    question: 'What is a JDA Section 90-A Patta, and why is it mandatory for our developments?',
    answer: 'Under the Rajasthan Land Revenue Act, Section 90-A is the mandatory statutory procedure through which agricultural land is legally surrendered to the state and converted into non-agricultural residential freehold tenure. Many developers in Jaipur push rapid projects that carry demolition notices or lack municipal Bisalpur sweet water lines. Happy Homes exclusively builds on land backed by clean JDA Section 90-A Pattas and certified 30-year sub-registrar title searches.',
    keyPoint: 'Guaranteed freehold ownership with direct municipal Registry and Mutation rights.'
  },
  {
    id: 'brokerage-model',
    category: 'brokerage',
    question: 'How does Happy Homes differ from standard property dealers and builders?',
    answer: 'Traditional developers often compromise on structural integrity, prioritize speed over quality, or push projects regardless of legal disputes. Happy Homes operates as a disciplined construction firm. We conduct exhaustive engineering and title due diligence before acquiring land, reject sites that don’t meet our strict structural standards, and oversee all construction phases directly to ensure premium delivery.',
    keyPoint: 'Disciplined construction, zero structural compromise, and full title forensic audits.'
  },
  {
    id: 'nri-monitoring',
    category: 'nri',
    question: 'How do NRIs and outstation clients manage construction projects remotely?',
    answer: 'Over 40% of our luxury clients reside in Dubai, North America, the UK, Singapore, or Mumbai. Our dedicated construction management desk coordinates high-definition 4K video walk-throughs, drone perimeter surveys, material quality reporting, Power of Attorney (PoA) legal validation, and FEMA/NRE compliance. We manage the construction progress and execute the final registry on your behalf with complete legal transparency.',
    keyPoint: 'Seamless remote construction oversight with verified video walk-throughs and milestone reporting.'
  },
  {
    id: 'stamp-duty-fees',
    category: 'conveyancing',
    question: 'What are the current stamp duty and registration expenses in Rajasthan?',
    answer: 'Residential property conveyancing in Rajasthan involves approximately 6%–6.5% stamp duty plus a 1% municipal registration fee (with statutory concessions available when registering in a woman family member’s name). Our legal desk prepares the exact e-stamp challans and handles complete Rajasthan Revenue Department documentation to ensure your handover process has zero hidden surprises.',
    keyPoint: 'Clear government e-stamping and registry execution for your completed home.'
  },
  {
    id: 'brokerage-transparency',
    category: 'brokerage',
    question: 'What are your consultancy fees, and when are they payable?',
    answer: 'We believe in absolute transparency. Our construction and project fees are standardized, transparent, and agreed upon in writing prior to project initiation. Fees are payable based on completed development milestones and strictly tied to the successful registration and handover of your property.',
    keyPoint: 'Transparent, milestone-based fees tied strictly to completed project delivery.'
  },
  {
    id: 'home-loan-clearance',
    category: 'title',
    question: 'Are Happy Homes projects pre-approved for bank mortgages?',
    answer: 'Yes. Because our land inventory undergoes our mandatory 4-point legal title and engineering audit (including 30-year sub-registrar non-encumbrance verification), every project is pre-approved for construction and home loans with tier-1 lenders including State Bank of India (SBI), HDFC Bank, ICICI Bank, and PNB for up to 80% LTV financing.',
    keyPoint: 'Tier-1 institutional banking clearance with expedited construction loan sanction.'
  }
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS[0].id);
  const [isConsultOpen, setIsConsultOpen] = useState(false);

  const filteredFaqs = activeCategory === 'all' 
    ? FAQS 
    : FAQS.filter(f => f.category === activeCategory);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section id="faq" className="px-6 md:px-12 pt-24 md:pt-32 pb-0 w-full max-w-[1600px] mx-auto bg-white">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#737373] block mb-3">
            Legal & Brokerage Advisory FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Uncompromising answers on <span className="text-[#B5623A]">title & conveyancing.</span>
          </h2>
        </div>
        <p className="text-[#666] text-[14px] leading-relaxed max-w-md font-light">
          Everything you need to know about navigating Jaipur's land title laws, sub-registrar registry protocols, and private client brokerage representation.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex overflow-x-auto lg:flex-wrap gap-2 mb-12 border-b border-black/10 pb-6 no-scrollbar">
        {[
          { id: 'all', label: 'All Advisory Topics' },
          { id: 'title', label: 'Title & JDA 90-A Laws' },
          { id: 'brokerage', label: 'Brokerage & Valuation' },
          { id: 'nri', label: 'NRI & Remote Desk' },
          { id: 'conveyancing', label: 'Conveyancing & Taxes' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-6 py-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap rounded-full ${
              activeCategory === tab.id
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'bg-[#F8F8F8] text-[#666] border-black/10 hover:border-black/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Accordions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div 
                key={faq.id}
                className={`border transition-all duration-200 rounded-2xl overflow-hidden ${
                  isOpen ? 'border-[#141414] bg-[#F8F8F8]' : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-6 cursor-pointer"
                >
                  <span className="text-[16px] sm:text-[17px] font-medium text-[#141414] leading-snug">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#141414] text-white border-[#141414]' : 'bg-white text-[#141414]'
                  }`}>
                    <ChevronDown size={15} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-7 sm:px-7 sm:pb-8 pt-0 text-[#555] border-t border-black/5 mt-1">
                    <p className="text-[14px] font-light leading-relaxed mb-4 pt-4">
                      {faq.answer}
                    </p>
                    <div className="flex items-start gap-2 bg-white p-3.5 border border-black/10 text-[12px] font-mono text-[#141414] rounded-lg">
                      <ShieldCheck size={15} className="text-[#B5623A] mt-0.5 shrink-0" />
                      <span><strong>Key Standard:</strong> {faq.keyPoint}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Callout (4 cols) */}
        <div className="lg:col-span-4 bg-[#F8F8F8] border border-black/10 text-[#141414] p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#666] block">
              HAVE A SPECIFIC PROPERTY QUESTION?
            </span>
            <h3 className="text-2xl font-light text-[#141414] tracking-tight">
              Speak directly with our senior property advocates.
            </h3>
            <p className="text-[13px] text-[#555] font-light leading-relaxed pt-2">
              Whether conducting a title audit on a prospective plot in Jagatpura or requiring off-market inventory access, our partners are available for discreet consultations.
            </p>
          </div>

          <div className="pt-6 border-t border-black/10 space-y-3">
            <a
              href="https://wa.me/919166054964?text=Hello%20Happy%20Homes%2C%20I%20have%20an%20inquiry%20regarding%20Jaipur%20property%20titles%20and%20due%20diligence."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#141414] hover:bg-black text-white py-3.5 px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-full"
            >
              <MessageSquare size={13} />
              <span>WhatsApp Directly</span>
            </a>

            <button
              type="button"
              onClick={() => setIsConsultOpen(true)}
              className="w-full border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] py-3.5 px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-full"
            >
              <span>Schedule Private Consultation</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="General Title & Property Advisory"
      />
    </section>
  );
}
