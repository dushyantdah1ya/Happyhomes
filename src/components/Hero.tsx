import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden bg-[#141414]">
      {/* 
        Background Architectural Video
        Preserved existing composition with neutral illustrative attribution.
      */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_144509_89e2d612-8af2-45c3-90f4-4831bc60715d.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Illustrative media attribution pill */}
      <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
        <span className="bg-black/60 backdrop-blur-md text-white/70 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
          Illustrative Architectural Concept
        </span>
      </div>

      {/* Hero Content: Positioned in upper-left safe zone */}
      <div className="relative z-10 w-full h-full flex flex-col justify-start pt-[14vh] sm:pt-[16vh] lg:pt-[18vh] px-8 sm:px-12 md:px-20 lg:px-24">
        <div className="max-w-[90%] sm:max-w-[80%] lg:max-w-[48%] space-y-8 lg:-ml-[3%]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#1A1A1A] tracking-tight leading-[0.98] max-w-[14ch]"
          >
            Jaipur,
            <br />
            Undisputed.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2"
          >
            <Link
              to="/developments"
              className="inline-flex items-center justify-center gap-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300"
            >
              <span>Explore Our Developments</span>
              <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
