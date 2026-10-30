import PublicLayout from '../components/PublicLayout';
import DevelopmentFinder from '../components/DevelopmentFinder';

export default function FloorsPage() {
  return (
    <PublicLayout>
      <DevelopmentFinder
        activeTab="floors"
        fixedType="Independent Floor"
        pageTitle="Independent Floors in Jaipur"
        pageSubtitle="Low-rise independent floors with private ownership in Jaipur."
        eyebrowText="Residential Portfolio • Jaipur"
      />
    </PublicLayout>
  );
}
