import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Archive, AlertTriangle, FileText, RefreshCw, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useApp } from '../../context/AppContext';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { createCertificatePdf } from '../../utils/pdfGenerator';
import { generateCertificates } from '../../services/api';

export const StepOutputStatus = () => {
  const { wizardState, resetWizard } = useApp();
  const {
    generationStatus,
    generationProgress,
    generatedBatchId,
    generatedCertificates,
    eventDetails,
    selectedTemplate,
    participants
  } = wizardState;

  const navigate = useNavigate();
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [generatingSingleId, setGeneratingSingleId] = useState(null);

  const totalValid = participants.filter(p => p.status === 'valid').length;
  const processedRecords = Math.round((generationProgress / 100) * totalValid);

  const successfulList = generatedCertificates.filter(c => c.status === 'success');
  const failedList = generatedCertificates.filter(c => c.status === 'failed');

  useEffect(() => {
    if (generationStatus === 'completed') {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [generationStatus]);

  // Generate and download a real valid ZIP archive of all PDFs (calls live backend API stream or falls back to client-side)
  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);

      // Attempt live backend streaming endpoint if event has an ID
      const targetEventId = eventDetails?.id || 'evt-demo';
      try {
        const backendParticipants = successfulList.map(c => ({
          participantName: c.name,
          participantEmail: c.email,
          role: c.role,
          certificateId: c.certificateId,
        }));

        await generateCertificates(targetEventId, backendParticipants, `${generatedBatchId || 'batch'}_certificates.zip`);
        return;
      } catch (backendErr) {
        console.warn('Backend ZIP stream not available, falling back to in-browser engine:', backendErr.message);
      }

      const zip = new JSZip();

      // Folder inside ZIP
      const certFolder = zip.folder("certificates");

      // Generate real PDF for each successful record and add to zip
      for (const cert of successfulList) {
        const doc = createCertificatePdf({
          cert,
          eventDetails,
          template: selectedTemplate
        });
        const pdfBlob = doc.output('blob');
        const safeName = (cert.name || 'Recipient').replace(/[^a-zA-Z0-9_-]/g, '_');
        certFolder.file(`${safeName}_${cert.certificateId}.pdf`, pdfBlob);
      }

      // Add metadata JSON summary
      const metadata = {
        batchId: generatedBatchId,
        eventTitle: eventDetails.title,
        issuingOrganization: eventDetails.organization,
        category: eventDetails.category,
        date: eventDetails.date,
        signatory: eventDetails.signatory,
        totalIssued: successfulList.length,
        recipients: successfulList.map(c => ({
          certificateId: c.certificateId,
          name: c.name,
          email: c.email,
          role: c.role
        }))
      };
      zip.file("batch_manifest.json", JSON.stringify(metadata, null, 2));

      // Build real zip blob with explicit application/zip MIME type
      const content = await zip.generateAsync({
        type: "blob",
        mimeType: "application/zip",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });
      const zipFilename = `${generatedBatchId || 'batch'}_certificates.zip`;
      
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = zipFilename;
      a.setAttribute('download', zipFilename);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 500);
    } catch (err) {
      console.error("Error generating ZIP:", err);
      alert("Failed to create ZIP package. Please try again.");
    } finally {
      setDownloadingZip(false);
    }
  };

  // Generate and download a real PDF for an individual certificate
  const handleDownloadSinglePdf = (cert) => {
    try {
      setGeneratingSingleId(cert.id);
      const doc = createCertificatePdf({
        cert,
        eventDetails,
        template: selectedTemplate
      });
      const safeName = (cert.name || 'Recipient').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeName}_${cert.certificateId}.pdf`;
      
      // Use direct jsPDF save which explicitly sets the .pdf extension and header
      doc.save(filename);
    } catch (err) {
      console.error("Error generating single PDF:", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setGeneratingSingleId(null);
    }
  };

  // Quick in-browser preview tab
  const handlePreviewPdf = (cert) => {
    try {
      const doc = createCertificatePdf({
        cert,
        eventDetails,
        template: selectedTemplate
      });
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error("Error previewing PDF:", err);
    }
  };

  const outputColumns = [
    {
      header: "Certificate ID",
      accessor: "certificateId",
      render: (item) => (
        <span className="font-monospace fw-bold text-dark small">
          {item.certificateId || "N/A"}
        </span>
      )
    },
    {
      header: "Recipient Name",
      accessor: "name",
      render: (item) => (
        <div>
          <div className="fw-semibold text-dark">{item.name}</div>
          <div className="text-muted text-xs" style={{ fontSize: '11px' }}>{item.email}</div>
        </div>
      )
    },
    {
      header: "Designation / Role",
      accessor: "role",
      render: (item) => <span className="badge bg-light text-dark border">{item.role}</span>
    },
    {
      header: "Status",
      accessor: "status",
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: "Download Action",
      accessor: "actions",
      render: (item) => {
        if (item.status === 'success') {
          const isDownloadingThis = generatingSingleId === item.id;
          return (
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1"
                onClick={() => handleDownloadSinglePdf(item)}
                disabled={isDownloadingThis}
              >
                {isDownloadingThis ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <Download size={13} />
                )}
                <span>Download PDF</span>
              </button>

              <button
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 text-secondary"
                title="Preview in new tab"
                onClick={() => handlePreviewPdf(item)}
              >
                <Eye size={13} />
              </button>
            </div>
          );
        }
        return (
          <span className="text-danger small fst-italic">
            {item.failureReason || "Generation skipped"}
          </span>
        );
      }
    }
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      {/* State A: Generating in progress */}
      {generationStatus === 'generating' && (
        <div className="py-5 text-center">
          <div className="position-relative d-inline-block mb-4">
            <div className="p-4 rounded-circle bg-primary-subtle text-primary pulse-circle">
              <FileText size={48} />
            </div>
          </div>
          <h3 className="fw-bold text-dark mb-2">Generating High-Resolution Digital Certificates</h3>
          <p className="text-muted small mb-4">
            Rendering vector layouts, applying cryptographic digital signatures, and compiling batch assets...
          </p>

          <div className="col-12 col-md-8 mx-auto">
            <div className="d-flex justify-content-between align-items-center mb-1 text-muted small fw-semibold">
              <span>Processing batch queue: {processedRecords} / {totalValid} records</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="progress rounded-pill" style={{ height: '14px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary rounded-pill"
                role="progressbar"
                style={{ width: `${generationProgress}%` }}
                aria-valuenow={generationProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="text-muted small mt-3">
              Event: <strong>{eventDetails.title}</strong> • Template: <strong>{selectedTemplate?.name}</strong>
            </div>
          </div>
        </div>
      )}

      {/* State B: Success & Output View */}
      {generationStatus === 'completed' && (
        <div>
          {/* Header Banner */}
          <div className="text-center mb-4 pb-2">
            <div className="d-inline-flex p-3 rounded-circle bg-success text-white mb-3 shadow">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="fw-bold text-dark mb-1">Batch PDF Generation Successful!</h3>
            <p className="text-muted small mb-3">
              All valid certificates have been compiled and signed. Download the entire ZIP archive or individual PDFs below.
            </p>
            <div className="d-inline-flex align-items-center gap-2 bg-light border px-3 py-1.5 rounded-pill small">
              <span className="text-muted">Batch ID:</span>
              <strong className="font-monospace text-primary">{generatedBatchId}</strong>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-3.5 bg-primary-subtle rounded-3 border border-primary-subtle mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <div className="fw-bold text-dark">Download Bulk Package</div>
              <div className="text-muted small">
                Consolidated ZIP containing {successfulList.length} signed PDF certificates & verified metadata JSON
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={downloadingZip}
              onClick={handleDownloadZip}
              icon={<Archive size={20} />}
              className="shadow-sm"
            >
              Download ZIP Archive ({successfulList.length} Files)
            </Button>
          </div>

          {/* Failed Records Alert */}
          {failedList.length > 0 && (
            <div className="alert alert-danger d-flex align-items-start gap-2 rounded-3 mb-4 py-2.5">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice: {failedList.length} record(s) failed or were skipped during generation.</strong>
                <p className="mb-0 small text-danger-emphasis">
                  These rows were omitted from the ZIP archive due to incomplete participant metadata or formatting conflicts.
                </p>
              </div>
            </div>
          )}

          {/* Individual PDF Links Table */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3">Generated Certificate Records</h5>
            <DataTable
              columns={outputColumns}
              data={generatedCertificates}
              searchPlaceholder="Search generated certificates..."
              itemsPerPage={5}
            />
          </div>

          {/* Footer Navigation */}
          <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
            <button
              className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 rounded-pill px-4"
              onClick={() => {
                resetWizard();
                navigate('/');
              }}
            >
              <span>Return to Dashboard</span>
            </button>

            <button
              className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-pill px-4"
              onClick={() => {
                resetWizard();
              }}
            >
              <RefreshCw size={16} />
              <span>Generate Another Batch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
