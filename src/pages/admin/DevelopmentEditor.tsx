import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Trash2,
  EyeOff,
  Building,
  Plus,
  ArrowUp,
  ArrowDown,
  MapPin,
  Clock,
  Layers,
  ListChecks,
  Compass,
} from 'lucide-react';
import Logo from '../../components/Logo';
import DevelopmentPhotosEditor from './DevelopmentPhotosEditor';
import DevelopmentDocumentsEditor from './DevelopmentDocumentsEditor';
import UnusedUploadsPanel from '../../components/admin/UnusedUploadsPanel';
import { useAuth } from '../../context/AuthContext';
import {
  type DevelopmentDraft,
  type DevelopmentPhoto,
  type DevelopmentFloorPlan,
  type DevelopmentBrochure,
  type DevelopmentType,
  type PriceMode,
  type AvailabilityStatus,
  type ConstructionStage,
  type AreaDefinition,
  type AreaUnit,
  type ImageLabel,
  type SpecificationGroup,
  type SpecificationItem,
  type SpecificationType,
  type DevelopmentConfiguration,
  type NearbyPlace,
  type NearbyPlaceStatus,
  type ProgressUpdate,
  type ProgressUpdateStage,
  generateSlug,
  formatINR,
  formatPriceDisplay,
} from '../../types/development';

