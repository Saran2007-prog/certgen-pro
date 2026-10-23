import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('saranstalin@certgen.io');
  const [password, setPassword] = useState('admin1234');
  const [fullName, setFullName] = useState('Saranstalin S.');
  const [organization, setOrganization] = useState('Global Institute of Technology');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const { login } = useApp();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!email || !email.includes('@')) {
      errs.email = "Please provide a valid work email";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (mode === 'signup' && !fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light">
          <div className="fw-semibold text-dark">
            {mode === 'login' ? 'Organizer Sign In' : 'Create Organizer Account'}
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-link text-secondary p-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* Mode Switch Tabs */}
          <div className="d-flex rounded-2 p-1 mb-4 bg-light border">
            <button
              type="button"
              className={`btn btn-sm flex-grow-1 fw-medium py-1.5 ${
                mode === 'login' ? 'btn-pro-primary' : 'btn-link text-secondary text-decoration-none'
              }`}
              onClick={() => { setMode('login'); setErrors({}); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-grow-1 fw-medium py-1.5 ${
                mode === 'signup' ? 'btn-pro-primary' : 'btn-link text-secondary text-decoration-none'
              }`}
              onClick={() => { setMode('signup'); setErrors({}); }}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Saranstalin S."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <div className="text-danger small mt-1">{errors.fullName}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary fw-medium mb-1">Issuing Organization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Apex Academy"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label small text-secondary fw-medium mb-1">Work Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="organizer@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small text-secondary fw-medium mb-0">Password</label>
                {mode === 'login' && (
                  <span className="small text-success cursor-pointer" onClick={() => alert("Demo Mode: password is 'admin1234'")}>
                    Forgot?
                  </span>
                )}
              </div>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-pro-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-3 pt-3 border-top text-center text-muted small">
            Demo Credentials: <code>organizer@certgen.io</code> / <code>admin1234</code>
          </div>
        </div>
      </div>
    </div>
  );
};
