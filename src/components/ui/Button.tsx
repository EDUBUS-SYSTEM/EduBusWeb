'use client';

import React from 'react';
import { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-2xl
    transition-all duration-300 ease-in-out transform hover:scale-105
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    shadow-lg hover:shadow-xl
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14',
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-400 to-blue-600 
      text-white border-0
      hover:from-blue-500 hover:to-blue-700
      focus:ring-blue-300
      shadow-blue-200/50
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 
      text-gray-800 border border-gray-300
      hover:from-gray-200 hover:to-gray-300
      focus:ring-gray-300
      shadow-gray-200/50
    `,
    outline: `
      bg-transparent border-2 border-blue-400 
      text-blue-600
      hover:bg-blue-50 hover:border-blue-500
      focus:ring-blue-300
      shadow-blue-100/50
    `,
    ghost: `
      bg-transparent border-0 
      text-blue-600
      hover:bg-blue-50
      focus:ring-blue-300
      shadow-transparent
    `,
    danger: `
      bg-gradient-to-r from-red-400 to-red-600 
      text-white border-0
      hover:from-red-500 hover:to-red-700
      focus:ring-red-300
      shadow-red-200/50
    `,
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;


