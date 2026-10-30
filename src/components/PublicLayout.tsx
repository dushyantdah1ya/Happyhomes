import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
  children: ReactNode;
  /** Whether this is the homepage (which starts with a full-viewport hero) */
  isHome?: boolean;
  className?: string;
}

export default function PublicLayout({
  children,
  isHome = false,
  className = '',
}: PublicLayoutProps) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8F8F8] text-[#141414] selection:bg-[#141414] selection:text-white relative">
      <Navbar />
      <main className={`flex-1 w-full ${isHome ? '' : 'pt-24 sm:pt-28 md:pt-32'} ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
