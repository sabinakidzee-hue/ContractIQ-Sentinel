import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Home from '../pages/Home';
import UploadContract from '../pages/UploadContract';
import ContractAnalysis from '../pages/ContractAnalysis';
import Reports from '../pages/Reports';
import About from '../pages/About';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/upload"   element={<UploadContract />} />
          <Route path="/analysis" element={<ContractAnalysis />} />
          <Route path="/reports"  element={<Reports />} />
          <Route path="/about"    element={<About />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
