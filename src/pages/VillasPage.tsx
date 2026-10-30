import PublicLayout from '../components/PublicLayout';
import DevelopmentFinder from '../components/DevelopmentFinder';

export default function VillasPage() {
  return (
    <PublicLayout>
      <DevelopmentFinder
        activeTab="villas"
        fixedType="Villa"
        pageTitle="Villas in Jaipur"
        pageSubtitle="Private turnkey villas across prime residential corridors of Jaipur."
        eyebrowText="Residential Portfolio • Jaipur"
      />
    </PublicLayout>
  );
}
