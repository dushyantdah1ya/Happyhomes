import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Camera,
  Star,
  RefreshCw,
  Info,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  type DevelopmentPhoto,
  type PhotoLabel,
  type ProgressUpdate,
  getOptimizedImageUrl,
} from '../../types/development';

interface DevelopmentPhotosEditorProps {
  photos: DevelopmentPhoto[];
  setPhotos: React.Dispatch<React.SetStateAction<DevelopmentPhoto[]>>;
  developmentId: string;
  isNew: boolean;
  markDirty: () => void;
  getIdToken: () => Promise<string | null>;
  onSaveDraftFirst: () => void;
  progressUpdates?: ProgressUpdate[];
  setProgressUpdates?: React.Dispatch<React.SetStateAction<ProgressUpdate[]>>;
}

interface UploadQueueItem {
  id: string;
  file: File;
  label: PhotoLabel;
  altText: string;
  progress: number;
  status: 'pending' | 'resizing' | 'signing' | 'uploading' | 'finalizing' | 'success' | 'error';
  errorMessage?: string;
}

/**
 * Resizes an image file in the browser if its long edge exceeds 2400px,
 * maintaining aspect ratio without any AI alterations or external service calls.
 */
async function resizeImageClientSide(file: File): Promise<Blob> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported format: ${file.type || 'unknown'}. Allowed formats: JPEG, PNG, WebP only.`);
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`File "${file.name}" exceeds maximum allowed size of 10 MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        const { width, height } = img;
        const maxEdge = 2400;

        // If both dimensions are within limit, return original file blob
        if (width <= maxEdge && height <= maxEdge) {
          resolve(file);
          return;
        }

        const scale = Math.min(maxEdge / width, maxEdge / height);
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.92
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function DevelopmentPhotosEditor({
  photos,
  setPhotos,
  developmentId,
  isNew,
  markDirty,
  getIdToken,
  onSaveDraftFirst,
  progressUpdates = [],
  setProgressUpdates,
}: DevelopmentPhotosEditorProps) {
  const [cloudinaryConfig, setCloudinaryConfig] = useState<{
    isConfigured: boolean;
    cloudName: string | null;
    hasApiKey: boolean;
    hasApiSecret: boolean;
    hasPreset: boolean;
    presetName?: string | null;
    connected?: boolean;
    presetVerified?: boolean;
    allowedFormats?: string[];
    overwriteDisabled?: boolean;
  } | null>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Upload state
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [defaultLabel, setDefaultLabel] = useState<PhotoLabel>('Actual photograph');
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [removalConflict, setRemovalConflict] = useState<{
    photoId: string;
    referencingCount: number;
    referencingTitles: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check Cloudinary configuration on mount
  useEffect(() => {
    const checkConfig = async () => {
      setConfigLoading(true);
      setConfigError(null);
      try {
        const token = await getIdToken();
        if (!token) return;

        const res = await fetch('/api/admin/media/config', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.config) {
          setCloudinaryConfig(data.config);
        } else {
          setConfigError(data.message || 'Failed to verify media configuration.');
        }
      } catch (err: any) {
        setConfigError(err.message || 'Network error verifying Cloudinary configuration.');
      } finally {
        setConfigLoading(false);
      }
    };

    checkConfig();
  }, [getIdToken]);

  // Handle file selection from input or drop
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setEditorNotice(null);

    if (isNew) {
      setEditorNotice('Please save the draft overview first to establish a development ID before uploading photographs.');
      return;
    }

    const currentCount = photos.length + uploadQueue.filter((q) => q.status !== 'error').length;
    if (currentCount >= 20) {
      setEditorNotice('Maximum limit of 20 photographs per development has been reached.');
      return;
    }

    const availableSlots = 20 - currentCount;
    const fileArray = Array.from(files).slice(0, availableSlots);

    const newQueueItems: UploadQueueItem[] = [];

    for (const file of fileArray) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setEditorNotice(`File "${file.name}" has unsupported format (${file.type || 'unknown'}). Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setEditorNotice(`File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        continue;
      }

      newQueueItems.push({
        id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        label: defaultLabel,
        altText: '',
        progress: 0,
        status: 'pending',
      });
    }

    if (newQueueItems.length > 0) {
      setUploadQueue((prev) => [...prev, ...newQueueItems]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process upload queue items sequentially or concurrently
  useEffect(() => {
    const processQueue = async () => {
      const pendingItem = uploadQueue.find((item) => item.status === 'pending');
      if (!pendingItem || isUploading) return;

      setIsUploading(true);

      const updateItem = (status: UploadQueueItem['status'], progress: number, error?: string) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === pendingItem.id ? { ...item, status, progress, errorMessage: error } : item
          )
        );
      };

      try {
        const token = await getIdToken();
        if (!token) throw new Error('Authentication required for signed upload.');

        // 1. Client-side resize / validation
        updateItem('resizing', 10);
        const processedBlob = await resizeImageClientSide(pendingItem.file);

        // 2. Request server signature
        updateItem('signing', 25);
        const signRes = await fetch('/api/admin/media/sign-upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developmentId,
            label: pendingItem.label,
            altText: pendingItem.altText,
            sortOrder: photos.length,
          }),
        });

        const signData = await signRes.json();
        if (!signRes.ok || !signData.success) {
          throw new Error(signData.message || 'Failed to sign upload intent.');
        }

        const {
          intentId,
          uploadUrl,
          apiKey,
          timestamp,
          signature,
          folder,
          publicId,
          uploadPreset,
        } = signData;

        // 3. Direct browser upload to Cloudinary
        updateItem('uploading', 40);
        const formData = new FormData();
        formData.append('file', processedBlob, pendingItem.file.name);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', folder);
        formData.append('public_id', publicId);
        formData.append('overwrite', 'false');
        if (uploadPreset) {
          formData.append('upload_preset', uploadPreset);
        }

        const cloudinaryRes = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!cloudinaryRes.ok) {
          const cloudErr = await cloudinaryRes.json().catch(() => ({}));
          throw new Error(cloudErr.error?.message || 'Direct upload to Cloudinary failed.');
        }

        // 4. Finalize & verify asset on server
        updateItem('finalizing', 90);
        const finalizeRes = await fetch('/api/admin/media/finalize-upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intentId,
            developmentId,
          }),
        });

        const finalizeData = await finalizeRes.json();
        if (!finalizeRes.ok || !finalizeData.success || !finalizeData.photo) {
          throw new Error(finalizeData.message || 'Failed to verify uploaded asset on server.');
        }

        const verifiedPhoto: DevelopmentPhoto = finalizeData.photo;

        // Add to draft photos
        markDirty();
        setPhotos((prev) => {
          const updated = [...prev, verifiedPhoto];
          // Ensure first photo is cover if no cover exists
          if (!updated.some((p) => p.isCover)) {
            updated[0].isCover = true;
          }
          return updated;
        });

        // Remove from upload queue on success
        setUploadQueue((prev) => prev.filter((item) => item.id !== pendingItem.id));
      } catch (err: any) {
        console.error('[Upload error]', err);
        updateItem('error', 0, err.message || 'Upload failed.');
      } finally {
        setIsUploading(false);
      }
    };

    processQueue();
  }, [uploadQueue, isUploading, developmentId, getIdToken, photos.length, markDirty, setPhotos]);

  // Gallery ordering & management
  const handleSetCover = (photoId: string) => {
    markDirty();
    setPhotos(
      photos.map((p) => ({
        ...p,
        isCover: p.id === photoId,
      }))
    );
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    // update sortOrder values
    const reordered = updated.map((p, idx) => ({ ...p, sortOrder: idx }));
    setPhotos(reordered);
  };

  const handleRemovePhoto = (photoId: string) => {
    const referencingUpdates = (progressUpdates || []).filter((u) => u.photoIds?.includes(photoId));
    if (referencingUpdates.length > 0) {
      setRemovalConflict({
        photoId,
        referencingCount: referencingUpdates.length,
        referencingTitles: referencingUpdates.map((u) => u.title || 'Untitled Update'),
      });
      return;
    }
    executeRemovePhoto(photoId);
  };

  const executeRemovePhoto = (photoId: string, detachFromUpdates = false) => {
    markDirty();
    if (detachFromUpdates && setProgressUpdates) {
      setProgressUpdates((prev) =>
        prev.map((u) => ({
          ...u,
          photoIds: (u.photoIds || []).filter((id) => id !== photoId),
        }))
      );
    }
    const remaining = photos.filter((p) => p.id !== photoId);
    if (remaining.length > 0 && !remaining.some((p) => p.isCover)) {
      remaining[0].isCover = true;
    }
    setPhotos(remaining);
    setRemovalConflict(null);
    setEditorNotice(
      detachFromUpdates
        ? 'Photograph detached from construction updates and removed from draft gallery.'
        : 'Photograph removed from draft gallery. Click Save Draft or Publish Changes to update.'
    );
  };

  const handleUpdatePhotoField = (photoId: string, field: 'altText' | 'label', value: string) => {
    markDirty();
    setPhotos(
      photos.map((p) =>
        p.id === photoId
          ? {
              ...p,
              [field]: field === 'label' ? (value as PhotoLabel) : value.slice(0, 200),
            }
          : p
      )
    );
  };

  const handleRetryItem = (itemId: string) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: 'pending', errorMessage: undefined } : item))
    );
  };

  const handleRemoveQueueItem = (itemId: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
      {/* Removal Conflict Banner (Attached to Construction Updates) */}
      {removalConflict && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-700 shrink-0 mt-0.5" />
            <div className="text-[13px] text-rose-950 font-light space-y-1">
              <p className="font-medium text-rose-900">
                This photograph cannot be deleted directly because it is associated with {removalConflict.referencingCount} construction milestone(s):
              </p>
              <p className="text-[12px] font-mono text-rose-800">
                {removalConflict.referencingTitles.map((t) => `"${t}"`).join(', ')}
              </p>
              <p className="text-[12px] text-rose-900">
                Would you like to detach it from those construction updates and remove it from the gallery?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-rose-200/60 justify-end">
            <button
              type="button"
              onClick={() => setRemovalConflict(null)}
              className="px-4 py-1.5 rounded-full border border-rose-300 text-[11px] font-mono uppercase text-rose-900 hover:bg-rose-100 cursor-pointer"
            >
              Keep in Gallery
            </button>
            <button
              type="button"
              onClick={() => executeRemovePhoto(removalConflict.photoId, true)}
              className="px-4 py-1.5 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-mono uppercase cursor-pointer"
            >
              Detach from Updates & Remove
            </button>
          </div>
        </div>
      )}

      {/* Inline Notification Banner */}
      {editorNotice && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-3 text-[12px] text-orange-950">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[#B5623A] shrink-0" />
            <span>{editorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditorNotice(null)}
            className="text-orange-900 hover:text-black p-1 cursor-pointer"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Section Header & Public Marketing Notice */}
      <div className="space-y-2 border-b border-black/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
              Media & Visual Assets
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#141414]">
              Development Photography Gallery ({photos.length} / 20)
            </h2>
            {cloudinaryConfig?.connected && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-900 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Cloudinary Connected • Preset: {cloudinaryConfig.presetName || 'default'} ({cloudinaryConfig.allowedFormats?.join(', ') || 'jpg, jpeg, png, webp'})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
              Default Type:
            </span>
            <select
              value={defaultLabel}
              onChange={(e) => setDefaultLabel(e.target.value as PhotoLabel)}
              className="bg-neutral-50 border border-black/15 text-[11px] font-mono uppercase px-3 py-1.5 rounded-xl text-[#141414] focus:outline-none focus:border-black"
            >
              <option value="Actual photograph">Actual photograph</option>
              <option value="Architectural visualization">Architectural visualization</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 bg-neutral-50 border border-black/5 rounded-2xl flex items-start gap-2.5 text-[12px] text-[#555] leading-relaxed">
          <Info size={16} className="text-[#B5623A] shrink-0 mt-0.5" />
          <p>
            <strong>Public Marketing Media:</strong> Photographs uploaded here are public visual presentations. An unpublished draft stays off the public website, but direct Cloudinary delivery URLs are web-accessible. Do not upload private customer documents, sale deeds, or confidential buyer communications.
          </p>
        </div>
      </div>

      {/* Cloudinary Setup Notice if unconfigured */}
      {!configLoading && cloudinaryConfig && !cloudinaryConfig.isConfigured && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
          <div className="flex items-center gap-2 font-medium text-[13px]">
            <AlertTriangle size={18} className="text-amber-700 shrink-0" />
            <span>Cloudinary Media Storage Not Configured</span>
          </div>
          <p className="text-[12px] leading-relaxed text-amber-900">
            To enable photograph uploads, configure your Cloudinary credentials in <strong>AI Studio Settings → Secrets / Environment Variables</strong>:
          </p>
          <ul className="text-[11px] font-mono list-disc pl-5 space-y-1 text-amber-900">
            <li><code>CLOUDINARY_CLOUD_NAME</code> (Your Cloudinary cloud name)</li>
            <li><code>CLOUDINARY_API_KEY</code> (Your Cloudinary API key)</li>
            <li><code>CLOUDINARY_API_SECRET</code> (Your Cloudinary API secret)</li>
            <li><code>CLOUDINARY_UPLOAD_PRESET</code> (Optional: signed preset if required by your account)</li>
          </ul>
          <p className="text-[11px] text-amber-800 pt-1">
            * Note: Do NOT use unsigned presets. All direct uploads use server-signed SHA signatures for strict security.
          </p>
        </div>
      )}

      {/* Development ID Guard: Must save draft first */}
      {isNew && (
        <div className="p-6 bg-[#FAFAFA] border border-dashed border-black/20 rounded-2xl text-center space-y-3">
          <Camera size={28} className="text-[#888] mx-auto" />
          <h3 className="text-base font-medium text-[#141414]">Save Draft Before Uploading Photographs</h3>
          <p className="text-[13px] text-[#666] max-w-md mx-auto">
            Direct uploads are securely scoped to this specific development. Please save your draft overview first to establish a stable development ID.
          </p>
          <button
            onClick={onSaveDraftFirst}
            className="bg-[#141414] hover:bg-black text-white px-5 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Save Draft Overview First
          </button>
        </div>
      )}

      {/* Upload Zone (Enabled if saved and configured) */}
      {!isNew && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black/15 hover:border-black/35 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3 bg-[#FAFAFA] hover:bg-neutral-50 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="p-3 bg-white rounded-full border border-black/10 shadow-2xs group-hover:scale-105 transition-transform">
              <Upload size={22} className="text-[#B5623A]" />
            </div>

            <div>
              <p className="text-[14px] font-medium text-[#141414]">
                Click to browse or drag & drop photographs here
              </p>
              <p className="text-[11px] font-mono text-[#737373] mt-1">
                JPEG, PNG, or WebP • Max 10 MB each • Max 20 gallery photographs • High-res images auto-optimized to 2400px
              </p>
            </div>
          </div>

          {/* Active Upload Queue Items */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2 p-4 bg-neutral-50 border border-black/10 rounded-2xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] block mb-2">
                Upload Queue ({uploadQueue.length} items)
              </span>

              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl text-[12px]"
                >
                  <div className="flex items-center gap-3 truncate max-w-md">
                    {item.status === 'error' ? (
                      <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                    ) : item.status === 'success' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Loader2 size={15} className="animate-spin text-[#B5623A] shrink-0" />
                    )}
                    <span className="truncate font-mono">{item.file.name}</span>
                    <span className="text-[10px] font-mono text-[#888] uppercase shrink-0">
                      ({(item.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#737373]">
                      {item.status === 'resizing' && 'Optimizing...'}
                      {item.status === 'signing' && 'Authorizing...'}
                      {item.status === 'uploading' && 'Uploading bytes...'}
                      {item.status === 'finalizing' && 'Verifying...'}
                      {item.status === 'error' && (
                        <span className="text-rose-600">{item.errorMessage || 'Failed'}</span>
                      )}
                    </span>

                    {item.status === 'error' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRetryItem(item.id)}
                          className="p-1 text-[#666] hover:text-[#141414] rounded-md transition-colors cursor-pointer"
                          title="Retry"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1 text-[#666] hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Draft Gallery ({photos.length} items)
          </span>
          {photos.length > 0 && (
            <span className="text-[10px] font-mono text-[#888]">
              Cover photograph is displayed as the primary hero image
            </span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="p-8 text-center bg-[#FAFAFA] border border-dashed border-black/10 rounded-2xl text-[12px] text-[#737373]">
            No photographs uploaded to this development yet. Uploaded images will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`bg-[#FAFAFA] border rounded-2xl p-4 space-y-3 transition-all ${
                  photo.isCover ? 'border-[#B5623A] ring-1 ring-[#B5623A]/30 bg-orange-50/20' : 'border-black/10'
                }`}
              >
                {/* Thumbnail & Actions Bar */}
                <div className="flex gap-4">
                  <div className="relative aspect-4/3 w-32 shrink-0 rounded-xl overflow-hidden bg-neutral-200 border border-black/10 shadow-2xs">
                    <img
                      src={getOptimizedImageUrl(photo.secureUrl || photo.url, 300)}
                      alt={photo.altText || 'Development thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {photo.isCover && (
                      <span className="absolute top-1 left-1 bg-[#B5623A] text-white text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold">
                        Cover
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="truncate">
                        <span className="text-[10px] font-mono text-[#888] block">
                          #{index + 1} • {photo.width} × {photo.height} px
                        </span>
                        <span className="text-[10px] font-mono uppercase text-[#737373]">
                          {photo.format.toUpperCase()} • {(photo.bytes / 1024).toFixed(0)} KB
                        </span>
                      </div>

                      {/* Cover Toggle Button */}
                      {!photo.isCover ? (
                        <button
                          type="button"
                          onClick={() => handleSetCover(photo.id)}
                          className="border border-black/15 hover:border-black/40 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full text-[#666] hover:text-[#141414] transition-colors cursor-pointer shrink-0"
                        >
                          Set as Cover
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono uppercase text-[#B5623A] font-semibold shrink-0">
                          Primary Cover
                        </span>
                      )}
                    </div>

                    {/* Label Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-[#737373] block">
                        Media Classification
                      </label>
                      <select
                        value={photo.label}
                        onChange={(e) => handleUpdatePhotoField(photo.id, 'label', e.target.value)}
                        className="w-full bg-white border border-black/10 text-[11px] font-mono rounded-lg px-2 py-1 text-[#141414] focus:outline-none focus:border-black"
                      >
                        <option value="Actual photograph">Actual photograph</option>
                        <option value="Architectural visualization">Architectural visualization</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Alt Text / Caption Field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-[#737373] block">
                    Accessibility Alt Text / Description (max 200 chars)
                  </label>
                  <input
                    type="text"
                    value={photo.altText}
                    onChange={(e) => handleUpdatePhotoField(photo.id, 'altText', e.target.value)}
                    placeholder="e.g. Master suite balcony overlooking landscaped sector avenue"
                    className="w-full bg-white border border-black/10 rounded-xl px-3 py-1.5 text-[12px] text-[#141414] placeholder:text-[#AAA] focus:outline-none focus:border-black"
                  />
                </div>

                {/* Ordering & Remove Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMovePhoto(index, 'up')}
                      className="p-1 rounded-md text-[#666] hover:text-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === photos.length - 1}
                      onClick={() => handleMovePhoto(index, 'down')}
                      className="p-1 rounded-md text-[#666] hover:text-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <span className="text-[10px] font-mono text-[#888] ml-1">
                      Position: {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Remove from Draft</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-50 rounded-2xl border border-black/5 text-[11px] font-mono text-[#737373] leading-relaxed">
        * Staged edits note: Adding, reordering, editing alt text, and removing photographs are saved to your working draft. They will become live on the public website only after clicking <strong>Publish Changes</strong>.
      </div>
    </div>
  );
}
