import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Loader2,
  AlertCircle,
  Check,
  Compass,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  Download,
  Maximize2,
  X,
  ChevronRight,
  Shield,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import DevelopmentGallery from '../components/DevelopmentGallery';
import VisitRequestForm from '../components/VisitRequestForm';
import DevelopmentCard from '../components/DevelopmentCard';
import { usePublicCatalog } from '../context/PublicCatalogContext';
import { useSettings } from '../hooks/useSettings';
import {
  type DevelopmentPublic,
  type SpecificationGroup,
  type DevelopmentConfiguration,
  type NearbyPlacePublic,
  type ProgressUpdatePublic,
  formatPriceDisplay,
  formatBytes,
} from '../types/development';
import {
  isDevelopmentAvailable,
  isDevelopmentSoldOnly,
  getEffectiveAvailability,
} from '../utils/canonicalAvailability';

function isSafeUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(url, base);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function getCategoryRoute(type: string): { label: string; path: string } {
  switch (type) {
    case 'Villa':
    case 'Turnkey Luxury Villa':
      return { label: 'Villas', path: '/villas' };
    case 'Independent Floor':
    case 'Boutique Independent Floor':
      return { label: 'Independent Floors', path: '/independent-floors' };
    case 'Residential Plot':
      return { label: 'Residential Plots', path: '/plots' };
    default:
      return { label: 'Developments', path: '/developments' };
  }
}

