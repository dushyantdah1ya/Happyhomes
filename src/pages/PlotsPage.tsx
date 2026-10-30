import PublicLayout from '../components/PublicLayout';
import DevelopmentFinder from '../components/DevelopmentFinder';

export default function PlotsPage() {
  return (
    <PublicLayout>
      <DevelopmentFinder
        activeTab="plots"
        fixedType="Residential Plot"
        pageTitle="Residential Plots in Jaipur"
        pageSubtitle="Residential plots and planned sectors across Jagatpura and Jaipur corridors."
        eyebrowText="Residential Land & Plots • Jaipur"
      />
    </PublicLayout>
  );
}
