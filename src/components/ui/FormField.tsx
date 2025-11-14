"use client";
import React from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface FormFieldProps {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string | null;
  success?: boolean;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export default function FormField({
  label,
  icon,
  required = false,
  error,
  success = false,
  children,
  className = "",
  description
}: FormFieldProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        {icon && <span className="text-[#fad23c]">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 -mt-1">{description}</p>
      )}

      {/* Input Field */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          className: `w-full px-4 py-3 border-2 rounded-lg transition-all bg-gray-50 focus:bg-white resize-none ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : hasSuccess
              ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              : 'border-gray-200 focus:border-[#fad23c] focus:ring-2 focus:ring-[#fad23c]/20'
          } ${(children as React.ReactElement<Record<string, unknown>>).props.className || ''}`.trim()
        })}

        {/* Success/Error Icon */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? (
              <FaExclamationTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <FaCheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="flex items-start gap-2 mt-2">
          <FaExclamationTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {hasSuccess && (
        <div className="flex items-center gap-2 mt-2">
          <FaCheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-600 font-medium">Valid</p>
        </div>
      )}
    </div>
  );
}

// Character Counter Component
interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className = "" }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <div className={`flex items-center justify-between text-xs ${className}`}>
      <div className={`font-medium ${
        isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-500'
      }`}>
        {current} / {max} characters
      </div>
      
      {/* Progress Bar */}
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-2">
        <div 
          className={`h-full transition-all duration-300 ${
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Validation Summary Component
interface ValidationSummaryProps {
  errors: Array<{ field: string; message: string }>;
  className?: string;
}

export function ValidationSummary({ errors, className = "" }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <FaExclamationTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                • {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
