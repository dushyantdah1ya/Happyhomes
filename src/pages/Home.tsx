import PublicLayout from '../components/PublicLayout';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Investment from '../components/Investment';
import Properties from '../components/Properties';
import CostEstimator from '../components/CostEstimator';
import StudioGuild from '../components/StudioGuild';
import HowItWorks from '../components/HowItWorks';
import JaipurCorridors from '../components/JaipurCorridors';
import Craftsmanship from '../components/Craftsmanship';
import Testimonials from '../components/Testimonials';
import FaqSection from '../components/FaqSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  return (
    <PublicLayout isHome={true}>
      {/* 1. Hero: Restored "Jaipur, Undisputed." and original outlined button */}
      <Hero />

      {/* 2. About Us: Company philosophy, architectural builders vs speculative market */}
      <AboutUs />

      {/* 3. Investment: Three pathways to prime ownership */}
      <Investment />

      {/* 4. Properties: Restored asymmetric portfolio layout connected to public data with honest empty state */}
      <Properties />

      {/* 5. Cost Estimator: Interactive construction & valuation budget calculator */}
      <CostEstimator />

      {/* 6. Studio Guild: Specialized execution pillars & construction standards */}
      <StudioGuild />

      {/* 7. How It Works: 4-stage acquisition protocol */}
      <HowItWorks />

      {/* 8. Jaipur Corridors: Spatial cartography and growth vectors */}
      <JaipurCorridors />

      {/* 9. Craftsmanship: Forensic construction vetting audits */}
      <Craftsmanship />

      {/* 10. Testimonials: Client journal & verified case studies */}
      <Testimonials />

      {/* 11. FAQ: Legal, title, and construction answers */}
      <FaqSection />

      {/* 12. Contact Section: Direct office coordinates and enquiry form */}
      <ContactSection />
    </PublicLayout>
  );
}
