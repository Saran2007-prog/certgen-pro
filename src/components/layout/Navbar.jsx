import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, PlusCircle, LayoutDashboard, LogOut, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const auth = useAuth?.() || {};
  const app = useApp?.() || {};
  const user = auth.user || app.user;
  const logout = auth.logout || app.logout;
  const location = useLocation();

  if (!user || location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg pro-nav sticky-top py-2">
      <div className="container-fluid px-4 px-lg-5">
        {/* Brand - No link to public home once logged in */}
        <div className="navbar-brand d-flex align-items-center gap-2 mb-0" style={{ cursor: 'default' }}>
          <div className="p-1.5 rounded-2 bg-success text-dark fw-bold d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--cyber-green)' }}>
            <Award size={18} />
          </div>
          <span className="fs-5 fw-bold text-dark">
            CertGen<span className="text-success" style={{ color: 'var(--cyber-green-dark)' }}> Pro</span>
          </span>
        </div>

        {/* Center Navigation Links */}
        <div className="d-flex align-items-center gap-2 mx-auto">
          <Link
            to="/dashboard"
            className={`btn btn-sm px-3 py-1.5 ${
              location.pathname === '/dashboard' ? 'btn-pro-primary' : 'btn-pro-outline'
            }`}
          >
            <LayoutDashboard size={15} className="me-1 inline" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/templates"
            className={`btn btn-sm px-3 py-1.5 ${
              location.pathname === '/templates' ? 'btn-pro-primary' : 'btn-pro-outline'
            }`}
          >
            <Layers size={15} className="me-1 inline" />
            <span>Template Studio</span>
          </Link>
          <Link
            to="/wizard"
            className={`btn btn-sm px-3 py-1.5 ${
              location.pathname === '/wizard' ? 'btn-pro-primary' : 'btn-pro-outline'
            }`}
          >
            <PlusCircle size={15} className="me-1 inline" />
            <span>Generate Certificates</span>
          </Link>
        </div>

        {/* User Profile and Logout Button (The ONLY way back to landing page) */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-md-block">
            <div className="fw-semibold text-dark small">{user.name}</div>
            <div className="text-muted text-xs" style={{ fontSize: '11px' }}>{user.role}</div>
          </div>
          <div 
            className="avatar rounded-circle fw-bold d-flex align-items-center justify-content-center" 
            style={{ 
              width: 34, 
              height: 34, 
              fontSize: '13px',
              backgroundColor: 'var(--cyber-green-light)',
              color: 'var(--cyber-green-dark)',
              border: '1.5px solid var(--cyber-green)'
            }}
          >
            {user.name.charAt(0)}
          </div>
          <button
            onClick={logout}
            className="btn btn-sm btn-outline-danger p-1.5 d-flex align-items-center gap-1.5 px-2.5 rounded-2"
            title="Log out of organizer console"
          >
            <LogOut size={15} />
            <span className="small fw-semibold">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
