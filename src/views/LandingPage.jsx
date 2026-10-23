import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award,
  ShieldCheck, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Layers,
  Send,
  CheckCircle,
  Zap
} from 'lucide-react';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { AuthModal } from '../components/auth/AuthModal';
import { useApp } from '../context/AppContext';
import certgenBanner from '../assets/certgen_banner.jpg';

export const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const { user } = useApp();
  const navigate = useNavigate();

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartNow = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      handleOpenAuth('signup');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 3000);
  };

  return (
    <div className="container-fluid p-0 min-vh-100 overflow-hidden bg-white text-dark">
      <div className="row g-0 min-vh-100">
        
        {/* ===================== LEFT HALF: MINIMAL TEXT, DARK GREEN BG, WHITE TEXT ===================== */}
        <div 
          className="col-12 col-lg-5 col-xl-5 d-flex flex-column justify-content-between p-4 p-xl-5"
          style={{
            backgroundColor: '#062816', // Deep Dark Green
            color: '#ffffff',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          {/* Top Brand Pill */}
          <div>
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-4 border" style={{ backgroundColor: 'rgba(0, 230, 91, 0.12)', borderColor: 'rgba(0, 230, 91, 0.3)' }}>
              <span className="badge rounded-circle p-1" style={{ backgroundColor: 'var(--cyber-green)' }}></span>
              <span className="small fw-bold text-uppercase" style={{ color: 'var(--cyber-green)', letterSpacing: '0.06em', fontSize: '11px' }}>
                Enterprise Issuance Engine
              </span>
            </div>

            {/* Clean Minimal Headline */}
            <h1 className="display-6 fw-bold text-white mb-3" style={{ lineHeight: '1.25' }}>
              Automated Digital Certificate Generation
            </h1>

            {/* Minimal Concise Subtitle */}
            <p className="fs-6 text-light mb-4" style={{ color: '#d1fae5', opacity: 0.88, lineHeight: '1.6' }}>
              Bulk certificate generation for universities and events. Ingest spreadsheets, validate records, and dispatch authenticated PDF credentials.
            </p>

            {/* Minimal Essential Feature Highlights */}
            <div className="d-flex flex-column gap-3 mb-4">
              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-3"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
              >
                <div 
                  className="p-1.5 rounded-2 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'var(--cyber-green)', color: '#042611' }}
                >
                  <CheckCircle size={17} />
                </div>
                <div>
                  <div className="fw-bold text-white small">Automated Data Validation</div>
                  <div className="small text-light" style={{ opacity: 0.75, fontSize: '12px' }}>Instant duplicate checking & error detection</div>
                </div>
              </div>

              <div 
                className="p-3 rounded-3 d-flex align-items-center gap-3"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
              >
                <div 
                  className="p-1.5 rounded-2 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'var(--cyber-green)', color: '#042611' }}
                >
                  <Download size={17} />
                </div>
                <div>
                  <div className="fw-bold text-white small">Batch ZIP & Vector PDF</div>
                  <div className="small text-light" style={{ opacity: 0.75, fontSize: '12px' }}>High-res 300 DPI vector exports</div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Bottom Metrics and Action */}
          <div className="pt-4 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <div className="row g-2 mb-3 text-center">
              <div className="col-4">
                <div className="fs-4 fw-bolder text-white">100K+</div>
                <div className="small text-light" style={{ opacity: 0.75, fontSize: '11px' }}>Issued</div>
              </div>
              <div className="col-4">
                <div className="fs-4 fw-bolder" style={{ color: 'var(--cyber-green)' }}>&lt;0.5s</div>
                <div className="small text-light" style={{ opacity: 0.75, fontSize: '11px' }}>Speed</div>
              </div>
              <div className="col-4">
                <div className="fs-4 fw-bolder text-white">100%</div>
                <div className="small text-light" style={{ opacity: 0.75, fontSize: '11px' }}>Accurate</div>
              </div>
            </div>

            <button
              onClick={handleStartNow}
              className="btn w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{ 
                backgroundColor: 'var(--cyber-green)', 
                color: '#042611', 
                borderRadius: '6px',
                border: 'none'
              }}
            >
              <span>Get Started as Organizer</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* ===================== RIGHT HALF: SCROLLABLE CONTAINER WITH HERO BANNER & NAVBAR ===================== */}
        <div 
          id="right-scroll-container"
          className="col-12 col-lg-7 col-xl-7 d-flex flex-column position-relative"
          style={{
            height: '100vh',
            overflowY: 'auto'
          }}
        >
          {/* Top Navbar pinned to top of right side */}
          <LandingNavbar onOpenAuth={handleOpenAuth} />

          {/* Scrollable Content Container with Generous Spacing */}
          <div className="p-4 p-md-5 flex-grow-1">

            {/* PROJECT NAME HERO BANNER IN RIGHT HALF WITH BACKGROUND IMAGE */}
            <div 
              className="rounded-4 overflow-hidden mb-5 border position-relative text-white"
              style={{
                backgroundImage: `url(${certgenBanner})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '250px'
              }}
            >
              <div 
                className="p-4 p-md-5 d-flex flex-column justify-content-center h-100 position-relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 40, 22, 0.92) 0%, rgba(6, 40, 22, 0.75) 100%)',
                  minHeight: '250px'
                }}
              >
                <div className="d-inline-flex align-items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-2 bg-success text-dark fw-bold d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--cyber-green)' }}>
                    <Award size={20} />
                  </div>
                  <span className="badge px-2.5 py-1 small fw-bold" style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#ffffff' }}>
                    v2.5 PRODUCTION READY
                  </span>
                </div>

                <h1 className="display-4 fw-bolder text-white mb-2 tracking-tight">
                  CertGen<span style={{ color: 'var(--cyber-green)' }}> Pro</span>
                </h1>

                <p className="fs-6 text-light mb-4" style={{ maxWidth: '520px', color: '#e2fbf0' }}>
                  The unified bulk credential dispatcher. Turn spreadsheets into publication-grade vector PDF certificates with instant ZIP compression.
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3">
                  <button onClick={handleStartNow} className="btn btn-pro-primary px-4 py-2.5 d-flex align-items-center gap-2">
                    <span>Launch Event Creator</span>
                    <ArrowRight size={16} />
                  </button>

                  <button 
                    onClick={() => {
                      const rightContainer = document.getElementById('right-scroll-container');
                      const contactEl = document.getElementById('contact');
                      if (rightContainer && contactEl) {
                        rightContainer.scrollTo({ top: contactEl.offsetTop - 75, behavior: 'auto' });
                      }
                    }} 
                    className="btn btn-outline-light px-4 py-2.5 fw-semibold"
                  >
                    Enterprise Contact
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: OVERVIEW */}
            <section id="home" className="mb-5 pb-4 border-bottom">
              <span className="badge bg-light text-secondary border mb-2 small fw-semibold">
                SYSTEM WORKFLOW
              </span>
              <h2 className="fw-bold text-dark mb-3">
                Streamline Your Credential Workflow
              </h2>
              <p className="text-secondary mb-4" style={{ lineHeight: '1.7' }}>
                Manual certificate creation is slow and prone to typographical errors. CertGen Pro provides a turnkey web pipeline to import participant rosters, map columns to designer templates, and generate authenticated batch packages in minutes.
              </p>

              {/* Clean Engine Preview Card */}
              <div className="p-4 bg-light rounded-3 border mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span className="small fw-bold text-dark">Live Generation Canvas Sample</span>
                  <span className="badge bg-white text-success border border-success-subtle small px-2.5 py-1">Engine Ready</span>
                </div>
                
                <div className="bg-white p-4 rounded border text-center shadow-xs">
                  <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: '11px' }}>Apex Global University</div>
                  <h5 className="fw-bold text-dark mb-1">CERTIFICATE OF RECOGNITION</h5>
                  <div className="text-muted small fst-italic mb-1">Conferred Upon</div>
                  <h4 className="fw-bolder mb-1" style={{ color: 'var(--cyber-green-dark)' }}>Saranstalin S.</h4>
                  <div className="text-secondary small mb-2">Lead Systems Architect & Speaker</div>
                  <div className="d-flex justify-content-between text-muted small pt-3 border-top mt-2" style={{ fontSize: '11px' }}>
                    <span>Date: 2026-10-22</span>
                    <span>Signatory: Dr. Evelyn Reed</span>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-3">
                <button onClick={handleStartNow} className="btn btn-pro-primary px-4 py-2.5 d-flex align-items-center gap-2">
                  <span>Create New Batch</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* SECTION 2: ABOUT */}
            <section id="about" className="mb-5 pb-4 border-bottom">
              <span className="badge bg-light text-secondary border mb-2 small fw-semibold">
                PLATFORM CAPABILITIES
              </span>
              <h3 className="fw-bold text-dark mb-2">
                Built for High Reliability & Bulk Scale
              </h3>
              <p className="text-secondary small mb-4" style={{ lineHeight: '1.6' }}>
                Everything needed to ingest rosters, resolve data defects, and output valid certificates with zero manual intervention.
              </p>

              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 border bg-light h-100">
                    <div className="p-2.5 rounded bg-white text-dark border d-inline-flex mb-3 shadow-xs">
                      <FileSpreadsheet size={22} style={{ color: 'var(--cyber-green-dark)' }} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1.5">Spreadsheet Ingestion</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                      Upload `.xlsx` or `.csv`. Automated parsing validates email syntax and highlights duplicates.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 border bg-light h-100">
                    <div className="p-2.5 rounded bg-white text-dark border d-inline-flex mb-3 shadow-xs">
                      <Layers size={22} style={{ color: 'var(--cyber-green-dark)' }} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1.5">Column Binding</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                      Map headers to certificate placeholders with real-time vector canvas rendering preview.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 border bg-light h-100">
                    <div className="p-2.5 rounded bg-white text-dark border d-inline-flex mb-3 shadow-xs">
                      <Download size={22} style={{ color: 'var(--cyber-green-dark)' }} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1.5">Consolidated ZIP Export</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                      Export all records into a single `.zip` package with manifest metadata JSON or download individual PDFs.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-4 rounded-3 border bg-light h-100">
                    <div className="p-2.5 rounded bg-white text-dark border d-inline-flex mb-3 shadow-xs">
                      <ShieldCheck size={22} style={{ color: 'var(--cyber-green-dark)' }} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1.5">Verification Stamped</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                      Every certificate receives a unique tamper-evident verification ID and signatory imprint.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: CONTACT */}
            <section id="contact" className="mb-4">
              <span className="badge bg-light text-secondary border mb-2 small fw-semibold">
                SUPPORT & INQUIRIES
              </span>
              <h3 className="fw-bold text-dark mb-2">Contact Our Engineering Team</h3>
              <p className="text-secondary small mb-4">
                Have custom enterprise template requirements or questions about on-premise bulk clustering? Send a message below.
              </p>

              {contactSubmitted && (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2.5 px-3 small rounded mb-4">
                  <CheckCircle2 size={16} />
                  <span>Your transmission was received. We will respond within 2 hours.</span>
                </div>
              )}

              <div className="p-4 p-md-5 bg-light rounded-3 border">
                <form onSubmit={handleContactSubmit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Your Name</label>
                      <input type="text" className="form-control py-2" placeholder="Saranstalin S." required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">Work Email</label>
                      <input type="email" className="form-control py-2" placeholder="sconnor@institution.edu" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">Organization / Event</label>
                      <input type="text" className="form-control py-2" placeholder="Annual International Conference 2026" required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary mb-1">Message</label>
                      <textarea className="form-control py-2" rows={3} placeholder="Describe expected participant counts and template needs..." required></textarea>
                    </div>
                    <div className="col-12 mt-3">
                      <button type="submit" className="btn btn-pro-primary px-4 py-2.5 d-flex align-items-center gap-2">
                        <span>Send Transmission</span>
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="d-flex flex-wrap gap-4 mt-4 pt-4 border-top small text-secondary">
                  <span className="d-flex align-items-center gap-1.5">
                    <Mail size={15} style={{ color: 'var(--cyber-green-dark)' }} /> support@certgen.io
                  </span>
                  <span className="d-flex align-items-center gap-1.5">
                    <Phone size={15} style={{ color: 'var(--cyber-green-dark)' }} /> +1 (800) 555-CERT
                  </span>
                  <span className="d-flex align-items-center gap-1.5">
                    <MapPin size={15} style={{ color: 'var(--cyber-green-dark)' }} /> Tech Corridor, Suite 400
                  </span>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-4 mt-4 border-top text-secondary small d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <div>CertGen Pro © 2026. All Rights Reserved.</div>
              <div className="d-flex gap-3">
                <a 
                  href="#home" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('right-scroll-container')?.scrollTo({ top: 0, behavior: 'auto' });
                  }} 
                  className="text-secondary text-decoration-none"
                >
                  Top
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('about');
                    if (el) document.getElementById('right-scroll-container')?.scrollTo({ top: el.offsetTop - 75, behavior: 'auto' });
                  }} 
                  className="text-secondary text-decoration-none"
                >
                  About
                </a>
                <a 
                  href="#contact" 
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById('contact');
                    if (el) document.getElementById('right-scroll-container')?.scrollTo({ top: el.offsetTop - 75, behavior: 'auto' });
                  }} 
                  className="text-secondary text-decoration-none"
                >
                  Contact
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Auth Modal Stack */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
