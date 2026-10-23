import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon = null,
  type = 'button',
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn btn-primary';
      case 'secondary':
        return 'btn btn-secondary';
      case 'outline-primary':
        return 'btn btn-outline-primary';
      case 'outline-secondary':
        return 'btn btn-outline-secondary';
      case 'success':
        return 'btn btn-success';
      case 'danger':
        return 'btn btn-danger';
      case 'light':
        return 'btn btn-light';
      default:
        return 'btn btn-primary';
    }
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'btn-sm';
    if (size === 'lg') return 'btn-lg';
    return '';
  };

  return (
    <button
      type={type}
      className={`${getVariantClass()} ${getSizeClass()} d-inline-flex align-items-center justify-content-center gap-2 fw-semibold px-3 py-2 rounded-3 shadow-sm ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="d-flex align-items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
