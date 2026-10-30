import PublicLayout from '../components/PublicLayout';
import { Shield, Lock, Eye, FileText, AlertCircle, Scale, Server } from 'lucide-react';
import { Link } from 'react-router';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 md:px-16 pt-8 pb-24 md:pb-32">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[11px] font-mono tracking-wider uppercase text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">Home</Link>
            </li>
            <li className="text-[#A5A5A5]">•</li>
            <li className="text-[#141414] font-medium" aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <div className="mb-8 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3.5 text-[12px] text-amber-900">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Draft for Owner Review</strong>
              <p className="font-light leading-relaxed">
                This document is a source-maintained operational privacy policy for Happy Homes Jaipur. Formal operator identity and designated privacy contact coordinates remain subject to final owner confirmation prior to public launch.
              </p>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-[#141414] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[11px] font-mono text-[#737373] uppercase tracking-widest mb-12">
            Last Revised: October 2026
          </p>

          <div className="space-y-12 text-[#555] font-light leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Shield size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">1. Introduction</h2>
              </div>
              <p>
                Happy Homes ("we," "us," or "our") is a direct residential builder and developer operating in Jaipur, Rajasthan. This Privacy Policy outlines how personal information collected through our website and property enquiry desk is managed, processed, and protected.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Eye size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">2. Information We Collect</h2>
              </div>
              <p>
                We collect personal information that you voluntarily submit when requesting property details or scheduling site visits:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact Data:</strong> Name and primary phone number (required); email address (optional).</li>
                <li><strong>Enquiry & Property Context:</strong> Selected development interest, architectural category (villas, independent floors, or plots), target locality, and optional message/notes.</li>
                <li><strong>Visit Preferences:</strong> Requested viewing dates, time slots, and viewing type (On-site Visit or Video Viewing).</li>
                <li><strong>Consent Preferences:</strong> Contact acknowledgement (required for submission) and optional marketing consent.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Scale size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">3. How Information Is Used</h2>
              </div>
              <p>
                Information collected through our website forms is used for project operations:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To respond to your specific property enquiries and coordinate project details.</li>
                <li>To schedule and confirm in-person site visits or video walkthroughs.</li>
                <li>To send project updates (only if you have explicitly opted into marketing preferences).</li>
                <li>To prevent automated form abuse and enforce server rate limits.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Server size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">4. Technical Processors & Infrastructure</h2>
              </div>
              <p>
                We rely on technical service providers to maintain website availability and data storage:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Cloud & Firebase:</strong> Provides database storage (Firestore), administrative authentication, and application hosting.</li>
                <li><strong>Cloudinary:</strong> Delivers architectural imagery and media assets. Cloudinary does not receive your submitted enquiry data.</li>
              </ul>
              <p>
                We do not sell personal enquiry data to third parties for behavioral profiling.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <Lock size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">5. Cookies, Storage & Security</h2>
              </div>
              <p>
                Standard browser persistence is used by Firebase Authentication to manage secure sessions for authorized administrative access. No third-party marketing tracking pixels are implemented in the current codebase.
              </p>
              <p>
                <strong>Security Measures:</strong> Technical identifiers are used to help prevent abuse and enforce server rate limits. All data in transit is encrypted using HTTPS.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[#141414] font-medium mb-2">
                <FileText size={20} className="text-[#B5623A]" />
                <h2 className="text-xl">6. Data Retention & Your Rights</h2>
              </div>
              <p>
                Enquiry records are stored to support responses and follow-up. The retention and deletion arrangements for this draft notice remain subject to owner review.
              </p>
              <p>
                You have the right to request access to your submitted enquiry information, request corrections, or ask for the deletion of your records. To exercise these rights, please contact our project desk via our <Link to="/contact" className="text-[#B5623A] underline font-medium">Contact Page</Link>.
              </p>
            </section>

            <div className="pt-8 border-t border-black/10">
              <p className="text-[12px] text-[#888]">
                Note: This policy is an operational draft maintained alongside application updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
