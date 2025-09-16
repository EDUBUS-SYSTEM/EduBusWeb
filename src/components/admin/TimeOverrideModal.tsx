"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaCalendarAlt } from "react-icons/fa";
import { ScheduleTimeOverride } from "@/types";
import { scheduleService } from "@/services/api/scheduleService";

interface TimeOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  scheduleName: string;
  onSuccess: () => void;
  override?: ScheduleTimeOverride | null;
  effectiveFrom: string;
  effectiveTo?: string;
}

export default function TimeOverrideModal({
  isOpen,
  onClose,
  scheduleId,
  scheduleName,
  onSuccess,
  override = null,
  effectiveFrom,
  effectiveTo,
}: TimeOverrideModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
    isCancelled: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (override) {
      setFormData({
        date: new Date(override.date).toISOString().split("T")[0],
        startTime: override.startTime,
        endTime: override.endTime,
        reason: override.reason,
        isCancelled: override.isCancelled,
      });
    } else {
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
        isCancelled: false,
      });
    }
  }, [override]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    // Check date within schedule effective range
    if (formData.date) {
      const date = new Date(formData.date);
      const from = effectiveFrom ? new Date(effectiveFrom) : null;
      const to = effectiveTo ? new Date(effectiveTo) : null;
      if (from && date < new Date(from.toISOString().split("T")[0])) {
        newErrors.date = "Date must be on or after Effective From";
      }
      if (to && date > new Date(to.toISOString().split("T")[0])) {
        newErrors.date = "Date must be on or before Effective To";
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
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

    try {
      const timeOverrideData: ScheduleTimeOverride = {
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        createdBy: "admin", // TODO: Get from auth context
        createdAt: new Date(),
        isCancelled: formData.isCancelled,
      };

      if (override) {
        // Update existing override: upsert by date
        await scheduleService.updateTimeOverride(
          scheduleId,
          timeOverrideData
        );
      } else {
        // Add new override
        await scheduleService.addTimeOverride(scheduleId, timeOverrideData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving time override:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#463B3B] flex items-center">
              <FaCalendarAlt className="w-6 h-6 mr-3 text-blue-600" />
              {override ? "Edit Time Override" : "Add Time Override"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Schedule:</strong> {scheduleName}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                min={effectiveFrom ? new Date(effectiveFrom).toISOString().split("T")[0] : undefined}
                max={effectiveTo ? new Date(effectiveTo).toISOString().split("T")[0] : undefined}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                  errors.date ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.startTime
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.endTime
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                  errors.reason ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Enter reason for this time override..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isCancelled}
                  onChange={(e) =>
                    handleInputChange("isCancelled", e.target.checked)
                  }
                  className="w-4 h-4 text-[#fad23c] bg-gray-100 border-gray-300 rounded focus:ring-[#fad23c] focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mark as cancelled
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] px-6 py-3 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center gap-2 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#463B3B] border-t-transparent rounded-full animate-spin"></div>
                    {override ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {override ? "Update Override" : "Add Override"}
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
