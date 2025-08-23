'use client';

import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, error, helperText, onChange, className = '', ...props }, ref) => {
    const baseClasses = `
      w-full px-4 py-3 rounded-2xl border-2
      transition-all duration-300 ease-in-out
      focus:outline-none focus:ring-4 focus:ring-opacity-50
      placeholder:text-gray-400
      bg-white backdrop-blur-sm
    `;

    const stateClasses = error
      ? `
          border-red-300 focus:border-red-500 focus:ring-red-200
          text-red-900 placeholder:text-red-300
        `
      : `
          border-gray-200 focus:border-blue-400 focus:ring-blue-200
          text-gray-900 hover:border-gray-300
        `;

    const classes = `
      ${baseClasses}
      ${stateClasses}
      pr-12
      ${className}
    `;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={classes}
            onChange={handleChange}
            {...props}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
