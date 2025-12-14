import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  noPadding = false,
  hover = true,
  ...props
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg p-6 
        transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : 'shadow-md'}
        ${className}
      `}
      style={{
        boxShadow: '0 4px 16px rgba(201, 169, 97, 0.08)'
      }}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`border-b border-[#EAE3D2] pb-4 mb-4 ${headerClassName}`}>
          {title && (
            <h3 
              className="text-xl font-semibold text-[#2C2416]" 
              style={{fontFamily: 'Cormorant Garamond, serif'}}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-[#6B5D4F]">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className={`${noPadding ? '' : ''} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`border-t border-[#EAE3D2] pt-4 mt-4 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;