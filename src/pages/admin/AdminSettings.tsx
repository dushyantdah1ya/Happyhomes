import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { BusinessSettings } from '../../types/settings';
import Logo from '../../components/Logo';

export default function AdminSettings() {
  const { user, isOwner, loading: authLoading, getIdToken, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isOwner)) {
      navigate('/admin/login');
    }
  }, [authLoading, user, isOwner, navigate]);

  const fetchSettings = async () => {
    if (!isOwner) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = await getIdToken();
      if (!token) throw new Error('Authentication session missing. Please sign in again.');
      
      const res = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
      } else {
        setError(data.message || `Server error (${res.status}): Failed to load settings.`);
      }
    } catch (err: any) {
      console.error('[AdminSettings] fetch error:', err);
      setError(err.message || 'An unexpected error occurred while fetching settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchSettings();
    }
  }, [isOwner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !isOwner) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const token = await getIdToken();
      if (!token) throw new Error('Token expired. Please refresh the page.');

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BusinessSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const updateSocial = (platform: keyof BusinessSettings['socials'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socials: {
        ...settings.socials,
        [platform]: value
      }
    });
  };

  const updateOperational = (field: 'availabilityReviewIntervalDays' | 'brochureReviewIntervalDays', value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      operationalSettings: {
        availabilityReviewIntervalDays: settings.operationalSettings?.availabilityReviewIntervalDays || 30,
        brochureReviewIntervalDays: settings.operationalSettings?.brochureReviewIntervalDays || 90,
        ...settings.operationalSettings,
        [field]: value
      }
    });
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
              <a href="/admin/enquiries" className="text-[13px] font-medium text-[#A5A5A5] hover:text-[#141414] transition-colors">Enquiries</a>
              <a href="/admin/settings" className="text-[13px] font-bold text-[#141414] border-b-2 border-[#B5623A] pb-1">Settings</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#F8F8F8] border border-black/10 px-3 py-1.5 rounded-full text-[11px] font-mono text-[#555]">
              <ShieldCheck size={13} className="text-[#B5623A]" />
              <span className="truncate max-w-[150px]">{user?.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-[#A5A5A5] hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading || authLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#B5623A] mb-4" />
            <p className="text-[14px] text-[#A5A5A5] font-mono uppercase tracking-widest">Initialising Settings Console...</p>
          </div>
        ) : !settings ? (
          <div className="max-w-xl mx-auto text-center py-20 bg-white border border-black/5 rounded-[2rem] shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-medium text-[#141414] mb-2">Error Loading Settings</h2>
            <p className="text-[14px] text-[#666] mb-8 px-8">
              {error || 'An unexpected error occurred while preparing the business settings interface.'}
            </p>
            <button 
              onClick={fetchSettings}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#141414] text-white text-[12px] font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-md active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Settings size={16} className="text-[#B5623A]" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B5623A]">Business Identity</span>
                </div>
                <h1 className="text-4xl font-light tracking-tight text-[#141414]">Business Settings</h1>
                <p className="text-[14px] text-[#666] mt-2 font-light">Global contact information and brand profiles used across Happy Homes.</p>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3.5 bg-[#141414] text-white rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Configuration
              </button>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-700 text-sm animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Settings synchronized successfully with the production database.</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Contact Information */}
              <section className="bg-white rounded-[2rem] border border-black/5 p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#FDFCFB] border border-black/5 rounded-xl flex items-center justify-center text-[#B5623A]">
                    <Phone size={20} />
                  </div>
                  <h2 className="text-xl font-medium text-[#141414]">Contact Channels</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Public Phone</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91 98280 12345"
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">WhatsApp (Intl Format)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={settings.whatsapp}
                        onChange={(e) => updateField('whatsapp', e.target.value)}
                        placeholder="+919828012345"
                        className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                      />
                      <MessageSquare className="absolute right-4 top-3.5 w-4 h-4 text-[#A5A5A5]" />
                    </div>
                    <p className="text-[11px] text-[#A5A5A5] mt-1 ml-1 font-light italic">Used for automated wa.me links. No spaces or symbols except +.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Official Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="info@happyhomesjaipur.com"
                        className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                        required
                      />
                      <Mail className="absolute right-4 top-3.5 w-4 h-4 text-[#A5A5A5]" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Office Details */}
              <section className="bg-white rounded-[2rem] border border-black/5 p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#FDFCFB] border border-black/5 rounded-xl flex items-center justify-center text-[#B5623A]">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-medium text-[#141414]">Office Location</h2>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Mailing Address</label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      rows={3}
                      className="w-full px-5 py-4 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Google Maps Directions URL</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={settings.directionsUrl || ''}
                          onChange={(e) => updateField('directionsUrl', e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                        />
                        <ExternalLink className="absolute right-4 top-3.5 w-4 h-4 text-[#A5A5A5]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Business Hours</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={settings.officeHours || ''}
                          onChange={(e) => updateField('officeHours', e.target.value)}
                          placeholder="Mon - Sat: 10 AM - 7 PM"
                          className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                        />
                        <Clock className="absolute right-4 top-3.5 w-4 h-4 text-[#A5A5A5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Social Profiles */}
              <section className="bg-white rounded-[2rem] border border-black/5 p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#FDFCFB] border border-black/5 rounded-xl flex items-center justify-center text-[#B5623A]">
                    <Instagram size={20} />
                  </div>
                  <h2 className="text-xl font-medium text-[#141414]">Social Presence</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1 flex items-center gap-2">
                      <Instagram size={12} /> Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.socials.instagram || ''}
                      onChange={(e) => updateSocial('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1 flex items-center gap-2">
                      <Facebook size={12} /> Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={settings.socials.facebook || ''}
                      onChange={(e) => updateSocial('facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1 flex items-center gap-2">
                      <Linkedin size={12} /> LinkedIn Company URL
                    </label>
                    <input
                      type="url"
                      value={settings.socials.linkedin || ''}
                      onChange={(e) => updateSocial('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1 flex items-center gap-2">
                      <Twitter size={12} /> X / Twitter URL
                    </label>
                    <input
                      type="url"
                      value={settings.socials.twitter || ''}
                      onChange={(e) => updateSocial('twitter', e.target.value)}
                      placeholder="https://twitter.com/..."
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                  </div>
                </div>
              </section>

              {/* Operational Settings */}
              <section className="bg-white rounded-[2rem] border border-black/5 p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-[#FDFCFB] border border-black/5 rounded-xl flex items-center justify-center text-[#B5623A]">
                    <Clock size={20} />
                  </div>
                  <h2 className="text-xl font-medium text-[#141414]">Operational Review Cycles</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Availability Check Interval (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.operationalSettings?.availabilityReviewIntervalDays || 30}
                      onChange={(e) => updateOperational('availabilityReviewIntervalDays', parseInt(e.target.value, 10))}
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                    <p className="text-[11px] text-[#A5A5A5] mt-1 ml-1 font-light italic">Recommended: 30 days for active developments.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#737373] ml-1">Brochure Review Interval (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.operationalSettings?.brochureReviewIntervalDays || 90}
                      onChange={(e) => updateOperational('brochureReviewIntervalDays', parseInt(e.target.value, 10))}
                      className="w-full px-5 py-3 rounded-xl border border-black/10 focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A]/20 outline-none transition-all text-[15px]"
                    />
                    <p className="text-[11px] text-[#A5A5A5] mt-1 ml-1 font-light italic">Recommended: 90 days for legal/brochure compliance.</p>
                  </div>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-black/5 text-[11px] font-mono text-[#A5A5A5] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>Version sync: {new Date(settings.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} />
                  <span className="truncate max-w-[250px]">Owner Identity: {settings.updatedBy}</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
      
      <footer className="border-t border-black/10 bg-white py-6 px-6 text-center text-[10px] font-mono text-[#A5A5A5] uppercase tracking-[0.2em]">
        Happy Homes Jaipur • Secure Brand Management Environment
      </footer>
    </div>
  );
}

