import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UploadDropzone } from '../common/UploadDropzone';
import { Button } from '../common/Button';
import { uploadSpreadsheet } from '../../services/api';

export const StepDataUpload = ({ onNext, onPrev }) => {
  const { wizardState, setParsedParticipants } = useApp();
  const { participants, fileData, eventDetails } = wizardState;
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadSample = () => {
    // Generate a quick downloadable sample CSV file for organizers
    const sampleHeaders = ["Full Name", "Email Address", "Role", "Issue Date", "Grade"];
    const sampleRows = [
      ["Eleanor Sterling", "eleanor@cambridge.org", "Valedictorian", "2026-11-15", "Grade A+"],
      ["Devon Vance", "d.vance@blackmesa.gov", "Presenter", "2026-11-15", "Honors"],
      ["Maya Lin", "mlin@designlab.io", "Attendee", "2026-11-15", "Pass"],
      ["Lucas Grey", "lgrey@securitynet.com", "Researcher", "2026-11-15", "Distinction"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [sampleHeaders.join(","), ...sampleRows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_certificate_recipients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Handles live upload to backend API (POST /api/events/:eventId/upload).
   * Populates participant records using validRecords and invalidRecords.
   */
  const handleServerUpload = async (file) => {
    setErrorMsg('');
    setIsUploading(true);

    try {
      const targetEventId = eventDetails?.id || 'evt-demo';
      const result = await uploadSpreadsheet(targetEventId, file);

      const validList = (result.validRecords || []).map((r, idx) => ({
        id: idx + 1,
        participantName: r.participantName,
        email: r.participantEmail || r.data?.email || r.data?.Email || '',
        role: r.data?.role || r.data?.Role || 'Participant',
        issueDate: r.data?.issueDate || r.data?.Date || eventDetails?.date || new Date().toISOString().split('T')[0],
        grade: r.data?.grade || r.data?.Grade || 'Pass',
        status: 'valid',
        errors: [],
        data: r.data,
      }));

      const invalidList = (result.invalidRecords || []).map((r, idx) => ({
        id: validList.length + idx + 1,
        participantName: r.participantName || '(Missing Name)',
        email: r.participantEmail || r.data?.email || '',
        role: r.data?.role || 'Participant',
        issueDate: r.data?.issueDate || eventDetails?.date || '',
        grade: r.data?.grade || 'N/A',
        status: 'error',
        errors: [r.reason || 'Missing required participant name'],
        data: r.data,
      }));

      const mergedParticipants = [...validList, ...invalidList];

      const meta = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        totalRows: mergedParticipants.length,
        uploadedAt: new Date().toLocaleTimeString(),
      };

      setParsedParticipants(mergedParticipants, meta);
    } catch (err) {
      console.error('Server spreadsheet upload error:', err);
      setErrorMsg(`Server upload error: ${err.message}. Please verify backend connection.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDataParsed = (parsedList, meta) => {
    setErrorMsg('');
    setParsedParticipants(parsedList, meta);
  };

  const handleProceed = () => {
    if (!participants || participants.length === 0) {
      setErrorMsg("Please upload a spreadsheet file or load sample records first.");
      return;
    }
    onNext();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Step 2: Participant Data Upload</h4>
          <p className="text-muted small mb-0">
            Provide recipient information via Excel (.xlsx) or Comma Separated Values (.csv).
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
        >
          <Download size={14} />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <UploadDropzone
        onDataParsed={handleDataParsed}
        onFileUpload={handleServerUpload}
        currentFile={fileData}
        isUploading={isUploading}
      />

      {/* Summary info if data exists */}
      {participants && participants.length > 0 && (
        <div className="mt-4 p-3 rounded-3 bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} className="text-success" />
            <span className="fw-semibold text-dark small">
              {participants.length} participant records loaded into memory
            </span>
          </div>
          <div className="d-flex gap-2">
            <span className="badge bg-success-subtle text-success border">
              {participants.filter(p => p.status === 'valid').length} Valid
            </span>
            <span className="badge bg-danger-subtle text-danger border">
              {participants.filter(p => p.status === 'error').length} Errors
            </span>
            <span className="badge bg-warning-subtle text-warning border">
              {participants.filter(p => p.status === 'duplicate').length} Duplicates
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
        <Button
          variant="outline-secondary"
          onClick={onPrev}
          icon={<ArrowLeft size={18} />}
        >
          Back to Event Details
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleProceed}
          icon={<ArrowRight size={18} />}
        >
          Proceed to Validation Preview
        </Button>
      </div>
    </div>
  );
};
