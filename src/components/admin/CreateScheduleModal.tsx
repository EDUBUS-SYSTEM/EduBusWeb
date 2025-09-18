"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaClock,
  FaCalendarAlt,
  FaTag,
  FaSave,
  FaGraduationCap,
  FaEye,
} from "react-icons/fa";
import {
  scheduleService,
  CreateScheduleDto,
} from "@/services/api/scheduleService";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import RRuleBuilder from "@/components/admin/RRuleBuilder";
import { RRuleUtils } from "@/utils/rruleUtils";

interface CreateScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Helper function to generate RRule based on schedule type
// Removed unused generateRRule function

export default function CreateScheduleModal({
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    scheduleType: "school_day",
    startTime: "",
    endTime: "",
    academicYear: "",
    effectiveFrom: "",
    effectiveTo: "",
    description: "",
    isActive: true,
    rRule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", // Default RRule for school days
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true);
  const [rruleValidation, setRruleValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({
    isValid: true,
    errors: [],
  });
  const handleRruleValidationChange = useCallback((isValid: boolean, errors: string[]) => {
    setRruleValidation({ isValid, errors });
  }, []);
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const scheduleTypes = [
    {
      value: "school_day",
      label: "School Day",
      description: "Regular schedule for normal school days",
    },
    {
      value: "exam_day",
      label: "Exam Day",
      description: "Special schedule for examination days",
    },
    {
      value: "holiday",
      label: "Holiday",
      description: "Schedule for holidays and special events",
    },
    {
      value: "weekend",
      label: "Weekend",
      description: "Schedule for Saturday and Sunday",
    },
    {
      value: "special",
      label: "Special",
      description: "Schedule for other special events",
    },
  ];

  // Load academic years on component mount
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setLoadingAcademicYears(true);
        const years = await academicCalendarService.getAcademicYears();
        setAcademicYears(years);

        // Auto-select current academic year if available
        const currentYear =
          await academicCalendarService.getCurrentAcademicYear();
        if (currentYear) {
          setFormData((prev) => ({ ...prev, academicYear: currentYear }));
        }
      } catch (error) {
        console.error("Error loading academic years:", error);
        setSubmitError(
          "Failed to load academic years. Please refresh and try again."
        );
      } finally {
        setLoadingAcademicYears(false);
      }
    };

    loadAcademicYears();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    }

    if (!formData.academicYear) {
      newErrors.academicYear = "Academic year is required";
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

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }

    if (!formData.effectiveTo) {
      newErrors.effectiveTo = "Effective to date is required";
    }

    if (
      formData.effectiveFrom &&
      formData.effectiveTo &&
      formData.effectiveFrom >= formData.effectiveTo
    ) {
      newErrors.effectiveTo =
        "Effective to date must be after effective from date";
    }

    // Validate RRule
    if (!rruleValidation.isValid) {
      newErrors.rRule = "RRule configuration is invalid";
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
        rRule: formData.rRule,
        timezone: "UTC",
        academicYear: formData.academicYear,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || undefined,
        exceptions: [],
        isActive: formData.isActive,
      };

      await scheduleService.createSchedule(createScheduleDto);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error creating schedule:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setSubmitError(axiosError.response.data.message);
        } else {
          setSubmitError(
            "An error occurred while creating the schedule. Please try again."
          );
        }
      } else if (error && typeof error === "object" && "message" in error) {
        setSubmitError((error as { message: string }).message);
      } else {
        setSubmitError(
          "An error occurred while creating the schedule. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-suggest RRule based on schedule type
    if (field === "scheduleType") {
      let suggestedRRule = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"; // Default school day

      switch (value) {
        case "school_day":
          suggestedRRule = "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";
          break;
        case "exam_day":
          suggestedRRule = "FREQ=MONTHLY;BYMONTHDAY=15";
          break;
        case "holiday":
          suggestedRRule = "FREQ=YEARLY;BYMONTH=1,4,9,12";
          break;
        case "weekend":
          suggestedRRule = "FREQ=WEEKLY;BYDAY=SA,SU";
          break;
        case "special":
          suggestedRRule = "FREQ=DAILY;INTERVAL=1";
          break;
      }

      setFormData((prev) => ({ ...prev, rRule: suggestedRRule }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generatePreviewDates = () => {
    if (!formData.rRule || !formData.effectiveFrom) {
      setPreviewDates([]);
      return;
    }

    try {
      const startDate = new Date(formData.effectiveFrom);
      // const endDate = formData.effectiveTo
      //   ? new Date(formData.effectiveTo)
      //   : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start

      const dates = RRuleUtils.generatePreviewDates(
        formData.rRule,
        startDate,
        10
      );
      setPreviewDates(dates);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview dates:", error);
      setPreviewDates([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              Create New Schedule
            </h3>
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
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
                onChange={(e) =>
                  handleInputChange("scheduleType", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {
                  scheduleTypes.find(
                    (type) => type.value === formData.scheduleType
                  )?.description
                }
              </p>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaGraduationCap className="inline w-4 h-4 mr-2" />
                Academic Year *
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) =>
                  handleInputChange("academicYear", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.academicYear
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
                disabled={loadingAcademicYears}
              >
                <option value="">
                  {loadingAcademicYears
                    ? "Loading academic years..."
                    : "Select Academic Year"}
                </option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.academicYear && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.academicYear}
                </p>
              )}
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
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
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
                  <FaClock className="inline w-4 h-4 mr-2" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
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
                  onChange={(e) =>
                    handleInputChange("effectiveFrom", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.effectiveFrom
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.effectiveFrom && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.effectiveFrom}
                  </p>
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
                  min={formData.effectiveFrom || undefined}
                  onChange={(e) =>
                    handleInputChange("effectiveTo", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                    errors.effectiveTo
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.effectiveTo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.effectiveTo}
                  </p>
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
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter schedule description (optional)"
              />
            </div>

            {/* RRule Builder */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Schedule Configuration
              </h4>
              <RRuleBuilder
                value={formData.rRule}
                onChange={(rrule) => handleInputChange("rRule", rrule)}
                onValidationChange={handleRruleValidationChange}
                previewStartDate={formData.effectiveFrom}
                previewEndDate={formData.effectiveTo || undefined}
              />
              {errors.rRule && (
                <p className="mt-2 text-sm text-red-600">{errors.rRule}</p>
              )}
            </div>

            {/* Preview Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Active Schedule
                </label>
              </div>
              {/* Removed duplicate Preview Dates button; RRuleBuilder has its own Preview */}
            </div>

            {/* Preview Dates */}
            {showPreview && previewDates.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-3">
                  Preview Generated Dates (Next 10 occurrences):
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {previewDates.map((date, index) => (
                    <div
                      key={index}
                      className="bg-white border border-blue-200 rounded px-3 py-2 text-sm text-blue-700"
                    >
                      {date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800"
                >
                  Hide Preview
                </button>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
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
