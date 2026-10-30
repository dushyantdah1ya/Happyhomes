import React, { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router';
import { 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowUpRight, 
  MessageSquare,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Mail,
  Navigation,
  Calendar,
  Video,
  Camera
} from 'lucide-react';
import Logo from '../components/Logo';
import PublicLayout from '../components/PublicLayout';
import { developments } from '../data/developments';
import { useSettings } from '../hooks/useSettings';

type ContactIntent = 'General Enquiry' | 'Site Visit' | 'Video Viewing';

export default function ContactPage() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('Turnkey Villa');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [intent, setIntent] = useState<ContactIntent>('General Enquiry');
  const [visitDate, setVisitDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM - 01:00 PM');
  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedContact, setAcknowledgedContact] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [idempotencyKey] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36));

  useEffect(() => {
    const intentParam = searchParams.get('intent');
    if (intentParam === 'visit') {
      setIntent('Site Visit');
    } else if (intentParam === 'video') {
      setIntent('Video Viewing');
    }
  }, [searchParams]);

  const handleIntentChange = (newIntent: ContactIntent) => {
    setIntent(newIntent);
    if (newIntent === 'General Enquiry') {
      setVisitDate('');
      setVisitTimeSlot('11:00 AM - 01:00 PM');
      setSelectedDevelopmentId('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !acknowledgedContact) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const isVisit = intent !== 'General Enquiry';

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idempotencyKey,
          name: fullName,
          phone,
          message: message || undefined,
          service: isVisit ? `Viewing Request: ${intent}` : interest,
          locality: 'Jagatpura, Jaipur',
          acknowledgedContact,
          marketingConsent,
          formVersion: '2026-10-S06B-v2',
          source: isVisit ? `contact_page_${intent.toLowerCase().replace(' ', '_')}` : 'contact_page',
          honeypot,
          // Visit fields
          visitDate: isVisit ? visitDate : undefined,
          visitTimeSlot: isVisit ? visitTimeSlot : undefined,
          visitType: intent === 'Site Visit' ? 'In-person' : (intent === 'Video Viewing' ? 'Video' : undefined),
          developmentId: isVisit && selectedDevelopmentId ? selectedDevelopmentId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit enquiry');
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[Contact Page Enquiry Error]', err);
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = settings.whatsapp.replace(/\D/g, '');

  const whatsappText = encodeURIComponent(
    `Hello Happy Homes Jaipur, I would like to enquire through your contact page.\n\n• Name: ${fullName || 'Prospective Client'}\n• Phone: ${phone || 'Provided via WhatsApp'}\n• Interest: ${interest}${message ? `\n• Notes: ${message}` : ''}`
  );

  return (
    <PublicLayout>
      <div className="max-w-[1600px] mx-auto">
        {/* Breadcrumb Navigation & Hero Section */}
        <section className="px-6 md:px-12 pt-8 sm:pt-12 pb-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373]">
              <li>
                <Link to="/" className="hover:text-[#141414] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-black/30">/</li>
              <li>
                <span className="text-[#B5623A] font-medium">Contact Studio</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A5A5A5] block mb-4">
              Project Registry & Studio Access
            </span>
            <h1 className="text-4xl md:text-7xl font-light tracking-[-0.04em] leading-[1.05] text-[#141414] mb-8">
              Connect with <span className="italic text-[#B5623A]">Happy Homes.</span>
            </h1>
            <p className="text-[#737373] text-lg md:text-xl leading-relaxed font-light max-w-2xl">
              From plot evaluation in Jagatpura to turnkey villa construction management, our project desk is ready to assist your architectural journey in Jaipur.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 px-6 md:px-12 pb-24 md:pb-32">
          
          {/* Left Column: Coordinates & Studio Info */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Direct Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <a 
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="group p-8 bg-[#FDFCFB] border border-black/5 rounded-3xl hover:border-[#B5623A]/30 transition-all shadow-sm"
              >
                <div className="w-10 h-10 bg-white border border-black/5 flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
                  <Phone size={20} className="text-[#B5623A]" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5] block mb-1">Call Project Desk</span>
                <span className="text-xl font-mono text-[#141414]">{settings.phone}</span>
              </a>

              <a 
                href={`mailto:${settings.email}`}
                className="group p-8 bg-[#FDFCFB] border border-black/5 rounded-3xl hover:border-[#B5623A]/30 transition-all shadow-sm"
              >
                <div className="w-10 h-10 bg-white border border-black/5 flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform">
                  <Mail size={20} className="text-[#B5623A]" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5] block mb-1">Email Enquiries</span>
                <span className="text-xl font-light text-[#141414] break-all">{settings.email}</span>
              </a>
            </div>

            {/* Studio Address */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#141414] border-b border-black/10 pb-4">
                Jaipur Studio Headquarters
              </h3>
              <div className="flex gap-4">
                <MapPin size={24} className="text-[#B5623A] shrink-0 mt-1" />
                <div className="space-y-4">
                  <p className="text-lg text-[#555] font-light leading-relaxed">
                    {settings.address}
                  </p>
                  {settings.directionsUrl ? (
                    <a 
                      href={settings.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#141414] hover:text-[#B5623A] transition-colors group"
                    >
                      <Navigation size={14} />
                      <span>Get Directions</span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <div className="text-[12px] font-mono text-[#555]">26.8184° N, 75.8752° E</div>
                  )}
                </div>
              </div>
            </div>

            {/* Operational Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5] mb-3">Consultation Hours</h4>
                <p className="text-[14px] text-[#555] font-light">
                  {settings.officeHours}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5] mb-3">RERA Compliance</h4>
                <p className="text-[14px] text-[#555] font-light">
                  Registered RAJ-RERA<br />
                  JDA Approved Protocols
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div id="enquiry" className="lg:col-span-7">
            <div className="bg-[#F8F8F8] border border-black/5 p-8 md:p-16 rounded-[3rem] shadow-sm relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5623A]/5 rounded-bl-[100%]"></div>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#B5623A]/10 border border-[#B5623A]/20 flex items-center justify-center rounded-full mx-auto mb-8">
                    <CheckCircle2 size={40} className="text-[#B5623A]" />
                  </div>
                  <h2 className="text-3xl font-light text-[#141414] mb-4">
                    {intent === 'General Enquiry' ? 'Enquiry Logged Successfully' : 'Visit Request Received'}
                  </h2>
                  <p className="text-[#737373] text-base font-light max-w-md mx-auto mb-10 leading-relaxed">
                    {intent === 'General Enquiry' ? (
                      <>Thank you, {fullName}. We have received your interest in <span className="font-medium text-[#141414]">{interest}</span>. Our advisory team will review the details and contact you at <span className="font-medium text-[#141414]">{phone}</span> shortly.</>
                    ) : (
                      <>Thank you, {fullName}. Your request for a <span className="font-medium text-[#141414]">{intent}</span> has been received and requires confirmation. Our site manager will contact you at <span className="font-medium text-[#141414]">{phone}</span> to finalize the schedule.</>
                    )}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#141414] text-white px-8 py-4 text-[12px] font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-3 rounded-full hover:bg-black transition-all"
                    >
                      <MessageSquare size={16} />
                      <span>WhatsApp Directly</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFullName('');
                        setPhone('');
                        setMessage('');
                      }}
                      className="border border-black/20 text-[#141414] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.16em] rounded-full hover:bg-white hover:border-black transition-all"
                    >
                      Submit Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-12">
                    <h2 className="text-3xl font-light text-[#141414] mb-3">
                      {intent === 'General Enquiry' ? 'Architectural Enquiry' : 'Schedule a Viewing'}
                    </h2>
                    <p className="text-[14px] text-[#A5A5A5] font-light">
                      {intent === 'General Enquiry' 
                        ? 'Fill in the details below to schedule a consultation with our builder team.' 
                        : 'Select your preferred date and time for a guided walkthrough of our properties.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Request Selector */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] block">
                        I would like to request:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['General Enquiry', 'Site Visit', 'Video Viewing'] as ContactIntent[]).map((item) => (
                          <button
                            type="button"
                            key={item}
                            onClick={() => handleIntentChange(item)}
                            className={`p-4 text-[13px] border transition-all text-center rounded-2xl flex flex-col items-center gap-2 ${
                              intent === item
                                ? 'bg-[#141414] text-white border-[#141414] shadow-lg shadow-black/10'
                                : 'bg-white text-[#555] border-black/5 hover:border-black/20'
                            }`}
                          >
                            {item === 'General Enquiry' && <MessageSquare size={16} />}
                            {item === 'Site Visit' && <MapPin size={16} />}
                            {item === 'Video Viewing' && <Camera size={16} />}
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {intent === 'General Enquiry' ? (
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] block">
                          I am interested in:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {['Turnkey Villa', 'Independent Floor', 'JDA Freehold Plot'].map((item) => (
                            <button
                              type="button"
                              key={item}
                              onClick={() => setInterest(item)}
                              className={`p-4 text-[13px] border transition-all text-center rounded-2xl ${
                                interest === item
                                  ? 'bg-[#141414] text-white border-[#141414] shadow-lg shadow-black/10'
                                  : 'bg-white text-[#555] border-black/5 hover:border-black/20'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                        {/* Development Selection */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                            Select Development
                          </label>
                          <select
                            value={selectedDevelopmentId}
                            onChange={(e) => setSelectedDevelopmentId(e.target.value)}
                            className="w-full bg-white border border-black/10 p-4 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] rounded-xl appearance-none"
                          >
                            <option value="">Not sure yet / General portfolio</option>
                            {developments.map((dev) => (
                              <option key={dev.id} value={dev.id}>
                                {dev.title} — {dev.location}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Date */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                              Preferred Date
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                required={intent !== 'General Enquiry'}
                                min={new Date().toISOString().split('T')[0]}
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full bg-white border border-black/10 p-4 pl-12 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] rounded-xl"
                              />
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A5A5A5]" size={18} />
                            </div>
                          </div>

                          {/* Time */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                              Time Window (IST)
                            </label>
                            <div className="relative">
                              <select
                                value={visitTimeSlot}
                                onChange={(e) => setVisitTimeSlot(e.target.value)}
                                className="w-full bg-white border border-black/10 p-4 pl-12 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] rounded-xl appearance-none"
                              >
                                <option>10:00 AM - 12:00 PM</option>
                                <option>12:00 PM - 02:00 PM</option>
                                <option>02:00 PM - 04:00 PM</option>
                                <option>04:00 PM - 06:00 PM</option>
                                <option>Flexible / Any time</option>
                              </select>
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A5A5A5]" size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vikram Singh"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white border border-black/10 p-4 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-all rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98XXX XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white border border-black/10 p-4 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-all rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5]">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your specific requirements, preferred location, or timelines."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-white border border-black/10 p-4 text-[14px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-all rounded-xl resize-none"
                      />
                    </div>

                    {/* Honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <input 
                        type="text" 
                        value={honeypot} 
                        onChange={(e) => setHoneypot(e.target.value)} 
                        tabIndex={-1} 
                        autoComplete="off" 
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                          type="checkbox"
                          required
                          checked={acknowledgedContact}
                          onChange={(e) => setAcknowledgedContact(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A] mt-0.5"
                        />
                        <span className="text-[13px] leading-tight text-[#666] group-hover:text-[#141414] transition-colors">
                          I acknowledge that Happy Homes advisory team will contact me regarding this enquiry per the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[#B5623A] hover:text-[#141414]">Privacy Policy</a>. <span className="text-red-500">*</span>
                        </span>
                      </label>

                      <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={marketingConsent}
                          onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A] mt-0.5"
                        />
                        <span className="text-[13px] leading-tight text-[#A5A5A5] group-hover:text-[#141414] transition-colors">
                          Optional: I would like to receive occasional updates on new Jaipur projects.
                        </span>
                      </label>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl flex items-start gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || !acknowledgedContact}
                        className="flex-1 bg-[#141414] hover:bg-black disabled:bg-[#A5A5A5] text-white px-8 py-4.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-black/5 rounded-full"
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">Processing Enquiry...</span>
                        ) : (
                          <>
                            <span>Submit Request</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white border border-black/10 hover:border-black text-[#141414] px-8 py-4.5 text-[12px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer rounded-full"
                      >
                        <MessageSquare size={16} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
