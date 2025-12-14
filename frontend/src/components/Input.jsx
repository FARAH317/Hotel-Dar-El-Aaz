import React from 'react';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-[#2C2416] mb-2"
          style={{fontFamily: 'Montserrat, sans-serif'}}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B7965]">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            border rounded-sm
            bg-white text-[#2C2416]
            placeholder-[#8B7965]
            transition-all duration-200
            focus:outline-none
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
            }
            ${icon ? 'pl-10' : ''}
            ${disabled ? 'bg-[#F5F1E8] cursor-not-allowed opacity-60' : ''}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;