import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm uppercase tracking-wide';
  
  const variantClasses = {
    primary: 'bg-[#C9A961] text-white hover:bg-[#B8934A] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-transparent text-[#C9A961] border-2 border-[#C9A961] hover:bg-[#C9A961] hover:text-white hover:-translate-y-0.5 active:translate-y-0',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5',
    outline: 'border border-[#EAE3D2] bg-white text-[#2C2416] hover:bg-[#F5F1E8] hover:border-[#C9A961]',
    ghost: 'bg-transparent text-[#C9A961] hover:bg-[#F5F1E8]',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;