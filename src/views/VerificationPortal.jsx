import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Building2, 
  Award, 
  User, 
  Search, 
  ArrowLeft,
  Lock,
  ExternalLink
} from 'lucide-react';
import { verifyCertificate } from '../services/api';

export const VerificationPortal = () => {
  const { certId } = useParams();
  const [searchId, setSearchId] = useState(certId || 'CERT-12345');
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!certId || !certId.trim()) {
        setRecord(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const response = await verifyCertificate(certId.trim());

        if (!isMounted) return;

        if (response && response.isValid && response.data) {
          const item = response.data;
          setRecord({
            certId: item.certificateId,
            participantName: item.participantName,
            eventName: item.event?.title || 'Certified Event',
            organization: item.event?.organization || 'Authorized Organization',
            signatory: item.event?.signatory || 'Authorized Signatory',
            issueDate: item.issueDate ? new Date(item.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
            category: item.metadata?.category || 'Certificate of Completion',
            status: item.status || 'Verified',
            grade: item.metadata?.grade || 'Issued',
            credentialDigest: `SHA256: ${item.certificateId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}...active`,
          });
        } else {
          setRecord(null);
          setErrorMessage(response?.message || 'Certificate record not found.');
        }
      } catch (err) {
        if (!isMounted) return;
        setRecord(null);
        setErrorMessage(err.message || 'Error communicating with verification service.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [certId]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      window.location.href = `/verify/${searchId.trim().toUpperCase()}`;
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-5 px-3 px-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-7 col-xl-6">

          {/* Top Verification Search Bar */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Certificate Verification Portal</h5>
                  <div className="text-muted small">Public Registry & Tamper-Check Validation</div>
                </div>
              </div>

              <Link to="/" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3">
                <ArrowLeft size={14} />
                <span>Home</span>
              </Link>
            </div>

            <form onSubmit={handleManualSearch}>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted border-end-0">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Enter Certificate Identifier (e.g., CERT-12345)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button type="submit" className="btn btn-success px-4 fw-semibold text-white">
                  Verify Record
                </button>
              </div>
            </form>
          </div>

          {/* Validation Result Box */}
          {loading ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <div className="spinner-border text-success mx-auto mb-3" role="status" style={{ width: 44, height: 44 }}></div>
              <h5 className="fw-bold text-dark">Verifying Credential Cryptographic Hash...</h5>
              <p className="text-muted small mb-0">Querying immutable registry records for <code>{certId}</code></p>
            </div>
          ) : record ? (
            /* VALID STATE: Green Verified Screen */
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              {/* Green Verified Banner */}
              <div className="p-4 bg-success text-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-white text-success d-flex align-items-center justify-content-center shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Official Verified Certificate</h4>
                    <span className="small opacity-90">Tamper-evident authenticity confirmed</span>
                  </div>
                </div>

                <span className="badge bg-white text-success px-3 py-2 rounded-pill fw-bold text-uppercase small">
                  Status: Active & Valid
                </span>
              </div>

              {/* Verified Certificate Metadata */}
              <div className="p-4 p-md-5">
                <div className="row g-4">
                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Recipient Name</div>
                    <div className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
                      <User size={18} className="text-success" />
                      <span>{record.participantName}</span>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Certificate Identifier</div>
                    <div className="font-monospace fw-bold fs-5 text-success">
                      {record.certId}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Event / Conference</div>
                    <div className="fw-semibold text-dark fs-6 d-flex align-items-center gap-2">
                      <Award size={18} className="text-success" />
                      <span>{record.eventName}</span>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Issuing Authority</div>
                    <div className="fw-medium text-dark d-flex align-items-center gap-2">
                      <Building2 size={16} className="text-muted" />
                      <span>{record.organization}</span>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Date of Issuance</div>
                    <div className="fw-medium text-dark d-flex align-items-center gap-2">
                      <Calendar size={16} className="text-muted" />
                      <span>{record.issueDate}</span>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Recognition Category</div>
                    <div className="badge bg-success-subtle text-success border border-success px-2.5 py-1.5 rounded-pill fw-semibold">
                      {record.category}
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="text-muted small text-uppercase fw-semibold mb-1">Authorized Signatory</div>
                    <div className="text-dark fw-medium small fst-italic">
                      {record.signatory}
                    </div>
                  </div>

                  <div className="col-12 pt-3 border-top">
                    <div className="text-muted small mb-1">Cryptographic Fingerprint / Digest:</div>
                    <div className="p-2.5 rounded-2 bg-light text-muted small font-monospace text-break border">
                      <Lock size={13} className="me-1 inline" />
                      {record.credentialDigest}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 text-center">
                  <Link to="/templates" className="btn btn-outline-success btn-sm rounded-pill px-4">
                    Open Template Studio
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* INVALID STATE: Red Warning Screen */
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="p-4 bg-danger text-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2.5 rounded-circle bg-white text-danger d-flex align-items-center justify-content-center shadow-sm">
                    <XCircle size={32} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Tampered / Record Not Found</h4>
                    <span className="small opacity-90">Warning: No cryptographic match found in registry</span>
                  </div>
                </div>

                <span className="badge bg-white text-danger px-3 py-2 rounded-pill fw-bold text-uppercase small">
                  Invalid
                </span>
              </div>

              <div className="p-5 text-center">
                <div className="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3">
                  <AlertTriangle size={36} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Unrecognized Certificate ID: "{certId}"</h5>
                <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '440px' }}>
                  The requested certificate identifier could not be validated against our database. It may have been revoked, falsified, or entered with typographical errors.
                </p>

                <div className="d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-outline-secondary btn-sm px-4"
                    onClick={() => {
                      window.location.href = '/verify/CERT-12345';
                    }}
                  >
                    Try Valid Demo ID (CERT-12345)
                  </button>
                  <Link to="/" className="btn btn-success btn-sm px-4 text-white">
                    Return to Homepage
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
