"use client";
import { useState } from "react";
import {
  FaTimes,
  FaSave,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { scheduleService } from "@/services/api/scheduleService";
import { Schedule } from "@/types";

interface ExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule;
  onSuccess: () => void;
}

export default function ExceptionModal({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}: ExceptionModalProps) {
  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionNotes, setNewExceptionNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [undoStack, setUndoStack] = useState<
    Array<{ action: string; data: { date: Date; notes: string } }>
  >([]);

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

      // Enforce within schedule effective range
      const effFrom = schedule.effectiveFrom
        ? new Date(schedule.effectiveFrom)
        : null;
      const effTo = schedule.effectiveTo
        ? new Date(schedule.effectiveTo)
        : null;
      if (effFrom) {
        const fromYMD = effFrom.toISOString().split("T")[0];
        if (selectedDate < new Date(fromYMD)) {
          newErrors.date = "Date must be on or after Effective From";
        }
      }
      if (effTo) {
        const toYMD = effTo.toISOString().split("T")[0];
        if (selectedDate > new Date(toYMD)) {
          newErrors.date = "Date must be on or before Effective To";
        }
      }

      // Check if date already exists
      const dateExists = schedule.exceptions.some(
        (exception) =>
          new Date(exception as unknown as string | Date).toDateString() ===
          selectedDate.toDateString()
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
    setErrors({});

    try {
      const newException = new Date(newExceptionDate);
      const updatedExceptions = [...schedule.exceptions, newException];

      // Add to undo stack
      setUndoStack((prev) => [
        ...prev,
        {
          action: "add",
          data: { date: newException, notes: newExceptionNotes },
        },
      ]);

      // Build full UpdateScheduleDto using existing schedule fields
      await scheduleService.updateSchedule(schedule.id, {
        id: schedule.id,
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
        updatedAt: schedule.updatedAt, // Send current timestamp for optimistic locking
      });

      onSuccess();
      setNewExceptionDate("");
      setNewExceptionNotes("");
    } catch (error: unknown) {
      console.error("Error adding exception:", error);

      // Enhanced error handling
      let errorMessage = "Failed to add exception. Please try again.";

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

  const handleRemoveException = async (dateToRemove: Date | string) => {
    if (!confirm("Are you sure you want to remove this exception?")) {
      return;
    }

    setLoading(true);

    try {
      const removeKey = new Date(
        dateToRemove as unknown as string | Date
      ).toDateString();

      // Add to undo stack
      setUndoStack((prev) => [
        ...prev,
        {
          action: "remove",
          data: { date: new Date(dateToRemove), notes: "" },
        },
      ]);

      const updatedExceptions = schedule.exceptions.filter(
        (exception) =>
          new Date(exception as unknown as string | Date).toDateString() !==
          removeKey
      );

      // Update schedule with updated exceptions
      await scheduleService.updateSchedule(schedule.id, {
        id: schedule.id,
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
        updatedAt: schedule.updatedAt, // Send current timestamp for optimistic locking
      });

      onSuccess();
    } catch (error: unknown) {
      console.error("Error removing exception:", error);

      // Enhanced error handling
      let errorMessage = "Failed to remove exception. Please try again.";

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

      alert(errorMessage);
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

  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    try {
      if (lastAction.action === "add") {
        // Undo add by removing the exception
        const removeKey = new Date(lastAction.data.date).toDateString();
        const updatedExceptions = schedule.exceptions.filter(
          (exception) =>
            new Date(exception as unknown as string | Date).toDateString() !==
            removeKey
        );

        await scheduleService.updateSchedule(schedule.id, {
          id: schedule.id,
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
          updatedAt: schedule.updatedAt, // Send current timestamp for optimistic locking
        });
      } else if (lastAction.action === "remove") {
        // Undo remove by adding the exception back
        const updatedExceptions = [
          ...schedule.exceptions,
          lastAction.data.date,
        ];

        await scheduleService.updateSchedule(schedule.id, {
          id: schedule.id,
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
          updatedAt: schedule.updatedAt, // Send current timestamp for optimistic locking
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error undoing action:", error);
      alert("Failed to undo action. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="exception-title"
        aria-modal="true"
        aria-describedby="exception-description"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3
              id="exception-title"
              className="text-2xl font-bold text-[#463B3B] flex items-center"
            >
              <FaExclamationTriangle
                className="w-6 h-6 mr-3 text-orange-600"
                aria-hidden="true"
              />
              Manage Exceptions
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
            id="exception-description"
            className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarAlt
                className="w-5 h-5 text-orange-600"
                aria-hidden="true"
              />
              <h4 className="text-lg font-semibold text-orange-800">
                Schedule: {schedule.name}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-orange-600 font-medium">
                  Academic Year:
                </span>
                <span className="ml-2 text-orange-800">
                  {schedule.academicYear || "Not assigned"}
                </span>
              </div>
              <div>
                <span className="text-orange-600 font-medium">
                  Schedule Type:
                </span>
                <span className="ml-2 text-orange-800">
                  {schedule.scheduleType}
                </span>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Time Range:</span>
                <span className="ml-2 text-orange-800">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
              <div>
                <span className="text-orange-600 font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    schedule.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {schedule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-3 italic">
              Exceptions are dates when this schedule will not run
            </p>
          </div>

          {/* Add New Exception Form */}
          <form onSubmit={handleAddException} className="mb-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="exception-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Add Exception Date *
                </label>
                <input
                  id="exception-date"
                  type="date"
                  value={newExceptionDate}
                  min={
                    schedule.effectiveFrom
                      ? new Date(schedule.effectiveFrom)
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  max={
                    schedule.effectiveTo
                      ? new Date(schedule.effectiveTo)
                          .toISOString()
                          .split("T")[0]
                      : undefined
                  }
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                    errors.date ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date && (
                  <p id="date-error" className="mt-1 text-sm text-red-600">
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="exception-notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="exception-notes"
                  placeholder="Add notes about this exception..."
                  value={newExceptionNotes}
                  onChange={(e) => setNewExceptionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex gap-3">
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" aria-hidden="true" />
                      Add Exception
                    </>
                  )}
                </button>

                {undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Undo Last Action
                  </button>
                )}
              </div>
            </div>
            {errors.general && (
              <p className="mt-2 text-sm text-red-600">{errors.general}</p>
            )}
          </form>

          {/* Current Exceptions List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Current Exceptions ({schedule.exceptions.length})
            </h4>

            {schedule.exceptions.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  aria-hidden="true"
                />
                <p className="text-gray-600">
                  No exceptions set for this schedule.
                </p>
              </div>
            ) : (
              <div
                className="space-y-3"
                role="list"
                aria-label="Current exceptions"
              >
                {schedule.exceptions
                  .sort(
                    (a, b) =>
                      new Date(a as unknown as string | Date).getTime() -
                      new Date(b as unknown as string | Date).getTime()
                  )
                  .map((exception, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-white to-orange-50 border border-gray-100 rounded-xl p-4 hover:shadow-soft transition-all duration-300"
                      role="listitem"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaCalendarAlt
                            className="w-5 h-5 text-orange-500 mr-3"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {new Date(
                                exception as unknown as string | Date
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                exception as unknown as string | Date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveException(exception)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          title="Remove Exception"
                          aria-label={`Remove exception for ${new Date(exception as unknown as string | Date).toLocaleDateString()}`}
                        >
                          <FaTimes className="w-4 h-4" aria-hidden="true" />
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
