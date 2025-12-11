/**
 * Centralized Date Formatting Utilities
 * Standard format: "Dec 2, 2025" (en-US, month abbreviated)
 * 
 * This file provides consistent date formatting across the entire web application.
 * All components should import from this file instead of using local formatDate functions.
 */

/**
 * Format date to standard display format: "Dec 2, 2025"
 * @param dateInput - Date object, ISO date string, or any parseable date string
 * @returns Formatted date string
 */
export const formatDate = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format date with time: "Dec 2, 2025, 10:30 AM"
 * @param dateInput - Date object, ISO date string, or any parseable date string
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date with time (short, without year): "Dec 2, 10:30 AM"
 * Useful for tables where space is limited
 * @param dateInput - Date object, ISO date string, or any parseable date string
 * @returns Formatted datetime string without year
 */
export const formatDateTimeShort = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format for input fields: "2025-12-02"
 * Converts UTC date strings to local date for proper timezone handling
 * @param dateInput - Date object, ISO date string, or any parseable date string
 * @returns Formatted date string for HTML date inputs (local timezone)
 */
export const formatDateForInput = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return '';
    // If string and already in YYYY-MM-DD format, return as is (assume it's already local date)
    if (typeof dateInput === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;
    }

    // Always parse through Date object to handle timezone conversion correctly
    // This ensures UTC strings are converted to local date
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    
    // Get local date components (not UTC components)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format time only: "10:30 AM"
 * @param dateInput - Date object, ISO date string, or any parseable date string
 * @returns Formatted time string
 */
export const formatTime = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format month and year only: "December 2025"
 * @param dateInput - Date object (or string for consistency)
 * @returns Formatted month year string
 */
export const formatMonthYear = (dateInput: Date | string): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });
};
