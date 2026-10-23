import React, { useState } from 'react';
import { ArrowLeft, Play, Sparkles, Check, Layout, Link2, Eye, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { certificateTemplates } from '../../data/mockData';
import { Button } from '../common/Button';

export const StepTemplateMapping = ({ onPrev }) => {
  const { wizardState, setSelectedTemplate, updateColumnMapping, startBulkGeneration } = useApp();
  const { eventDetails, selectedTemplate, columnMapping, participants } = wizardState;

  const validParticipants = participants.filter(p => p.status === 'valid');
  const sampleRecipient = validParticipants[0] || {
    participantName: "Saranstalin S.",
    email: "saranstalin.s@techsummit.org",
    role: "Lead Systems Architect & Speaker",
    issueDate: eventDetails.date || "2026-11-15",
    grade: "Distinction"
  };

  const spreadsheetAvailableColumns = [
    { key: "participantName", label: "participantName (e.g. Saranstalin S.)" },
    { key: "email", label: "email (e.g. a.vance@blackmesa.org)" },
    { key: "role", label: "role (e.g. Keynote Speaker)" },
    { key: "issueDate", label: "issueDate (e.g. 2026-10-22)" },
    { key: "grade", label: "grade (e.g. Distinction)" }
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Step 4: Template Mapping & Live Design Preview</h4>
        <p className="text-muted small">
          Select a verified certificate design layout and bind spreadsheet columns to certificate placeholders.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Template Selection & Mapping controls */}
        <div className="col-12 col-lg-6">
          <label className="form-label small fw-bold text-secondary text-uppercase mb-2">
            1. Select Certificate Theme & Layout
          </label>
          <div className="d-flex flex-column gap-3 mb-4">
            {certificateTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <div
                  key={template.id}
                  className={`p-3 rounded-3 border cert-template-card ${isSelected ? 'selected bg-light' : 'bg-white'}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle"
                        style={{ width: 14, height: 14, backgroundColor: template.accentColor }}
                      ></div>
                      <span className="fw-bold text-dark">{template.name}</span>
                    </div>
                    {isSelected && (
                      <span className="badge bg-primary rounded-pill d-flex align-items-center gap-1">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-0 mt-1">{template.description}</p>
                </div>
              );
            })}
          </div>

          <label className="form-label small fw-bold text-secondary text-uppercase mb-2">
            2. Spreadsheet Column Mapping
          </label>
          <div className="bg-light p-3.5 rounded-3 border">
            <div className="d-flex align-items-center gap-2 mb-3 text-secondary small">
              <Link2 size={16} />
              <span>Map incoming sheet keys to target certificate template fields</span>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1">
                Recipient Name Field <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={columnMapping.participantName}
                onChange={(e) => updateColumnMapping('participantName', e.target.value)}
              >
                {spreadsheetAvailableColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1">
                Recipient Email Address
              </label>
              <select
                className="form-select form-select-sm"
                value={columnMapping.email}
                onChange={(e) => updateColumnMapping('email', e.target.value)}
              >
                {spreadsheetAvailableColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark mb-1">
                Role / Contribution Title
              </label>
              <select
                className="form-select form-select-sm"
                value={columnMapping.role}
                onChange={(e) => updateColumnMapping('role', e.target.value)}
              >
                {spreadsheetAvailableColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-0">
              <label className="form-label small fw-semibold text-dark mb-1">
                Issue Date / Completion Grade
              </label>
              <select
                className="form-select form-select-sm"
                value={columnMapping.grade}
                onChange={(e) => updateColumnMapping('grade', e.target.value)}
              >
                {spreadsheetAvailableColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Certificate Canvas Preview */}
        <div className="col-12 col-lg-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-bold text-secondary text-uppercase mb-0">
              Live Certificate Rendering Preview
            </label>
            <span className="badge bg-light text-dark border small d-flex align-items-center gap-1">
              <Eye size={13} /> Sample: {sampleRecipient.participantName}
            </span>
          </div>

          <div className="p-3 bg-secondary-subtle rounded-4 border">
            {/* Certificate Canvas Render */}
            <div className={`cert-preview-canvas ${selectedTemplate?.themeClass || 'cert-canvas-classic'}`}>
              <div className="text-uppercase tracking-widest small mb-1 opacity-75">
                {eventDetails.organization || "Global Institution of Technology"}
              </div>

              <div className="fs-6 fw-bold text-uppercase tracking-wider mb-2">
                {eventDetails.category || "Certificate of Excellence"}
              </div>

              <div className="small text-muted mb-2 fst-italic">This is proudly presented to</div>

              <div className="fs-3 fw-bolder text-primary mb-1 border-bottom pb-1 px-4 text-break">
                {sampleRecipient.participantName || "Participant Full Name"}
              </div>

              <div className="small opacity-80 mb-3 px-3">
                for active participation and demonstrating exceptional competence in <strong>{eventDetails.title || "The Selected Summit Event"}</strong>
              </div>

              <div className="w-100 d-flex justify-content-between align-items-end mt-auto px-4 pt-2 border-top">
                <div className="text-start">
                  <div className="small text-muted" style={{ fontSize: '10px' }}>DATE OF ISSUANCE</div>
                  <div className="small fw-semibold">{eventDetails.date || sampleRecipient.issueDate}</div>
                </div>

                <div className="text-center">
                  <ShieldCheck size={26} className="text-primary mb-0.5" />
                  <div className="small text-muted" style={{ fontSize: '9px' }}>OFFICIAL VERIFIED</div>
                </div>

                <div className="text-end">
                  <div className="fst-italic small fw-bold text-dark">{eventDetails.signatory || "Dean of Operations"}</div>
                  <div className="small text-muted" style={{ fontSize: '10px' }}>AUTHORIZED SIGNATURE</div>
                </div>
              </div>
            </div>

            <div className="text-center text-muted small mt-2">
              Dimensions: High-Res 300 DPI Vector PDF Compatible
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Trigger Bulk Generation */}
      <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
        <Button
          variant="outline-secondary"
          onClick={onPrev}
          icon={<ArrowLeft size={18} />}
        >
          Back to Validation Preview
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={startBulkGeneration}
          icon={<Sparkles size={18} />}
          className="shadow"
        >
          Start Bulk Generation ({validParticipants.length} Certificates)
        </Button>
      </div>
    </div>
  );
};
