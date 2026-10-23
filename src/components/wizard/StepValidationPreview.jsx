import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Edit3, Trash2, CheckCircle2, AlertTriangle, XCircle, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

export const StepValidationPreview = ({ onNext, onPrev }) => {
  const { wizardState, updateParticipant, removeParticipant, setStep } = useApp();
  const { participants } = wizardState;

  // Editing modal/inline state
  const [editingItem, setEditingItem] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'valid' | 'errors' | 'duplicates'

  const validCount = participants.filter(p => p.status === 'valid').length;
  const errorCount = participants.filter(p => p.status === 'error').length;
  const duplicateCount = participants.filter(p => p.status === 'duplicate').length;

  const filteredParticipants = participants.filter(p => {
    if (filterMode === 'valid') return p.status === 'valid';
    if (filterMode === 'errors') return p.status === 'error';
    if (filterMode === 'duplicates') return p.status === 'duplicate';
    return true;
  });

  const handleStartEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      updateParticipant(editingItem.id, {
        participantName: editingItem.participantName,
        email: editingItem.email,
        role: editingItem.role,
        grade: editingItem.grade
      });
      setEditingItem(null);
    }
  };

  const tableColumns = [
    {
      header: "#",
      accessor: "id",
      style: { width: '50px' },
      render: (item, idx) => <span className="text-muted small">{idx + 1}</span>
    },
    {
      header: "Participant Name",
      accessor: "participantName",
      render: (item) => {
        if (editingItem && editingItem.id === item.id) {
          return (
            <input
              type="text"
              className="form-control form-control-sm"
              value={editingItem.participantName}
              onChange={(e) => setEditingItem({ ...editingItem, participantName: e.target.value })}
            />
          );
        }
        return (
          <div>
            <div className={`fw-semibold ${!item.participantName ? 'text-danger fst-italic' : 'text-dark'}`}>
              {item.participantName || "(Empty Name)"}
            </div>
            {item.errors && item.errors.length > 0 && (
              <div className="text-danger small mt-0.5" style={{ fontSize: '11px' }}>
                • {item.errors.join(", ")}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Email Address",
      accessor: "email",
      render: (item) => {
        if (editingItem && editingItem.id === item.id) {
          return (
            <input
              type="email"
              className="form-control form-control-sm"
              value={editingItem.email}
              onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
            />
          );
        }
        return <span className="font-monospace small text-secondary">{item.email}</span>;
      }
    },
    {
      header: "Designation / Role",
      accessor: "role",
      render: (item) => {
        if (editingItem && editingItem.id === item.id) {
          return (
            <input
              type="text"
              className="form-control form-control-sm"
              value={editingItem.role}
              onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
            />
          );
        }
        return <span className="badge bg-light text-dark border">{item.role || "Participant"}</span>;
      }
    },
    {
      header: "Grade / Result",
      accessor: "grade",
      render: (item) => {
        if (editingItem && editingItem.id === item.id) {
          return (
            <input
              type="text"
              className="form-control form-control-sm"
              value={editingItem.grade}
              onChange={(e) => setEditingItem({ ...editingItem, grade: e.target.value })}
            />
          );
        }
        return <span className="small text-muted">{item.grade || "-"}</span>;
      }
    },
    {
      header: "Validation Status",
      accessor: "status",
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      accessor: "actions",
      style: { width: '130px' },
      render: (item) => {
        if (editingItem && editingItem.id === item.id) {
          return (
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-success p-1 px-2 d-flex align-items-center gap-1 rounded"
                onClick={handleSaveEdit}
              >
                <Check size={14} /> Save
              </button>
              <button
                className="btn btn-sm btn-outline-secondary p-1 px-2 d-flex align-items-center gap-1 rounded"
                onClick={() => setEditingItem(null)}
              >
                <X size={14} />
              </button>
            </div>
          );
        }
        return (
          <div className="d-flex gap-1.5">
            <button
              className="btn btn-sm btn-outline-primary p-1.5 rounded-2"
              title="Edit record"
              onClick={() => handleStartEdit(item)}
            >
              <Edit3 size={15} />
            </button>
            <button
              className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
              title="Delete row"
              onClick={() => removeParticipant(item.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      }
    }
  ];

  const getRowClassName = (item) => {
    if (item.status === 'valid') return 'row-valid';
    if (item.status === 'error') return 'row-error';
    if (item.status === 'duplicate') return 'row-warning';
    return '';
  };

  const handleContinue = () => {
    if (validCount === 0) {
      alert("You cannot proceed without at least one valid recipient record. Please edit errors or re-upload.");
      return;
    }
    onNext();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      {/* Step Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Step 3: Validation Preview Table</h4>
          <p className="text-muted small mb-0">
            Green highlights indicate valid entries ready for PDF dispatch. Red rows flag formatting or missing column errors.
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1.5"
          onClick={() => setStep(2)}
        >
          <RefreshCw size={14} />
          <span>Re-upload File</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className={`btn btn-sm rounded-pill px-3 ${filterMode === 'all' ? 'btn-dark' : 'btn-light border'}`}
          onClick={() => setFilterMode('all')}
        >
          All Records ({participants.length})
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 ${filterMode === 'valid' ? 'btn-success text-white' : 'btn-light border text-success'}`}
          onClick={() => setFilterMode('valid')}
        >
          <CheckCircle2 size={14} className="me-1 inline" /> Valid ({validCount})
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 ${filterMode === 'errors' ? 'btn-danger text-white' : 'btn-light border text-danger'}`}
          onClick={() => setFilterMode('errors')}
        >
          <XCircle size={14} className="me-1 inline" /> Errors ({errorCount})
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 ${filterMode === 'duplicates' ? 'btn-warning text-dark' : 'btn-light border text-warning'}`}
          onClick={() => setFilterMode('duplicates')}
        >
          <AlertTriangle size={14} className="me-1 inline" /> Duplicates ({duplicateCount})
        </button>
      </div>

      {/* Preview DataTable */}
      <DataTable
        columns={tableColumns}
        data={filteredParticipants}
        searchPlaceholder="Filter parsed participants..."
        renderRowClass={getRowClassName}
        itemsPerPage={6}
        emptyMessage="No participant records match this filter."
      />

      {/* Error alert notice if issues persist */}
      {(errorCount > 0 || duplicateCount > 0) && (
        <div className="alert alert-warning mt-4 d-flex align-items-center justify-content-between rounded-3 py-2.5 px-3">
          <div className="d-flex align-items-center gap-2 small">
            <AlertTriangle size={18} />
            <span>
              <strong>Attention:</strong> Found {errorCount} malformed and {duplicateCount} duplicate row(s). You can edit them using the pencil icon or proceed to generate only the {validCount} valid certificates.
            </span>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
        <Button
          variant="outline-secondary"
          onClick={onPrev}
          icon={<ArrowLeft size={18} />}
        >
          Back to Upload
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          icon={<ArrowRight size={18} />}
        >
          Proceed to Template Mapping ({validCount} Valid)
        </Button>
      </div>
    </div>
  );
};
