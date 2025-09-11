"use client";
import { useState } from "react";
import { FaTimes, FaClock, FaCalendarAlt, FaTag, FaSave } from "react-icons/fa";
import { scheduleService, CreateScheduleDto } from "@/services/api/scheduleService";

interface CreateScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Helper function to generate RRule based on schedule type
const generateRRule = (scheduleType: string): string => {
  switch (scheduleType.toLowerCase()) {
    case 'daily':
      return 'FREQ=DAILY';
    case 'weekday':
      return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
    case 'weekend':
      return 'FREQ=WEEKLY;BYDAY=SA,SU';
    case 'custom':
      return 'FREQ=WEEKLY';
    default:
      return 'FREQ=DAILY';
  }
};

export default function CreateScheduleModal({ onClose, onSuccess }: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    scheduleType: "Daily",
    startTime: "",
    endTime: "",
    effectiveFrom: "",
    effectiveTo: "",
    description: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const scheduleTypes = [
    { value: "Daily", label: "Daily" },
    { value: "Weekday", label: "Weekday" },
    { value: "Weekend", label: "Weekend" },
    { value: "Custom", label: "Custom" }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }

    if (!formData.effectiveTo) {
      newErrors.effectiveTo = "Effective to date is required";
    }

    if (formData.effectiveFrom && formData.effectiveTo && formData.effectiveFrom >= formData.effectiveTo) {
      newErrors.effectiveTo = "Effective to date must be after effective from date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError("");
    
    try {
      const createScheduleDto: CreateScheduleDto = {
        name: formData.name,
        scheduleType: formData.scheduleType,
        startTime: formData.startTime,
        endTime: formData.endTime,
        rRule: generateRRule(formData.scheduleType),
        timezone: "UTC",
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || undefined,
        exceptions: [],
        isActive: formData.isActive
      };

      await scheduleService.createSchedule(createScheduleDto);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error creating schedule:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          setSubmitError(axiosError.response.data.message);
        } else {
          setSubmitError("An error occurred while creating the schedule. Please try again.");
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        setSubmitError((error as { message: string }).message);
      } else {
        setSubmitError("An error occurred while creating the schedule. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Create New Schedule</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Schedule Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Enter schedule name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTag className="inline w-4 h-4 mr-2" />
                Schedule Type *
              </label>
              <select
                value={formData.scheduleType}
                onChange={(e) => handleInputChange("scheduleType", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300"
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline w-4 h-4 mr-2" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline w-4 h-4 mr-2" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Effective Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Effective From *
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => handleInputChange("effectiveFrom", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.effectiveFrom ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.effectiveFrom && (
                  <p className="mt-1 text-sm text-red-600">{errors.effectiveFrom}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Effective To *
                </label>
                <input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => handleInputChange("effectiveTo", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.effectiveTo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.effectiveTo && (
                  <p className="mt-1 text-sm text-red-600">{errors.effectiveTo}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter schedule description (optional)"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="w-4 h-4 text-[#fad23c] bg-gray-100 border-gray-300 rounded focus:ring-[#fad23c] focus:ring-2"
              />
              <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                Active Schedule
              </label>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center gap-2 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#463B3B] border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Create Schedule
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
