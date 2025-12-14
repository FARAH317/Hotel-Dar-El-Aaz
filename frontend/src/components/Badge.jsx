import React from 'react';
import { getStatusBadgeClass } from '@/utils/formatters';

const Badge = ({ 
  children, 
  color = 'secondary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-sm font-medium uppercase tracking-wide';
  
  const colorClasses = {
    primary: 'bg-[#E5D4A6]/30 text-[#B8934A] border border-[#C9A961]/20',
    secondary: 'bg-[#F5F1E8] text-[#6B5D4F] border border-[#EAE3D2]',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };
  
  // Use getStatusBadgeClass if color is a status
  const colorClass = colorClasses[color] || getStatusBadgeClass(color);
  
  return (
    <span 
      className={`${baseClasses} ${colorClass} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;