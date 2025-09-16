"use client";
import { useState } from "react";
import {
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { scheduleService } from "@/services/api/scheduleService";

interface ExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  scheduleName: string;
  onSuccess: () => void;
  exceptions: Date[];
}

export default function ExceptionModal({
  isOpen,
  onClose,
  scheduleId,
  scheduleName,
  onSuccess,
  exceptions,
}: ExceptionModalProps) {
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newExceptionDate) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(newExceptionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Exception date cannot be in the past";
      }

      // Check if date already exists
      const dateExists = exceptions.some(
        (exception) => exception.toDateString() === selectedDate.toDateString()
      );
      if (dateExists) {
        newErrors.date = "This date is already an exception";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const newException = new Date(newExceptionDate);
      const updatedExceptions = [...exceptions, newException];

      // Update schedule with new exceptions
      await scheduleService.updateSchedule(scheduleId, {
        id: scheduleId,
        name: "",
        scheduleType: "",
        startTime: "",
        endTime: "",
        rRule: "",
        timezone: "",
        academicYear: "",
        effectiveFrom: "",
        effectiveTo: "",
        exceptions: updatedExceptions,
        isActive: true,
      });

      onSuccess();
      setNewExceptionDate("");
    } catch (error: unknown) {
      console.error("Error adding exception:", error);
      setErrors({ general: "Failed to add exception. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveException = async (dateToRemove: Date) => {
    if (!confirm("Are you sure you want to remove this exception?")) {
      return;
    }

    setLoading(true);

    try {
      const updatedExceptions = exceptions.filter(
        (exception) => exception.toDateString() !== dateToRemove.toDateString()
      );

      // Update schedule with updated exceptions
      await scheduleService.updateSchedule(scheduleId, {
        id: scheduleId,
        name: "",
        scheduleType: "",
        startTime: "",
        endTime: "",
        rRule: "",
        timezone: "",
        academicYear: "",
        effectiveFrom: "",
        effectiveTo: "",
        exceptions: updatedExceptions,
        isActive: true,
      });

      onSuccess();
    } catch (error: unknown) {
      console.error("Error removing exception:", error);
      alert("Failed to remove exception. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setNewExceptionDate(value);
    // Clear error when user starts typing
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: "" }));
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
              <FaExclamationTriangle className="w-6 h-6 mr-3 text-orange-600" />
              Manage Exceptions
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Schedule:</strong> {scheduleName}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Exceptions are dates when this schedule will not run
            </p>
          </div>

          {/* Add New Exception Form */}
          <form onSubmit={handleAddException} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Exception Date *
                </label>
                <input
                  type="date"
                  value={newExceptionDate}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.date ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] px-6 py-3 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center gap-2 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#463B3B] border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
            {errors.general && (
              <p className="mt-2 text-sm text-red-600">{errors.general}</p>
            )}
          </form>

          {/* Current Exceptions List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Current Exceptions ({exceptions.length})
            </h4>

            {exceptions.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No exceptions set for this schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exceptions
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((exception, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-white to-orange-50 border border-gray-100 rounded-xl p-4 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-5 h-5 text-orange-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {exception.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {exception.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveException(exception)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Remove Exception"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
