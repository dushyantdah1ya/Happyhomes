import PublicLayout from '../components/PublicLayout';
import DevelopmentFinder from '../components/DevelopmentFinder';

export default function Developments() {
  return (
    <PublicLayout>
      <DevelopmentFinder
        activeTab="all"
        pageTitle="Architectural residences & bespoke developments."
        pageSubtitle="Direct builder developments across Jagatpura, Kusum Vihar and Vidhyadhar Nagar engineered with structural discipline and clear JDA Section 90-A tenure."
        eyebrowText="Construction Portfolio • Jaipur"
      />
    </PublicLayout>
  );
}
