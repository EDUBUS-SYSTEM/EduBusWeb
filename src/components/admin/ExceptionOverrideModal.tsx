"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaCalendarAlt, FaExclamationTriangle, FaClock } from "react-icons/fa";
import { ScheduleTimeOverride } from "@/types";
import { scheduleService } from "@/services/api/scheduleService";
import TimeSlotSelector from "./TimeSlotSelector";

interface ExceptionOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  scheduleName: string;
  onSuccess: () => void;
  effectiveFrom: string;
  effectiveTo?: string;
  existingExceptions?: Date[];
  existingOverrides?: ScheduleTimeOverride[];
}

type OverrideType = "exception" | "override";

export default function ExceptionOverrideModal({
  isOpen,
  onClose,
  scheduleId,
  scheduleName,
  onSuccess,
  effectiveFrom,
  effectiveTo,
  existingExceptions = [],
  existingOverrides = [],
}: ExceptionOverrideModalProps) {
  const [overrideType, setOverrideType] = useState<OverrideType>("override");
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<string>("");
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
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
        isCancelled: false,
      });
      setOverrideType("override");
      setSelectedExceptionDate("");
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (overrideType === "exception") {
      // For exception, validate the date
      if (!formData.date) {
        newErrors.date = "Date is required";
      }

      // Check if date already has exception
      if (formData.date) {
        const date = new Date(formData.date);
        const hasException = existingExceptions.some(ex => 
          new Date(ex).toDateString() === date.toDateString()
        );
        if (hasException) {
          newErrors.date = "Exception already exists for this date";
        }
      }
    } else if (overrideType === "override") {
      // For override, validate exception date selection
      if (!selectedExceptionDate) {
        newErrors.exceptionDate = "Please select an exception date";
      }

      // Validate time fields
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

      // Check if override already exists for selected exception date
      if (selectedExceptionDate) {
        const hasOverride = existingOverrides.some(override => 
          new Date(override.date).toDateString() === new Date(selectedExceptionDate).toDateString()
        );
        if (hasOverride) {
          newErrors.exceptionDate = "Override already exists for this exception date";
        }
      }
    }

    // Check date within schedule effective range
    const dateToCheck = overrideType === "override" ? selectedExceptionDate : formData.date;
    if (dateToCheck) {
      const date = new Date(dateToCheck);
      const from = effectiveFrom ? new Date(effectiveFrom) : null;
      const to = effectiveTo ? new Date(effectiveTo) : null;
      if (from && date < new Date(from.toISOString().split("T")[0])) {
        newErrors.date = "Date must be on or after Effective From";
      }
      if (to && date > new Date(to.toISOString().split("T")[0])) {
        newErrors.date = "Date must be on or before Effective To";
      }
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
      if (overrideType === "exception") {
        // Only create exception
        const exceptionDate = new Date(formData.date);
        const schedule = await scheduleService.getScheduleById(scheduleId);
        if (schedule) {
          const updatedExceptions = [...schedule.exceptions, exceptionDate];
          await scheduleService.updateSchedule(scheduleId, {
            id: scheduleId,
            name: schedule.name,
            scheduleType: schedule.scheduleType,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            rRule: schedule.rRule,
            timezone: schedule.timezone,
            academicYear: schedule.academicYear,
            effectiveFrom: new Date(schedule.effectiveFrom).toISOString(),
            effectiveTo: schedule.effectiveTo
              ? new Date(schedule.effectiveTo).toISOString()
              : undefined,
            exceptions: updatedExceptions,
            isActive: schedule.isActive,
            timeOverrides: schedule.timeOverrides || [],
          });
        }
      } else if (overrideType === "override") {
        // Only create override for selected exception date
        const timeOverrideData: ScheduleTimeOverride = {
          date: new Date(selectedExceptionDate),
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason,
          createdBy: "admin", // TODO: Get from auth context
          createdAt: new Date(),
          isCancelled: formData.isCancelled,
        };

        await scheduleService.addTimeOverride(scheduleId, timeOverrideData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving exception/override:", error);
      setErrors({ general: "Failed to save. Please try again." });
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
              Add Exception/Override
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
            {/* Override Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to create?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => setOverrideType("exception")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    overrideType === "exception"
                      ? "border-[#FDC700] bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-[#FDC700] hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <FaExclamationTriangle className="w-6 h-6 text-orange-500 mb-2" />
                    <h5 className="font-semibold text-gray-800 text-sm mb-1">
                      Exception Only
                    </h5>
                    <p className="text-xs text-gray-500">
                      Cancel schedule for this date
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setOverrideType("override")}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    overrideType === "override"
                      ? "border-[#FDC700] bg-yellow-50 shadow-lg"
                      : "border-gray-200 hover:border-[#FDC700] hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <FaClock className="w-6 h-6 text-blue-500 mb-2" />
                    <h5 className="font-semibold text-gray-800 text-sm mb-1">
                      Override Only
                    </h5>
                    <p className="text-xs text-gray-500">
                      Change time for existing exception
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            {overrideType === "exception" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exception Date *
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Exception Date for Override *
                </label>
                {existingExceptions.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      No exceptions available. Please create an exception first before adding an override.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedExceptionDate}
                    onChange={(e) => setSelectedExceptionDate(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                      errors.exceptionDate ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select an exception date...</option>
                    {existingExceptions.map((exception, index) => (
                      <option key={index} value={new Date(exception).toISOString().split("T")[0]}>
                        {new Date(exception).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                )}
                {errors.exceptionDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.exceptionDate}</p>
                )}
              </div>
            )}

            {/* Time Range - Only show for override */}
            {overrideType === "override" && (
              <TimeSlotSelector
                selectedStartTime={formData.startTime}
                selectedEndTime={formData.endTime}
                onStartTimeChange={(time) => handleInputChange("startTime", time)}
                onEndTimeChange={(time) => handleInputChange("endTime", time)}
                errors={{
                  startTime: errors.startTime,
                  endTime: errors.endTime
                }}
              />
            )}

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
                placeholder="Enter reason for this exception/override..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Status - Only show for override */}
            {overrideType === "override" && (
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
            )}

            {errors.general && (
              <p className="mt-2 text-sm text-red-600">{errors.general}</p>
            )}

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
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Create {overrideType === "exception" ? "Exception" : overrideType === "override" ? "Override" : "Both"}
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
