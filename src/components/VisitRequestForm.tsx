import React, { useState, type FormEvent } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface VisitRequestFormProps {
  developmentId: string;
  developmentName: string;
  isSold?: boolean;
}

export default function VisitRequestForm({
  developmentId,
  developmentName,
  isSold = false,
}: VisitRequestFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning (10:00 - 12:00)');
  const [visitType, setVisitType] = useState<'In-person' | 'Video'>('In-person');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgedContact, setAcknowledgedContact] = useState(false);
  const [idempotencyKey] = useState(() => Math.random().toString(36).slice(2) + Date.now().toString(36));

  // Get tomorrow's date for min date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !acknowledgedContact) return;
    if (!isSold && !visitDate) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey,
          name: fullName,
          phone,
          service: isSold ? 'Enquiry: Similar developments' : `Visit: ${visitType}`,
          developmentId,
          visitDate: visitDate || (isSold ? minDate : undefined),
          visitTimeSlot: timeSlot,
          visitType,
          message: message || undefined,
          acknowledgedContact,
          marketingConsent: false,
          formVersion: '2026-10-S10',
          source: isSold ? 'sold_similar_enquiry_form' : 'visit_request_form'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit request');

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-[#B5623A]/20 rounded-3xl p-8 text-center animate-in fade-in duration-500 shadow-sm">
        <div className="w-16 h-16 bg-[#B5623A]/10 border border-[#B5623A]/20 flex items-center justify-center rounded-full mx-auto mb-6">
          <CheckCircle2 size={32} className="text-[#B5623A]" />
        </div>
        <h3 className="text-2xl font-light text-[#141414] mb-3">
          {isSold ? 'Interest Registered' : 'Visit Request Logged'}
        </h3>
        <p className="text-[14px] text-[#666] max-w-sm mx-auto mb-2 leading-relaxed">
          {isSold ? (
            <>
              Thank you, {fullName}. We have logged your interest for developments comparable to <strong>{developmentName}</strong>.
            </>
          ) : (
            <>
              Thank you, {fullName}. We have received your request for an <strong>{visitType.toLowerCase()}</strong> viewing of {developmentName} on <strong>{visitDate ? new Date(visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'the requested date'}</strong>.
            </>
          )}
        </p>
        <p className="text-[13px] text-[#A5A5A5] font-light">
          Happy Homes developer desk will contact you at {phone} to discuss active and upcoming opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/10 rounded-3xl overflow-hidden shadow-xs">
      <div className="p-6 md:p-8 border-b border-black/5">
        <h3 className="text-xl font-light text-[#141414] mb-1">
          {isSold ? 'Enquire About Similar Developments' : 'Request Private Viewing'}
        </h3>
        <p className="text-[12px] text-[#A5A5A5] font-light uppercase tracking-wider">
          {isSold
            ? `Register requirements for upcoming or comparable residences to ${developmentName}`
            : 'Schedule a site walkthrough or video tour'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Visit Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisitType('In-person')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[12px] transition-all ${
                  visitType === 'In-person' 
                  ? 'bg-[#141414] text-white border-[#141414] shadow-sm' 
                  : 'bg-[#FAFAFA] text-[#555] border-black/5 hover:border-black/10'
                }`}
              >
                <MapPin size={14} />
                <span>In-person</span>
              </button>
              <button
                type="button"
                onClick={() => setVisitType('Video')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-[12px] transition-all ${
                  visitType === 'Video' 
                  ? 'bg-[#141414] text-white border-[#141414] shadow-sm' 
                  : 'bg-[#FAFAFA] text-[#555] border-black/5 hover:border-black/10'
                }`}
              >
                <Video size={14} />
                <span>Video Call</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Preferred Date</label>
            <div className="relative">
              <input
                type="date"
                required
                min={minDate}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-black/5 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] transition-all rounded-xl"
              />
              <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A5A5] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Preferred Time Slot</label>
            <div className="relative">
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-black/5 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] transition-all rounded-xl appearance-none"
              >
                <option>Morning (10:00 - 12:00)</option>
                <option>Mid-day (12:00 - 15:00)</option>
                <option>Evening (15:00 - 18:00)</option>
                <option>Late (18:00 - 19:30)</option>
              </select>
              <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A5A5] pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Phone / WhatsApp</label>
            <input
              type="tel"
              required
              placeholder="+91 98XXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-black/5 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] transition-all rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Your Name</label>
          <input
            type="text"
            required
            placeholder="e.g. S. Rajawat"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-black/5 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] transition-all rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A5A5A5]">Special Requirements (Optional)</label>
          <textarea
            rows={2}
            placeholder="e.g. I would like to see the JDA Patta copies during the visit."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-black/5 p-3 text-[13px] text-[#141414] focus:outline-none focus:border-[#B5623A] transition-all rounded-xl resize-none"
          />
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={acknowledgedContact}
              onChange={(e) => setAcknowledgedContact(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#B5623A] focus:ring-[#B5623A] mt-0.5"
            />
            <span className="text-[11px] leading-tight text-[#666] group-hover:text-[#141414] transition-colors">
              I acknowledge that Happy Homes will contact me at {phone || 'the provided number'} regarding this {isSold ? 'enquiry' : 'viewing'}. <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !acknowledgedContact}
          className="w-full bg-[#141414] hover:bg-black disabled:bg-[#A5A5A5] text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-full shadow-lg shadow-black/5"
        >
          {isSubmitting ? (
            <span className="animate-pulse tracking-widest">Logging Request...</span>
          ) : (
            <>
              <span>{isSold ? 'Submit Interest for Similar Developments' : 'Submit Viewing Request'}</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
