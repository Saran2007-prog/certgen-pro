import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './views/LandingPage';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { WizardView } from './views/WizardView';
import { TemplateStudio } from './views/TemplateStudio';
import { CertificateView } from './views/CertificateView';
import { VerificationPortal } from './views/VerificationPortal';

// Protected Route Guard (Checks token & user in AuthContext / localStorage)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const storedToken = localStorage.getItem('certgen_token');

  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const storedToken = localStorage.getItem('certgen_token');
  const loggedIn = isAuthenticated || Boolean(storedToken);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--cyber-bg)' }}>
      <Routes>
        {/* Public Landing Page (Redirects to dashboard if logged in) */}
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* Dedicated Login route */}
        <Route path="/login" element={<LoginView />} />

        {/* Public Verification Route */}
        <Route path="/verify/:certId" element={<VerificationPortal />} />
        <Route path="/verify" element={<VerificationPortal />} />

        {/* Protected Interactive Template Studio (Canva-like Fabric.js) */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-grow-1">
                <TemplateStudio />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Certificate Preview with QR Code */}
        <Route
          path="/certificate"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-grow-1 py-4 bg-light">
                <CertificateView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Protected Organizer Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-grow-1">
                <DashboardView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Protected Certificate Generation Flow */}
        <Route
          path="/wizard"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="flex-grow-1">
                <WizardView />
              </main>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
