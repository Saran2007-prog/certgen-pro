import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LoginView = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('organizer@certgen.io');
  const [password, setPassword] = useState('admin1234');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (isRegisterMode && !name.trim()) {
      errs.name = "Full name is required";
    }

    if (!email) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        await register({ name, email, password, role: 'Administrator' });
        setAuthSuccess('Account registered successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-5 col-xl-4">
          {/* Logo & Welcome text */}
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-4 bg-primary text-white shadow-lg mb-3">
              <Award size={36} />
            </div>
            <h3 className="fw-bold text-dark tracking-tight">CertGen<span className="text-primary"> Pro</span></h3>
            <p className="text-muted small">Automated Bulk Digital Certificate Generation Platform</p>
          </div>

          {/* Form Card */}
          <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="fw-bold mb-0 text-dark">
                {isRegisterMode ? 'Create Administrator' : 'Administrator Login'}
              </h4>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 text-primary fw-semibold"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError('');
                  setAuthSuccess('');
                  setErrors({});
                }}
              >
                {isRegisterMode ? 'Existing User? Sign In' : 'Register New'}
              </button>
            </div>
            <p className="text-muted small mb-4">
              {isRegisterMode
                ? 'Register a new administrator account with MongoDB'
                : 'Enter organizer credentials to manage batches & events'}
            </p>

            {authError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4">
                <ShieldCheck size={18} />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name Field (Register Mode Only) */}
              {isRegisterMode && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 py-2 ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g. Dr. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Work Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className={`form-control border-start-0 py-2 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="organizer@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
                  {!isRegisterMode && (
                    <a
                      href="#reset"
                      className="small text-primary text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Quick Demo Credentials:\nEmail: organizer@certgen.io\nPassword: admin1234");
                      }}
                    >
                      Need Help?
                    </a>
                  )}
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className={`form-control border-start-0 py-2 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2.5"
                loading={isSubmitting}
                icon={<ArrowRight size={18} />}
              >
                {isRegisterMode ? 'Complete Registration' : 'Sign In to Organizer Console'}
              </Button>
            </form>

            <div className="mt-4 pt-3 border-top text-center">
              <span className="text-muted small d-flex align-items-center justify-content-center gap-1">
                <ShieldCheck size={16} className="text-success" /> End-to-End Encrypted Session (JWT Verified)
              </span>
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="text-center mt-3 text-muted small">
            Quick Demo: <code>organizer@certgen.io</code> / <code>admin1234</code>
          </div>
        </div>
      </div>
    </div>
  );
};
