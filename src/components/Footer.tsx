import { useState } from 'react';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { Link } from 'react-router';
import ConsultationModal from './ConsultationModal';
import Logo from './Logo';
import { useSettings } from '../hooks/useSettings';
import { NAVIGATION_REGISTRY } from '../config/navigation';

export default function Footer() {
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappNumber = settings.whatsapp.replace(/\D/g, '');

  return (
    <footer className="w-full bg-[#121212] text-white selection:bg-white selection:text-black">
      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 md:px-16 py-20 md:py-24">
        
        {/* Quiet Editorial Statement & Discrete Inquiry Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-white/10">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40 block mb-3">
              Direct Developers • Jaipur
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extralight tracking-[-0.02em] leading-snug text-white/95">
              Developing prime JDA freehold properties and luxury residences across Jaipur with <span className="text-[#B5623A]">forensic construction discipline.</span>
            </h2>
          </div>

          <div>
            <button
              onClick={() => setIsConsultOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-[#B5623A] hover:text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer rounded-full"
            >
              <span>Schedule Builder Consultation</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {/* Quiet Studio Navigation Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pt-16 pb-20">
          
          {/* Identity & Studio Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo 
                variant="light" 
                size="md" 
                subtitle="ESTATE ADVISORY • JAIPUR"
                onClick={scrollToTop}
              />
            </div>

            <p className="text-[13px] text-white/50 leading-relaxed max-w-sm font-light">
              {settings.address}
            </p>

            <p className="text-[11px] font-mono text-white/30 tracking-wider">
              Jaipur, Rajasthan
            </p>
          </div>

          {/* Direct Private Line & Hours */}
          <div className="space-y-3 text-[13px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
              Contact
            </span>

            <div>
              <a 
                href={`tel:${settings.phone.replace(/\s/g, '')}`} 
                className="text-white/80 hover:text-white transition-colors font-mono tracking-tight"
              >
                {settings.phone}
              </a>
            </div>

            <div>
              <a 
                href={`mailto:${settings.email}`} 
                className="text-white/50 hover:text-white transition-colors"
              >
                {settings.email}
              </a>
            </div>

            <p className="text-[12px] text-white/40 pt-1 font-light">
              {settings.officeHours}
            </p>
          </div>

          {/* Happy Homes Links */}
          <div className="space-y-3 text-[13px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
              Happy Homes
            </span>

            <ul className="space-y-2 text-white/60 font-light">
              {NAVIGATION_REGISTRY.aboutUs.items.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={NAVIGATION_REGISTRY.ourApproach.href} className="hover:text-white transition-colors">
                  {NAVIGATION_REGISTRY.ourApproach.label}
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations Links */}
          <div className="space-y-3 text-[13px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
              Locations
            </span>

            <ul className="space-y-2 text-white/60 font-light">
              {NAVIGATION_REGISTRY.locations.items.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Buyer Guide Links */}
          <div className="space-y-3 text-[13px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
              Buyer Guide
            </span>

            <ul className="space-y-2 text-white/60 font-light">
              {NAVIGATION_REGISTRY.buyerGuide.items.slice(0, 2).map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={NAVIGATION_REGISTRY.visitChecklist.href} className="hover:text-white transition-colors">
                  Homebuyer Visit Checklist
                </Link>
              </li>
              {NAVIGATION_REGISTRY.buyerGuide.items.slice(2).map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curated Portfolio Links */}
          <div className="space-y-3 text-[13px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 block mb-4">
              Developments
            </span>

            <ul className="space-y-2 text-white/60 font-light">
              {NAVIGATION_REGISTRY.developments.items.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1.5 border-t border-white/10">
                <Link to={NAVIGATION_REGISTRY.primaryCta.href} className="text-[#B5623A] hover:text-white transition-colors font-medium">
                  {NAVIGATION_REGISTRY.primaryCta.label}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Minimal Hairline Legal Sub-bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-white/40 font-light">
          <p>
            © {new Date().getFullYear()} Happy Homes. Architectural Builders & Direct Developers, Jaipur.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/10">•</span>
            <Link to="/website-terms" className="hover:text-white transition-colors">
              Website Terms
            </Link>
            <span className="text-white/10">•</span>
            {settings.whatsapp && (
              <>
                <a 
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Directly
                </a>
                <span className="text-white/10">•</span>
              </>
            )}
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp size={11} />
            </button>
          </div>
        </div>

      </div>

      <ConsultationModal 
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        defaultService="Private Inquiry"
      />
    </footer>
  );
}
