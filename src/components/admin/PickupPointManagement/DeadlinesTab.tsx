// components/admin/PickupPointManagement/DeadlinesTab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { FaClock, FaSave, FaCalendarAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DeadlineSettings {
  enrollmentDeadline: string; // ISO date string
  paymentDeadline: string; // ISO date string
}

const STORAGE_KEY = 'pickup_point_deadlines';

const DeadlinesTab: React.FC = () => {
  const [settings, setSettings] = useState<DeadlineSettings>({
    enrollmentDeadline: '',
    paymentDeadline: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          enrollmentDeadline: parsed.enrollmentDeadline || '',
          paymentDeadline: parsed.paymentDeadline || '',
        });
      } else {
        // Set default to next month
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setSettings({
          enrollmentDeadline: nextMonth.toISOString().split('T')[0],
          paymentDeadline: nextMonth.toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Failed to load deadlines:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate dates
      if (!settings.enrollmentDeadline || !settings.paymentDeadline) {
        toast.error('Please fill in all deadline dates');
        return;
      }

      const enrollmentDate = new Date(settings.enrollmentDeadline);
      const paymentDate = new Date(settings.paymentDeadline);

      if (isNaN(enrollmentDate.getTime()) || isNaN(paymentDate.getTime())) {
        toast.error('Invalid date format');
        return;
      }

      // Save to localStorage (in production, this should be saved to backend)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      toast.success('Deadlines saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save deadlines');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof DeadlineSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#463B3B] mb-2">Manage Deadlines</h2>
        <p className="text-gray-600">
          Set the deadline dates for enrollment registration and payment submission
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {/* Enrollment Deadline */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FaCalendarAlt className="text-[#fad23c] text-2xl" />
            <div>
              <h3 className="text-lg font-semibold text-[#463B3B]">Enrollment Registration Deadline</h3>
              <p className="text-sm text-gray-600">
                Last date for parents to submit pickup point registration requests
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline Date
            </label>
            <input
              type="date"
              value={settings.enrollmentDeadline}
              onChange={(e) => handleChange('enrollmentDeadline', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
            {settings.enrollmentDeadline && (
              <p className="mt-2 text-sm text-gray-600">
                Deadline: {new Date(settings.enrollmentDeadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Payment Deadline */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FaClock className="text-[#fad23c] text-2xl" />
            <div>
              <h3 className="text-lg font-semibold text-[#463B3B]">Payment Submission Deadline</h3>
              <p className="text-sm text-gray-600">
                Last date for parents to complete payment for approved pickup point requests
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline Date
            </label>
            <input
              type="date"
              value={settings.paymentDeadline}
              onChange={(e) => handleChange('paymentDeadline', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
            {settings.paymentDeadline && (
              <p className="mt-2 text-sm text-gray-600">
                Deadline: {new Date(settings.paymentDeadline).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <FaClock className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Deadlines
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These deadlines are currently stored locally. In production, they should be 
          saved to the backend database and can be used to automatically restrict enrollment and payment submissions.
        </p>
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default DeadlinesTab;

