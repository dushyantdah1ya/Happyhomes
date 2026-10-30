import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Building,
  Camera,
  Layers,
} from 'lucide-react';
import {
  type DevelopmentPhoto,
  type DevelopmentPhotoPublic,
  type DevelopmentImage,
  getOptimizedImageUrl,
  getCloudinarySrcSet,
} from '../types/development';

export interface DevelopmentGalleryProps {
  photos?: (DevelopmentPhoto | DevelopmentPhotoPublic)[];
  legacyImage?: DevelopmentImage | null;
  developmentName: string;
  isPrivatePreview?: boolean;
}

export default function DevelopmentGallery({
  photos = [],
  legacyImage = null,
  developmentName,
  isPrivatePreview = false,
}: DevelopmentGalleryProps) {
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  // Active cover photo & secondary items
  const sortedPhotos = hasPhotos ? [...photos].sort((a, b) => a.sortOrder - b.sortOrder) : [];
  const coverPhoto = sortedPhotos.find((p) => p.isCover) || sortedPhotos[0];
  const secondaryPhotos = sortedPhotos.filter((p) => p.id !== coverPhoto?.id);

  // Enlarged viewer modal state
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const openLightbox = (index: number, e?: React.MouseEvent) => {
    if (e) {
      triggerRef.current = e.currentTarget as HTMLElement;
    }
    setActiveModalIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveModalIndex(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, []);

  const showNext = useCallback(() => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((prev) => (prev! + 1) % sortedPhotos.length);
  }, [activeModalIndex, sortedPhotos.length]);

  const showPrev = useCallback(() => {
    if (activeModalIndex === null) return;
    setActiveModalIndex((prev) => (prev! - 1 + sortedPhotos.length) % sortedPhotos.length);
  }, [activeModalIndex, sortedPhotos.length]);

  // Keyboard navigation & accessibility for lightbox
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeModalIndex, closeLightbox, showNext, showPrev]);

  // Fallback 1: Legacy Image Presentation
  if (!hasPhotos && legacyImage && legacyImage.url) {
    return (
      <section aria-label="Development photography" className="space-y-3">
        <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden border border-black/10 bg-neutral-100 shadow-sm">
          <img
            src={getOptimizedImageUrl(legacyImage.url, 1600)}
            srcSet={getCloudinarySrcSet(legacyImage.url)}
            sizes="(max-width: 1024px) 100vw, 1200px"
            alt={legacyImage.altText || developmentName}
            width={1200}
            height={675}
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full">
              {legacyImage.label}
            </span>
          </div>
        </div>
      </section>
    );
  }

  // Fallback 2: Placeholder when no media uploaded
  if (!hasPhotos) {
    return (
      <div className="aspect-16/9 w-full rounded-3xl border border-dashed border-black/15 bg-white flex flex-col items-center justify-center text-[#888] gap-2 p-8 text-center shadow-xs">
        <Building size={32} className="text-[#AAA]" />
        <span className="text-[12px] font-mono uppercase tracking-wider text-[#141414]">
          Architectural Photography Pending
        </span>
        <span className="text-[11px] text-[#737373] max-w-sm">
          High-resolution architectural photography is captured on-site and published as construction milestones progress.
        </span>
      </div>
    );
  }

  const activePhotoInModal = activeModalIndex !== null ? sortedPhotos[activeModalIndex] : null;

  return (
    <section aria-label="Development photograph gallery" className="space-y-6">
      {/* Featured Cover Photograph */}
      <div className="relative aspect-16/9 w-full rounded-3xl overflow-hidden border border-black/10 bg-neutral-100 shadow-sm group">
        <img
          src={getOptimizedImageUrl(coverPhoto.secureUrl || coverPhoto.url, 1600)}
          srcSet={getCloudinarySrcSet(coverPhoto.secureUrl || coverPhoto.url)}
          sizes="(max-width: 1024px) 100vw, 1200px"
          alt={coverPhoto.altText || `${developmentName} cover view`}
          width={coverPhoto.width || 1600}
          height={coverPhoto.height || 900}
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
        />

        {/* Labels & Tags */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
          <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Camera size={11} className="text-[#B5623A]" />
            <span>{coverPhoto.label}</span>
          </span>

          <span className="bg-white/90 backdrop-blur-xs text-[#141414] text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-black/10 font-semibold shadow-sm">
            Cover View
          </span>

          {isPrivatePreview && (
            <span className="bg-amber-500 text-white text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shadow-sm">
              Preview
            </span>
          )}
        </div>

        {/* Zoom trigger overlay button */}
        <button
          onClick={(e) => openLightbox(sortedPhotos.indexOf(coverPhoto), e)}
          className="absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={`Enlarge cover photograph for ${developmentName}`}
        >
          <Maximize2 size={12} />
          <span className="hidden sm:inline">Enlarge View</span>
        </button>
      </div>

      {/* Secondary Gallery Grid */}
      {secondaryPhotos.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373]">
              Additional Perspectives ({secondaryPhotos.length})
            </span>
            <span className="text-[10px] font-mono text-[#A5A5A5]">
              Click any image to view high-resolution gallery
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {secondaryPhotos.map((photo) => {
              const fullIndex = sortedPhotos.indexOf(photo);
              return (
                <button
                  key={photo.id}
                  onClick={(e) => openLightbox(fullIndex, e)}
                  className="relative aspect-4/3 rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 shadow-2xs group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#141414] text-left"
                  aria-label={`View enlarged photograph: ${photo.altText || photo.label}`}
                >
                  <img
                    src={getOptimizedImageUrl(photo.secureUrl || photo.url, 640)}
                    srcSet={getCloudinarySrcSet(photo.secureUrl || photo.url, [320, 640, 960])}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={photo.altText || `${developmentName} architectural view`}
                    width={photo.width || 640}
                    height={photo.height || 480}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {photo.label === 'Actual photograph' ? 'Actual' : 'Visualization'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Enlarged Accessible Lightbox Modal */}
      {activeModalIndex !== null && activePhotoInModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged view of ${developmentName} photograph ${activeModalIndex + 1} of ${sortedPhotos.length}`}
          className="fixed inset-0 z-50 bg-[#141414]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Top Bar with Counter, Label, and Close */}
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#B5623A] font-semibold">
                Photo {activeModalIndex + 1} of {sortedPhotos.length}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">
                {activePhotoInModal.label}
              </span>
              {activePhotoInModal.isCover && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                  Cover
                </span>
              )}
            </div>

            <button
              ref={closeButtonRef}
              onClick={closeLightbox}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close enlarged photograph viewer (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Stage: Image and Left/Right Nav */}
          <div className="relative max-w-6xl w-full mx-auto flex-1 flex items-center justify-center my-4 overflow-hidden">
            {sortedPhotos.length > 1 && (
              <button
                onClick={showPrev}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous photograph (Left arrow)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="max-h-[75vh] max-w-full flex flex-col items-center justify-center">
              <img
                src={getOptimizedImageUrl(activePhotoInModal.secureUrl || activePhotoInModal.url, 1920)}
                srcSet={getCloudinarySrcSet(activePhotoInModal.secureUrl || activePhotoInModal.url)}
                sizes="90vw"
                alt={activePhotoInModal.altText || `${developmentName} photograph ${activeModalIndex + 1}`}
                width={activePhotoInModal.width || 1920}
                height={activePhotoInModal.height || 1080}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {sortedPhotos.length > 1 && (
              <button
                onClick={showNext}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next photograph (Right arrow)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Bar: Alt Text / Caption & Dimensions */}
          <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between text-neutral-400 text-[11px] font-mono border-t border-white/10 pt-4 gap-2">
            <span className="text-white text-[12px] font-light max-w-xl truncate">
              {activePhotoInModal.altText || `${developmentName} • Architectural Estate Presentation`}
            </span>
            <div className="flex items-center gap-4 text-[#888]">
              {activePhotoInModal.width && activePhotoInModal.height ? (
                <span>
                  {activePhotoInModal.width} × {activePhotoInModal.height} px ({activePhotoInModal.format.toUpperCase()})
                </span>
              ) : null}
              <span>Use Arrow Keys or Esc</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
