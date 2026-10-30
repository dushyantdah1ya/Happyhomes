import PublicLayout from '../components/PublicLayout';
import DevelopmentFinder from '../components/DevelopmentFinder';

export default function CompletedPage() {
  return (
    <PublicLayout>
      <DevelopmentFinder
        activeTab="completed"
        fixedStage="Completed"
        pageTitle="Completed Developments"
        pageSubtitle="Delivered architectural developments and handed-over residences in Jaipur."
        eyebrowText="Completed Portfolio • Jaipur"
      />
    </PublicLayout>
  );
}
