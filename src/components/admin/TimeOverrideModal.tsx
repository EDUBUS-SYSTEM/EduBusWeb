"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave, FaCalendarAlt } from "react-icons/fa";
import { ScheduleTimeOverride } from "@/types";
import { scheduleService } from "@/services/api/scheduleService";
import TimeSlotSelector from "./TimeSlotSelector";
import { formatDate, formatDateForInput } from "@/utils/dateUtils";

interface TimeOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  scheduleName: string;
  onSuccess: () => void;
  override?: ScheduleTimeOverride | null;
  effectiveFrom: string;
  effectiveTo?: string;
  existingExceptions?: Date[];
  updatedAt?: string;
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
  existingExceptions = [],
  updatedAt,
}: TimeOverrideModalProps) {
  const [formData, setFormData] = useState({
    date: "", // Override date
    startTime: "",
    endTime: "",
    reason: "",
    isCancelled: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overrideType, setOverrideType] = useState<"exception" | "standalone">(
    "standalone"
  );
  const [selectedExceptionDate, setSelectedExceptionDate] =
    useState<string>(""); // Exception date
  const [undoStack, setUndoStack] = useState<
    Array<{ action: string; data: ScheduleTimeOverride }>
  >([]);

  useEffect(() => {
    if (override) {
      setFormData({
        date: formatDateForInput(override.date),
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

    // Validate date based on override type
    if (overrideType === "standalone") {
      if (!formData.date) {
        newErrors.date = "Date is required";
      }

      // Check date within schedule effective range
      if (formData.date) {
        const date = new Date(formData.date);
        const from = effectiveFrom ? new Date(effectiveFrom) : null;
        const to = effectiveTo ? new Date(effectiveTo) : null;
        if (from && date < new Date(formatDateForInput(from))) {
          newErrors.date = "Date must be on or after Effective From";
        }
        if (to && date > new Date(formatDateForInput(to))) {
          newErrors.date = "Date must be on or before Effective To";
        }
      }
    } else {
      // Exception override type
      if (!selectedExceptionDate) {
        newErrors.exceptionDate = "Please select an exception date";
      }
      if (!formData.date) {
        newErrors.date = "Override date is required";
      } else {
        // Check override date within schedule effective range
        const date = new Date(formData.date);
        const from = effectiveFrom ? new Date(effectiveFrom) : null;
        const to = effectiveTo ? new Date(effectiveTo) : null;
        if (from && date < new Date(formatDateForInput(from))) {
          newErrors.date = "Override date must be on or after Effective From";
        }
        if (to && date > new Date(formatDateForInput(to))) {
          newErrors.date = "Override date must be on or before Effective To";
        }
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
    setErrors({});

    try {
      const timeOverrideData: ScheduleTimeOverride = {
        date: new Date(formData.date), // Override date (ngày học bù)
        exceptionDate:
          overrideType === "exception" && selectedExceptionDate
            ? new Date(selectedExceptionDate)
            : undefined, // Exception date (ngày nghỉ)
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        createdBy: "admin", // TODO: Get from auth context
        createdAt: new Date(),
        isCancelled: formData.isCancelled,
      };

      // Add to undo stack
      setUndoStack((prev) => [
        ...prev,
        {
          action: override ? "update" : "add",
          data: timeOverrideData,
        },
      ]);

      if (override) {
        // Update existing override: upsert by date
        await scheduleService.updateTimeOverride(scheduleId, timeOverrideData);
      } else {
        // Add new override
        await scheduleService.addTimeOverride(
          scheduleId,
          timeOverrideData,
          updatedAt
        );
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving time override:", error);

      // Enhanced error handling
      let errorMessage = "Failed to save time override. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        if (axiosError.response?.status === 409) {
          errorMessage =
            "Schedule was modified by another user. Please refresh and try again.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setErrors({ general: errorMessage });
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

  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    try {
      if (lastAction.action === "add") {
        // Undo add by removing the override
        await scheduleService.removeTimeOverride(
          scheduleId,
          lastAction.data.date.toISOString().split("T")[0],
          updatedAt
        );
      } else if (lastAction.action === "update") {
        // Undo update by restoring previous data
        await scheduleService.updateTimeOverride(scheduleId, lastAction.data);
      }

      onSuccess();
    } catch (error) {
      console.error("Error undoing action:", error);
      alert("Failed to undo action. Please try again.");
    }
  };

  const handleExport = async () => {
    try {
      // Fetch current schedule to get time overrides
      const currentSchedule = await scheduleService.getScheduleById(scheduleId);
      const timeOverrides = currentSchedule.timeOverrides || [];

      const data = timeOverrides.map((override) => ({
        Date: formatDate(override.date),
        StartTime: override.startTime,
        EndTime: override.endTime,
        Reason: override.reason,
        Status: override.isCancelled ? "Cancelled" : "Active",
        CreatedBy: override.createdBy,
        CreatedAt: new Date(override.createdAt).toLocaleString(),
      }));

      const csv = convertToCSV(data);
      downloadCSV(
        csv,
        `time-overrides-${scheduleName.replace(/\s+/g, "-")}.csv`
      );
    } catch (error) {
      console.error("Error exporting time overrides:", error);
      alert("Failed to export time overrides. Please try again.");
    }
  };

  const convertToCSV = (data: Array<Record<string, string>>) => {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="time-override-title"
        aria-modal="true"
        aria-describedby="time-override-description"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3
              id="time-override-title"
              className="text-2xl font-bold text-[#463B3B] flex items-center"
            >
              <FaCalendarAlt
                className="w-6 h-6 mr-3 text-blue-600"
                aria-hidden="true"
              />
              {override ? "Edit Time Override" : "Add Time Override"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
              aria-label="Close modal"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div
            id="time-override-description"
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarAlt
                className="w-5 h-5 text-blue-600"
                aria-hidden="true"
              />
              <h4 className="text-lg font-semibold text-blue-800">
                Schedule: {scheduleName}
              </h4>
            </div>
            <p className="text-sm text-blue-600">
              Override allows you to change the time for a specific date
            </p>
          </div>

          {/* Override Type Selection */}
          {!override && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Override Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setOverrideType("standalone")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${overrideType === "standalone"
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-1">
                      Standalone Override
                    </div>
                    <div className="text-sm text-gray-600">
                      Change time for any date
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideType("exception")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${overrideType === "exception"
                      ? "border-orange-500 bg-orange-50 text-orange-800"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-1">
                      Exception Override
                    </div>
                    <div className="text-sm text-gray-600">
                      Change time for exception date
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            {overrideType === "standalone" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Override Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  min={
                    effectiveFrom
                      ? formatDateForInput(effectiveFrom)
                      : undefined
                  }
                  max={
                    effectiveTo
                      ? formatDateForInput(effectiveTo)
                      : undefined
                  }
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.date ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Exception Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exception Date *
                  </label>
                  {existingExceptions.length > 0 ? (
                    <select
                      value={selectedExceptionDate}
                      onChange={(e) => {
                        setSelectedExceptionDate(e.target.value);
                        if (errors.exceptionDate) {
                          setErrors((prev) => ({ ...prev, exceptionDate: "" }));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.exceptionDate
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                        }`}
                    >
                      <option value="">Select an exception date...</option>
                      {existingExceptions.map((exception, index) => (
                        <option
                          key={index}
                          value={
                            formatDateForInput(exception)
                          }
                        >
                          {formatDate(exception)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-orange-800 text-sm">
                        No exceptions available. Please create an exception
                        first or use &quot;Standalone Override&quot;.
                      </p>
                    </div>
                  )}
                  {errors.exceptionDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.exceptionDate}
                    </p>
                  )}
                </div>

                {/* Override Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Override Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    min={
                      effectiveFrom
                        ? formatDateForInput(effectiveFrom)
                        : undefined
                    }
                    max={
                      effectiveTo
                        ? formatDateForInput(effectiveTo)
                        : undefined
                    }
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                      }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
              </div>
            )}

            {/* Time Range */}
            <TimeSlotSelector
              selectedStartTime={formData.startTime}
              selectedEndTime={formData.endTime}
              onStartTimeChange={(time) => handleInputChange("startTime", time)}
              onEndTimeChange={(time) => handleInputChange("endTime", time)}
              errors={{
                startTime: errors.startTime,
                endTime: errors.endTime,
              }}
            />

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.reason ? "border-red-300 bg-red-50" : "border-gray-200"
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
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Undo Last Action
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExport}
                  className="px-6 py-3 border border-blue-300 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  Export CSV
                </button>
              </div>

              <div className="flex gap-3">
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
                      <div
                        className="w-4 h-4 border-2 border-[#463B3B] border-t-transparent rounded-full animate-spin"
                        aria-hidden="true"
                      ></div>
                      {override ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" aria-hidden="true" />
                      {override ? "Update Override" : "Add Override"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {errors.general && (
              <p className="mt-2 text-sm text-red-600">{errors.general}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
