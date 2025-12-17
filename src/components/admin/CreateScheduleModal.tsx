"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaTag,
  FaSave,
  FaGraduationCap,
} from "react-icons/fa";
import {
  scheduleService,
  CreateScheduleDto,
} from "@/services/api/scheduleService";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import { AcademicSemester, TripType } from "@/types";
import RRuleBuilder from "@/components/admin/RRuleBuilder";
import TimeSlotSelector from "@/components/admin/TimeSlotSelector";

interface CreateScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateScheduleModal({
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    scheduleType: "school_day",
    tripType: TripType.Departure,
    startTime: "",
    endTime: "",
    academicYear: "",
    semesterCode: "",
    effectiveFrom: "",
    effectiveTo: "",
    description: "",
    isActive: true,
    rRule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true);
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [rruleValidation, setRruleValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({
    isValid: true,
    errors: [],
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);
  const handleRruleValidationChange = useCallback(
    (isValid: boolean, errors: string[]) => {
      setRruleValidation({ isValid, errors });
    },
    []
  );

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };
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

  const tripTypes = [
    {
      value: TripType.Departure,
      label: "Departure",
      description: "Trip from pickup points to school",
    },
    {
      value: TripType.Return,
      label: "Return",
      description: "Trip from school back to pickup points",
    },
  ];

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setLoadingAcademicYears(true);
        const years = await academicCalendarService.getAcademicYears();
        setAcademicYears(years);

        const currentYear =
          await academicCalendarService.getCurrentAcademicYear();
        if (currentYear) {
          const updatedFormData = { ...formData, academicYear: currentYear };
          setFormData(updatedFormData);
          setInitialFormData(updatedFormData);
        } else {
          setInitialFormData(formData);
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

  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialFormData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const formatDateForInput = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadSemesters = async () => {
      if (formData.academicYear) {
        try {
          setLoadingSemesters(true);
          const academicCalendar =
            await academicCalendarService.getAcademicCalendarByYear(
              formData.academicYear
            );
          const activeSemesters = academicCalendar.semesters.filter(
            (s) => s.isActive
          );
          setSemesters(activeSemesters);

          setFormData((prev) => ({
            ...prev,
            semesterCode: "",
          }));
        } catch (error) {
          console.error("Error loading semesters:", error);
          setSemesters([]);
        } finally {
          setLoadingSemesters(false);
        }
      } else {
        setSemesters([]);
      }
    };

    loadSemesters();
  }, [formData.academicYear]);

  useEffect(() => {
    const loadEffectiveDates = async () => {
      if (formData.academicYear) {
        try {
          const academicCalendar =
            await academicCalendarService.getAcademicCalendarByYear(
              formData.academicYear
            );

          if (formData.semesterCode) {
            const semester = academicCalendar.semesters.find(
              (s) => s.code === formData.semesterCode && s.isActive
            );
            if (semester) {
              setFormData((prev) => ({
                ...prev,
                effectiveFrom: formatDateForInput(semester.startDate),
                effectiveTo: formatDateForInput(semester.endDate),
              }));
              return;
            }
          }

          setFormData((prev) => ({
            ...prev,
            effectiveFrom: academicCalendar.startDate
              ? formatDateForInput(academicCalendar.startDate)
              : "",
            effectiveTo: academicCalendar.endDate
              ? formatDateForInput(academicCalendar.endDate)
              : "",
          }));
        } catch (error) {
          console.error("Error loading effective dates:", error);
        }
      }
    };

    loadEffectiveDates();
  }, [formData.academicYear, formData.semesterCode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Schedule name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Schedule name must be at least 3 characters";
    }

    if (!formData.academicYear) {
      newErrors.academicYear = "Academic year is required";
    } else if (!academicYears.includes(formData.academicYear)) {
      newErrors.academicYear = "Please select a valid academic year";
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


    if (!formData.academicYear) {
      if (!formData.effectiveFrom) {
        newErrors.effectiveFrom = "Effective from date is required";
      }
      if (!formData.effectiveTo) {
        newErrors.effectiveTo = "Effective to date is required";
      }
    }

    if (
      formData.effectiveFrom &&
      formData.effectiveTo &&
      formData.effectiveFrom >= formData.effectiveTo
    ) {
      newErrors.effectiveTo =
        "Effective to date must be after effective from date";
    }

    if (!rruleValidation.isValid) {
      newErrors.rRule = "Please configure a valid recurrence rule";
    } else if (!formData.rRule || !formData.rRule.includes("FREQ=")) {
      newErrors.rRule = "RRule must contain FREQ parameter";
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
      const effectiveFromDate = formData.effectiveFrom
        ? (() => {
          const [year, month, day] = formData.effectiveFrom.split('-').map(Number);
          console.log(`Parsing effectiveFrom: ${formData.effectiveFrom} -> year=${year}, month=${month}, day=${day}`);
          const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
          const isoString = date.toISOString();
          console.log(`Created UTC date: ${isoString}, UTC date part: ${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`);
          return isoString;
        })()
        : new Date().toISOString();

      const effectiveToDate = formData.effectiveTo
        ? (() => {
          const [year, month, day] = formData.effectiveTo.split('-').map(Number);
          const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
          return date.toISOString();
        })()
        : undefined;

      const tripTypeValue = formData.tripType;

      const createScheduleDto: CreateScheduleDto = {
        name: formData.name.trim(),
        scheduleType: formData.scheduleType,
        tripType: tripTypeValue,
        startTime: formData.startTime,
        endTime: formData.endTime,
        rRule: formData.rRule,
        timezone: "UTC",
        academicYear: formData.academicYear,
        semesterCode: formData.semesterCode || undefined,
        effectiveFrom: effectiveFromDate,
        effectiveTo: effectiveToDate,
        exceptions: [],
        isActive: formData.isActive,
      };

      console.log("Submitting schedule:", JSON.stringify(createScheduleDto, null, 2));
      await scheduleService.createSchedule(createScheduleDto);
      setHasUnsavedChanges(false);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error creating schedule:", error);

      let errorMessage = "Failed to create schedule. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
            status?: number;
          };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.errors) {
          const errorMessages = Object.values(axiosError.response.data.errors).flat();
          errorMessage = errorMessages.join(", ") || errorMessage;
        }
        console.error("Backend error details:", axiosError.response?.data);
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-gray-800">
                Create New Schedule
              </h3>
              {hasUnsavedChanges && (
                <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
            >
              <FaTimes />
            </button>
          </div>

          <form
            id="schedule-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                placeholder="Enter schedule name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTag className="inline w-4 h-4 mr-2" />
                Trip Type *
              </label>
              <select
                value={formData.tripType}
                onChange={(e) =>
                  handleInputChange("tripType", Number(e.target.value))
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.tripType
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200"
                  }`}
              >
                {tripTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {
                  tripTypes.find(
                    (type) => type.value === formData.tripType
                  )?.description
                }
              </p>
              {errors.tripType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tripType}
                </p>
              )}
            </div>

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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.academicYear
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

            {formData.academicYear && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGraduationCap className="inline w-4 h-4 mr-2" />
                  Semester (Optional)
                </label>
                <select
                  value={formData.semesterCode}
                  onChange={(e) =>
                    handleInputChange("semesterCode", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  disabled={loadingSemesters}
                >
                  <option value="">
                    {loadingSemesters
                      ? "Loading semesters..."
                      : "Select Semester (Optional - leave empty for full academic year)"}
                  </option>
                  {semesters.map((semester) => (
                    <option key={semester.code} value={semester.code}>
                      {semester.name} ({semester.code})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.semesterCode
                    ? "Effective dates will be set from selected semester"
                    : "Leave empty to use full academic year dates"}
                </p>
              </div>
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Effective From{" "}
                  {formData.academicYear
                    ? formData.semesterCode
                      ? "(Auto-filled from Semester)"
                      : "(Auto-filled from Academic Year)"
                    : "*"}
                </label>
                <input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    handleInputChange("effectiveFrom", e.target.value)
                  }
                  disabled={!!formData.academicYear}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.effectiveFrom
                    ? "border-red-300 bg-red-50"
                    : formData.academicYear
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200"
                    }`}
                />
                {errors.effectiveFrom && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.effectiveFrom}
                  </p>
                )}
                {formData.academicYear && (
                  <p className="mt-1 text-xs text-blue-600">
                    {formData.semesterCode
                      ? "Automatically set from selected Semester"
                      : "Automatically set from Academic Year"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Effective To{" "}
                  {formData.academicYear
                    ? formData.semesterCode
                      ? "(Auto-filled from Semester)"
                      : "(Auto-filled from Academic Year)"
                    : "*"}
                </label>
                <input
                  type="date"
                  value={formData.effectiveTo}
                  min={formData.effectiveFrom || undefined}
                  onChange={(e) =>
                    handleInputChange("effectiveTo", e.target.value)
                  }
                  disabled={!!formData.academicYear}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.effectiveTo
                    ? "border-red-300 bg-red-50"
                    : formData.academicYear
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200"
                    }`}
                />
                {errors.effectiveTo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.effectiveTo}
                  </p>
                )}
                {formData.academicYear && (
                  <p className="mt-1 text-xs text-blue-600">
                    {formData.semesterCode
                      ? "Automatically set from selected Semester"
                      : "Automatically set from Academic Year"}
                  </p>
                )}
              </div>
            </div>

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
            </div>

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


          </form>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-form"
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
        </div>
      </div>
    </div>
  );
}
