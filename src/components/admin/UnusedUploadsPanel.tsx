import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type ManagedAsset, formatBytes } from '../../types/development';

interface UnusedUploadsPanelProps {
  developmentId: string;
}

export default function UnusedUploadsPanel({ developmentId }: UnusedUploadsPanelProps) {
  const { getIdToken } = useAuth();
  const [assets, setAssets] = useState<(ManagedAsset & { eligibility?: { eligible: boolean; reason: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingAsset, setConfirmingAsset] = useState<ManagedAsset | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAssets = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    setError(null);
    if (!isLoadMore) setConfirmingAsset(null);
    
    try {
      const token = await getIdToken();
      const lastId = isLoadMore && assets.length > 0 ? assets[assets.length - 1].assetId : '';
      const url = `/api/admin/media/assets?developmentId=${developmentId}&limit=20${lastId ? `&startAfterId=${lastId}` : ''}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (isLoadMore) {
          setAssets(prev => [...prev, ...(data.assets || [])]);
        } else {
          setAssets(data.assets || []);
        }
        setHasMore(data.hasMore);
      } else {
        throw new Error(data.message || 'Failed to fetch asset registry');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [developmentId]);

  const handleDelete = async () => {
    if (!confirmingAsset) return;
    const asset = confirmingAsset;
    
    setDeletingId(asset.assetId);
    setError(null);
    setSuccessMessage(null);
    setConfirmingAsset(null);

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/media/assets/${asset.assetId}/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ developmentId })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Asset ${asset.publicId} deleted successfully.`);
        fetchAssets(); // Refresh list
      } else {
        throw new Error(data.message || 'Deletion failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getEligibility = (asset: ManagedAsset & { eligibility?: { eligible: boolean; reason: string } }) => {
    if (asset.eligibility) {
      return asset.eligibility;
    }
    
    // Fallback to client-side logic if for some reason server didn't provide it
    if (asset.status === 'deleted') return { eligible: false, reason: 'Already deleted' };
    if (asset.status === 'attached') return { eligible: false, reason: 'Currently in use' };
    if (asset.status === 'deletion_pending') return { eligible: false, reason: 'Deletion in progress' };
    
    const now = new Date();
    const created = new Date(asset.createdAt);
    const ageDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageDays < 7) {
      return { eligible: false, reason: `Wait period: ${Math.ceil(7 - ageDays)} days left` };
    }

    if (asset.status === 'detached' && asset.detachedAt) {
      const detached = new Date(asset.detachedAt);
      const unrefDays = (now.getTime() - detached.getTime()) / (1000 * 60 * 60 * 24);
      if (unrefDays < 7) {
        return { eligible: false, reason: `Detached recently: ${Math.ceil(7 - unrefDays)} days left` };
      }
    }

    return { eligible: true, reason: 'Eligible for cleanup' };
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#737373]">
        <Loader2 size={24} className="animate-spin mb-3" />
        <span className="text-[13px] font-light">Loading asset registry...</span>
      </div>
    );
  }

  const unusedCandidates = assets.filter(a => a.status !== 'attached' && a.status !== 'deleted');

  return (
    <div className="space-y-6 relative">
      {/* Confirmation Modal */}
      {confirmingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-black/5 space-y-6">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h4 className="text-xl font-medium">Confirm Permanent Deletion</h4>
            </div>
            
            <div className="space-y-4">
              <p className="text-[14px] text-[#444] font-light leading-relaxed">
                You are about to permanently delete the <span className="font-semibold capitalize">{confirmingAsset.purpose.replace('_', ' ')}</span> asset:
              </p>
              
              <div className="bg-neutral-50 rounded-2xl p-4 border border-black/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white border border-black/5 flex items-center justify-center overflow-hidden shrink-0">
                  {confirmingAsset.purpose === 'gallery' || confirmingAsset.purpose === 'floor_plan' && confirmingAsset.format !== 'pdf' ? (
                    <img src={confirmingAsset.secureUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <FileText size={20} className="text-[#666]" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[13px] font-medium text-[#141414] truncate">{confirmingAsset.publicId}</div>
                  <div className="text-[11px] text-[#888] font-mono">{confirmingAsset.format.toUpperCase()} • {formatBytes(confirmingAsset.bytes)}</div>
                </div>
              </div>

              <p className="text-[13px] text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-100">
                Warning: This action is permanent. The file will be removed from Cloudinary and cannot be recovered. Previously downloaded copies or cached CDN versions may persist temporarily.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingAsset(null)}
                className="flex-1 px-4 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#141414] text-[13px] font-mono uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-mono uppercase tracking-wider transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[#141414]">Unused Uploads</h3>
          <p className="text-[12px] text-[#666] font-light">
            Review and permanently remove files that are no longer referenced by this development.
          </p>
        </div>
        <button 
          onClick={fetchAssets}
          disabled={loading}
          className="p-2 rounded-full hover:bg-neutral-100 text-[#737373] transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[12px] flex items-center gap-2">
          <CheckCircle2 size={14} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[12px] flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {unusedCandidates.length === 0 ? (
        <div className="py-12 border border-dashed border-black/10 rounded-3xl text-center space-y-2">
          <Info size={24} className="mx-auto text-[#CCC]" />
          <p className="text-[13px] text-[#888] font-light">No unused assets found for this development.</p>
        </div>
      ) : (
        <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-black/5">
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-[#737373]">Asset</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-[#737373]">Upload Date</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-[#737373]">Eligibility</th>
                  <th className="px-5 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-[#737373]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {unusedCandidates.map((asset) => {
                  const { eligible, reason } = getEligibility(asset);
                  return (
                    <tr key={asset.assetId} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-black/5 shrink-0">
                            {asset.purpose === 'gallery' || asset.purpose === 'floor_plan' && asset.format !== 'pdf' ? (
                              <img src={asset.secureUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <FileText size={18} className="text-[#666]" />
                            )}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium text-[#141414] capitalize">{asset.purpose.replace('_', ' ')}</div>
                            <div className="text-[11px] text-[#888] font-mono uppercase">
                              {asset.format} • {formatBytes(asset.bytes)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#666] font-light">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {eligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono">
                              Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono">
                              <Clock size={10} />
                              {reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setConfirmingAsset(asset)}
                          disabled={!eligible || deletingId === asset.assetId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-[11px] font-mono uppercase tracking-wider"
                        >
                          {deletingId === asset.assetId ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-[#FAFAFA] text-[11px] text-[#888] font-light flex items-center gap-2">
            <Info size={14} className="text-[#AAA]" />
            <span>Only assets unreferenced in all versions (including published) for 7+ days are eligible. Deletion is permanent in Cloudinary.</span>
          </div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchAssets(true)}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full border border-black/10 text-[11px] font-mono uppercase tracking-wider text-[#666] hover:text-[#141414] hover:bg-neutral-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} className="rotate-90" />}
            <span>Load More Assets</span>
          </button>
        </div>
      )}
    </div>
  );
}
