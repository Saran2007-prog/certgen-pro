import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ShieldCheck, Download, Calendar, Building2, User } from 'lucide-react';

export const CertificateView = ({
  certificateData = {
    certId: "CERT-12345",
    participantName: "Saranstalin S.",
    eventName: "National AI & Web3 Hackathon 2026",
    organization: "Government College of Engineering",
    signatory: "Dr. Evelyn Reed (Director of Operations)",
    date: "2026-10-22",
    category: "Certificate of Excellence"
  },
  onDownload = null
}) => {
  // Verification URL encoded in the QR code
  const verificationUrl = `${window.location.origin}/verify/${certificateData.certId}`;

  return (
    <div className="d-flex flex-column align-items-center">
      {/* Physical Certificate Canvas Representation */}
      <div 
        id="certificate-print-area"
        className="card border-0 shadow-lg rounded-3 p-5 position-relative overflow-hidden bg-white text-dark"
        style={{
          width: '100%',
          maxWidth: '860px',
          aspectRatio: '1.414 / 1',
          border: '12px solid #059669',
          outline: '2px solid #a7f3d0',
          outlineOffset: '-7px'
        }}
      >
        {/* Watermark / Subtle Background Stamp */}
        <div 
          className="position-absolute top-50 start-50 translate-middle pointer-events-none opacity-5"
          style={{ transform: 'translate(-50%, -50%) rotate(-15deg)', zIndex: 0 }}
        >
          <Award size={380} color="#059669" />
        </div>

        <div className="position-relative z-1 d-flex flex-column justify-content-between h-100 text-center">
          {/* Header */}
          <div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2 text-success">
              <ShieldCheck size={26} />
              <span className="fw-bold tracking-widest text-uppercase small" style={{ letterSpacing: '0.12em' }}>
                {certificateData.organization}
              </span>
            </div>

            <h2 className="fw-bold text-dark text-uppercase mt-2 mb-1" style={{ letterSpacing: '0.05em' }}>
              {certificateData.category}
            </h2>
            <div className="text-secondary small fst-italic">This credential is formally awarded to</div>
          </div>

          {/* Recipient Name */}
          <div className="my-auto py-3">
            <h1 className="display-5 fw-bold text-success mb-2 text-capitalize">
              {certificateData.participantName}
            </h1>
            <div className="w-50 mx-auto border-bottom border-success border-2 mb-3"></div>
            <p className="text-secondary small mx-auto" style={{ maxWidth: '620px', lineHeight: '1.6' }}>
              in recognition of outstanding participation, technical competence, and successful submission during the <strong>{certificateData.eventName}</strong>.
            </p>
          </div>

          {/* Footer: Date, Verification QR Code, Signatures */}
          <div className="d-flex justify-content-between align-items-end pt-3 border-top border-2">
            {/* Left: Issue Date */}
            <div className="text-start">
              <div className="small text-muted text-uppercase" style={{ fontSize: '10px' }}>Date of Issuance</div>
              <div className="fw-bold small text-dark d-flex align-items-center gap-1">
                <Calendar size={14} /> {certificateData.date}
              </div>
            </div>

            {/* Center: Dynamic Verification QR Code */}
            <div className="d-flex flex-column align-items-center bg-light p-2 rounded-2 border">
              <QRCodeSVG
                value={verificationUrl}
                size={75}
                level="H"
                includeMargin={false}
              />
              <span className="font-monospace text-success fw-bold mt-1" style={{ fontSize: '10px' }}>
                {certificateData.certId}
              </span>
              <span className="text-muted" style={{ fontSize: '9px' }}>
                Scan to Verify Authenticity
              </span>
            </div>

            {/* Right: Authorized Signature */}
            <div className="text-end">
              <div className="fst-italic fw-bold text-dark small">{certificateData.signatory}</div>
              <div className="small text-muted text-uppercase" style={{ fontSize: '10px' }}>Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 d-flex gap-3">
        {onDownload && (
          <button onClick={onDownload} className="btn btn-success d-flex align-items-center gap-2 px-4 py-2">
            <Download size={16} />
            <span>Download High-Res PDF</span>
          </button>
        )}
        <a 
          href={verificationUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2"
        >
          <ShieldCheck size={16} />
          <span>Test Verification Route ({certificateData.certId})</span>
        </a>
      </div>
    </div>
  );
};
