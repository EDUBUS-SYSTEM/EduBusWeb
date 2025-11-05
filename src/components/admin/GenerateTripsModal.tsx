"use client";

import React, { useState } from 'react';
import { FaTimes, FaMagic } from 'react-icons/fa';

interface GenerateTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleId: string, startDate: string, endDate: string) => void;
  schedules?: { id: string; name: string }[];
}

export default function GenerateTripsModal({
  isOpen,
  onClose,
  onSubmit,
  schedules = []
}: GenerateTripsModalProps) {
  const [scheduleId, setScheduleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(scheduleId, startDate, endDate);
      // Reset form
      setScheduleId('');
      setStartDate('');
      setEndDate('');
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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
            <select
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.scheduleId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Schedule</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </option>
              ))}
            </select>
            {errors.scheduleId && (
              <p className="mt-1 text-sm text-red-500">{errors.scheduleId}</p>
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold"
            >
              Generate Trips
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

