import { useState } from 'react';
import { Link } from 'react-router';
import { 
  ChevronDown, 
  HelpCircle, 
  ArrowRight, 
  ArrowUpRight, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Search
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import ConsultationModal from '../components/ConsultationModal';
import { FAQS_DATA, type FaqItem } from '../data/faqsData';
import { useSettings } from '../hooks/useSettings';

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'browsing', label: 'Browsing & Inventory' },
  { id: 'viewings', label: 'Visits & Video Viewings' },
  { id: 'information', label: 'Property Information' },
  { id: 'planning', label: 'Purchase Planning' },
] as const;

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('property-types');
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const { settings } = useSettings();

  const filteredFaqs = activeCategory === 'all'
    ? FAQS_DATA
    : FAQS_DATA.filter((faq) => faq.category === activeCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <PublicLayout>
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 md:px-16 pt-8 pb-24 md:pb-32">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">
                Home
              </Link>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li>
              <span className="text-[#737373]">Buyer Guide</span>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">
              Frequently Asked Questions
            </li>
          </ol>
        </nav>

        {/* Page Hero Header */}
        <div className="mb-14 md:mb-18 max-w-4xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-4">
            Client Advisory &amp; Clarifications • Jaipur
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414] mb-6">
            Frequently asked<br />
            <span className="text-[#B5623A]">questions.</span>
          </h1>
          <p className="text-[#555] text-base sm:text-lg leading-relaxed font-light max-w-3xl">
            Clear, plain-language answers covering how to browse published inventory, request on-site or 
            video viewings, access project drawings, and structure your purchase planning with Happy Homes in Jaipur.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mb-12 border-b border-black/10 pb-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-[12px] font-mono tracking-wider uppercase transition-all duration-200 shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B5623A] focus:outline-none ${
                  isSelected
                    ? 'bg-[#141414] text-white shadow-sm'
                    : 'bg-white border border-black/10 text-[#666] hover:text-[#141414] hover:border-black/30'
                }`}
                aria-pressed={isSelected}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Accordion / Accessible Disclosures Container */}
        <div className="space-y-4 mb-20 md:mb-28 max-w-5xl">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            const buttonId = `faq-btn-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="bg-white border border-black/10 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 sm:px-8 py-6 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-black/[0.01] transition-colors focus-visible:ring-2 focus-visible:ring-[#B5623A] focus:outline-none"
                  >
                    <div className="space-y-1 pr-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#888] block">
                        {faq.categoryLabel}
                      </span>
                      <span className="text-base sm:text-lg font-light text-[#141414] leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center shrink-0 mt-1 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-black/5 text-[#B5623A]' : 'text-[#737373]'
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>
                </h3>

                {/* Content Panel (Accessible & Server-Rendered) */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`px-6 sm:px-8 pb-6 pt-2 border-t border-black/5 text-[14px] text-[#555] font-light leading-relaxed ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Cross-Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Full Walkthrough
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Buying a home with Happy Homes
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Explore the six practical stages from defining property criteria to independent legal review 
                and final key handover.
              </p>
            </div>
            <Link
              to="/buying-process"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Explore Purchase Sequence</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-8 sm:p-10 bg-white border border-black/10 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-3">
                Remote Coordination
              </span>
              <h3 className="text-xl sm:text-2xl font-light text-[#141414] mb-3">
                Planning your purchase from outside Jaipur
              </h3>
              <p className="text-[13px] text-[#666] font-light leading-relaxed mb-6">
                Guidelines for NRI and outstation clients coordinating video viewings, plan inspections, 
                and local verification.
              </p>
            </div>
            <Link
              to="/nri-buyers"
              className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#B5623A] hover:underline"
            >
              <span>Read Remote &amp; NRI Guide</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Closing Action Banner */}
        <div className="p-8 sm:p-12 md:p-16 bg-[#141414] text-white rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 block mb-3">
              Direct Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-4">
              Have a question not addressed here?
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed">
              Connect directly with our desk to ask about specific property configurations, request site coordinates, 
              or plan an in-person or video walkthrough.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
            <Link
              to="/contact#enquiry"
              className="px-8 py-4 rounded-full bg-[#B5623A] text-white text-[12px] font-mono uppercase tracking-widest hover:bg-[#A3522C] transition-colors text-center font-medium"
            >
              Contact the Team
            </Link>
            <Link
              to="/contact?intent=visit#enquiry"
              className="px-8 py-4 rounded-full border border-white/20 text-white text-[12px] font-mono uppercase tracking-widest hover:bg-white/10 transition-colors text-center font-medium"
            >
              Plan a Visit
            </Link>
          </div>
        </div>

        {/* Contact Reference */}
        <div className="mt-8 text-center text-[12px] font-mono text-[#737373]">
          Contact: <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="underline hover:text-[#141414]">{settings.phone}</a> • <a href={`mailto:${settings.email}`} className="underline hover:text-[#141414]">{settings.email}</a> • {settings.address}
        </div>
      </div>

      <ConsultationModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="General Property Inquiry"
      />
    </PublicLayout>
  );
}
