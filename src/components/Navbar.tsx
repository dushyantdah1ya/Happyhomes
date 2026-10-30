import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Menu, X, Phone, MessageSquare, ArrowUpRight, Calendar } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import Logo from './Logo';
import { useSettings } from '../hooks/useSettings';
import { NAVIGATION_REGISTRY } from '../config/navigation';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>('developments');
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const isHomePage = location.pathname === '/' || location.pathname === '';

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle outside click to close desktop disclosures
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | any) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle Escape key to close open menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (isHomePage) {
        const heroElement = document.getElementById('hero');
        const heroHeight = heroElement ? heroElement.offsetHeight : window.innerHeight;
        setIsScrolledPastHero(currentScrollY > heroHeight - 80);

        if (currentScrollY > lastScrollY && currentScrollY > 400) {
          setIsScrollingDown(true);
        } else {
          setIsScrollingDown(false);
        }
      } else {
        setIsScrolledPastHero(true);
        setIsScrollingDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isHomePage]);

  const handleLogoClick = () => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const toggleMobileGroup = (id: string) => {
    setMobileExpandedGroup((prev) => (prev === id ? null : id));
  };

  const whatsappNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '';

  const headerPillStyle = !isHomePage || isScrolledPastHero
    ? 'bg-white/95 backdrop-blur-xl border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
    : 'bg-white/80 backdrop-blur-lg border border-black/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]';

  const isDevelopmentsActive = [
    '/developments',
    '/villas',
    '/independent-floors',
    '/plots',
    '/completed-projects',
    '/completed',
  ].some((path) => location.pathname.startsWith(path));

  const isAboutUsActive = [
    '/about',
    '/construction-quality',
  ].some((path) => location.pathname.startsWith(path));

  const isLocationsActive = location.pathname.startsWith('/jaipur-localities');

  const isOurApproachActive = location.pathname.startsWith('/our-approach');
  const isVisitChecklistActive = location.pathname.startsWith('/visit-checklist');

  const isBuyerGuideActive = [
    '/contact',
    '/buying-process',
    '/nri-buyers',
    '/faqs',
    '/visit-checklist',
  ].some((path) => location.pathname.startsWith(path));

  return (
    <>
      {/* Floating Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 py-3.5 sm:py-5 ${
          isScrollingDown && isHomePage
            ? 'opacity-20 pointer-events-none scale-[0.98]'
            : 'opacity-100 pointer-events-auto scale-100'
        } hover:opacity-100 hover:pointer-events-auto hover:scale-100`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 max-w-[1700px] mx-auto transition-all duration-300">
          {/* Left: Brand Logo (Always links Home) */}
          <div className={`pointer-events-auto transition-all duration-500 px-6 py-2.5 rounded-full ${headerPillStyle}`}>
            <Logo variant="dark" size="md" withShadow={false} onClick={handleLogoClick} />
          </div>

          {/* Center: Desktop Grouped Navigation with Accessible Disclosures */}
          <nav
            ref={navRef}
            aria-label="Main Navigation"
            className={`hidden lg:flex items-center pointer-events-auto h-[48px] transition-all duration-500 px-6 rounded-full relative ${headerPillStyle}`}
          >
            <div className="flex items-center gap-6 h-full">
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === 'developments'}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('developments')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                    isDevelopmentsActive || openDropdown === 'developments'
                      ? 'text-[#B5623A]'
                      : 'text-[#1A1A1A] hover:text-[#B5623A]'
                  }`}
                >
                  <span>{NAVIGATION_REGISTRY.developments.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      openDropdown === 'developments' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Developments Dropdown Panel */}
                <AnimatePresence>
                  {openDropdown === 'developments' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl border border-black/10 shadow-2xl p-2.5 z-50 text-left"
                    >
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#888] px-3.5 py-1.5 border-b border-black/5">
                        Architectural Catalogue
                      </div>
                      <div className="py-1">
                        {NAVIGATION_REGISTRY.developments.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-[#F6F6F6] text-[#B5623A]'
                                  : 'hover:bg-[#F9F9F9] text-[#141414]'
                              }`}
                            >
                              <div className="text-[12px] font-medium tracking-tight">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-[#737373] font-light leading-snug pt-0.5 line-clamp-1">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 2: About Us Disclosure */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === 'aboutUs'}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('aboutUs')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                    isAboutUsActive || openDropdown === 'aboutUs'
                      ? 'text-[#B5623A]'
                      : 'text-[#1A1A1A] hover:text-[#B5623A]'
                  }`}
                >
                  <span>{NAVIGATION_REGISTRY.aboutUs.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      openDropdown === 'aboutUs' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* About Us Dropdown Panel */}
                <AnimatePresence>
                  {openDropdown === 'aboutUs' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl border border-black/10 shadow-2xl p-2.5 z-50 text-left"
                    >
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#888] px-3.5 py-1.5 border-b border-black/5">
                        Builder Identity
                      </div>
                      <div className="py-1">
                        {NAVIGATION_REGISTRY.aboutUs.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-[#F6F6F6] text-[#B5623A]'
                                  : 'hover:bg-[#F9F9F9] text-[#141414]'
                              }`}
                            >
                              <div className="text-[12px] font-medium tracking-tight">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-[#737373] font-light leading-snug pt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 3: Locations Disclosure */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === 'locations'}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('locations')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                    isLocationsActive || openDropdown === 'locations'
                      ? 'text-[#B5623A]'
                      : 'text-[#1A1A1A] hover:text-[#B5623A]'
                  }`}
                >
                  <span>{NAVIGATION_REGISTRY.locations.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      openDropdown === 'locations' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Locations Dropdown Panel */}
                <AnimatePresence>
                  {openDropdown === 'locations' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl border border-black/10 shadow-2xl p-2.5 z-50 text-left"
                    >
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#888] px-3.5 py-1.5 border-b border-black/5">
                        Corridor Guides
                      </div>
                      <div className="py-1">
                        {NAVIGATION_REGISTRY.locations.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-[#F6F6F6] text-[#B5623A]'
                                  : 'hover:bg-[#F9F9F9] text-[#141414]'
                              }`}
                            >
                              <div className="text-[12px] font-medium tracking-tight">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-[#737373] font-light leading-snug pt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Group 4: Buyer Guide Disclosure */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openDropdown === 'buyerGuide'}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('buyerGuide')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                    isBuyerGuideActive || openDropdown === 'buyerGuide'
                      ? 'text-[#B5623A]'
                      : 'text-[#1A1A1A] hover:text-[#B5623A]'
                  }`}
                >
                  <span>{NAVIGATION_REGISTRY.buyerGuide.label}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      openDropdown === 'buyerGuide' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Buyer Guide Dropdown Panel */}
                <AnimatePresence>
                  {openDropdown === 'buyerGuide' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      role="menu"
                      className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl border border-black/10 shadow-2xl p-2.5 z-50 text-left"
                    >
                      <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#888] px-3.5 py-1.5 border-b border-black/5">
                        Client Advisory
                      </div>
                      <div className="py-1">
                        {NAVIGATION_REGISTRY.buyerGuide.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              role="menuitem"
                              onClick={() => setOpenDropdown(null)}
                              className={`block px-3.5 py-2.5 rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-[#F6F6F6] text-[#B5623A]'
                                  : 'hover:bg-[#F9F9F9] text-[#141414]'
                              }`}
                            >
                              <div className="text-[12px] font-medium tracking-tight">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-[#737373] font-light leading-snug pt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct Link 5: Our Approach */}
              <Link
                to={NAVIGATION_REGISTRY.ourApproach.href}
                className={`text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                  isOurApproachActive
                    ? 'text-[#B5623A]'
                    : 'text-[#1A1A1A] hover:text-[#B5623A]'
                }`}
              >
                {NAVIGATION_REGISTRY.ourApproach.label}
              </Link>

              {/* Direct Link 6: Visit Checklist */}
              <Link
                to={NAVIGATION_REGISTRY.visitChecklist.href}
                className={`text-[11px] font-bold tracking-[0.16em] uppercase py-2 transition-colors cursor-pointer ${
                  isVisitChecklistActive
                    ? 'text-[#B5623A]'
                    : 'text-[#1A1A1A] hover:text-[#B5623A]'
                }`}
              >
                {NAVIGATION_REGISTRY.visitChecklist.label}
              </Link>
            </div>
          </nav>

          {/* Right: Primary CTA ("Plan a Visit") & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <Link
              to={NAVIGATION_REGISTRY.primaryCta.href}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-6 h-[48px] text-[10px] font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(181,98,58,0.25)] hover:-translate-y-[1px] bg-[#141414] text-white hover:bg-[#B5623A]"
            >
              <Calendar size={13} className="opacity-90" strokeWidth={2} />
              <span>{NAVIGATION_REGISTRY.primaryCta.label}</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              className={`lg:hidden p-2.5 rounded-full cursor-pointer transition-all duration-300 text-[#1A1A1A] ${headerPillStyle}`}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Accordion-Based) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 overflow-y-auto text-white"
          >
            {/* Drawer Header: Logo and Close Button */}
            <div className="flex justify-between items-center pb-6 border-b border-white/10">
              <Logo variant="light" size="md" onClick={handleLogoClick} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
              >
                <X size={26} />
              </button>
            </div>

            {/* Drawer Body: Accessible Mobile Accordions */}
            <div className="py-6 space-y-4 max-w-md mx-auto w-full">
              {/* Developments Accordion */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleMobileGroup('developments')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  aria-expanded={mobileExpandedGroup === 'developments'}
                >
                  <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-white">
                    {NAVIGATION_REGISTRY.developments.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-white/70 ${
                      mobileExpandedGroup === 'developments' ? 'rotate-180 text-[#B5623A]' : ''
                    }`}
                  />
                </button>

                {mobileExpandedGroup === 'developments' && (
                  <div className="px-5 pb-4 pt-1 space-y-2 border-t border-white/5">
                    {NAVIGATION_REGISTRY.developments.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-2 text-[14px] font-light tracking-wide transition-colors ${
                            isActive
                              ? 'text-[#B5623A] font-medium'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* About Us Accordion */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleMobileGroup('aboutUs')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  aria-expanded={mobileExpandedGroup === 'aboutUs'}
                >
                  <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-white">
                    {NAVIGATION_REGISTRY.aboutUs.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-white/70 ${
                      mobileExpandedGroup === 'aboutUs' ? 'rotate-180 text-[#B5623A]' : ''
                    }`}
                  />
                </button>

                {mobileExpandedGroup === 'aboutUs' && (
                  <div className="px-5 pb-4 pt-1 space-y-2 border-t border-white/5">
                    {NAVIGATION_REGISTRY.aboutUs.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-2 text-[14px] font-light tracking-wide transition-colors ${
                            isActive
                              ? 'text-[#B5623A] font-medium'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Locations Accordion */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleMobileGroup('locations')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  aria-expanded={mobileExpandedGroup === 'locations'}
                >
                  <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-white">
                    {NAVIGATION_REGISTRY.locations.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-white/70 ${
                      mobileExpandedGroup === 'locations' ? 'rotate-180 text-[#B5623A]' : ''
                    }`}
                  />
                </button>

                {mobileExpandedGroup === 'locations' && (
                  <div className="px-5 pb-4 pt-1 space-y-2 border-t border-white/5">
                    {NAVIGATION_REGISTRY.locations.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-2 text-[14px] font-light tracking-wide transition-colors ${
                            isActive
                              ? 'text-[#B5623A] font-medium'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Buyer Guide Accordion */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleMobileGroup('buyerGuide')}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                  aria-expanded={mobileExpandedGroup === 'buyerGuide'}
                >
                  <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-white">
                    {NAVIGATION_REGISTRY.buyerGuide.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-white/70 ${
                      mobileExpandedGroup === 'buyerGuide' ? 'rotate-180 text-[#B5623A]' : ''
                    }`}
                  />
                </button>

                {mobileExpandedGroup === 'buyerGuide' && (
                  <div className="px-5 pb-4 pt-1 space-y-2 border-t border-white/5">
                    {NAVIGATION_REGISTRY.buyerGuide.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-2 text-[14px] font-light tracking-wide transition-colors ${
                            isActive
                              ? 'text-[#B5623A] font-medium'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Link 5: Our Approach */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <Link
                  to={NAVIGATION_REGISTRY.ourApproach.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-white/5 block"
                >
                  <span className={`text-[13px] font-bold tracking-[0.16em] uppercase ${
                    isOurApproachActive ? 'text-[#B5623A]' : 'text-white'
                  }`}>
                    {NAVIGATION_REGISTRY.ourApproach.label}
                  </span>
                </Link>
              </div>

              {/* Direct Link 6: Visit Checklist */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                <Link
                  to={NAVIGATION_REGISTRY.visitChecklist.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-white/5 block"
                >
                  <span className={`text-[13px] font-bold tracking-[0.16em] uppercase ${
                    isVisitChecklistActive ? 'text-[#B5623A]' : 'text-white'
                  }`}>
                    {NAVIGATION_REGISTRY.visitChecklist.label}
                  </span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer: Primary CTA & Studio Lines */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-4 max-w-sm mx-auto w-full">
              <Link
                to={NAVIGATION_REGISTRY.primaryCta.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex justify-center items-center gap-2.5 bg-white text-black hover:bg-[#B5623A] hover:text-white px-6 py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
              >
                <Calendar size={14} />
                <span>{NAVIGATION_REGISTRY.primaryCta.label}</span>
              </Link>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-2 border border-white/20 hover:border-white text-white/90 hover:text-white py-3 px-4 rounded-full text-[11px] font-mono tracking-wider transition-colors"
                >
                  <Phone size={13} />
                  <span>Call Desk</span>
                </a>

                {whatsappNumber ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-white/20 hover:border-white text-white/90 hover:text-white py-3 px-4 rounded-full text-[11px] font-mono tracking-wider transition-colors"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>
                ) : null}
              </div>

              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 text-center pt-2">
                Happy Homes • Jagatpura, Jaipur
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
