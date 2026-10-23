import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingNavbar = ({ onOpenAuth }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    // Specifically target the section element inside the right scroll container
    const rightContainer = document.getElementById('right-scroll-container');
    const targetElement = document.getElementById(id);

    if (rightContainer && targetElement) {
      // Calculate position relative to right container
      const topOffset = targetElement.offsetTop - 75; // Account for sticky navbar height
      rightContainer.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'auto'
      });
    } else if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-3 px-4 px-xl-5 shadow-none" style={{ zIndex: 10 }}>
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        {/* Navigation Links with exact coordinate scrolling */}
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => scrollToSection('home')}
            className="btn btn-sm btn-link text-secondary text-decoration-none px-2 fw-semibold"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="btn btn-sm btn-link text-secondary text-decoration-none px-2 fw-semibold"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="btn btn-sm btn-link text-secondary text-decoration-none px-2 fw-semibold"
          >
            Contact
          </button>
        </div>

        {/* Auth / Console Buttons */}
        <div className="d-flex align-items-center gap-2">
          {user ? (
            <div className="d-flex align-items-center gap-2">
              <Link to="/dashboard" className="btn btn-sm btn-pro-primary px-3 py-1.5 d-flex align-items-center gap-1.5">
                <LayoutDashboard size={14} />
                <span>Console</span>
              </Link>
              <button
                onClick={logout}
                className="btn btn-sm btn-pro-outline p-1.5"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="btn btn-sm btn-pro-outline px-3.5 py-1.5 d-flex align-items-center gap-1.5"
              >
                <LogIn size={14} />
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuth('signup')}
                className="btn btn-sm btn-pro-primary px-4 py-1.5 d-flex align-items-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
