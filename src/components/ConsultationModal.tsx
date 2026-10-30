import React, { useState } from 'react';
import { X, Phone, MessageSquare, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
  developmentId?: string | null;
}

export default function ConsultationModal({ 
  isOpen, 
  onClose, 
  defaultService = 'Luxury Villa Acquisition',
  developmentId = null
}: ConsultationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [service, setService] = useState(defaultService);
  const [locality, setLocality] = useState('Jagatpura, Jaipur');
  const [acknowledgedContact, setAcknowledgedContact] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim() || !acknowledgedContact) return;
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
          name,
          phone,
          email: email || undefined,
          message: message || undefined,
          service,
          locality,
          developmentId,
          acknowledgedContact,
          marketingConsent,
          formVersion: '2026-10-S06A',
          honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit enquiry');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[Enquiry Submission Error]', err);
      setError(err.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Happy Homes, I am interested in ${service} in ${locality}. Please provide details.`
  );

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border border-[#141414]/10 shadow-2xl p-6 sm:p-10 flex flex-col rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#A5A5A5] hover:text-[#141414] transition-colors p-1"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="mb-4">
              <Logo variant="color" size="sm" subtitle="JAIPUR ADVISORY" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#141414] mb-2">
              Private Consultation
            </h3>
            <p className="text-[13px] text-[#A5A5A5] leading-relaxed mb-6">
              Connect directly with our senior site engineers and construction team for custom builds, structural project evaluations, or JDA compliance.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                  Your Name
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-black/15 px-3.5 py-2.5 text-[14px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="091660 54964"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-black/15 px-3.5 py-2.5 text-[14px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                  Email Address <span className="text-gray-400 normal-case">(Optional)</span>
                </label>
                <input 
                  type="email"
                  placeholder="e.g. vikram@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-black/15 px-3.5 py-2.5 text-[14px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                    Project Type
                  </label>
                  <select 
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full border border-black/15 px-3 py-2.5 text-[13px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] bg-white transition-colors rounded-lg"
                  >
                    <option value="Luxury Villa Construction">Luxury Villa Construction</option>
                    <option value="Independent Luxury Floor">Independent Luxury Floor</option>
                    <option value="JDA Plot Development">JDA Plot Development</option>
                    <option value="Structural Project Audit">Structural Project Audit</option>
                    <option value="Regulatory Compliance Audit">Regulatory Compliance Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                    Target Locality
                  </label>
                  <select 
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full border border-black/15 px-3 py-2.5 text-[13px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] bg-white transition-colors rounded-lg"
                  >
                    <option value="Jagatpura, Jaipur">Jagatpura, Jaipur</option>
                    <option value="Kusum Vihar, Jaipur">Kusum Vihar, Jaipur</option>
                    <option value="Vidhyadhar Nagar, Jaipur">Vidhyadhar Nagar</option>
                    <option value="OBC Colony, Jaipur">OBC Colony, Jagatpura</option>
                    <option value="Other Jaipur Area">Other Jaipur Area</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#141414] mb-1.5">
                  Message <span className="text-gray-400 normal-case">(Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Tell us about your requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-black/15 px-3.5 py-2.5 text-[14px] text-[#141414] outline-none focus:border-[#B5623A] focus:ring-1 focus:ring-[#B5623A] transition-colors rounded-lg resize-none"
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

              <div className="space-y-3 mt-1">
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
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-lg">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || !acknowledgedContact}
                className="mt-3 w-full bg-[#141414] hover:bg-black disabled:bg-[#A5A5A5] text-white py-3.5 px-6 text-[12px] font-bold tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-2 rounded-full"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>Confirm Request</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a 
                href={`https://wa.me/919166054964?text=${whatsappMessage}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] text-[#141414] font-medium hover:opacity-75 transition-opacity"
              >
                <MessageSquare size={14} />
                <span>WhatsApp Directly</span>
              </a>
              <a 
                href="tel:09166054964" 
                className="flex items-center gap-2 text-[12px] text-[#141414] font-medium hover:opacity-75 transition-opacity"
              >
                <Phone size={14} />
                <span>Call: 091660 54964</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#B5623A] text-white flex items-center justify-center mx-auto mb-4">
              <Check size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-medium tracking-tight text-[#141414] mb-2">
              Enquiry Received
            </h3>
            <p className="text-[14px] text-[#A5A5A5] leading-relaxed max-w-sm mx-auto mb-6">
              Thank you, <strong className="text-[#141414] font-semibold">{name || 'Client'}</strong>. Your enquiry has been received. Happy Homes will contact you at <strong className="text-[#141414]">{phone}</strong> regarding your interest in <strong className="text-[#141414]">{service}</strong>.
            </p>

            <div className="p-4 bg-gray-50 border border-black/5 text-left mb-6 space-y-1.5 text-[12px] text-[#141414]">
              <div className="flex items-center gap-2 text-[#B5623A] font-medium">
                <ShieldCheck size={16} />
                <span>Direct Site Visit Coordination Guaranteed</span>
              </div>
              <p className="text-[#A5A5A5] pl-6 text-[11px]">
                Office: 172, near Gyan Vihar University, Kusum Vihar, Jagatpura, Jaipur
              </p>
            </div>

            <button 
              onClick={() => { setIsSubmitted(false); onClose(); }}
              className="bg-[#141414] hover:bg-black text-white py-3 px-8 text-[12px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer shadow-sm rounded-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
