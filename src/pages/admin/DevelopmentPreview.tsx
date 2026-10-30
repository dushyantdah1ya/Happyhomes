import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Globe,
  Loader2,
  AlertTriangle,
  Building,
  CheckCircle2,
  MessageSquare,
  Phone,
  ShieldCheck,
  Check,
  Compass,
  ExternalLink,
  Clock,
  MapPin,
  Lock,
  Eye,
  FileText,
  Download,
  Maximize2,
  X,
} from 'lucide-react';
import Logo from '../../components/Logo';
import DevelopmentGallery from '../../components/DevelopmentGallery';
import { useAuth } from '../../context/AuthContext';
import { type DevelopmentDraft, formatPriceDisplay, formatBytes } from '../../types/development';

export default function DevelopmentPreview() {
  const { id } = useParams<{ id: string }>();
  const { user, isOwner, loading: authLoading, getIdToken } = useAuth();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<DevelopmentDraft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  // Accessible lightbox modal for floor plan linework and progress photos
  const [selectedModalImage, setSelectedModalImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [authLoading, user, isOwner, navigate]);

  useEffect(() => {
    const fetchDraft = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch(`/api/admin/developments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.status === 200 && data.development) {
          setDraft(data.development);
        } else {
          setErrorMessage(data.message || 'Development draft not found.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Network error fetching draft.');
      } finally {
        setLoading(false);
      }
    };

    if (isOwner && id) {
      fetchDraft();
    }
  }, [id, isOwner]);

  const handlePublishFromPreview = async () => {
    if (!id) return;
    setPublishing(true);
    setErrorMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/developments/${id}/publish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 200 && data.development) {
        setDraft(data.development);
        setPublishSuccess(true);
      } else {
        setErrorMessage(data.message || 'Failed to publish development.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error publishing development.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6 text-[#141414]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#141414]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Loading draft preview...
          </span>
        </div>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="w-full min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6 text-[#141414]">
        <div className="max-w-md p-8 bg-white border border-black/10 rounded-3xl text-center space-y-4">
          <AlertTriangle size={24} className="text-rose-600 mx-auto" />
          <h2 className="text-xl font-medium">Draft Not Found</h2>
          <p className="text-[13px] text-[#666]">The requested development draft could not be located.</p>
          <Link
            to="/admin/developments"
            className="inline-block bg-[#141414] text-white px-5 py-2.5 rounded-full text-[11px] font-mono uppercase"
          >
            Return to List
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F8F8F8] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Top Owner Preview Banner */}
      <div className="bg-[#141414] text-white px-6 md:px-12 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-[#B5623A] text-white text-[9px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full font-bold">
            Private Preview Mode
          </span>
          <span className="text-[12px] font-light text-neutral-300 hidden sm:inline">
            Viewing current working draft. This URL is not accessible to the public.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/developments/${draft.id}`}
            className="text-[11px] font-mono uppercase text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back to Editor</span>
          </Link>

          {draft.status !== 'published' ? (
            <button
              onClick={handlePublishFromPreview}
              disabled={publishing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {publishing ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
              <span>Publish Now</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
              Already Published
            </span>
          )}
        </div>
      </div>

      {publishSuccess && (
        <div className="max-w-4xl mx-auto w-full px-6 pt-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[12px] text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Development published successfully!</span>
            </div>
            {draft.publishedSlug && (
              <Link
                to={`/developments/${draft.publishedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono uppercase underline font-semibold"
              >
                View Live Page →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Development Detail View */}
      <article className="max-w-4xl mx-auto w-full px-6 md:px-12 py-12 flex-1 space-y-10">
        
        {/* Header Breadcrumb & Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373]">
            <span>{draft.locality}</span>
            <span>•</span>
            <span className="text-[#B5623A] font-semibold">{draft.type}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#141414]">
            {draft.name || 'Untitled Development'}
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-2xl font-mono font-medium text-[#141414]">
              {formatPriceDisplay(draft.priceMode, draft.priceAmount)}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAEAEA] text-[#333]">
              {draft.availability}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAEAEA] text-[#333]">
              {draft.constructionStage}
            </span>
          </div>
        </div>

        {/* Photograph Gallery (Cover + Secondary Views) */}
        <DevelopmentGallery
          photos={draft.photos}
          legacyImage={draft.image}
          developmentName={draft.name || 'Untitled Development'}
          isPrivatePreview={true}
        />

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white border border-black/10 rounded-2xl">
          {draft.area && draft.area.value ? (
            <div>
              <span className="text-[9px] font-mono uppercase text-[#737373] block mb-1">
                {draft.area.definition} Area
              </span>
              <span className="text-[15px] font-mono font-medium text-[#141414]">
                {draft.area.value} {draft.area.unit}
              </span>
            </div>
          ) : null}

          {draft.bedrooms ? (
            <div>
              <span className="text-[9px] font-mono uppercase text-[#737373] block mb-1">
                Bedrooms
              </span>
              <span className="text-[15px] font-mono font-medium text-[#141414]">
                {draft.bedrooms} Suites
              </span>
            </div>
          ) : null}

          <div>
            <span className="text-[9px] font-mono uppercase text-[#737373] block mb-1">
              Construction Stage
            </span>
            <span className="text-[14px] font-medium text-[#141414]">
              {draft.constructionStage}
            </span>
          </div>

          <div>
            <span className="text-[9px] font-mono uppercase text-[#737373] block mb-1">
              Tenure / Title
            </span>
            <span className="text-[14px] font-medium text-[#141414]">
              100% Freehold JDA
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 bg-white border border-black/10 rounded-3xl p-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
            Architectural Narrative
          </span>
          <p className="text-[15px] text-[#333] font-light leading-relaxed whitespace-pre-line">
            {draft.shortDescription || 'No description provided yet.'}
          </p>
        </div>

        {/* --- S05B2: PROJECT BROCHURE DOWNLOAD --- */}
        {draft.brochure && draft.brochure.url && (
          <div className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
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
                    {formatBytes(draft.brochure.bytes)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-light text-white">{draft.brochure.title}</h3>
                {draft.brochure.editionDate && (
                  <p className="text-[12px] font-mono text-neutral-400">
                    Edition: {draft.brochure.editionDate}
                  </p>
                )}
              </div>
            </div>

            <a
              href={draft.brochure.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#141414] hover:bg-neutral-100 text-[11px] font-mono uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer"
            >
              <Download size={13} />
              <span>Download Brochure PDF</span>
            </a>
          </div>
        )}

        {/* --- S05A: AVAILABLE CONFIGURATIONS --- */}
        {Array.isArray(draft.configurations) && draft.configurations.length > 0 && (
          <section className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Unit Configurations
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
                Available Layouts & Residences
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.configurations.map((config) => (
                <div
                  key={config.id}
                  className="bg-white border border-black/10 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-light text-[#141414] leading-snug">
                        {config.label || 'Untitled Configuration'}
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

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-mono text-[#666]">
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
                      Pricing
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

        {/* --- S05A: ARCHITECTURAL SPECIFICATIONS --- */}
        {Array.isArray(draft.specifications) && draft.specifications.length > 0 && (
          <section className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Technical Standards
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
                Architectural Specifications
              </h2>
            </div>

            <div className="space-y-4">
              {draft.specifications.map((group) => (
                <div
                  key={group.id}
                  className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs"
                >
                  <h3 className="text-lg font-light text-[#141414] pb-2 border-b border-black/5 flex items-center justify-between">
                    <span>{group.title || 'Untitled Group'}</span>
                    <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider font-normal">
                      {group.items.length} items
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
                            {item.label || 'Unnamed Specification'}
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
                          {item.value || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-mono text-[#737373] pt-1 leading-relaxed">
              * Note: Items designated as "Optional Upgrade" are bespoke engineering enhancements available upon request during structural execution and are not included in baseline specifications.
            </p>
          </section>
        )}

        {/* --- S05B2: FLOOR PLANS & BLUEPRINTS --- */}
        {Array.isArray(draft.plans) && draft.plans.length > 0 && (
          <section className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Architectural Plans
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
                Floor Plans & Blueprints
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.plans.map((plan) => (
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
                            Floor: {plan.floor}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-[#444] border border-black/5 shrink-0">
                        {plan.assetType === 'pdf' ? 'PDF Blueprint' : 'Image Plan'}
                      </span>
                    </div>

                    {/* Linked configuration badge */}
                    {plan.configurationId && (
                      <div className="text-[11px] font-mono text-[#B5623A] bg-[#B5623A]/10 px-2.5 py-1 rounded-lg inline-block">
                        Linked configuration: {draft.configurations?.find((c) => c.id === plan.configurationId)?.label || 'Residential Unit'}
                      </div>
                    )}

                    {/* Plan content preview */}
                    {plan.assetType === 'image' ? (
                      <div
                        onClick={() => setSelectedModalImage({ url: plan.url, title: plan.title, subtitle: plan.floor || undefined })}
                        className="relative aspect-4/3 rounded-xl overflow-hidden border border-black/10 bg-[#FAFAFA] cursor-pointer group"
                      >
                        <img
                          src={plan.url}
                          alt={plan.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-mono uppercase tracking-wider">
                          <Maximize2 size={14} />
                          <span>Inspect Linework</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAFAFA] border border-black/5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-800 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <span className="text-[11px] font-mono uppercase font-semibold text-[#141414]">Vector PDF Plan</span>
                            <span className="text-[11px] font-mono text-[#737373] block">{formatBytes(plan.bytes)}</span>
                          </div>
                        </div>
                        <a
                          href={plan.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full border border-black/15 hover:bg-neutral-100 text-[#141414] text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>View PDF</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-[#737373]">
                    <span>{plan.assetType === 'pdf' ? 'Direct PDF document' : `${plan.width || ''} × ${plan.height || ''} px`}</span>
                    <span>{formatBytes(plan.bytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- S05A: LOCATION & CIVIC CONNECTIVITY --- */}
        {draft.location && (draft.location.address || draft.location.coordinates || draft.location.directionsUrl || (draft.location.nearbyPlaces && draft.location.nearbyPlaces.length > 0)) && (
          <section className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Sector Connectivity
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
                Location & Civic Infrastructure
              </h2>
            </div>

            {/* Address & Coordinates Card */}
            {(draft.location.address || draft.location.coordinates || draft.location.directionsUrl) && (
              <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
                {draft.location.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#B5623A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-0.5">
                        Physical Site Address
                      </span>
                      <p className="text-[15px] font-light text-[#141414]">
                        {draft.location.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/5">
                  {draft.location.coordinates ? (
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#666]">
                      <Compass size={13} className="text-[#737373]" />
                      <span>
                        Coordinates: {draft.location.coordinates.latitude.toFixed(5)}° N, {draft.location.coordinates.longitude.toFixed(5)}° E
                      </span>
                    </div>
                  ) : <div />}

                  {draft.location.directionsUrl && (
                    <a
                      href={draft.location.directionsUrl}
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

            {/* Nearby Verified Infrastructure */}
            {Array.isArray(draft.location.nearbyPlaces) && draft.location.nearbyPlaces.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block">
                  Sector Landmarks & Internal Verification Notes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {draft.location.nearbyPlaces.map((place) => (
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
                            {place.name || 'Unnamed Landmark'}
                          </h4>
                        </div>
                        {place.distanceValue !== null && place.distanceValue !== undefined && (
                          <span className="text-[12px] font-mono font-medium text-[#141414] shrink-0 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {place.distanceValue} {place.distanceUnit || 'km'}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-black/5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              place.status === 'Proposed / Upcoming'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-neutral-100 text-[#444]'
                            }`}
                          >
                            {place.status}
                          </span>

                          {place.sourceNote && (
                            <span
                              className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                place.isPublicSourceNote
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-neutral-100 text-[#737373]'
                              }`}
                            >
                              {place.isPublicSourceNote ? <Eye size={9} /> : <Lock size={9} />}
                              <span>{place.isPublicSourceNote ? 'Public Note' : 'Internal Only'}</span>
                            </span>
                          )}
                        </div>

                        {place.sourceNote && (
                          <p className="text-[11px] text-[#666] font-light italic bg-neutral-50 p-2 rounded-lg border border-black/5">
                            "{place.sourceNote}"
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

        {/* --- S05A: CONSTRUCTION PROGRESS LOG --- */}
        {Array.isArray(draft.progress) && draft.progress.length > 0 && (
          <section className="space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Execution Transparency
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
                Construction Progress & Timeline
              </h2>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-black/10 pl-2">
              {draft.progress.map((item) => (
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
                      {item.title || 'Untitled Milestone'}
                    </h4>

                    {item.description && (
                      <p className="text-[13px] font-light text-[#444] leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}

                    {/* Associated milestone photographs */}
                    {Array.isArray(item.photoIds) && item.photoIds.length > 0 && Array.isArray(draft.photos) && (
                      <div className="pt-3 border-t border-black/5 space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block">
                          Milestone Documentation ({item.photoIds.length} photo{item.photoIds.length > 1 ? 's' : ''})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {item.photoIds.map((pid) => {
                            const p = draft.photos?.find((photo) => photo.id === pid);
                            if (!p) return null;
                            return (
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
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Builder Consultation CTA */}
        <div className="bg-[#141414] text-white p-8 rounded-3xl space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
            Direct Developer Access
          </span>
          <h2 className="text-2xl font-light">Enquire with the Builder</h2>
          <p className="text-[13px] text-neutral-300 font-light max-w-xl">
            Speak directly with Happy Homes engineering directors for technical site walkthroughs, JDA Section 90-A legal documents, and construction timelines.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="tel:+919829012345"
              className="bg-white text-[#141414] px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-neutral-100 transition-colors"
            >
              <Phone size={13} />
              <span>Call Developer Desk</span>
            </a>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white py-6 px-6 text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
        Happy Homes Jaipur • Preview Mode
      </footer>

      {/* Accessible Image Modal / Lightbox for Floor Plans and Milestone Photographs */}
      {selectedModalImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedModalImage.title}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedModalImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
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
                aria-label="Close dialog"
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
              <span>Original Architectural Resolution</span>
              <button
                type="button"
                onClick={() => setSelectedModalImage(null)}
                className="px-4 py-1.5 rounded-full bg-[#141414] text-white hover:bg-neutral-800 uppercase tracking-wider text-[10px]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
