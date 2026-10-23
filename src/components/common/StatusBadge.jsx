import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'valid':
      case 'success':
        return {
          bg: 'badge-soft-success',
          icon: <CheckCircle2 size={13} className="me-1" />,
          label: status.toUpperCase()
        };
      case 'in progress':
      case 'generating':
      case 'processing':
        return {
          bg: 'badge-soft-primary',
          icon: <Clock size={13} className="me-1 animate-spin" />,
          label: status.toUpperCase()
        };
      case 'duplicate':
      case 'warning':
        return {
          bg: 'badge-soft-warning',
          icon: <AlertTriangle size={13} className="me-1" />,
          label: status.toUpperCase()
        };
      case 'error':
      case 'failed':
      case 'cancelled':
        return {
          bg: 'badge-soft-danger',
          icon: <XCircle size={13} className="me-1" />,
          label: status.toUpperCase()
        };
      default:
        return {
          bg: 'badge-soft-primary',
          icon: <Clock size={13} className="me-1" />,
          label: status ? status.toUpperCase() : 'PENDING'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.bg} px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center text-xs`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
