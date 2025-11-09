"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaMagic } from 'react-icons/fa';
import { scheduleService } from "@/services/api/scheduleService";
import { Schedule } from "@/types";

interface GenerateTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleId: string, startDate: string, endDate: string) => Promise<void>;
}

export default function GenerateTripsModal({
  isOpen,
  onClose,
  onSubmit,
}: GenerateTripsModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleId, setScheduleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load schedules when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSchedules();
      // Set default dates (today and 7 days from now)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(nextWeek.toISOString().split('T')[0]);
      setScheduleId('');
      setErrors({});
      setSubmissionError(null);
    }
  }, [isOpen]);

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const schedulesData = await scheduleService.getSchedules({ activeOnly: true });
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setErrors(prev => ({ ...prev, schedules: 'Failed to load schedules' }));
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Format time for display
  const formatTime = (isoTime: string): string => {
    try {
      // Handle different time formats
      let timeStr = isoTime;
      // If it's just time (HH:mm or HH:mm:ss), add date prefix
      if (isoTime && !isoTime.includes('T') && !isoTime.includes(' ')) {
        timeStr = `2000-01-01T${isoTime}`;
      }
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        return isoTime; // Return original if can't parse
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoTime;
    }
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!scheduleId) {
      newErrors.scheduleId = 'Schedule is required';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(scheduleId, startDate, endDate);
      // Success - modal will be closed by parent
      setScheduleId('');
      setStartDate('');
      setEndDate('');
      setErrors({});
      setSubmissionError(null);
    } catch (error: unknown) {
      console.error('Error generating trips:', error);

      // Extract error message - handle both axios errors and Error objects
      let errorMessage = 'Failed to generate trips. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        if (axiosError.response?.data) {
          if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          }
          if (axiosError.response.data.error) {
            errorMessage += `: ${axiosError.response.data.error}`;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FaMagic className="text-[#fad23c]" />
            <h3 className="text-2xl font-bold text-[#463B3B]">Generate Trips from Schedule</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This will automatically generate trips based on the selected schedule&apos;s recurrence rules (RRule)
              for the specified date range. Existing trips will be skipped to avoid duplicates.
            </p>
          </div>

          {/* Schedule Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule <span className="text-red-500">*</span>
            </label>
            {loadingSchedules ? (
              <div className="text-sm text-gray-500">Loading schedules...</div>
            ) : (
              <>
                <select
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.scheduleId ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Schedule</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name} ({formatTime(schedule.startTime)} - {formatTime(schedule.endTime)})
                    </option>
                  ))}
                </select>
                {errors.scheduleId && (
                  <p className="mt-1 text-sm text-red-500">{errors.scheduleId}</p>
                )}
              </>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          {/* Error Message */}
          {submissionError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="text-sm font-medium">Error:</p>
              <p className="text-sm">{submissionError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generating...' : 'Generate Trips'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}