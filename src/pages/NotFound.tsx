import { Link } from 'react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto text-center py-16 sm:py-24 px-6">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center justify-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373]">
            <li>
              <Link to="/" className="hover:text-[#141414] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-black/30">/</li>
            <li>
              <span className="text-[#B5623A] font-medium">404 Error</span>
            </li>
          </ol>
        </nav>

        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B5623A] block mb-3">
          Error 404 • Route Unresolved
        </span>
        <h1 className="text-4xl sm:text-6xl font-light tracking-[-0.03em] leading-tight text-[#141414] mb-4">
          Page Not Found
        </h1>
        <p className="text-[14px] text-[#666] font-light leading-relaxed mb-8 max-w-md mx-auto">
          The requested path could not be located in our development catalog. Return to the homepage or explore our published residential developments.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#141414] hover:bg-black text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/developments"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-[#141414] border border-black/10 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] rounded-full transition-all"
          >
            <span>Explore Portfolio</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

