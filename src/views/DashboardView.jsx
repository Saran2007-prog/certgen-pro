import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Award, Users, CheckCircle2, FileText, ArrowUpRight, Calendar, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

export const DashboardView = () => {
  const { events, resetWizard } = useApp();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    resetWizard();
    navigate('/wizard');
  };

  // Metrics computation
  const totalCertificatesIssued = events.reduce((sum, item) => sum + item.totalRecords, 0);
  const activeBatchesCount = events.filter(e => e.status !== 'Completed').length;
  const completedBatchesCount = events.filter(e => e.status === 'Completed').length;

  const tableColumns = [
    {
      header: "Batch ID",
      accessor: "batchId",
      render: (item) => (
        <div className="d-flex align-items-center gap-2">
          <div className="p-1.5 rounded-2 bg-light text-primary border">
            <Award size={16} />
          </div>
          <div>
            <span className="font-monospace fw-bold text-dark">{item.batchId}</span>
            <div className="text-muted text-xs" style={{ fontSize: '11px' }}>Created {item.createdAt}</div>
          </div>
        </div>
      )
    },
    {
      header: "Event Title & Organization",
      accessor: "title",
      render: (item) => (
        <div>
          <div className="fw-semibold text-dark">{item.title}</div>
          <div className="text-muted small d-flex align-items-center gap-1">
            <Building2 size={13} /> {item.organization}
          </div>
        </div>
      )
    },
    {
      header: "Event Date",
      accessor: "date",
      render: (item) => (
        <span className="d-flex align-items-center gap-1.5 text-secondary small">
          <Calendar size={14} /> {item.date}
        </span>
      )
    },
    {
      header: "Total Records",
      accessor: "totalRecords",
      render: (item) => (
        <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill fw-semibold">
          {item.totalRecords.toLocaleString()} recipients
        </span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (item) => (
        <button
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill px-3"
          onClick={() => {
            alert(`Opening batch report details for ${item.batchId}`);
          }}
        >
          <span>View Batch</span>
          <ArrowUpRight size={14} />
        </button>
      )
    }
  ];

  return (
    <div className="container-fluid px-4 py-4 max-w-7xl">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Organizer Dashboard</h2>
          <p className="text-muted small mb-0">
            Monitor bulk certificate generation batches, review dispatch metrics, and launch events
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<PlusCircle size={20} />}
          onClick={handleCreateNew}
          className="shadow"
        >
          Create New Event
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Certificates</span>
                <h3 className="fw-bold text-dark mt-2 mb-0">{totalCertificatesIssued.toLocaleString()}</h3>
              </div>
              <div className="p-2.5 rounded-3 bg-primary-subtle text-primary">
                <Award size={24} />
              </div>
            </div>
            <div className="mt-3 text-success small fw-medium">
              ↑ 12% from previous month
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Events Hosted</span>
                <h3 className="fw-bold text-dark mt-2 mb-0">{events.length}</h3>
              </div>
              <div className="p-2.5 rounded-3 bg-success-subtle text-success">
                <FileText size={24} />
              </div>
            </div>
            <div className="mt-3 text-muted small">
              Across 4 organizations
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Successful Batches</span>
                <h3 className="fw-bold text-dark mt-2 mb-0">{completedBatchesCount}</h3>
              </div>
              <div className="p-2.5 rounded-3 bg-info-subtle text-info">
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="mt-3 text-success small">
              100% Delivery rate
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">In Queue</span>
                <h3 className="fw-bold text-dark mt-2 mb-0">{activeBatchesCount}</h3>
              </div>
              <div className="p-2.5 rounded-3 bg-warning-subtle text-warning">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-3 text-muted small">
              Awaiting dispatch or verification
            </div>
          </div>
        </div>
      </div>

      {/* Batches Table Section */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Past Certificate Generation Batches</h5>
            <p className="text-muted small mb-0">Browse through historical batch records, issuance status, and recipient counts</p>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={events}
          searchPlaceholder="Search by Event, Batch ID, or Organization..."
          itemsPerPage={5}
        />
      </div>
    </div>
  );
};