export default function DevelopmentEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const { user, isOwner, loading: authLoading, getIdToken } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'documents' | 'specifications' | 'configurations' | 'location' | 'progress' | 'cleanup'>('overview');

  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // --- Overview Fields ---
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [type, setType] = useState<DevelopmentType>('Villa');
  const [locality, setLocality] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [priceMode, setPriceMode] = useState<PriceMode>('exact');
  const [priceAmount, setPriceAmount] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available');
  const [constructionStage, setConstructionStage] = useState<ConstructionStage>('Under construction');
  
  // Area Specs
  const [hasArea, setHasArea] = useState<boolean>(false);
  const [areaValue, setAreaValue] = useState<string>('');
  const [areaDefinition, setAreaDefinition] = useState<AreaDefinition>('built-up');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sq ft');

  // Bedrooms (for homes only)
  const [bedrooms, setBedrooms] = useState<string>('');

  // Image
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [imageLabel, setImageLabel] = useState<ImageLabel>('Architectural render');

  // S05B1: Photos gallery
  const [photos, setPhotos] = useState<DevelopmentPhoto[]>([]);

  // S05B2: Floor Plans & Brochure
  const [floorPlans, setFloorPlans] = useState<DevelopmentFloorPlan[]>([]);
  const [brochure, setBrochure] = useState<DevelopmentBrochure | null>(null);

  // --- S05A: Structured Content Fields ---
  const [specifications, setSpecifications] = useState<SpecificationGroup[]>([]);
  const [configurations, setConfigurations] = useState<DevelopmentConfiguration[]>([]);
  
  // Location
  const [address, setAddress] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [directionsUrl, setDirectionsUrl] = useState<string>('');
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);

  // Progress
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);

  // Metadata from existing draft
  const [currentDraft, setCurrentDraft] = useState<DevelopmentDraft | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [authLoading, user, isOwner, navigate]);

  // Load existing draft if editing
  useEffect(() => {
    if (isNew) return;

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
          const dev: DevelopmentDraft = data.development;
          setCurrentDraft(dev);
          setName(dev.name || '');
          setSlug(dev.slug || '');
          setType(dev.type || 'Villa');
          setLocality(dev.locality || '');
          setShortDescription(dev.shortDescription || '');
          setPriceMode(dev.priceMode || 'exact');
          setPriceAmount(dev.priceAmount ? String(dev.priceAmount) : '');
          setAvailability(dev.availability || 'Available');
          setConstructionStage(dev.constructionStage || 'Under construction');
          
          if (dev.area && dev.area.value) {
            setHasArea(true);
            setAreaValue(String(dev.area.value));
            setAreaDefinition(dev.area.definition || 'built-up');
            setAreaUnit(dev.area.unit || 'sq ft');
          } else {
            setHasArea(false);
          }

          setBedrooms(dev.bedrooms ? String(dev.bedrooms) : '');

          if (dev.image && dev.image.url) {
            setImageUrl(dev.image.url);
            setImageAlt(dev.image.altText || '');
            setImageLabel(dev.image.label || 'Architectural render');
          }

          // Structured Details Defaults
          setSpecifications(Array.isArray(dev.specifications) ? dev.specifications : []);
          setConfigurations(Array.isArray(dev.configurations) ? dev.configurations : []);

          if (dev.location) {
            setAddress(dev.location.address || '');
            if (dev.location.coordinates) {
              setLatitude(String(dev.location.coordinates.latitude));
              setLongitude(String(dev.location.coordinates.longitude));
            } else {
              setLatitude('');
              setLongitude('');
            }
            setDirectionsUrl(dev.location.directionsUrl || '');
            setNearbyPlaces(Array.isArray(dev.location.nearbyPlaces) ? dev.location.nearbyPlaces : []);
          } else {
            setAddress('');
            setLatitude('');
            setLongitude('');
            setDirectionsUrl('');
            setNearbyPlaces([]);
          }

          setProgressUpdates(Array.isArray(dev.progress) ? dev.progress : []);
          setPhotos(Array.isArray(dev.photos) ? dev.photos : []);
          setFloorPlans(Array.isArray(dev.plans) ? dev.plans : []);
          setBrochure(dev.brochure || null);

          setIsDirty(false);
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
  }, [isNew, id, isOwner]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // --- Specifications Handlers ---
  const handleAddSpecGroup = () => {
    markDirty();
    setSpecifications([
      ...specifications,
      {
        id: `sg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: 'New Specification Group',
        items: [],
      },
    ]);
  };

  const handleRemoveSpecGroup = (index: number) => {
    markDirty();
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleMoveSpecGroup = (index: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= specifications.length) return;
    const updated = [...specifications];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSpecifications(updated);
  };

  const handleAddSpecItem = (groupIndex: number) => {
    markDirty();
    const updated = [...specifications];
    updated[groupIndex].items.push({
      id: `si_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: '',
      value: '',
      type: 'inclusion',
    });
    setSpecifications(updated);
  };

  const handleRemoveSpecItem = (groupIndex: number, itemIndex: number) => {
    markDirty();
    const updated = [...specifications];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecifications(updated);
  };

  const handleMoveSpecItem = (groupIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    const items = specifications[groupIndex].items;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...specifications];
    const [moved] = updated[groupIndex].items.splice(itemIndex, 1);
    updated[groupIndex].items.splice(targetIndex, 0, moved);
    setSpecifications(updated);
  };

  // --- Configurations Handlers ---
  const handleAddConfig = () => {
    markDirty();
    setConfigurations([
      ...configurations,
      {
        id: `cfg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        floor: '',
        bedrooms: type === 'Residential Plot' ? null : 3,
        area: null,
        availability: 'Available',
        priceMode: 'exact',
        priceAmount: null,
      },
    ]);
  };

  const handleRemoveConfig = (index: number) => {
    markDirty();
    const removedId = configurations[index]?.id;
    setConfigurations(configurations.filter((_, i) => i !== index));
    if (removedId) {
      setFloorPlans((prev) =>
        prev.map((plan) =>
          plan.configurationId === removedId ? { ...plan, configurationId: null } : plan
        )
      );
    }
  };

  const handleMoveConfig = (index: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= configurations.length) return;
    const updated = [...configurations];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setConfigurations(updated);
  };

  // --- Nearby Places Handlers ---
  const handleAddNearbyPlace = () => {
    markDirty();
    setNearbyPlaces([
      ...nearbyPlaces,
      {
        id: `np_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        category: 'Transit',
        distanceValue: null,
        distanceUnit: 'km',
        status: 'Existing',
        sourceNote: '',
        isPublicSourceNote: false,
        checkedDate: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const handleRemoveNearbyPlace = (index: number) => {
    markDirty();
    setNearbyPlaces(nearbyPlaces.filter((_, i) => i !== index));
  };

  const handleMoveNearbyPlace = (index: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nearbyPlaces.length) return;
    const updated = [...nearbyPlaces];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setNearbyPlaces(updated);
  };

  // --- Progress Updates Handlers ---
  const handleAddProgress = () => {
    markDirty();
    setProgressUpdates([
      ...progressUpdates,
      {
        id: `prog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        date: new Date().toISOString().slice(0, 10),
        title: '',
        stage: 'Completed work',
        description: '',
      },
    ]);
  };

  const handleRemoveProgress = (index: number) => {
    markDirty();
    setProgressUpdates(progressUpdates.filter((_, i) => i !== index));
  };

  const handleMoveProgress = (index: number, direction: 'up' | 'down') => {
    markDirty();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= progressUpdates.length) return;
    const updated = [...progressUpdates];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setProgressUpdates(updated);
  };

  const constructDraftPayload = () => {
    const numPrice = priceMode !== 'on_request' && priceAmount ? parseFloat(priceAmount) : null;
    const numBedrooms = type !== 'Residential Plot' && bedrooms ? parseInt(bedrooms, 10) : null;
    const numArea = hasArea && areaValue ? parseFloat(areaValue) : null;

    let coords = null;
    if (latitude.trim() && longitude.trim()) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        coords = { latitude: lat, longitude: lng };
      }
    }

    return {
      name,
      slug: slug || generateSlug(name),
      type,
      locality,
      shortDescription,
      priceMode,
      priceAmount: numPrice,
      availability,
      constructionStage,
      area: numArea
        ? {
            value: numArea,
            definition: areaDefinition,
            unit: areaUnit,
          }
        : null,
      bedrooms: numBedrooms,
      image: photos.length > 0
        ? {
            url: (photos.find((p) => p.isCover) || photos[0]).url || (photos.find((p) => p.isCover) || photos[0]).secureUrl,
            altText: (photos.find((p) => p.isCover) || photos[0]).altText || name,
            label: (photos.find((p) => p.isCover) || photos[0]).label === 'Actual photograph' ? 'Actual photograph' : 'Architectural render',
          }
        : (imageUrl.trim()
            ? {
                url: imageUrl.trim(),
                altText: imageAlt.trim() || name,
                label: imageLabel,
              }
            : null),
      photos,
      plans: floorPlans,
      brochure: brochure,
      specifications,
      configurations,
      location: {
        address: address.trim() || null,
        coordinates: coords,
        directionsUrl: directionsUrl.trim().startsWith('https://') ? directionsUrl.trim() : null,
        nearbyPlaces,
      },
      progress: progressUpdates,
    };
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const payload = constructDraftPayload();

      if (isNew) {
        const res = await fetch('/api/admin/developments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.status === 201 && data.development) {
          setIsDirty(false);
          setSuccessMessage('Draft created successfully.');
          navigate(`/admin/developments/${data.development.id}`);
        } else {
          setErrorMessage(data.message || 'Failed to create development draft.');
        }
      } else {
        const res = await fetch(`/api/admin/developments/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draft: payload,
            version: currentDraft?.version,
          }),
        });

        const data = await res.json();
        if (res.status === 200 && data.development) {
          setCurrentDraft(data.development);
          setIsDirty(false);
          setSuccessMessage('Draft saved successfully.');
        } else {
          setErrorMessage(data.message || 'Failed to save development draft.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isDirty) {
      setErrorMessage('Please save your draft edits before publishing.');
      return;
    }

    if (!id || isNew) {
      setErrorMessage('Please save the draft first before publishing.');
      return;
    }

    setPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
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
        setCurrentDraft(data.development);
        setSuccessMessage('Development successfully published with all structured content!');
      } else {
        setErrorMessage(data.message || 'Failed to publish development.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error publishing development.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!id || !currentDraft?.publishedSlug) return;
    if (!window.confirm('Are you sure you want to unpublish this development? The public page will be retracted immediately, but your draft remains intact.')) {
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/developments/${id}/unpublish`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 200 && data.development) {
        setCurrentDraft(data.development);
        setSuccessMessage('Development unpublished. Public page retracted.');
      } else {
        setErrorMessage(data.message || 'Failed to unpublish development.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error unpublishing development.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;
    if (!window.confirm('Archive this development? It will be removed from public visibility and marked archived.')) {
      return;
    }

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/developments/${id}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 200 && data.development) {
        setCurrentDraft(data.development);
        setSuccessMessage('Development archived.');
      } else {
        setErrorMessage(data.message || 'Failed to archive development.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error archiving development.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!id) return;

    setActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/developments/${id}/restore`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.status === 200 && data.development) {
        setCurrentDraft(data.development);
        setSuccessMessage('Development restored to draft state.');
      } else {
        setErrorMessage(data.message || 'Failed to restore development.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error restoring development.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6 text-[#141414]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#141414]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373]">
            Loading development draft...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-[#F8F8F8] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/developments"
              className="p-1.5 border border-black/10 hover:border-black/30 rounded-full text-[#666] hover:text-[#141414] transition-colors"
              title="Back to developments list"
            >
              <ArrowLeft size={16} />
            </Link>
            <Logo variant="dark" size="sm" subtitle="DRAFT EDITOR" />
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            {!isNew && currentDraft?.status === 'published' && currentDraft.publishedSlug && (
              <Link
                to={`/developments/${currentDraft.publishedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 border border-black/15 hover:border-black/40 text-[#141414] px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors"
              >
                <ExternalLink size={12} />
                <span>View Live</span>
              </Link>
            )}

            {!isNew && (
              <Link
                to={`/admin/developments/${id}/preview`}
                className="hidden sm:flex items-center gap-1.5 border border-black/15 hover:border-black/40 text-[#141414] px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors"
              >
                <Eye size={12} />
                <span>Preview Draft</span>
              </Link>
            )}

            <button
              onClick={handleSaveDraft}
              disabled={saving || actionLoading}
              className="bg-[#141414] hover:bg-black text-white px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 transition-all shadow-xs disabled:bg-neutral-300 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>{isNew ? 'Create Draft' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <section className="max-w-[1100px] mx-auto w-full px-6 md:px-12 py-8 flex-1 space-y-6">
        
        {/* Unsaved Changes Banner */}
        {isDirty && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[12px] text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-700 shrink-0" />
              <span>You have unsaved changes in this draft.</span>
            </div>
            <button
              onClick={handleSaveDraft}
              className="text-[11px] font-mono uppercase underline font-semibold text-amber-900 cursor-pointer"
            >
              Save Now
            </button>
          </div>
        )}

        {/* Notifications */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[12px] text-rose-800 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[12px] text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Status Card & Publication Controls (for existing records) */}
        {!isNew && currentDraft && (
          <div className="bg-white border border-black/10 rounded-3xl p-6 md:p-7 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] block mb-1">
                  Publication Status
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-semibold ${
                      currentDraft.status === 'published'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : currentDraft.status === 'draft'
                        ? 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {currentDraft.status}
                  </span>

                  {currentDraft.hasUnpublishedChanges && currentDraft.status === 'published' && (
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-medium">
                      Unpublished Draft Edits
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {currentDraft.status !== 'published' ? (
                  <button
                    onClick={handlePublish}
                    disabled={publishing || actionLoading || isDirty}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {publishing ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                    <span>Publish to Live Site</span>
                  </button>
                ) : (
                  <>
                    {currentDraft.hasUnpublishedChanges && (
                      <button
                        onClick={handlePublish}
                        disabled={publishing || actionLoading || isDirty}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {publishing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                        <span>Publish Changes</span>
                      </button>
                    )}

                    <button
                      onClick={handleUnpublish}
                      disabled={actionLoading}
                      className="border border-rose-300 text-rose-800 hover:bg-rose-50 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <EyeOff size={12} />
                      <span>Unpublish</span>
                    </button>
                  </>
                )}

                {currentDraft.status !== 'archived' ? (
                  <button
                    onClick={handleArchive}
                    disabled={actionLoading}
                    className="border border-black/15 hover:border-black/40 text-[#666] hover:text-[#141414] px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Archive size={12} />
                    <span>Archive</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRestore}
                    disabled={actionLoading}
                    className="border border-black/15 hover:border-black/40 text-[#141414] px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Restore to Draft</span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#737373] flex flex-wrap gap-x-6 gap-y-1">
              <span>Stable ID: <code>{currentDraft.id}</code></span>
              <span>URL Slug: <code>{currentDraft.slug}</code></span>
              <span>Version: v{currentDraft.version}</span>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-black/10 p-1.5 rounded-2xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Photos</span>
            {photos.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'photos' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {photos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Plans & Docs</span>
            {(floorPlans.length > 0 || brochure) && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'documents' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {floorPlans.length + (brochure ? 1 : 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('specifications')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'specifications'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Specifications</span>
            {specifications.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'specifications' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {specifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('configurations')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'configurations'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Configurations</span>
            {configurations.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'configurations' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {configurations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Location</span>
            {nearbyPlaces.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'location' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {nearbyPlaces.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'progress'
                ? 'bg-[#141414] text-white font-medium'
                : 'text-[#666] hover:text-[#141414]'
            }`}
          >
            <span>Progress</span>
            {progressUpdates.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'progress' ? 'bg-white/20' : 'bg-neutral-100 text-[#555]'}`}>
                {progressUpdates.length}
              </span>
            )}
          </button>

          {!isNew && (
            <button
              onClick={() => setActiveTab('cleanup')}
              className={`px-4 py-2 rounded-xl text-[12px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === 'cleanup'
                  ? 'bg-rose-900 text-white font-medium'
                  : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
              }`}
            >
              <span>Cleanup</span>
            </button>
          )}
        </div>

        {/* --- TAB CONTENT: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xs">
            {/* Identity */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
                Basic Identity
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Development Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (isNew || !currentDraft?.publishedSlug) {
                        setSlug(generateSlug(e.target.value));
                      }
                      markDirty();
                    }}
                    placeholder="e.g. The Courtyard Villa"
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Property Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as DevelopmentType);
                      markDirty();
                    }}
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none bg-white focus:border-black cursor-pointer"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Independent Floor">Independent Floor</option>
                    <option value="Residential Plot">Residential Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Locality *
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => {
                      setLocality(e.target.value);
                      markDirty();
                    }}
                    placeholder="e.g. Kusum Vihar, Jagatpura"
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    disabled={Boolean(currentDraft?.publishedSlug)}
                    onChange={(e) => {
                      setSlug(generateSlug(e.target.value));
                      markDirty();
                    }}
                    placeholder="e.g. the-courtyard-villa"
                    className={`w-full px-4 py-3 border border-black/15 rounded-xl text-[13px] font-mono outline-none ${
                      currentDraft?.publishedSlug
                        ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                        : 'text-[#141414] focus:border-black'
                    }`}
                  />
                  <span className="text-[10px] text-[#888] font-mono mt-1 block">
                    {currentDraft?.publishedSlug
                      ? 'Slug is fixed after publication to preserve public links.'
                      : `Live URL will be: /developments/${slug || 'your-slug'}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                  Short Description *
                </label>
                <textarea
                  value={shortDescription}
                  rows={3}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    markDirty();
                  }}
                  placeholder="Editorial overview of the property, architectural intent, and residential context..."
                  className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none focus:border-black font-light leading-relaxed"
                />
              </div>
            </div>

            {/* Pricing & Availability */}
            <div className="space-y-4 pt-6 border-t border-black/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
                Pricing & Market Availability
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Price Mode *
                  </label>
                  <select
                    value={priceMode}
                    onChange={(e) => {
                      setPriceMode(e.target.value as PriceMode);
                      markDirty();
                    }}
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none bg-white focus:border-black cursor-pointer"
                  >
                    <option value="exact">Exact Price</option>
                    <option value="starting_at">Starting From</option>
                    <option value="on_request">Price on Request</option>
                  </select>
                </div>

                {priceMode !== 'on_request' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                      Amount in INR (₹) *
                    </label>
                    <input
                      type="number"
                      value={priceAmount}
                      onChange={(e) => {
                        setPriceAmount(e.target.value);
                        markDirty();
                      }}
                      placeholder="e.g. 36500000 for 3.65 Cr"
                      className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] font-mono text-[#141414] outline-none focus:border-black"
                    />
                    {priceAmount && parseFloat(priceAmount) > 0 && (
                      <span className="text-[11px] text-[#B5623A] font-mono mt-1 block">
                        Preview: {formatPriceDisplay(priceMode, parseFloat(priceAmount))}
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Availability State
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => {
                      setAvailability(e.target.value as AvailabilityStatus);
                      markDirty();
                    }}
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none bg-white focus:border-black cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Construction Stage
                  </label>
                  <select
                    value={constructionStage}
                    onChange={(e) => {
                      setConstructionStage(e.target.value as ConstructionStage);
                      markDirty();
                    }}
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none bg-white focus:border-black cursor-pointer"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Under construction">Under construction</option>
                    <option value="Completed">Completed</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Specifications preview & bedrooms */}
            <div className="space-y-4 pt-6 border-t border-black/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
                Basic Dimensions
              </span>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasArea"
                    checked={hasArea}
                    onChange={(e) => {
                      setHasArea(e.target.checked);
                      markDirty();
                    }}
                    className="w-4 h-4 rounded text-[#141414]"
                  />
                  <label htmlFor="hasArea" className="text-[13px] font-light text-[#141414] cursor-pointer">
                    Specify physical overall area measurement
                  </label>
                </div>

                {hasArea && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F8F8F8] p-4 rounded-2xl border border-black/10">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#555] mb-1">
                        Area Value
                      </label>
                      <input
                        type="number"
                        value={areaValue}
                        onChange={(e) => {
                          setAreaValue(e.target.value);
                          markDirty();
                        }}
                        placeholder="e.g. 4200"
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-[13px] font-mono bg-white outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#555] mb-1">
                        Definition
                      </label>
                      <select
                        value={areaDefinition}
                        onChange={(e) => {
                          setAreaDefinition(e.target.value as AreaDefinition);
                          markDirty();
                        }}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-[13px] bg-white outline-none focus:border-black"
                      >
                        <option value="built-up">Built-up Area</option>
                        <option value="carpet">Carpet Area</option>
                        <option value="plot">Plot Area</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#555] mb-1">
                        Unit
                      </label>
                      <select
                        value={areaUnit}
                        onChange={(e) => {
                          setAreaUnit(e.target.value as AreaUnit);
                          markDirty();
                        }}
                        className="w-full px-3 py-2 border border-black/15 rounded-lg text-[13px] bg-white outline-none focus:border-black"
                      >
                        <option value="sq ft">sq ft</option>
                        <option value="sq yd">sq yd</option>
                      </select>
                    </div>
                  </div>
                )}

                {type !== 'Residential Plot' && (
                  <div className="max-w-xs">
                    <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                      Bedrooms / Suites
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={bedrooms}
                      onChange={(e) => {
                        setBedrooms(e.target.value);
                        markDirty();
                      }}
                      placeholder="e.g. 4"
                      className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] font-mono text-[#141414] outline-none focus:border-black"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Visual Media */}
            <div className="space-y-4 pt-6 border-t border-black/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block">
                Visual Media (Optional)
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                    Image URL (Site-relative or HTTPS)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://... or /assets/..."
                    className="w-full px-4 py-3 border border-black/15 rounded-xl text-[13px] font-mono text-[#141414] outline-none focus:border-black"
                  />
                </div>

                {imageUrl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#555] mb-1">
                        Image Label / Source Type
                      </label>
                      <select
                        value={imageLabel}
                        onChange={(e) => {
                          setImageLabel(e.target.value as ImageLabel);
                          markDirty();
                        }}
                        className="w-full px-3 py-2.5 border border-black/15 rounded-lg text-[13px] bg-white outline-none focus:border-black"
                      >
                        <option value="Actual photograph">Actual photograph</option>
                        <option value="Architectural render">Architectural render</option>
                        <option value="Representative image">Representative image</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#555] mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => {
                          setImageAlt(e.target.value);
                          markDirty();
                        }}
                        placeholder="Descriptive text for accessibility"
                        className="w-full px-3 py-2.5 border border-black/15 rounded-lg text-[13px] bg-white outline-none focus:border-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: PHOTOGRAPHS GALLERY --- */}
        {activeTab === 'photos' && (
          <DevelopmentPhotosEditor
            photos={photos}
            setPhotos={setPhotos}
            developmentId={id || ''}
            isNew={isNew}
            markDirty={markDirty}
            getIdToken={getIdToken}
            onSaveDraftFirst={handleSaveDraft}
            progressUpdates={progressUpdates}
            setProgressUpdates={setProgressUpdates}
          />
        )}

        {/* --- TAB CONTENT: PLANS & DOCUMENTS --- */}
        {activeTab === 'documents' && (
          <DevelopmentDocumentsEditor
            developmentId={id || ''}
            isNew={isNew}
            floorPlans={floorPlans}
            setFloorPlans={setFloorPlans}
            brochure={brochure}
            setBrochure={setBrochure}
            configurations={configurations}
            markDirty={markDirty}
          />
        )}

        {/* --- TAB CONTENT: SPECIFICATIONS --- */}
        {activeTab === 'specifications' && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                  Technical Specifications
                </span>
                <h3 className="text-xl font-medium text-[#141414]">Engineering & Material Groups</h3>
                <p className="text-[12px] text-[#666] font-light mt-0.5">
                  Organize materials, structural elements, and finishes into clear categorized headings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSpecGroup}
                className="bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>Add Group</span>
              </button>
            </div>

            {specifications.length === 0 ? (
              <div className="py-12 border border-dashed border-black/15 rounded-2xl text-center space-y-3">
                <ListChecks size={28} className="mx-auto text-[#AAA]" />
                <p className="text-[13px] text-[#666] font-light">No specification groups added yet.</p>
                <button
                  type="button"
                  onClick={handleAddSpecGroup}
                  className="inline-flex items-center gap-1.5 border border-black/20 text-[#141414] px-4 py-1.5 rounded-full text-[11px] font-mono uppercase hover:bg-neutral-50"
                >
                  <Plus size={12} />
                  <span>Create First Group</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {specifications.map((group, gIdx) => (
                  <div key={group.id} className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-5 md:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] font-mono text-[#888]">#{gIdx + 1}</span>
                        <input
                          type="text"
                          value={group.title}
                          onChange={(e) => {
                            const updated = [...specifications];
                            updated[gIdx].title = e.target.value;
                            setSpecifications(updated);
                            markDirty();
                          }}
                          placeholder="Group Title (e.g. Structural & Civil, Finishes)"
                          className="w-full max-w-md px-3 py-1.5 bg-white border border-black/15 rounded-lg text-[13px] font-medium text-[#141414] outline-none focus:border-black"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveSpecGroup(gIdx, 'up')}
                          disabled={gIdx === 0}
                          title="Move group up"
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSpecGroup(gIdx, 'down')}
                          disabled={gIdx === specifications.length - 1}
                          title="Move group down"
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecGroup(gIdx)}
                          title="Remove group"
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Group Items */}
                    <div className="space-y-2.5">
                      {group.items.map((item, iIdx) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-black/5 shadow-2xs">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const updated = [...specifications];
                              updated[gIdx].items[iIdx].label = e.target.value;
                              setSpecifications(updated);
                              markDirty();
                            }}
                            placeholder="Label (e.g. Steel)"
                            className="w-full sm:w-1/3 px-3 py-1.5 border border-black/15 rounded-lg text-[12px] font-mono outline-none focus:border-black"
                          />

                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => {
                              const updated = [...specifications];
                              updated[gIdx].items[iIdx].value = e.target.value;
                              setSpecifications(updated);
                              markDirty();
                            }}
                            placeholder="Value / Details (e.g. Tata Tiscon Fe-550D)"
                            className="w-full sm:flex-1 px-3 py-1.5 border border-black/15 rounded-lg text-[12px] outline-none focus:border-black"
                          />

                          <select
                            value={item.type}
                            onChange={(e) => {
                              const updated = [...specifications];
                              updated[gIdx].items[iIdx].type = e.target.value as SpecificationType;
                              setSpecifications(updated);
                              markDirty();
                            }}
                            className="px-2.5 py-1.5 border border-black/15 rounded-lg text-[11px] font-mono bg-white outline-none focus:border-black cursor-pointer"
                          >
                            <option value="inclusion">Standard Inclusion</option>
                            <option value="optional_extra">Optional Upgrade</option>
                          </select>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleMoveSpecItem(gIdx, iIdx, 'up')}
                              disabled={iIdx === 0}
                              className="p-1 text-[#666] hover:bg-neutral-100 rounded disabled:opacity-25"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSpecItem(gIdx, iIdx, 'down')}
                              disabled={iIdx === group.items.length - 1}
                              className="p-1 text-[#666] hover:bg-neutral-100 rounded disabled:opacity-25"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecItem(gIdx, iIdx)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddSpecItem(gIdx)}
                        className="text-[11px] font-mono uppercase tracking-wider text-[#B5623A] hover:text-[#9A4C27] flex items-center gap-1 pt-1 font-semibold cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Row to {group.title || 'Group'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: CONFIGURATIONS --- */}
        {activeTab === 'configurations' && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                  Unit Configurations
                </span>
                <h3 className="text-xl font-medium text-[#141414]">Individual Floor & Unit Typologies</h3>
                <p className="text-[12px] text-[#666] font-light mt-0.5">
                  Informational configurations (e.g. duplex layouts, independent floor tiers, plot sizes).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddConfig}
                className="bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>Add Configuration</span>
              </button>
            </div>

            {configurations.length === 0 ? (
              <div className="py-12 border border-dashed border-black/15 rounded-2xl text-center space-y-3">
                <Layers size={28} className="mx-auto text-[#AAA]" />
                <p className="text-[13px] text-[#666] font-light">No configurations added yet.</p>
                <button
                  type="button"
                  onClick={handleAddConfig}
                  className="inline-flex items-center gap-1.5 border border-black/20 text-[#141414] px-4 py-1.5 rounded-full text-[11px] font-mono uppercase hover:bg-neutral-50"
                >
                  <Plus size={12} />
                  <span>Add First Configuration</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {configurations.map((cfg, cIdx) => (
                  <div key={cfg.id} className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#888]">#{cIdx + 1}</span>
                        <input
                          type="text"
                          value={cfg.label}
                          onChange={(e) => {
                            const updated = [...configurations];
                            updated[cIdx].label = e.target.value;
                            setConfigurations(updated);
                            markDirty();
                          }}
                          placeholder="Configuration Label (e.g. Ground Floor Suite A, 3BHK Tier)"
                          className="w-full sm:w-80 px-3 py-1.5 bg-white border border-black/15 rounded-lg text-[13px] font-medium text-[#141414] outline-none focus:border-black"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveConfig(cIdx, 'up')}
                          disabled={cIdx === 0}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveConfig(cIdx, 'down')}
                          disabled={cIdx === configurations.length - 1}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveConfig(cIdx)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Floor / Tier
                        </label>
                        <input
                          type="text"
                          value={cfg.floor || ''}
                          onChange={(e) => {
                            const updated = [...configurations];
                            updated[cIdx].floor = e.target.value;
                            setConfigurations(updated);
                            markDirty();
                          }}
                          placeholder="e.g. Ground Floor"
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black"
                        />
                      </div>

                      {type !== 'Residential Plot' && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Bedrooms
                          </label>
                          <input
                            type="number"
                            value={cfg.bedrooms ?? ''}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[cIdx].bedrooms = e.target.value ? parseInt(e.target.value, 10) : null;
                              setConfigurations(updated);
                              markDirty();
                            }}
                            placeholder="e.g. 3"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg font-mono outline-none focus:border-black"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Area (Value)
                        </label>
                        <input
                          type="number"
                          value={cfg.area?.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            const updated = [...configurations];
                            if (val) {
                              updated[cIdx].area = {
                                value: val,
                                definition: cfg.area?.definition || 'built-up',
                                unit: cfg.area?.unit || 'sq ft',
                              };
                            } else {
                              updated[cIdx].area = null;
                            }
                            setConfigurations(updated);
                            markDirty();
                          }}
                          placeholder="e.g. 2400"
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg font-mono outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Availability
                        </label>
                        <select
                          value={cfg.availability}
                          onChange={(e) => {
                            const updated = [...configurations];
                            updated[cIdx].availability = e.target.value as AvailabilityStatus;
                            setConfigurations(updated);
                            markDirty();
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black cursor-pointer font-mono"
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                          <option value="Not specified">Not specified</option>
                        </select>
                      </div>
                    </div>

                    {/* Configuration Price (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-black/5 text-[12px]">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Pricing Mode
                        </label>
                        <select
                          value={cfg.priceMode || 'on_request'}
                          onChange={(e) => {
                            const updated = [...configurations];
                            updated[cIdx].priceMode = e.target.value as PriceMode;
                            setConfigurations(updated);
                            markDirty();
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black"
                        >
                          <option value="exact">Exact Price</option>
                          <option value="starting_at">Starting From</option>
                          <option value="on_request">Price on Request</option>
                        </select>
                      </div>

                      {cfg.priceMode !== 'on_request' && (
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Amount (INR)
                          </label>
                          <input
                            type="number"
                            value={cfg.priceAmount ?? ''}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[cIdx].priceAmount = e.target.value ? parseFloat(e.target.value) : null;
                              setConfigurations(updated);
                              markDirty();
                            }}
                            placeholder="e.g. 18500000"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg font-mono outline-none focus:border-black"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: LOCATION --- */}
        {activeTab === 'location' && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                Geographic Location & Landmarks
              </span>
              <h3 className="text-xl font-medium text-[#141414]">Address & Connectivity Facts</h3>
              <p className="text-[12px] text-[#666] font-light mt-0.5">
                Accurate postal location, coordinates, and verified nearby infrastructure.
              </p>
            </div>

            {/* Postal Address & Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                  Physical / Postal Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    markDirty();
                  }}
                  placeholder="Plot No. / Sector Road, Kusum Vihar, Jagatpura, Jaipur, Rajasthan 302017"
                  className="w-full px-4 py-3 border border-black/15 rounded-xl text-[14px] text-[#141414] outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. 26.8245"
                  className="w-full px-4 py-2.5 border border-black/15 rounded-xl text-[13px] font-mono text-[#141414] outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. 75.8341"
                  className="w-full px-4 py-2.5 border border-black/15 rounded-xl text-[13px] font-mono text-[#141414] outline-none focus:border-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-[#555] mb-1.5">
                  HTTPS Directions Link (Google Maps / OpenStreetMap)
                </label>
                <input
                  type="url"
                  value={directionsUrl}
                  onChange={(e) => {
                    setDirectionsUrl(e.target.value);
                    markDirty();
                  }}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-4 py-3 border border-black/15 rounded-xl text-[13px] font-mono text-[#141414] outline-none focus:border-black"
                />
                <span className="text-[10px] text-[#888] font-mono mt-1 block">
                  Must start with <code>https://</code>. Displayed as a clean external link button on the public page.
                </span>
              </div>
            </div>

            {/* Nearby Places Section */}
            <div className="space-y-4 pt-6 border-t border-black/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-medium text-[#141414]">Nearby Landmarks & Facilities</h4>
                  <p className="text-[12px] text-[#666] font-light">
                    Owner-verified distances to transit, healthcare, schools, and corridors.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddNearbyPlace}
                  className="bg-[#141414] hover:bg-black text-white px-4 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
                >
                  <Plus size={12} />
                  <span>Add Landmark</span>
                </button>
              </div>

              {nearbyPlaces.length === 0 ? (
                <div className="py-8 border border-dashed border-black/15 rounded-2xl text-center text-[#888] text-[12px]">
                  No nearby places recorded. Click "Add Landmark" to specify verified connectivity.
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyPlaces.map((place, pIdx) => (
                    <div key={place.id} className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#888]">#{pIdx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveNearbyPlace(pIdx, 'up')}
                            disabled={pIdx === 0}
                            className="p-1 text-[#666] hover:bg-neutral-200 rounded disabled:opacity-25"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveNearbyPlace(pIdx, 'down')}
                            disabled={pIdx === nearbyPlaces.length - 1}
                            className="p-1 text-[#666] hover:bg-neutral-200 rounded disabled:opacity-25"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveNearbyPlace(pIdx)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded ml-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Landmark Name *
                          </label>
                          <input
                            type="text"
                            value={place.name}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].name = e.target.value;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            placeholder="e.g. Jagatpura Railway Station"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Category
                          </label>
                          <select
                            value={place.category}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].category = e.target.value;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black cursor-pointer"
                          >
                            <option value="Transit">Transit / Station</option>
                            <option value="Healthcare">Healthcare / Hospital</option>
                            <option value="Education">Education / School</option>
                            <option value="Retail & Leisure">Retail & Leisure</option>
                            <option value="Civic">Civic / Sector Road</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Status
                          </label>
                          <select
                            value={place.status}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].status = e.target.value as NearbyPlaceStatus;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black cursor-pointer"
                          >
                            <option value="Existing">Existing</option>
                            <option value="Proposed / Upcoming">Proposed / Upcoming</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Distance (Value)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={place.distanceValue ?? ''}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].distanceValue = e.target.value ? parseFloat(e.target.value) : null;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            placeholder="e.g. 2.4"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg font-mono outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Distance Unit
                          </label>
                          <input
                            type="text"
                            value={place.distanceUnit || 'km'}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].distanceUnit = e.target.value;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            placeholder="km / min drive"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg font-mono outline-none focus:border-black"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                            Source Note / Verification Date
                          </label>
                          <input
                            type="text"
                            value={place.sourceNote || ''}
                            onChange={(e) => {
                              const updated = [...nearbyPlaces];
                              updated[pIdx].sourceNote = e.target.value;
                              setNearbyPlaces(updated);
                              markDirty();
                            }}
                            placeholder="e.g. Measured via sector road odometer odometer test"
                            className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Privacy toggle for source note */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id={`publicNote_${place.id}`}
                          checked={place.isPublicSourceNote || false}
                          onChange={(e) => {
                            const updated = [...nearbyPlaces];
                            updated[pIdx].isPublicSourceNote = e.target.checked;
                            setNearbyPlaces(updated);
                            markDirty();
                          }}
                          className="w-3.5 h-3.5 rounded"
                        />
                        <label htmlFor={`publicNote_${place.id}`} className="text-[11px] text-[#555] cursor-pointer">
                          Display note publicly on website (if unchecked, note is stored privately for internal builder records)
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: PROGRESS (CONSTRUCTION UPDATES) --- */}
        {activeTab === 'progress' && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-1">
                  Construction Updates
                </span>
                <h3 className="text-xl font-medium text-[#141414]">Dated Milestone Log</h3>
                <p className="text-[12px] text-[#666] font-light mt-0.5">
                  Record real completed milestones and future planned activities without invented completion percentages.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddProgress}
                className="bg-[#141414] hover:bg-black text-white px-4 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>Add Update</span>
              </button>
            </div>

            {progressUpdates.length === 0 ? (
              <div className="py-12 border border-dashed border-black/15 rounded-2xl text-center space-y-3">
                <Clock size={28} className="mx-auto text-[#AAA]" />
                <p className="text-[13px] text-[#666] font-light">No construction updates recorded.</p>
                <button
                  type="button"
                  onClick={handleAddProgress}
                  className="inline-flex items-center gap-1.5 border border-black/20 text-[#141414] px-4 py-1.5 rounded-full text-[11px] font-mono uppercase hover:bg-neutral-50"
                >
                  <Plus size={12} />
                  <span>Log First Milestone</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {progressUpdates.map((prog, uIdx) => (
                  <div key={prog.id} className="bg-[#F8F8F8] border border-black/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-black/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#888]">#{uIdx + 1}</span>
                        <input
                          type="date"
                          value={prog.date}
                          onChange={(e) => {
                            const updated = [...progressUpdates];
                            updated[uIdx].date = e.target.value;
                            setProgressUpdates(updated);
                            markDirty();
                          }}
                          className="px-3 py-1 bg-white border border-black/15 rounded-lg text-[12px] font-mono outline-none focus:border-black"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveProgress(uIdx, 'up')}
                          disabled={uIdx === 0}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProgress(uIdx, 'down')}
                          disabled={uIdx === progressUpdates.length - 1}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 text-[#555] disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProgress(uIdx)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-700 cursor-pointer ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Milestone Title *
                        </label>
                        <input
                          type="text"
                          value={prog.title}
                          onChange={(e) => {
                            const updated = [...progressUpdates];
                            updated[uIdx].title = e.target.value;
                            setProgressUpdates(updated);
                            markDirty();
                          }}
                          placeholder="e.g. Raft Foundation Concreting Completed"
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg text-[13px] font-medium outline-none focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Stage Category
                        </label>
                        <select
                          value={prog.stage}
                          onChange={(e) => {
                            const updated = [...progressUpdates];
                            updated[uIdx].stage = e.target.value as ProgressUpdateStage;
                            setProgressUpdates(updated);
                            markDirty();
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg text-[12px] font-mono outline-none focus:border-black cursor-pointer"
                        >
                          <option value="Completed work">Completed work</option>
                          <option value="Future planned activity">Future planned activity</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1">
                          Description / Technical Notes
                        </label>
                        <textarea
                          rows={2}
                          value={prog.description}
                          onChange={(e) => {
                            const updated = [...progressUpdates];
                            updated[uIdx].description = e.target.value;
                            setProgressUpdates(updated);
                            markDirty();
                          }}
                          placeholder="Describe the structural work completed or scheduled..."
                          className="w-full px-3 py-1.5 bg-white border border-black/15 rounded-lg text-[13px] font-light outline-none focus:border-black leading-relaxed"
                        />
                      </div>

                      {/* Associated Progress Photographs (up to 6) */}
                      <div className="sm:col-span-3 pt-3 border-t border-black/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase text-[#666] tracking-wider block">
                            Associated Photographs ({(prog.photoIds || []).length} / 6 selected)
                          </label>
                          {photos.length === 0 && (
                            <span className="text-[10px] font-mono text-[#888]">
                              Upload gallery photos in the "Photos" tab first to attach them here
                            </span>
                          )}
                        </div>

                        {/* Selected Photo Thumbnails */}
                        {(prog.photoIds || []).length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                            {(prog.photoIds || []).map((pid) => {
                              const photoObj = photos.find((p) => p.id === pid);
                              if (!photoObj) return null;
                              return (
                                <div
                                  key={pid}
                                  className="relative group rounded-xl overflow-hidden border border-black/10 bg-white aspect-square shadow-2xs"
                                >
                                  <img
                                    src={photoObj.url}
                                    alt={photoObj.altText || 'Progress photo'}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                    <span className="text-[8px] font-mono text-white bg-black/60 px-1 py-0.5 rounded truncate">
                                      {photoObj.label === 'Actual photograph' ? 'Actual' : 'Visual'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...progressUpdates];
                                        updated[uIdx].photoIds = (updated[uIdx].photoIds || []).filter((id) => id !== pid);
                                        setProgressUpdates(updated);
                                        markDirty();
                                      }}
                                      className="self-end p-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 cursor-pointer"
                                      title="Detach photo"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Available Gallery Photo Selector */}
                        {photos.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[9px] font-mono uppercase text-[#888] block">
                              Click photo to attach or detach:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {photos.map((p) => {
                                const isSelected = (prog.photoIds || []).includes(p.id);
                                const isMaxReached = !isSelected && (prog.photoIds || []).length >= 6;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    disabled={isMaxReached}
                                    onClick={() => {
                                      const updated = [...progressUpdates];
                                      const currentIds = updated[uIdx].photoIds || [];
                                      if (isSelected) {
                                        updated[uIdx].photoIds = currentIds.filter((id) => id !== p.id);
                                      } else {
                                        if (currentIds.length < 6) {
                                          updated[uIdx].photoIds = [...currentIds, p.id];
                                        }
                                      }
                                      setProgressUpdates(updated);
                                      markDirty();
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                                        : isMaxReached
                                        ? 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
                                        : 'bg-white border-black/15 text-[#333] hover:border-black'
                                    }`}
                                  >
                                    <span className="w-4 h-4 rounded overflow-hidden shrink-0 inline-block">
                                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                                    </span>
                                    <span className="truncate max-w-[100px]">
                                      {p.altText || (p.label === 'Actual photograph' ? 'Photograph' : 'Render')}
                                    </span>
                                    {isSelected && <span className="text-emerald-700 font-bold">✓</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB CONTENT: CLEANUP --- */}
        {activeTab === 'cleanup' && !isNew && (
          <div className="bg-white border border-black/10 rounded-3xl p-8 sm:p-10 shadow-xs">
            <UnusedUploadsPanel developmentId={id || ''} />
          </div>
        )}

        {/* Bottom Save Footer */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="text-[11px] font-mono text-[#888]">
            {isDirty ? (
              <span className="text-amber-800 font-semibold">• Unsaved edits</span>
            ) : (
              <span>All draft edits saved</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/developments"
              className="px-4 py-2 rounded-full border border-black/15 text-[11px] font-mono uppercase tracking-wider text-[#666] hover:text-[#141414]"
            >
              Back to List
            </Link>

            <button
              onClick={handleSaveDraft}
              disabled={saving || actionLoading}
              className="bg-[#141414] hover:bg-black text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 transition-all shadow-xs disabled:bg-neutral-300 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save Draft</span>
            </button>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white py-4 px-6 md:px-12 text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">
        Happy Homes Jaipur • Architectural Catalog Editor
      </footer>
    </main>
  );
}
