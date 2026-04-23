import { Routes, Route } from 'react-router-dom';
import PortalApp from './PortalApp';
import HomePage from './pages/landing/HomePage';
import HowItWorksPage from './pages/landing/HowItWorksPage';
import AboutPage from './pages/landing/AboutPage';
import IndustriesPage from './pages/landing/IndustriesPage';
import BookAuditPage from './pages/landing/BookAuditPage';
import ThankYouPage from './pages/landing/ThankYouPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/book-audit" element={<BookAuditPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/portal/*" element={<PortalApp />} />
    </Routes>
  );
}