export default function DevelopmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { initialDevelopments, currentDevelopment, setCurrentDevelopment } = usePublicCatalog();
  const { settings } = useSettings();

  // Resolve initial development state from SSR context or window.__INITIAL_DATA__
  const initialDev = useMemo(() => {
    if (!slug) return null;
    if (currentDevelopment && currentDevelopment.slug === slug) {
      return currentDevelopment;
    }
    if (initialDevelopments) {
      const match = initialDevelopments.find((d) => d.slug === slug);
      if (match) return match;
    }
    if (typeof window !== 'undefined') {
      const winData = (window as any).__INITIAL_DATA__;
      if (winData?.currentDevelopment && winData.currentDevelopment.slug === slug) {
        return winData.currentDevelopment as DevelopmentPublic;
      }
      if (Array.isArray(winData?.developments)) {
        const winMatch = winData.developments.find((d: any) => d.slug === slug);
        if (winMatch) return winMatch as DevelopmentPublic;
      }
    }
    return null;
  }, [slug, currentDevelopment, initialDevelopments]);

  const [development, setDevelopment] = useState<DevelopmentPublic | null>(initialDev);
  const [loading, setLoading] = useState<boolean>(!initialDev);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Full public catalog list for related developments (excludes current & sold)
  const [catalogue, setCatalogue] = useState<DevelopmentPublic[]>(initialDevelopments || []);

  // Accessible lightbox modal for floor plan linework and progress photos
  const [selectedModalImage, setSelectedModalImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // If we already have the development matching the current slug from SSR, avoid redundant fetch
    if (development && development.slug === slug) {
      setLoading(false);
      return;
    }

    const fetchPublicDevelopment = async () => {
      setLoading(true);
      setNotFound(false);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/developments/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
          setDevelopment(null);
          return;
        }
        if (!res.ok) {
          throw new Error('Database service unavailable while retrieving development record.');
        }

        const data = await res.json();
        if (data.development) {
          setDevelopment(data.development);
        } else {
          setNotFound(true);
          setDevelopment(null);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error loading development record.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDevelopment();
  }, [slug]);

  // Synchronize active development with PublicCatalogContext so RouteMetadataManager updates dynamically
  useEffect(() => {
    if (development) {
      setCurrentDevelopment?.(development);
    }
    return () => {
      setCurrentDevelopment?.(null);
    };
  }, [development, setCurrentDevelopment]);

  // Fetch full public catalogue if not populated (for related developments)
  useEffect(() => {
    if (catalogue.length === 0) {
      fetch('/api/developments')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.developments && Array.isArray(data.developments)) {
            setCatalogue(data.developments);
          }
        })
        .catch(() => {});
    }
  }, [catalogue.length]);

  // Modal keyboard listeners (Escape key)
  useEffect(() => {
    if (!selectedModalImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModalImage]);

  const scrollToVisitRequest = useCallback(() => {
    const el = document.getElementById('visit-request');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const whatsappNumber = useMemo(() => {
    return settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '919166054964';
  }, [settings.whatsapp]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="w-full min-h-[55vh] flex items-center justify-center p-12 text-[#141414]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[#141414]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
              Loading development presentation...
            </span>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // 1. Backend Read Failure: explicitly distinct from 404
  if (errorMessage && !development) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto my-16 sm:my-24 px-6 text-center space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-600 block">
            500 • Backend Read Failure
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[#141414]">Unable to Load Development</h1>
          <p className="text-[13px] text-[#666] font-light leading-relaxed">
            {errorMessage || 'A system error occurred while retrieving this public property record. Please refresh or retry shortly.'}
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-[#141414] hover:bg-black text-white px-8 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer"
            >
              Retry Loading
            </button>
            <Link
              to="/developments"
              className="inline-block border border-black/15 text-[#141414] px-8 py-3.5 rounded-full text-[11px] font-mono uppercase tracking-[0.16em] transition-all"
            >
              Back to Developments
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // 2. Genuine 404: development does not exist or unpublished
  if (notFound || !development) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto my-16 sm:my-24 px-6 text-center space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B5623A] block">
            404 • Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[#141414]">Development Unavailable</h1>
          <p className="text-[13px] text-[#666] font-light leading-relaxed">
            The requested residential development is not currently published in the public portfolio or has been archived.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/developments"
              className="inline-block bg-[#141414] hover:bg-black text-white px-8 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all"
            >
              Explore Active Portfolio
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const category = getCategoryRoute(development.type);
  const isAvailable = isDevelopmentAvailable(development);
  const isSold = isDevelopmentSoldOnly(development);
  const effectiveAvailability = getEffectiveAvailability(development);

  const hasSpecifications = Array.isArray(development.specifications) && development.specifications.length > 0;
  const hasConfigurations = Array.isArray(development.configurations) && development.configurations.length > 0;
  const hasPlans = Array.isArray(development.plans) && development.plans.length > 0;
  const hasBrochure = Boolean(development.brochure && development.brochure.url && isSafeUrl(development.brochure.url));
  const hasLocation = Boolean(
    development.location &&
      (development.location.address ||
        development.location.directionsUrl ||
        development.location.coordinates ||
        (Array.isArray(development.location.nearbyPlaces) && development.location.nearbyPlaces.length > 0))
  );
  const hasProgress = Array.isArray(development.progress) && development.progress.length > 0;

  // Extract structured facts from specifications if present (e.g. Parking, Lift, Orientation, Floors)
  const structuredFacts = useMemo(() => {
    if (!development.specifications) return [];
    const extracted: { label: string; value: string }[] = [];
    const targetKeywords = ['parking', 'lift', 'elevator', 'orientation', 'facing', 'floors', 'structure', 'water', 'power'];
    
    for (const group of development.specifications) {
      for (const item of group.items) {
        const lowerLabel = item.label.toLowerCase();
        if (targetKeywords.some((kw) => lowerLabel.includes(kw))) {
          if (!extracted.some((e) => e.label.toLowerCase() === lowerLabel)) {
            extracted.push({ label: item.label, value: item.value });
          }
        }
      }
    }
    return extracted.slice(0, 4);
  }, [development.specifications]);

  // Related developments: at most three other published available records (excludes current and sold-only/private)
  const relatedDevelopments = useMemo(() => {
    if (!development || !catalogue.length) return [];
    return catalogue
      .filter(
        (d) =>
          d &&
          d.id !== development.id &&
          d.slug !== development.slug &&
          isDevelopmentAvailable(d)
      )
      .sort((a, b) => {
        // Deterministically rank by same type and locality
        const aTypeMatch = a.type === development.type;
        const bTypeMatch = b.type === development.type;
        const aLocMatch = a.locality === development.locality;
        const bLocMatch = b.locality === development.locality;

        if (aTypeMatch && aLocMatch && !(bTypeMatch && bLocMatch)) return -1;
        if (bTypeMatch && bLocMatch && !(aTypeMatch && aLocMatch)) return 1;
        if (aTypeMatch && !bTypeMatch) return -1;
        if (bTypeMatch && !aTypeMatch) return 1;
        if (aLocMatch && !bLocMatch) return -1;
        if (bLocMatch && !aLocMatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);
  }, [development, catalogue]);

  const whatsappMessage = encodeURIComponent(
    isSold
      ? `Hello Happy Homes, I saw that "${development.name}" is sold. Could you please share details on upcoming or comparable developments in ${development.locality}?`
      : `Hello Happy Homes, I am interested in scheduling a site walkthrough for "${development.name}" (${development.locality}). Could you please share current availability details?`
  );

  return (
    <PublicLayout>
      {/* Subpage Breadcrumb Bar */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-12 pt-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-black/30">/</li>
            <li>
              <Link to="/developments" className="hover:text-[#141414] transition-colors">
                Developments
              </Link>
            </li>
            <li aria-hidden="true" className="text-black/30">/</li>
            <li>
              <Link to={category.path} className="hover:text-[#141414] transition-colors">
                {category.label}
              </Link>
            </li>
            <li aria-hidden="true" className="text-black/30">/</li>
            <li className="text-[#B5623A] font-medium truncate max-w-[180px] sm:max-w-[280px]" aria-current="page">
              {development.name}
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={category.path}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to {category.label}</span>
          </Link>
        </div>
      </div>

      {/* Main Content Article with bottom clearance for mobile bar */}
      <article className="max-w-5xl mx-auto w-full px-6 md:px-12 py-8 pb-28 md:pb-12 flex-1 space-y-12">
        
        {/* 1. Identity & Commercial Status */}
        <header className="space-y-4 border-b border-black/5 pb-8">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373]">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#B5623A]" />
              <span>{development.locality}</span>
            </span>
            <span>•</span>
            <Link
              to={category.path}
              className="text-[#B5623A] font-semibold hover:underline"
            >
              {development.type}
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#141414]">
                {development.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-mono font-medium text-[#141414]">
                  {development.priceDisplay}
                </span>

                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border font-medium ${
                    effectiveAvailability === 'Available'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : effectiveAvailability === 'Reserved'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {effectiveAvailability}
                </span>

                <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-neutral-100 text-[#444] border border-black/5">
                  {development.constructionStage}
                </span>
              </div>
            </div>

            {/* Direct Primary Action Buttons: Sold offers Enquire About Similar Developments */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isSold ? (
                <button
                  type="button"
                  onClick={scrollToVisitRequest}
                  className="bg-[#141414] hover:bg-black text-white px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <MessageSquare size={13} className="text-[#B5623A]" />
                  <span>Enquire About Similar Developments</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={scrollToVisitRequest}
                  className="bg-[#141414] hover:bg-black text-white px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Calendar size={13} className="text-[#B5623A]" />
                  <span>Request a Visit</span>
                </button>
              )}

              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-black/15 hover:border-black/40 text-[#141414] bg-white px-5 py-3.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <MessageSquare size={13} className="text-emerald-600" />
                  <span>WhatsApp Desk</span>
                </a>
              )}
            </div>
          </div>

          {/* Sold Notice Banner */}
          {isSold && (
            <div className="mt-4 p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-start gap-3 text-[12px] font-mono text-amber-900">
              <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold uppercase tracking-wider block mb-0.5">
                  Residences Fully Committed
                </span>
                <p className="font-light text-amber-800">
                  All inventory for this development has been sold. You can register your interest with our developer desk below for upcoming architectural releases or similar residences in this corridor.
                </p>
              </div>
            </div>
          )}
        </header>

        {/* 2. Photograph Gallery (Cover + Perspectives + Lightbox) */}
        <DevelopmentGallery
          photos={development.photos}
          legacyImage={development.image}
          developmentName={development.name}
        />

        {/* 3. At A Glance (Truthful Applicable Facts Only) */}
        <section aria-labelledby="at-a-glance-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <span id="at-a-glance-heading" className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
              Development Essentials
            </span>
            <span className="text-[10px] font-mono text-[#737373]">
              Supplied Project Parameters
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white border border-black/10 rounded-3xl shadow-xs">
            {development.area && development.area.value ? (
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block">
                  {development.area.definition} Area
                </span>
                <span className="text-[15px] font-mono font-medium text-[#141414] block">
                  {development.area.value} {development.area.unit}
                </span>
              </div>
            ) : null}

            {development.bedrooms && development.type !== 'Residential Plot' ? (
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block">
                  Bedrooms / Suites
                </span>
                <span className="text-[15px] font-mono font-medium text-[#141414] block">
                  {development.bedrooms} {development.bedrooms === 1 ? 'Suite' : 'Suites'}
                </span>
              </div>
            ) : null}

            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block">
                Construction Stage
              </span>
              <span className="text-[14px] font-medium text-[#141414] block">
                {development.constructionStage}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block">
                Commercial Status
              </span>
              <span className="text-[14px] font-medium text-[#141414] block">
                {effectiveAvailability}
              </span>
            </div>

            {/* Display structured facts if explicitly supplied in specifications */}
            {structuredFacts.map((fact, idx) => (
              <div key={idx} className="space-y-1 border-t border-black/5 pt-3">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block truncate">
                  {fact.label}
                </span>
                <span className="text-[14px] font-light text-[#141414] block truncate">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Narrative Description & Transparent Pricing Note */}
        <section className="space-y-6">
          <div className="bg-white border border-black/10 rounded-3xl p-8 shadow-xs space-y-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
              Architectural Overview
            </span>
            <p className="text-[15px] text-[#333] font-light leading-relaxed whitespace-pre-line">
              {development.shortDescription}
            </p>
          </div>

          {/* Transparent Price Explanation */}
          <div className="p-6 bg-[#FAFAFA] border border-black/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[12px] font-mono text-[#555]">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-[#B5623A] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-[#141414] uppercase tracking-wider text-[11px] block">
                  Direct Developer Acquisition Basis
                </span>
                <p className="font-light text-[#666]">
                  {development.priceMode === 'on_request'
                    ? 'Current phase pricing is available directly on inquiry without middleman or broker commissions.'
                    : development.priceMode === 'starting_at'
                    ? `Base configuration starting rate is ${development.priceDisplay}. Consideration varies by unit layout, floor level, and orientation.`
                    : `Direct developer rate: ${development.priceDisplay}. Zero dealer fees or agency markups apply.`}
                </p>
                <p className="text-[11px] text-[#888] font-light pt-0.5">
                  Government stamp duty, sub-registrar documentation, and bespoke interior customizations are billed at actuals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Official Project Brochure Download (PDF) - Omitted when absent */}
        {hasBrochure && (
          <section aria-labelledby="brochure-heading" className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <FileText size={22} className="text-[#B5623A]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/15 text-white font-medium">
                    Official Brochure • PDF
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {formatBytes(development.brochure!.bytes)}
                  </span>
                </div>
                <h3 id="brochure-heading" className="text-lg sm:text-xl font-light text-white">
                  {development.brochure!.title}
                </h3>
                {development.brochure!.editionDate && (
                  <p className="text-[12px] font-mono text-neutral-400">
                    Publication Edition: {development.brochure!.editionDate}
                  </p>
                )}
              </div>
            </div>

            <a
              href={development.brochure!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#141414] hover:bg-neutral-100 text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer"
            >
              <Download size={13} />
              <span>Download Official Brochure</span>
            </a>
          </section>
        )}

        {/* 5. Unit Configurations & Residences - Preserves unit-specific availability */}
        {hasConfigurations && (
          <section aria-labelledby="configurations-heading" className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Residential Layouts
              </span>
              <h2 id="configurations-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                Available Configurations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {development.configurations!.map((config) => (
                <div
                  key={config.id}
                  className="bg-white border border-black/10 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-light text-[#141414] leading-snug">
                        {config.label}
                      </h3>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 font-medium ${
                          config.availability === 'Available'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : config.availability === 'Reserved'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                        }`}
                      >
                        {config.availability}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-mono text-[#666]">
                      {config.floor && (
                        <span>Floor: {config.floor}</span>
                      )}
                      {config.bedrooms ? (
                        <span>• {config.bedrooms} Bedrooms</span>
                      ) : null}
                      {config.area && config.area.value ? (
                        <span>
                          • {config.area.value} {config.area.unit} ({config.area.definition})
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-baseline justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373]">
                      Price Mode
                    </span>
                    <span className="text-base font-mono font-medium text-[#141414]">
                      {config.priceDisplay ||
                        (config.priceMode
                          ? formatPriceDisplay(config.priceMode, config.priceAmount ?? null)
                          : 'Price on Request')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Floor Plans & Blueprints */}
        {hasPlans && (
          <section aria-labelledby="plans-heading" className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Linework Documentation
              </span>
              <h2 id="plans-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                Architectural Floor Plans
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {development.plans!.map((plan) => {
                const linkedConfig = plan.configurationId
                  ? development.configurations?.find((c) => c.id === plan.configurationId)
                  : null;

                return (
                  <div
                    key={plan.id}
                    className="bg-white border border-black/10 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-light text-[#141414] leading-snug">
                            {plan.title}
                          </h3>
                          {plan.floor && (
                            <span className="text-[12px] font-mono text-[#666] block mt-0.5">
                              Level: {plan.floor}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-[#444] border border-black/5 shrink-0">
                          {plan.assetType === 'pdf' ? 'PDF Vector' : 'Raster Plan'}
                        </span>
                      </div>

                      {/* Linked configuration badge */}
                      {linkedConfig && (
                        <div className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2.5 py-1 rounded-lg inline-block">
                          Layout applies to: {linkedConfig.label}
                        </div>
                      )}

                      {/* Plan visual preview */}
                      {plan.assetType === 'image' ? (
                        <div
                          onClick={() => setSelectedModalImage({ url: plan.url, title: plan.title, subtitle: plan.floor || undefined })}
                          className="relative aspect-4/3 rounded-xl overflow-hidden border border-black/10 bg-[#FAFAFA] cursor-pointer group"
                        >
                          <img
                            src={plan.url}
                            alt={plan.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-mono uppercase tracking-wider">
                            <Maximize2 size={14} />
                            <span>Inspect Linework</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#FAFAFA] border border-black/5 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-200 text-[#141414] flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <span className="text-[11px] font-mono uppercase font-semibold text-[#141414]">Architectural Blueprint (PDF)</span>
                              <span className="text-[11px] font-mono text-[#737373] block">{formatBytes(plan.bytes)}</span>
                            </div>
                          </div>
                          {isSafeUrl(plan.url) && (
                            <a
                              href={plan.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-full border border-black/15 hover:bg-neutral-100 text-[#141414] text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <ExternalLink size={12} />
                              <span>View PDF</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-[#737373]">
                      <span>{plan.assetType === 'pdf' ? 'Direct PDF document' : `${plan.width || ''} × ${plan.height || ''} px`}</span>
                      <span>{formatBytes(plan.bytes)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Technical Specifications & Inclusions */}
        {hasSpecifications && (
          <section aria-labelledby="specs-heading" className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Material Standards
              </span>
              <h2 id="specs-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                Technical Specifications & Inclusions
              </h2>
            </div>

            <div className="space-y-4">
              {development.specifications!.map((group) => (
                <div
                  key={group.id}
                  className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <h3 className="text-lg font-light text-[#141414] pb-2 border-b border-black/5 flex items-center justify-between">
                    <span>{group.title}</span>
                    <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider font-normal">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[#FAFAFA] border border-black/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
                            {item.label}
                          </span>
                          {item.type === 'optional_extra' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-[#B5623A] bg-[#B5623A]/10 px-2 py-0.5 rounded-full font-semibold">
                              Optional Upgrade
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                              <Check size={10} className="text-emerald-600" /> Included
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] font-light text-[#141414] leading-snug">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-mono text-[#737373] pt-1 leading-relaxed">
              * Note: Items marked as "Optional Upgrade" represent bespoke enhancements available upon request during structural execution. Baseline specifications reflect standard builder delivery.
            </p>
          </section>
        )}

        {/* 8. Location & Civic Infrastructure */}
        {hasLocation && (
          <section aria-labelledby="location-heading" className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Civic Connectivity
              </span>
              <h2 id="location-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                Location & Sector Infrastructure
              </h2>
            </div>

            {/* Address & Coordinates Card */}
            {(development.location?.address || development.location?.coordinates || development.location?.directionsUrl) && (
              <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                {development.location.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#B5623A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-0.5">
                        Site Location Address
                      </span>
                      <p className="text-[15px] font-light text-[#141414]">
                        {development.location.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/5">
                  {development.location.coordinates ? (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#666]">
                      <Compass size={13} className="text-[#737373]" />
                      <span>
                        Coordinates: {development.location.coordinates.latitude.toFixed(5)}° N, {development.location.coordinates.longitude.toFixed(5)}° E
                      </span>
                    </div>
                  ) : <div />}

                  {development.location.directionsUrl && isSafeUrl(development.location.directionsUrl) && (
                    <a
                      href={development.location.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#141414] hover:text-[#B5623A] underline transition-colors"
                    >
                      <ExternalLink size={12} />
                      <span>Open in Navigation Maps</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Nearby Infrastructure Landmarks */}
            {Array.isArray(development.location?.nearbyPlaces) && development.location!.nearbyPlaces!.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block">
                  Sector Landmarks & Travel Distances
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {development.location!.nearbyPlaces!.map((place) => (
                    <div
                      key={place.id}
                      className="p-4 bg-white border border-black/10 rounded-2xl space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#737373] block">
                            {place.category}
                          </span>
                          <h4 className="text-[14px] font-light text-[#141414] leading-snug">
                            {place.name}
                          </h4>
                        </div>
                        {place.distanceValue !== null && place.distanceValue !== undefined && (
                          <span className="text-[12px] font-mono font-medium text-[#141414] shrink-0 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {place.distanceValue} {place.distanceUnit || 'km'}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            place.status === 'Proposed / Upcoming'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-neutral-100 text-[#444]'
                          }`}
                        >
                          {place.status}
                        </span>

                        {place.publicNote && (
                          <p className="text-[11px] text-[#666] font-light italic w-full pt-1">
                            "{place.publicNote}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 9. Construction Progress & Milestones - Omitted gracefully when absent */}
        {hasProgress && (
          <section aria-labelledby="progress-heading" className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Milestone Tracking
              </span>
              <h2 id="progress-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                Construction Progress & Timeline
              </h2>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-black/10 pl-2">
              {development.progress!.map((item) => (
                <div
                  key={item.id}
                  className="relative pl-7 space-y-2"
                >
                  <div
                    className={`absolute left-2.5 top-2 w-3 h-3 rounded-full -translate-x-1/2 border-2 bg-white ${
                      item.stage === 'Completed work'
                        ? 'border-emerald-600'
                        : 'border-[#B5623A]'
                    }`}
                  />
                  <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#737373]">
                        {item.date}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                          item.stage === 'Completed work'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.stage}
                      </span>
                    </div>

                    <h4 className="text-[16px] font-medium text-[#141414]">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-[13px] font-light text-[#444] leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}

                    {/* Associated milestone documentation photos */}
                    {Array.isArray(item.photos) && item.photos.length > 0 && (
                      <div className="pt-3 border-t border-black/5 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
                          Milestone Documentation ({item.photos.length} photograph{item.photos.length > 1 ? 's' : ''})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {item.photos.map((p) => (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => setSelectedModalImage({
                                url: p.url || p.secureUrl,
                                title: item.title,
                                subtitle: `${p.label} • ${item.date}`
                              })}
                              className="group relative aspect-square rounded-xl overflow-hidden border border-black/10 bg-[#FAFAFA] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#B5623A]"
                            >
                              <img
                                src={p.url || p.secureUrl}
                                alt={p.altText || item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                <span className="text-[8px] font-mono text-white bg-black/60 px-1 py-0.5 rounded truncate">
                                  {p.label === 'Actual photograph' ? 'Actual' : 'Visual'}
                                </span>
                                <div className="self-end text-white">
                                  <Maximize2 size={12} />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. Related Developments (Shows at most three other published available records, excluding current & sold) */}
        {relatedDevelopments.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-6 pt-10 border-t border-black/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                  Portfolio Exploration
                </span>
                <h2 id="related-heading" className="text-2xl sm:text-3xl font-light text-[#141414]">
                  Similar Architectural Developments
                </h2>
              </div>
              <Link
                to="/developments"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[#737373] hover:text-[#141414] transition-colors"
              >
                <span>View All Portfolio</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDevelopments.map((related) => (
                <DevelopmentCard key={related.id} development={related} />
              ))}
            </div>
          </section>
        )}

        {/* 11. Visit Request / Sold Interest Section */}
        <section id="visit-request" aria-labelledby="visit-request-heading" className="space-y-6 pt-8 border-t border-black/5">
          <VisitRequestForm 
            developmentId={development.id} 
            developmentName={development.name}
            isSold={isSold}
          />
        </section>

        {/* 12. Direct Developer Consultation Desk */}
        <section aria-labelledby="developer-desk-heading" className="bg-[#141414] text-white p-8 md:p-10 rounded-3xl space-y-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
              Direct Developer Desk
            </span>
            <h2 id="developer-desk-heading" className="text-2xl sm:text-3xl font-light">
              {isSold
                ? `Enquire about upcoming developments like ${development.name}`
                : `Consult directly regarding ${development.name}`}
            </h2>
            <p className="text-[13px] text-neutral-300 font-light max-w-xl leading-relaxed">
              {isSold
                ? `Connect directly with Happy Homes project engineers to explore planned developments and upcoming inventory in ${development.locality}.`
                : 'Connect directly with Happy Homes project engineers. We arrange private site walkthroughs, share architectural linework, and verify registered title records.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 text-[12px] font-mono text-neutral-300">
            {settings.phone && (
              <div>
                <span className="text-[10px] uppercase text-[#737373] block mb-1">Telephone Line</span>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, '')}`}
                  className="text-white hover:text-[#B5623A] transition-colors font-medium flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-[#B5623A]" />
                  <span>{settings.phone}</span>
                </a>
              </div>
            )}

            {settings.email && (
              <div>
                <span className="text-[10px] uppercase text-[#737373] block mb-1">Direct Email</span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-white hover:text-[#B5623A] transition-colors break-all"
                >
                  {settings.email}
                </a>
              </div>
            )}

            {settings.address && (
              <div>
                <span className="text-[10px] uppercase text-[#737373] block mb-1">Developer Office</span>
                <span className="text-neutral-400 font-light block leading-snug">
                  {settings.address}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="bg-white text-[#141414] px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-neutral-100 transition-colors"
              >
                <Phone size={13} />
                <span>Call Developer Desk</span>
              </a>
            )}

            {settings.whatsapp && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 hover:border-white/50 text-white px-6 py-3.5 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <MessageSquare size={13} className="text-emerald-400" />
                <span>{isSold ? 'WhatsApp Desk Inquiry' : 'WhatsApp Walkthrough Request'}</span>
              </a>
            )}
          </div>
        </section>
      </article>

      {/* 13. Mobile Enquire/WhatsApp Sticky Bar (Respects safe area, hides when modal open, does not cover content) */}
      {!selectedModalImage && (
        <aside
          aria-label="Quick mobile action bar"
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[9px] font-mono uppercase text-[#737373] tracking-wider truncate">
              {development.locality}
            </span>
            <span className="text-[14px] font-mono font-medium text-[#141414] truncate">
              {development.priceDisplay}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center bg-white text-emerald-600 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <MessageSquare size={16} />
              </a>
            )}

            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                aria-label="Call Developer Line"
                className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center bg-white text-[#141414] hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Phone size={15} />
              </a>
            )}

            <button
              type="button"
              onClick={scrollToVisitRequest}
              className="bg-[#141414] active:bg-black text-white px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer shadow-sm"
            >
              {isSold ? 'Enquire Similar' : 'Request Visit'}
            </button>
          </div>
        </aside>
      )}

      {/* 14. Accessible Image Modal / Lightbox for Floor Plans and Milestone Photographs */}
      {selectedModalImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedModalImage.title}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-[#FAFAFA]">
              <div>
                <h3 className="text-base font-medium text-[#141414] leading-tight">
                  {selectedModalImage.title}
                </h3>
                {selectedModalImage.subtitle && (
                  <p className="text-[12px] font-mono text-[#666] mt-0.5">
                    {selectedModalImage.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalImage(null)}
                aria-label="Close dialog (Esc)"
                className="p-2 rounded-full hover:bg-neutral-200 text-[#444] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-neutral-100 max-h-[75vh]">
              <img
                src={selectedModalImage.url}
                alt={selectedModalImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="px-6 py-3 border-t border-black/10 bg-white flex items-center justify-between text-[11px] font-mono text-[#737373]">
              <span>Original Linework Resolution</span>
              <button
                type="button"
                onClick={() => setSelectedModalImage(null)}
                className="px-4 py-1.5 rounded-full bg-[#141414] text-white hover:bg-neutral-800 uppercase tracking-wider text-[10px] cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
