/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router';
import RouteMetadataManager from './components/RouteMetadataManager';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Developments from './pages/Developments';
import VillasPage from './pages/VillasPage';
import FloorsPage from './pages/FloorsPage';
import PlotsPage from './pages/PlotsPage';
import CompletedPage from './pages/CompletedPage';
import DevelopmentDetail from './pages/DevelopmentDetail';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ConstructionQualityPage from './pages/ConstructionQualityPage';
import JaipurLocalitiesHub from './pages/JaipurLocalitiesHub';
import LocalityGuidePage from './pages/LocalityGuidePage';
import BuyingProcessPage from './pages/BuyingProcessPage';
import NriBuyersPage from './pages/NriBuyersPage';
import FaqPage from './pages/FaqPage';
import OurApproachPage from './pages/OurApproachPage';
import VisitChecklistPage from './pages/VisitChecklistPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import WebsiteTermsPage from './pages/WebsiteTermsPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminSettings from './pages/admin/AdminSettings';
import DevelopmentList from './pages/admin/DevelopmentList';
import DevelopmentEditor from './pages/admin/DevelopmentEditor';
import DevelopmentPreview from './pages/admin/DevelopmentPreview';
import NotFound from './pages/NotFound';

import { PublicCatalogProvider } from './context/PublicCatalogContext';
import type { DevelopmentPublic } from './types/development';

interface AppProps {
  initialDevelopments?: DevelopmentPublic[];
  currentDevelopment?: DevelopmentPublic | null;
}

export default function App({ initialDevelopments, currentDevelopment }: AppProps = {}) {
  return (
    <AuthProvider>
      <PublicCatalogProvider
        initialDevelopments={initialDevelopments}
        currentDevelopment={currentDevelopment}
      >
        <RouteMetadataManager />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/developments" element={<Developments />} />
        <Route path="/developments/" element={<Developments />} />
        <Route path="/villas" element={<VillasPage />} />
        <Route path="/villas/" element={<VillasPage />} />
        <Route path="/independent-floors" element={<FloorsPage />} />
        <Route path="/independent-floors/" element={<FloorsPage />} />
        <Route path="/plots" element={<PlotsPage />} />
        <Route path="/plots/" element={<PlotsPage />} />
        <Route path="/residential-plots" element={<PlotsPage />} />
        <Route path="/residential-plots/" element={<PlotsPage />} />
        <Route path="/completed" element={<Navigate to="/completed-projects" replace />} />
        <Route path="/completed/" element={<Navigate to="/completed-projects" replace />} />
        <Route path="/completed-developments" element={<Navigate to="/completed-projects" replace />} />
        <Route path="/completed-developments/" element={<Navigate to="/completed-projects" replace />} />
        <Route path="/completed-projects" element={<CompletedPage />} />
        <Route path="/completed-projects/" element={<CompletedPage />} />
        <Route path="/developments/:slug" element={<DevelopmentDetail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/" element={<AboutPage />} />
        <Route path="/construction-quality" element={<ConstructionQualityPage />} />
        <Route path="/construction-quality/" element={<ConstructionQualityPage />} />
        <Route path="/jaipur-localities" element={<JaipurLocalitiesHub />} />
        <Route path="/jaipur-localities/" element={<JaipurLocalitiesHub />} />
        <Route path="/jaipur-localities/jagatpura" element={<LocalityGuidePage forcedSlug="jagatpura" />} />
        <Route path="/jaipur-localities/jagatpura/" element={<LocalityGuidePage forcedSlug="jagatpura" />} />
        <Route path="/jaipur-localities/kusum-vihar" element={<Navigate to="/jaipur-localities" replace />} />
        <Route path="/jaipur-localities/kusum-vihar/" element={<Navigate to="/jaipur-localities" replace />} />
        <Route path="/jaipur-localities/:slug" element={<LocalityGuidePage />} />
        <Route path="/buying-process" element={<BuyingProcessPage />} />
        <Route path="/buying-process/" element={<BuyingProcessPage />} />
        <Route path="/nri-buyers" element={<NriBuyersPage />} />
        <Route path="/nri-buyers/" element={<NriBuyersPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/faqs/" element={<FaqPage />} />
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/our-approach/" element={<OurApproachPage />} />
        <Route path="/visit-checklist" element={<VisitChecklistPage />} />
        <Route path="/visit-checklist/" element={<VisitChecklistPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy/" element={<PrivacyPolicyPage />} />
        <Route path="/website-terms" element={<WebsiteTermsPage />} />
        <Route path="/website-terms/" element={<WebsiteTermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/login/" element={<AdminLogin />} />
        <Route path="/admin/enquiries" element={<AdminEnquiries />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/developments" element={<DevelopmentList />} />
        <Route path="/admin/developments/new" element={<DevelopmentEditor />} />
        <Route path="/admin/developments/:id" element={<DevelopmentEditor />} />
        <Route path="/admin/developments/:id/preview" element={<DevelopmentPreview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </PublicCatalogProvider>
    </AuthProvider>
  );
}

