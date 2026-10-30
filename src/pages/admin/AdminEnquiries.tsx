import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { 
  Inbox, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  MapPin, 
  Video,
  ExternalLink,
  ChevronLeft,
  Loader2,
  X,
  CheckCircle2,
  Archive,
  Clock,
  Download,
  Save,
  AlertCircle,
  FileText,
  CalendarDays
} from 'lucide-react';
import { type Enquiry, type EnquiryStatus } from '../../types/enquiry';
import { format, isToday, isBefore, startOfDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Logo from '../../components/Logo';

const IST_TIMEZONE = 'Asia/Kolkata';

export default function AdminEnquiries() {
  const { user, isOwner, loading: authLoading, getIdToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [includeNotesInExport, setIncludeNotesInExport] = useState(false);
  const [activeRequest, setActiveRequest] = useState<number>(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [devFilter, setDevFilter] = useState<string>('');
  const [followUpFilter, setFollowUpFilter] = useState<'due' | 'overdue' | ''>('');
  const [developments, setDevelopments] = useState<{id: string, name: string}[]>([]);

  // Initialize filters from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status') as EnquiryStatus;
    const followUp = params.get('followUp') as 'due' | 'overdue';
    const source = params.get('source');
    const devId = params.get('developmentId');

    if (status) setStatusFilter(status);
    if (followUp) setFollowUpFilter(followUp);
    if (source) setSourceFilter(source);
    if (devId) setDevFilter(devId);
  }, []); // Only on mount

  // Internal Edit State
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [authLoading, user, isOwner, navigate]);

  const fetchDevelopments = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/developments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDevelopments(data.developments.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (err) {
      console.error('Failed to fetch developments for filter', err);
    }
  };

  const fetchEnquiries = useCallback(async (after?: string, reset = false) => {
    if (!isOwner) return;
    
    const requestId = Date.now();
    setActiveRequest(requestId);
    
    if (reset) {
      setEnquiries([]);
      setSelectedEnquiry(null);
      setError(null);
      setLastId(undefined);
      setHasMore(false);
    }
    
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Authentication token not available. Please sign in again.');
      
      let url = `/api/admin/enquiries?limit=20`;
      if (after && !reset) url += `&startAfterId=${after}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (sourceFilter) url += `&source=${encodeURIComponent(sourceFilter)}`;
      if (devFilter) url += `&developmentId=${devFilter}`;
      if (followUpFilter) url += `&followUp=${followUpFilter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Check if this request is still the active one
      setActiveRequest(current => {
        if (current === requestId) {
          if (!res.ok) {
            setError(data.message || 'Failed to fetch enquiries');
            setEnquiries([]);
          } else {
            if (after && !reset) {
              setEnquiries(prev => [...prev, ...data.enquiries]);
            } else {
              setEnquiries(data.enquiries);
            }
            setHasMore(data.hasMore);
            if (data.enquiries.length > 0) {
              setLastId(data.enquiries[data.enquiries.length - 1].id);
            }
          }
        }
        return current;
      });
    } catch (err: any) {
      setActiveRequest(current => {
        if (current === requestId) {
          console.error('[AdminEnquiries] fetch error:', err);
          setError(err.message);
          setEnquiries([]);
        }
        return current;
      });
    } finally {
      setActiveRequest(current => {
        if (current === requestId) {
          setLoading(false);
        }
        return current;
      });
    }
  }, [isOwner, statusFilter, sourceFilter, devFilter, followUpFilter, getIdToken]);

  useEffect(() => {
    if (isOwner) {
      fetchEnquiries(undefined, true);
      fetchDevelopments();
    }
  }, [isOwner, statusFilter, sourceFilter, devFilter, followUpFilter]);

  useEffect(() => {
    if (selectedEnquiry) {
      setNotes(selectedEnquiry.internalNotes || '');
      setFollowUpDate(selectedEnquiry.followUpDate || '');
    }
  }, [selectedEnquiry]);

  const handleUpdateDetails = async () => {
    if (!selectedEnquiry || !isOwner) return;
    setIsSavingDetails(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          internalNotes: notes,
          followUpDate: followUpDate || null,
          revision: selectedEnquiry.revision
        })
      });
      
      const data = await res.json();
      if (res.status === 409) {
        throw new Error('This record was modified by another user. Your changes are preserved below. Please reload to review current data or try saving again to overwrite.');
      }
      if (!res.ok) throw new Error(data.message || 'Failed to update details');
      
      const updated = { ...selectedEnquiry, internalNotes: notes, followUpDate: followUpDate || null, revision: (selectedEnquiry.revision || 0) + 1 };
      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? updated : e));
      setSelectedEnquiry(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: EnquiryStatus) => {
    const enq = enquiries.find(e => e.id === id);
    if (!enq) return;

    setUpdatingId(id);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Token expired. Please refresh the page.');

      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          revision: enq.revision 
        })
      });
      
      const data = await res.json();
      if (res.status === 409) {
        throw new Error('This record was modified by another user. Please refresh the page to see the latest data.');
      }
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      
      const nextRevision = (enq.revision || 0) + 1;
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status, revision: nextRevision } : e));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => prev ? { ...prev, status, revision: nextRevision } : null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = await getIdToken();
      let url = `/api/admin/enquiries/export?includeNotes=${includeNotesInExport}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (sourceFilter) url += `&source=${encodeURIComponent(sourceFilter)}`;
      if (devFilter) url += `&developmentId=${devFilter}`;
      if (followUpFilter) url += `&followUp=${followUpFilter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Export failed' }));
        throw new Error(data.message || 'Export failed');
      }
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `enquiries_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: EnquiryStatus) => {
    switch (status) {
      case 'New': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Visit Arranged': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed':
      case 'Archived': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFollowUpStatus = (dateStr: string) => {
    if (!dateStr) return null;
    const now = toZonedTime(new Date(), IST_TIMEZONE);
    const todayStr = format(now, 'yyyy-MM-dd');
    
    if (dateStr === todayStr) return 'due';
    if (dateStr < todayStr) return 'overdue';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-outfit">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#141414]/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/admin" className="hover:opacity-80 transition-opacity">
              <Logo variant="color" size="sm" />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/admin/developments" className="text-[13px] font-medium text-[#A5A5A5] hover:text-[#141414] transition-colors">Developments</a>
              <a href="/admin/enquiries" className="text-[13px] font-bold text-[#141414] border-b-2 border-[#B5623A] pb-1">Enquiries</a>
              <a href="/admin/settings" className="text-[13px] font-medium text-[#A5A5A5] hover:text-[#141414] transition-colors">Settings</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-2">
              <input 
                type="checkbox"
                id="includeNotes"
                checked={includeNotesInExport}
                onChange={(e) => setIncludeNotesInExport(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A] cursor-pointer"
              />
              <label htmlFor="includeNotes" className="text-[11px] font-medium text-[#A5A5A5] cursor-pointer select-none">
                Include private notes
              </label>
            </div>
            <button 
              onClick={handleExport}
              disabled={exporting || loading || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Export CSV
            </button>
            <button 
              onClick={() => fetchEnquiries(undefined, true)}
              className="p-2 text-[#A5A5A5] hover:text-[#141414] hover:bg-gray-50 rounded-full transition-all"
              title="Refresh"
            >
              <Clock size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#141414] mb-1">Owner Inbox</h1>
            <p className="text-[14px] text-[#A5A5A5]">Manage consultation requests and client interest.</p>
          </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-3 py-1.5 shadow-sm">
                <CalendarDays size={14} className="text-[#B5623A]" />
                <select 
                  value={followUpFilter}
                  onChange={(e) => setFollowUpFilter(e.target.value as any)}
                  className="text-[12px] font-bold text-[#B5623A] bg-transparent border-none focus:ring-0 cursor-pointer"
                >
                  <option value="">No Follow-up Filter</option>
                  <option value="due">Due Today</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-3 py-1.5 shadow-sm">
              <Filter size={14} className="text-[#A5A5A5]" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Visit Arranged">Visit Arranged</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived (Legacy)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-3 py-1.5 shadow-sm">
              <Tag size={14} className="text-[#A5A5A5]" />
              <select 
                value={devFilter}
                onChange={(e) => setDevFilter(e.target.value)}
                className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer max-w-[150px]"
              >
                <option value="">All Developments</option>
                {developments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-black/5 rounded-xl px-3 py-1.5 shadow-sm">
              <Search size={14} className="text-[#A5A5A5]" />
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-[12px] font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="">All Sources</option>
                <option value="homepage">Homepage</option>
                <option value="contact_page">Contact Page</option>
                <option value="property_modal">Property Modal</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
            <X size={18} className="cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Enquiry List */}
          <div className={`${selectedEnquiry ? 'hidden lg:block lg:col-span-5' : (enquiries.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12')} space-y-3`}>
            {loading && enquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-2xl">
                <Loader2 className="animate-spin text-[#B5623A] mb-4" size={32} />
                <p className="text-[14px] text-[#A5A5A5]">Loading your inbox...</p>
              </div>
            ) : enquiries.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-black/5 rounded-2xl text-center">
                <div className="w-16 h-16 bg-[#FDFCFB] text-[#A5A5A5] flex items-center justify-center rounded-full mb-4">
                  <Inbox size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#141414]">No enquiries yet</h3>
                <p className="text-[13px] text-[#A5A5A5] max-w-xs mx-auto mt-1">
                  Once prospective clients submit the consultation form, they will appear here.
                </p>
                {(statusFilter || devFilter || sourceFilter || followUpFilter) && (
                  <button 
                    onClick={() => { setStatusFilter(''); setDevFilter(''); setSourceFilter(''); setFollowUpFilter(''); }}
                    className="mt-4 text-[#B5623A] text-[12px] font-bold uppercase tracking-wider hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {enquiries.map((enq) => {
                    const followUp = getFollowUpStatus(enq.followUpDate || '');
                    return (
                      <div 
                        key={enq.id}
                        onClick={() => setSelectedEnquiry(enq)}
                        className={`group relative bg-white border ${selectedEnquiry?.id === enq.id ? 'border-[#B5623A] ring-1 ring-[#B5623A]/10' : 'border-black/5 hover:border-black/10'} p-5 rounded-2xl transition-all cursor-pointer shadow-sm overflow-hidden`}
                      >
                        {enq.status === 'New' && (
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#B5623A]"></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(enq.status)}`}>
                              {enq.status}
                            </div>
                            <span className="text-[11px] font-medium text-[#A5A5A5] flex items-center gap-1">
                              <Calendar size={12} />
                              {format(new Date(enq.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {followUp && followUp !== 'upcoming' && enq.status !== 'Closed' && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${followUp === 'due' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              <AlertCircle size={10} />
                              {followUp === 'due' ? 'Due Today' : 'Overdue'}
                            </div>
                          )}
                        </div>

                        <h3 className="text-base font-semibold text-[#141414] group-hover:text-[#B5623A] transition-colors line-clamp-1">
                          {enq.name}
                        </h3>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-[13px] text-[#666] flex items-center gap-2">
                            <Tag size={12} className="text-[#A5A5A5]" />
                            {enq.service}
                          </p>
                          {enq.developmentTitle && (
                            <p className="text-[12px] text-[#A5A5A5] flex items-center gap-2">
                              <MapPin size={12} />
                              {enq.developmentTitle}
                            </p>
                          )}
                          {enq.source && (
                            <p className="text-[11px] text-[#A5A5A5] flex items-center gap-2 pt-1 font-medium italic">
                              Source: {enq.source.replace('_', ' ')}
                            </p>
                          )}
                        </div>

                        <div className="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight size={18} className="text-[#A5A5A5]" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => fetchEnquiries(lastId)}
                      disabled={loading}
                      className="px-6 py-2.5 bg-white border border-black/10 text-[12px] font-bold uppercase tracking-widest text-[#141414] hover:bg-[#141414] hover:text-white transition-all rounded-full disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More Enquiries'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail View */}
          <div className={`${selectedEnquiry ? 'col-span-1 lg:col-span-7' : 'hidden lg:col-span-7 lg:block'} sticky top-28 h-fit`}>
            {selectedEnquiry ? (
              <div className="bg-white border border-black/5 rounded-[2rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
                {/* Detail Header */}
                <div className="p-8 border-b border-black/5">
                  <div className="flex justify-between items-start mb-6">
                    <button 
                      onClick={() => setSelectedEnquiry(null)}
                      className="lg:hidden p-2 -ml-2 text-[#A5A5A5] hover:text-[#141414]"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[200px] sm:max-w-none">
                      {(['New', 'Contacted', 'Visit Arranged', 'Closed'] as EnquiryStatus[]).map((st) => (
                        <button 
                          key={st}
                          onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                          disabled={updatingId === selectedEnquiry.id}
                          className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border ${selectedEnquiry.status === st ? getStatusColor(st) : 'bg-white text-[#A5A5A5] border-black/5 hover:border-black/10'}`}
                        >
                          {updatingId === selectedEnquiry.id && selectedEnquiry.status !== st ? <Loader2 size={10} className="animate-spin inline mr-1" /> : null}
                          {st === 'Visit Arranged' ? 'Visit' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-medium tracking-tight text-[#141414] mb-2">{selectedEnquiry.name}</h2>
                      <div className="flex flex-wrap gap-4 text-[14px]">
                        <a href={`tel:${selectedEnquiry.phone}`} className="flex items-center gap-2 text-[#B5623A] hover:underline font-medium">
                          <Phone size={16} />
                          {selectedEnquiry.phone}
                        </a>
                        {selectedEnquiry.email && (
                          <a href={`mailto:${selectedEnquiry.email}`} className="flex items-center gap-2 text-[#666] hover:text-[#141414] transition-colors">
                            <Mail size={16} />
                            {selectedEnquiry.email}
                          </a>
                        )}
                      </div>
                    </div>
                    {selectedEnquiry.source && (
                      <div className="px-3 py-1 bg-[#FDFCFB] border border-black/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#A5A5A5]">
                        {selectedEnquiry.source.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-8 space-y-8">
                  {/* Internal Notes & Follow-up (NEW S07B) */}
                  <div className="bg-[#FDFCFB] p-6 rounded-[1.5rem] border border-[#B5623A]/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B5623A]/5">
                      <div className="w-2 h-2 rounded-full bg-[#B5623A]"></div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#B5623A]">Internal & Private Workflow</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5623A] mb-2">
                          <CalendarDays size={12} />
                          Follow-up Date (IST)
                        </label>
                        <input 
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-[14px] focus:ring-1 focus:ring-[#B5623A] outline-none transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleUpdateDetails}
                          disabled={isSavingDetails}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B5623A] text-white text-[12px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#9E5431] transition-all disabled:opacity-50"
                        >
                          {isSavingDetails ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save Changes
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B5623A] mb-2">
                        <FileText size={12} />
                        Internal Notes
                      </label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add private workflow notes here..."
                        className="w-full h-24 bg-white border border-black/5 rounded-xl px-4 py-2.5 text-[14px] focus:ring-1 focus:ring-[#B5623A] outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5A5A5] mb-2">Service Requested</h4>
                      <p className="text-[15px] text-[#141414] font-medium">{selectedEnquiry.service}</p>
                    </div>
                    {selectedEnquiry.visitDate && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5A5A5] mb-2">Requested Visit</h4>
                        <div className="space-y-1">
                          <p className="text-[14px] text-[#141414] font-medium flex items-center gap-2">
                            <Calendar size={14} className="text-[#B5623A]" />
                            {format(new Date(selectedEnquiry.visitDate), 'MMMM do, yyyy')}
                          </p>
                          <p className="text-[13px] text-[#666] flex items-center gap-2">
                            <Clock size={14} />
                            {selectedEnquiry.visitTimeSlot}
                          </p>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#B5623A]/10 text-[#B5623A] text-[10px] font-bold uppercase tracking-wider rounded">
                            {selectedEnquiry.visitType === 'Video' ? <Video size={10} /> : <MapPin size={10} />}
                            {selectedEnquiry.visitType} Viewing
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedEnquiry.locality && !selectedEnquiry.visitDate && (
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5A5A5] mb-2">Target Locality</h4>
                        <p className="text-[15px] text-[#141414] font-medium">{selectedEnquiry.locality}</p>
                      </div>
                    )}
                  </div>

                  {selectedEnquiry.developmentTitle && (
                    <div className="p-4 bg-[#FDFCFB] border border-black/5 rounded-2xl flex items-center justify-between group">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5A5A5] mb-1.5">Contextual Development</h4>
                        <p className="text-[14px] text-[#141414] font-semibold">{selectedEnquiry.developmentTitle}</p>
                      </div>
                      {selectedEnquiry.developmentSlug && (
                        <a 
                          href={`/developments/${selectedEnquiry.developmentSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#B5623A] bg-white border border-[#B5623A]/20 rounded-full hover:bg-[#B5623A] hover:text-white transition-all shadow-sm"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5A5A5] mb-3">Client Message</h4>
                    <div className="bg-[#F8F8F8] p-5 rounded-2xl border border-black/5 min-h-[100px]">
                      {selectedEnquiry.message ? (
                        <p className="text-[15px] text-[#141414] leading-relaxed whitespace-pre-wrap">{selectedEnquiry.message}</p>
                      ) : (
                        <p className="text-[14px] text-[#A5A5A5] italic italic">No message provided.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 flex flex-wrap gap-6 text-[12px] text-[#A5A5A5]">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      Received {format(new Date(selectedEnquiry.createdAt), 'MMMM do, yyyy @ h:mm a')}
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon size={14} className={selectedEnquiry.acknowledgedContact ? 'text-green-500' : 'text-gray-300'} />
                      {selectedEnquiry.acknowledgedContact ? 'Contact Acknowledged' : 'Consent Missing'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className={selectedEnquiry.marketingConsent ? 'text-green-500' : 'text-gray-300'} />
                      Marketing: {selectedEnquiry.marketingConsent ? 'Subscribed' : 'Not subscribed'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-white border border-dashed border-black/10 rounded-[2rem] text-[#A5A5A5]">
                <Inbox size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-[14px]">Select an enquiry to view full details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldCheckIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
