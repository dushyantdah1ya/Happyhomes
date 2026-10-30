import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  ExternalLink,
  Plus,
  Layers,
  FileCheck,
  Info,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  type DevelopmentFloorPlan,
  type DevelopmentBrochure,
  type DevelopmentConfiguration,
  formatBytes,
} from '../../types/development';

interface DevelopmentDocumentsEditorProps {
  developmentId: string;
  isNew: boolean;
  floorPlans: DevelopmentFloorPlan[];
  setFloorPlans: (plans: DevelopmentFloorPlan[]) => void;
  brochure: DevelopmentBrochure | null;
  setBrochure: (brochure: DevelopmentBrochure | null) => void;
  configurations: DevelopmentConfiguration[];
  markDirty: () => void;
}

export default function DevelopmentDocumentsEditor({
  developmentId,
  isNew,
  floorPlans,
  setFloorPlans,
  brochure,
  setBrochure,
  configurations,
  markDirty,
}: DevelopmentDocumentsEditorProps) {
  const { getIdToken } = useAuth();

  // Notice & error state
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Brochure upload state
  const [brochureTitle, setBrochureTitle] = useState<string>(brochure?.title || 'Official Project Brochure');
  const [brochureEditionDate, setBrochureEditionDate] = useState<string>(brochure?.editionDate || '');
  const [isUploadingBrochure, setIsUploadingBrochure] = useState<boolean>(false);
  const [brochureUploadProgress, setBrochureUploadProgress] = useState<number>(0);
  const brochureFileInputRef = useRef<HTMLInputElement>(null);

  // Floor plan upload state per plan item
  const [uploadingPlanId, setUploadingPlanId] = useState<string | null>(null);
  const [planUploadProgress, setPlanUploadProgress] = useState<number>(0);
  const planFileInputRef = useRef<HTMLInputElement>(null);
  const [targetPlanIdForUpload, setTargetPlanIdForUpload] = useState<string | null>(null);

  // --- BROCHURE HANDLERS ---

  const handleBrochureFileSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setEditorNotice(null);
    setEditorError(null);

    if (isNew) {
      setEditorError('Please save the draft overview first to establish a development ID before uploading documents.');
      return;
    }

    // 10 MiB client input check
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setEditorError(`File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a compressed PDF.`);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setEditorError('The project brochure must be a PDF document. Please select a .pdf file.');
      return;
    }

    setIsUploadingBrochure(true);
    setBrochureUploadProgress(10);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required');

      // 1. Sign upload intent on server with purpose: 'brochure'
      const signRes = await fetch('/api/admin/media/sign-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developmentId,
          purpose: 'brochure',
          format: 'pdf',
          brochureTitle: brochureTitle.trim() || 'Official Project Brochure',
          brochureEditionDate: brochureEditionDate.trim() || null,
        }),
      });

      const signPayload = await signRes.json();
      if (signRes.status !== 200 || !signPayload.success) {
        throw new Error(signPayload.message || 'Server declined to authorize brochure upload.');
      }

      setBrochureUploadProgress(35);

      // 2. Direct browser upload to Cloudinary signed endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signPayload.apiKey);
      formData.append('timestamp', String(signPayload.timestamp));
      formData.append('signature', signPayload.signature);
      formData.append('folder', signPayload.folder);
      formData.append('public_id', signPayload.publicId);
      formData.append('overwrite', 'false');
      if (signPayload.uploadPreset) {
        formData.append('upload_preset', signPayload.uploadPreset);
      }

      const cloudRes = await fetch(signPayload.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudRes.ok || cloudData.error) {
        throw new Error(cloudData.error?.message || 'Direct upload to Cloudinary failed.');
      }

      setBrochureUploadProgress(75);

      // 3. Finalize on server
      const finalRes = await fetch('/api/admin/media/finalize-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intentId: signPayload.intentId,
          developmentId,
        }),
      });

      const finalData = await finalRes.json();
      if (finalRes.status !== 200 || !finalData.success || !finalData.brochure) {
        throw new Error(finalData.message || 'Server-side verification of uploaded brochure failed.');
      }

      setBrochureUploadProgress(100);
      setBrochure(finalData.brochure);
      markDirty();
      setEditorNotice('Project brochure uploaded and verified successfully.');
    } catch (err: any) {
      console.error('[Brochure Upload Error]', err);
      setEditorError(err.message || 'Failed to upload project brochure.');
    } finally {
      setIsUploadingBrochure(false);
      setBrochureUploadProgress(0);
      if (brochureFileInputRef.current) {
        brochureFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBrochure = () => {
    markDirty();
    setBrochure(null);
    setEditorNotice('Brochure reference removed from draft. (The asset remains safely stored in Cloudinary until draft changes are saved or published).');
  };

  // --- FLOOR PLANS HANDLERS ---

  const handleAddFloorPlan = () => {
    if (floorPlans.length >= 10) {
      setEditorError('Maximum of 10 floor plans allowed per development.');
      return;
    }
    setEditorNotice(null);
    setEditorError(null);
    markDirty();

    const newPlan: DevelopmentFloorPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `Plan ${floorPlans.length + 1} Layout`,
      floor: '',
      configurationId: null,
      assetType: 'image',
      cloudinaryPublicId: '',
      url: '',
      secureUrl: '',
      format: '',
      bytes: 0,
      width: null,
      height: null,
      sortOrder: floorPlans.length,
      createdAt: new Date().toISOString(),
    };

    setFloorPlans([...floorPlans, newPlan]);
  };

  const handleRemoveFloorPlan = (planId: string) => {
    markDirty();
    setFloorPlans(floorPlans.filter((p) => p.id !== planId));
    setEditorNotice('Floor plan removed from draft.');
  };

  const handleMoveFloorPlan = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= floorPlans.length) return;
    markDirty();

    const updated = [...floorPlans];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    updated.forEach((p, i) => {
      p.sortOrder = i;
    });
    setFloorPlans(updated);
  };

  const handleTriggerPlanUpload = (planId: string) => {
    setTargetPlanIdForUpload(planId);
    if (planFileInputRef.current) {
      planFileInputRef.current.click();
    }
  };

  const handlePlanFileSelected = async (files: FileList | null) => {
    if (!files || files.length === 0 || !targetPlanIdForUpload) return;
    const file = files[0];
    const planId = targetPlanIdForUpload;
    setEditorNotice(null);
    setEditorError(null);

    if (isNew) {
      setEditorError('Please save the draft overview first to establish a development ID before uploading floor plans.');
      return;
    }

    // 10 MiB client input check
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setEditorError(`File "${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a file under 10 MB.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!allowed.includes(ext)) {
      setEditorError('Floor plans must be JPEG, PNG, WebP image or a PDF document.');
      return;
    }

    const currentPlan = floorPlans.find((p) => p.id === planId);
    if (!currentPlan) return;

    setUploadingPlanId(planId);
    setPlanUploadProgress(10);

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication required');

      // 1. Sign upload intent on server with purpose: 'floor_plan'
      const signRes = await fetch('/api/admin/media/sign-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developmentId,
          purpose: 'floor_plan',
          format: ext,
          planTitle: currentPlan.title,
          planFloor: currentPlan.floor || null,
          configurationId: currentPlan.configurationId || null,
          sortOrder: currentPlan.sortOrder,
        }),
      });

      const signPayload = await signRes.json();
      if (signRes.status !== 200 || !signPayload.success) {
        throw new Error(signPayload.message || 'Server declined to authorize floor plan upload.');
      }

      setPlanUploadProgress(35);

      // 2. Direct browser upload to Cloudinary signed endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signPayload.apiKey);
      formData.append('timestamp', String(signPayload.timestamp));
      formData.append('signature', signPayload.signature);
      formData.append('folder', signPayload.folder);
      formData.append('public_id', signPayload.publicId);
      formData.append('overwrite', 'false');
      if (signPayload.uploadPreset) {
        formData.append('upload_preset', signPayload.uploadPreset);
      }

      const cloudRes = await fetch(signPayload.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudRes.ok || cloudData.error) {
        throw new Error(cloudData.error?.message || 'Direct upload to Cloudinary failed.');
      }

      setPlanUploadProgress(75);

      // 3. Finalize on server
      const finalRes = await fetch('/api/admin/media/finalize-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intentId: signPayload.intentId,
          developmentId,
        }),
      });

      const finalData = await finalRes.json();
      if (finalRes.status !== 200 || !finalData.success || !finalData.plan) {
        throw new Error(finalData.message || 'Server verification of floor plan failed.');
      }

      setPlanUploadProgress(100);

      // Update the plan in state while retaining current user-entered title, floor, configurationId
      setFloorPlans(
        floorPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                assetType: finalData.plan.assetType,
                cloudinaryPublicId: finalData.plan.cloudinaryPublicId,
                url: finalData.plan.url,
                secureUrl: finalData.plan.secureUrl,
                format: finalData.plan.format,
                bytes: finalData.plan.bytes,
                width: finalData.plan.width,
                height: finalData.plan.height,
              }
            : p
        )
      );

      markDirty();
      setEditorNotice(`Floor plan file attached successfully (${finalData.plan.assetType === 'pdf' ? 'PDF document' : 'High-resolution image'}).`);
    } catch (err: any) {
      console.error('[Plan Upload Error]', err);
      setEditorError(err.message || 'Failed to upload floor plan file.');
    } finally {
      setUploadingPlanId(null);
      setPlanUploadProgress(0);
      setTargetPlanIdForUpload(null);
      if (planFileInputRef.current) {
        planFileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-6 sm:p-10 space-y-10 shadow-xs">
      {/* Hidden File Inputs */}
      <input
        ref={brochureFileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleBrochureFileSelected(e.target.files)}
      />
      <input
        ref={planFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => handlePlanFileSelected(e.target.files)}
      />

      {/* Notifications */}
      {editorNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[13px] text-emerald-900 leading-relaxed font-light">{editorNotice}</p>
        </div>
      )}
      {editorError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <Info size={18} className="text-rose-700 shrink-0 mt-0.5" />
          <p className="text-[13px] text-rose-900 leading-relaxed font-light">{editorError}</p>
        </div>
      )}

      {/* Section 1: Project Brochure */}
      <section className="space-y-6">
        <div className="border-b border-black/10 pb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
            Marketing Documents
          </span>
          <h3 className="text-xl font-medium text-[#141414]">Official Project Brochure</h3>
          <p className="text-[12px] text-[#666] font-light mt-0.5">
            Attach one verified PDF brochure for direct public download. Direct browser upload enforces a 10 MB limit and preserves original document integrity.
          </p>
        </div>

        {brochure ? (
          /* Attached Brochure Card */
          <div className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#141414] text-white flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-[#B5623A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-800 rounded-md font-semibold">
                      PDF Document
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      {formatBytes(brochure.bytes)}
                    </span>
                  </div>
                  <h4 className="text-[16px] font-medium text-[#141414] mt-1">
                    {brochure.title}
                  </h4>
                  {brochure.editionDate && (
                    <p className="text-[12px] font-mono text-[#666]">
                      Edition: {brochure.editionDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={brochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white border border-black/15 text-[#141414] hover:bg-neutral-50 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={12} />
                  <span>Open / Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => brochureFileInputRef.current?.click()}
                  disabled={isUploadingBrochure}
                  className="px-4 py-2 bg-[#141414] text-white hover:bg-black rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload size={12} />
                  <span>Replace PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveBrochure}
                  className="p-2 text-rose-700 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                  title="Remove brochure from draft"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Editable metadata for existing brochure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                  Brochure Display Title
                </label>
                <input
                  type="text"
                  value={brochure.title}
                  onChange={(e) => {
                    setBrochure({ ...brochure, title: e.target.value });
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                  Edition Date (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2026 Edition"
                  value={brochure.editionDate || ''}
                  onChange={(e) => {
                    setBrochure({ ...brochure, editionDate: e.target.value });
                    markDirty();
                  }}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Empty State / Upload Form */
          <div className="border border-dashed border-black/20 rounded-2xl p-6 sm:p-8 space-y-4 bg-[#FAFAFA]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                  Brochure Title *
                </label>
                <input
                  type="text"
                  value={brochureTitle}
                  onChange={(e) => setBrochureTitle(e.target.value)}
                  placeholder="e.g. Official Project Brochure"
                  className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                  Edition Date (Optional)
                </label>
                <input
                  type="text"
                  value={brochureEditionDate}
                  onChange={(e) => setBrochureEditionDate(e.target.value)}
                  placeholder="e.g. October 2026"
                  className="w-full px-3.5 py-2 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black"
                />
              </div>
            </div>

            <div
              onClick={() => {
                if (!isUploadingBrochure) brochureFileInputRef.current?.click();
              }}
              className="border-2 border-dashed border-black/15 hover:border-black/40 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white space-y-2"
            >
              {isUploadingBrochure ? (
                <div className="space-y-3">
                  <Loader2 size={24} className="animate-spin mx-auto text-[#B5623A]" />
                  <p className="text-[13px] text-[#141414] font-medium">Uploading & Verifying PDF ({brochureUploadProgress}%)...</p>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-[#666]" />
                  <p className="text-[13px] font-medium text-[#141414]">Click to upload brochure PDF</p>
                  <p className="text-[11px] font-mono text-[#888]">PDF only • Max 10 MB • Direct signed Cloudinary transfer</p>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Floor Plans */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
              Architectural Layouts
            </span>
            <h3 className="text-xl font-medium text-[#141414]">Floor Plans & Blueprints</h3>
            <p className="text-[12px] text-[#666] font-light mt-0.5">
              Attach up to 10 named floor plans. Each entry accepts a crisp JPEG/PNG/WebP image or PDF document with an optional floor label and configuration link.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddFloorPlan}
            disabled={floorPlans.length >= 10}
            className="bg-[#141414] hover:bg-black text-white px-5 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Plus size={14} />
            <span>Add Floor Plan ({floorPlans.length}/10)</span>
          </button>
        </div>

        {floorPlans.length === 0 ? (
          <div className="py-12 border border-dashed border-black/15 rounded-2xl text-center space-y-3">
            <Layers size={28} className="mx-auto text-[#AAA]" />
            <p className="text-[13px] text-[#666] font-light">No floor plans attached yet.</p>
            <button
              type="button"
              onClick={handleAddFloorPlan}
              className="inline-flex items-center gap-1.5 border border-black/20 text-[#141414] px-4 py-1.5 rounded-full text-[11px] font-mono uppercase hover:bg-neutral-50"
            >
              <Plus size={12} />
              <span>Create First Floor Plan</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {floorPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-5 space-y-4"
              >
                {/* Header row with ordering and deletion */}
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#888]">#{idx + 1}</span>
                    <span className="text-[13px] font-medium text-[#141414]">{plan.title || 'Untitled Plan'}</span>
                    {plan.cloudinaryPublicId && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                        <FileCheck size={10} /> Attached ({plan.assetType.toUpperCase()})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveFloorPlan(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveFloorPlan(idx, 'down')}
                      disabled={idx === floorPlans.length - 1}
                      className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFloorPlan(plan.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer ml-1"
                      title="Remove plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                      Descriptive Title *
                    </label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) => {
                        const updated = [...floorPlans];
                        updated[idx].title = e.target.value;
                        setFloorPlans(updated);
                        markDirty();
                      }}
                      placeholder="e.g. Ground Floor Layout"
                      className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                      Floor Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={plan.floor || ''}
                      onChange={(e) => {
                        const updated = [...floorPlans];
                        updated[idx].floor = e.target.value;
                        setFloorPlans(updated);
                        markDirty();
                      }}
                      placeholder="e.g. Ground Floor, First Floor"
                      className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-xl text-[13px] outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                      Link Configuration (Optional)
                    </label>
                    <select
                      value={plan.configurationId || ''}
                      onChange={(e) => {
                        const updated = [...floorPlans];
                        updated[idx].configurationId = e.target.value || null;
                        setFloorPlans(updated);
                        markDirty();
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-xl text-[12px] font-mono outline-none focus:border-black cursor-pointer"
                    >
                      <option value="">General / None</option>
                      {configurations.map((cfg) => (
                        <option key={cfg.id} value={cfg.id}>
                          {cfg.label} {cfg.floor ? `(${cfg.floor})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attached File Inspector or Upload Action */}
                {plan.cloudinaryPublicId ? (
                  <div className="bg-white border border-black/10 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {plan.assetType === 'pdf' ? (
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-black/10">
                          <img
                            src={plan.url}
                            alt={plan.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#141414]">
                            {plan.assetType === 'pdf' ? 'PDF Document' : `Image (${plan.format.toUpperCase()})`}
                          </span>
                          <span className="text-[11px] font-mono text-[#737373]">
                            {formatBytes(plan.bytes)}
                          </span>
                        </div>
                        {plan.width && plan.height && (
                          <p className="text-[10px] font-mono text-[#888]">
                            {plan.width} × {plan.height} px
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={plan.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#FAFAFA] hover:bg-neutral-100 border border-black/10 text-[#141414] rounded-lg text-[11px] font-mono uppercase flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={11} />
                        <span>View</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleTriggerPlanUpload(plan.id)}
                        disabled={uploadingPlanId === plan.id}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#141414] rounded-lg text-[11px] font-mono uppercase transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {uploadingPlanId === plan.id ? 'Uploading...' : 'Replace File'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTriggerPlanUpload(plan.id)}
                    disabled={uploadingPlanId === plan.id}
                    className="w-full py-4 border-2 border-dashed border-black/15 hover:border-black/40 rounded-xl bg-white text-center cursor-pointer transition-colors space-y-1"
                  >
                    {uploadingPlanId === plan.id ? (
                      <div className="flex items-center justify-center gap-2 text-[12px] font-mono text-[#B5623A]">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Uploading Plan ({planUploadProgress}%)...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#141414]">
                          <Upload size={14} />
                          <span>Attach File (JPEG, PNG, WebP or PDF)</span>
                        </div>
                        <p className="text-[10px] font-mono text-[#888]">Max 10 MB • Signed upload</p>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cloudinary PDF Delivery Advisory Banner */}
      <div className="p-4 bg-neutral-50 border border-black/10 rounded-2xl flex items-start gap-3">
        <Info size={16} className="text-[#B5623A] shrink-0 mt-0.5" />
        <div className="text-[12px] text-[#555] font-light leading-relaxed space-y-1">
          <p className="font-medium text-[#141414]">Cloudinary PDF Delivery Setup Notice:</p>
          <p>
            PDF documents are uploaded securely under the signed <code className="font-mono text-[#141414]">happy_homes_documents</code> preset. In Cloudinary Console under <strong>Settings → Security → Restricted media types</strong>, ensure <strong>"PDF and ZIP files delivery"</strong> is unchecked/enabled so visitors can download PDF floor plans and brochures directly.
          </p>
        </div>
      </div>
    </div>
  );
}
