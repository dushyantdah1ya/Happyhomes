import { useState, type FormEvent } from 'react';
import { 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowUpRight, 
  MessageSquare,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

export default function ContactSection() {
  const { settings } = useSettings();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('Turnkey Villa');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedContact, setAcknowledgedContact] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [idempotencyKey] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !acknowledgedContact) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

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
          service: interest,
          locality: 'Jagatpura, Jaipur', // Default locality for homepage form
          acknowledgedContact,
          marketingConsent,
          formVersion: '2026-10-S06A',
          source: 'homepage_contact',
          honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit enquiry');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Homepage Enquiry Error]', err);
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappText = encodeURIComponent(
    `Hello Happy Homes Jaipur, I would like to schedule a private consultation.\n\n• Name: ${fullName || 'Prospective Client'}\n• Phone: ${phone || 'Provided via WhatsApp'}\n• Interest: ${interest}${message ? `\n• Notes: ${message}` : ''}`
  );

  const whatsappNumber = settings.whatsapp.replace(/\D/g, '');

  return (
    <section id="contact" className="px-6 md:px-12 py-24 md:py-32 w-full max-w-[1600px] mx-auto bg-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
        <div className="max-w-xl">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A5A5A5] block mb-3">
            Construction Project Desk
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] leading-[1.08] text-[#141414]">
            Start a <span className="text-[#B5623A]">construction conversation.</span>
          </h2>
        </div>
        <p className="text-[#737373] text-[14px] leading-relaxed max-w-md font-light">
          Whether evaluating a prospective plot in Jagatpura, scheduling a private villa site visit, or discussing master-planned construction timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Direct Studio Access & Coordinates (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] block mb-2">
              Direct Advisory Line
            </span>
            <a 
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              className="text-3xl sm:text-4xl font-light text-[#141414] font-mono tracking-tight hover:opacity-75 transition-opacity block"
            >
              {settings.phone}
            </a>
            <p className="text-[12px] text-[#737373] mt-1 font-light">
              Direct connection to Happy Homes senior property advisory partners.
            </p>
          </div>

          <div className="pt-6 border-t border-black/10 space-y-4 text-[13px] text-[#555]">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#141414] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#141414] block font-medium">Jaipur Studio Headquarters</strong>
                <p className="text-[#666] text-[13px] mt-0.5 leading-relaxed font-light">
                  {settings.address}
                </p>
                {settings.directionsUrl ? (
                  <a 
                    href={settings.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#141414] hover:text-[#B5623A] transition-colors border-0 bg-transparent p-0 cursor-pointer mt-1"
                  >
                    <span>View Directions (Google Maps)</span>
                    <ArrowUpRight size={11} />
                  </a>
                ) : (
                  <div className="text-[11px] font-mono text-[#737373] mt-1">26.8184° N, 75.8752° E</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3">
              <Clock size={16} className="text-[#141414] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#141414] block font-medium">Studio Consultations</strong>
                <p className="text-[#666] text-[13px] mt-0.5 font-light">
                  {settings.officeHours}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3">
              <ShieldCheck size={16} className="text-[#B5623A] mt-0.5 shrink-0" />
              <div>
                <strong className="text-[#141414] block font-medium">Direct Developer Access</strong>
                <p className="text-[#666] text-[13px] mt-0.5 font-light">
                  Direct engagement with the Happy Homes project desk and building supervisors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Editorial Inquiry Card (7 cols) */}
        <div id="enquiry" className="lg:col-span-7 bg-[#F8F8F8] border border-[#141414] p-8 sm:p-12 rounded-[2rem]">
          {isSubmitted ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border border-[#B5623A] mx-auto flex items-center justify-center mb-5 bg-[#B5623A]/10 rounded-full">
                <CheckCircle2 size={24} className="text-[#B5623A]" />
              </div>
              <h3 className="text-2xl font-light text-[#141414] mb-2">
                Inquiry Logged
              </h3>
              <p className="text-[13px] text-[#666] max-w-md mx-auto mb-8 font-light">
                Thank you, {fullName}. Your enquiry has been logged successfully. Happy Homes will review your request and reach out to <strong className="text-[#141414]">{phone}</strong> if additional details are needed.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#141414] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 rounded-full"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Directly</span>
                </a>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="border border-[#141414] hover:bg-[#141414] hover:text-white text-[#141414] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer rounded-full"
                >
                  Submit Another Note
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] block mb-2">
                  Requirement Type
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Turnkey Villa', 'Independent Floor', 'Residential Plot'].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setInterest(item)}
                      className={`p-3 text-[12px] border transition-all text-left cursor-pointer rounded-xl ${
                        interest === item
                          ? 'bg-[#141414] text-white border-[#141414] border-t-2 border-t-[#B5623A]'
                          : 'bg-white text-[#555] border-black/10 hover:border-black/30'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-black/10 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-black/10 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#A5A5A5] mb-1.5">
                  Specific Sector or Requirement Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Interested in inspecting completed villas in Kusum Vihar or checking plot availability in Jagatpura."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-black/10 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg resize-none"
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

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center h-5">
                    <input
                      type="checkbox"
                      required
                      checked={acknowledgedContact}
                      onChange={(e) => setAcknowledgedContact(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A]"
                    />
                  </div>
                  <span className="text-[12px] leading-tight text-[#666] group-hover:text-[#141414] transition-colors">
                    I acknowledge that Happy Homes may contact me about this enquiry per the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[#B5623A] hover:text-[#141414]">Privacy Policy</a>. <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A]"
                    />
                  </div>
                  <span className="text-[12px] leading-tight text-[#A5A5A5] group-hover:text-[#141414] transition-colors">
                    Optional: I would like to receive occasional updates on new Jaipur projects.
                  </span>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl flex items-start gap-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !acknowledgedContact}
                  className="bg-[#141414] hover:bg-black disabled:bg-[#A5A5A5] text-white px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm whitespace-nowrap rounded-full"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing Request...</span>
                  ) : (
                    <>
                      <span>Schedule Builder Consultation</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#141414] hover:bg-black text-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm rounded-full"
                >
                  <MessageSquare size={13} />
                  <span>WhatsApp Directly</span>
                </a>
              </div>

            </form>
          )}
        </div>

      </div>

    </section>
  );
}
