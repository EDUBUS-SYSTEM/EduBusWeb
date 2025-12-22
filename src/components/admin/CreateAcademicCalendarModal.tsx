"use client";
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaGraduationCap,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import {
  AcademicSemester,
  SchoolHoliday,
  SchoolDay,
  CreateAcademicCalendarDto,
  AcademicCalendar,
} from "@/types";

interface CreateAcademicCalendarModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAcademicCalendarModal({
  onClose,
  onSuccess,
}: CreateAcademicCalendarModalProps) {
  const [formData, setFormData] = useState({
    academicYear: "",
    name: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [existingCalendars, setExistingCalendars] = useState<AcademicCalendar[]>([]); // Store existing calendars
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [holidays, setHolidays] = useState<SchoolHoliday[]>([]);
  const [schoolDays] = useState<SchoolDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const calendars = await academicCalendarService.getAcademicCalendars();
        setExistingCalendars(calendars);
      } catch (error) {
        console.error("Failed to fetch existing calendars", error);
      }
    };
    fetchCalendars();
  }, []);

  const getLatestEndDate = () => {
    if (existingCalendars.length === 0) return null;

    // Find the latest end date across all calendars
    const dates = existingCalendars
      .map(c => c.endDate)
      .filter(Boolean)
      .map(d => new Date(d).getTime());

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates));
  };

  const getMinStartDate = () => {
    const latestEndDate = getLatestEndDate();
    if (!latestEndDate) return '';

    const minStart = new Date(latestEndDate);
    minStart.setDate(minStart.getDate() + 1); // Must be at least 1 day after
    return minStart.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic year is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Calendar name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const latestEndDate = getLatestEndDate();
      if (latestEndDate) {
        const startDate = new Date(formData.startDate);
        if (startDate <= latestEndDate) {
          newErrors.startDate = `Start date must be after the latest existing calendar (End Date: ${latestEndDate.toISOString().split('T')[0]})`;
        }
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
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
      const createCalendarDto: CreateAcademicCalendarDto = {
        academicYear: formData.academicYear,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        semesters: semesters,
        holidays: holidays,
        schoolDays: schoolDays,
        isActive: formData.isActive,
      };

      await academicCalendarService.createAcademicCalendar(createCalendarDto);
      onSuccess();
    } catch (error: unknown) {
      console.error("Error creating academic calendar:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setSubmitError(axiosError.response.data.message);
        } else {
          setSubmitError(
            "An error occurred while creating the academic calendar. Please try again."
          );
        }
      } else if (error && typeof error === "object" && "message" in error) {
        setSubmitError((error as { message: string }).message);
      } else {
        setSubmitError(
          "An error occurred while creating the academic calendar. Please try again."
        );
      }
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

  // Helper function to get minimum date for End Date (must be after Start Date)
  const getMinEndDate = () => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setDate(startDate.getDate() + 1); // Add 1 day to start date
      return startDate.toISOString().split('T')[0];
    }
    return '';
  };

  // Helper function to get date constraints for semesters and holidays
  const getAcademicYearDateConstraints = () => {
    return {
      minDate: formData.startDate || '',
      maxDate: formData.endDate || ''
    };
  };

  // Helper function to get minimum start date for semester based on previous semesters
  const getMinSemesterStartDate = (semesterIndex: number) => {
    const constraints = getAcademicYearDateConstraints();

    // If this is the first semester, use academic year start date
    if (semesterIndex === 0) {
      return constraints.minDate;
    }

    // Find the latest end date from previous semesters
    let latestEndDate = constraints.minDate;
    for (let i = 0; i < semesterIndex; i++) {
      if (semesters[i]?.endDate) {
        const endDate = new Date(semesters[i].endDate);
        const latestDate = new Date(latestEndDate);
        if (endDate > latestDate) {
          latestEndDate = semesters[i].endDate;
        }
      }
    }

    // Return the day after the latest end date
    if (latestEndDate) {
      const nextDay = new Date(latestEndDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }

    return constraints.minDate;
  };

  // Helper function to get maximum end date for semester
  const getMaxSemesterEndDate = (semesterIndex: number) => {
    const constraints = getAcademicYearDateConstraints();

    // If this is the last semester, use academic year end date
    if (semesterIndex === semesters.length - 1) {
      return constraints.maxDate;
    }

    // Find the earliest start date from next semesters
    let earliestStartDate = constraints.maxDate;
    for (let i = semesterIndex + 1; i < semesters.length; i++) {
      if (semesters[i]?.startDate) {
        const startDate = new Date(semesters[i].startDate);
        const earliestDate = new Date(earliestStartDate);
        if (startDate < earliestDate) {
          earliestStartDate = semesters[i].startDate;
        }
      }
    }

    // Return the day before the earliest start date
    if (earliestStartDate) {
      const prevDay = new Date(earliestStartDate);
      prevDay.setDate(prevDay.getDate() - 1);
      return prevDay.toISOString().split('T')[0];
    }

    return constraints.maxDate;
  };

  // Semester management
  const addSemester = () => {
    const newSemester: AcademicSemester = {
      name: "",
      code: "",
      startDate: "",
      endDate: "",
      isActive: true,
    };
    setSemesters((prev) => [...prev, newSemester]);
  };

  const updateSemester = (
    index: number,
    field: keyof AcademicSemester,
    value: string | boolean
  ) => {
    setSemesters((prev) => {
      const updatedSemesters = prev.map((semester, i) =>
        i === index ? { ...semester, [field]: value } : semester
      );

      // If updating start date, ensure end date is still valid
      if (field === 'startDate' && typeof value === 'string') {
        const currentSemester = updatedSemesters[index];
        if (currentSemester.endDate && value >= currentSemester.endDate) {
          // Clear end date if it becomes invalid
          updatedSemesters[index] = { ...currentSemester, endDate: '' };
        }
      }

      return updatedSemesters;
    });
  };

  const removeSemester = (index: number) => {
    setSemesters((prev) => prev.filter((_, i) => i !== index));
  };

  // Holiday management
  const addHoliday = () => {
    const newHoliday: SchoolHoliday = {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      isRecurring: false,
    };
    setHolidays((prev) => [...prev, newHoliday]);
  };

  const updateHoliday = (
    index: number,
    field: keyof SchoolHoliday,
    value: string | boolean
  ) => {
    setHolidays((prev) => {
      const updatedHolidays = prev.map((holiday, i) =>
        i === index ? { ...holiday, [field]: value } : holiday
      );

      // If updating start date, ensure end date is still valid
      if (field === 'startDate' && typeof value === 'string') {
        const currentHoliday = updatedHolidays[index];
        if (currentHoliday.endDate && value > currentHoliday.endDate) {
          // Clear end date if it becomes invalid
          updatedHolidays[index] = { ...currentHoliday, endDate: '' };
        }
      }

      return updatedHolidays;
    });
  };

  const removeHoliday = (index: number) => {
    setHolidays((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#463B3B] flex items-center">
              <FaGraduationCap className="w-6 h-6 mr-3 text-blue-600" />
              Create Academic Calendar
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaGraduationCap className="inline w-4 h-4 mr-2" />
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) =>
                    handleInputChange("academicYear", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.academicYear
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                    }`}
                  placeholder="e.g., 2024-2025"
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.academicYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Calendar Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  placeholder="e.g., EduBus Academic Calendar 2024-2025"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  min={getMinStartDate()}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.startDate
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                    }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline w-4 h-4 mr-2" />
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  min={getMinEndDate()}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${errors.endDate
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                    }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Active Calendar
              </label>
            </div>

            {/* Semesters Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Semesters
                </h4>
                <button
                  type="button"
                  onClick={addSemester}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Semester
                </button>
              </div>

              <div className="space-y-4">
                {semesters.map((semester, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800">
                        Semester {index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeSemester(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={semester.name}
                          onChange={(e) =>
                            updateSemester(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Semester 1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          value={semester.code}
                          onChange={(e) =>
                            updateSemester(index, "code", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., S1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={semester.startDate}
                          onChange={(e) =>
                            updateSemester(index, "startDate", e.target.value)
                          }
                          min={getMinSemesterStartDate(index)}
                          max={getAcademicYearDateConstraints().maxDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {getMinSemesterStartDate(index) && (
                          <p className="mt-1 text-xs text-gray-500">
                            Must be after {index > 0 ? 'previous semester' : 'academic year start'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={semester.endDate}
                          onChange={(e) =>
                            updateSemester(index, "endDate", e.target.value)
                          }
                          min={semester.startDate ? (() => {
                            const startDate = new Date(semester.startDate);
                            startDate.setDate(startDate.getDate() + 1);
                            return startDate.toISOString().split('T')[0];
                          })() : getMinSemesterStartDate(index)}
                          max={getMaxSemesterEndDate(index)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {semester.startDate && (
                          <p className="mt-1 text-xs text-gray-500">
                            Must be after start date
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                        id={`semester-active-${index}`}
                        checked={semester.isActive}
                        onChange={(e) =>
                          updateSemester(index, "isActive", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`semester-active-${index}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        Active Semester
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Holidays Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  Holidays
                </h4>
                <button
                  type="button"
                  onClick={addHoliday}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Holiday
                </button>
              </div>

              <div className="space-y-4">
                {holidays.map((holiday, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800">
                        Holiday {index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeHoliday(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={holiday.name}
                          onChange={(e) =>
                            updateHoliday(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Tet Holiday"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={holiday.startDate}
                          onChange={(e) =>
                            updateHoliday(index, "startDate", e.target.value)
                          }
                          min={getAcademicYearDateConstraints().minDate}
                          max={getAcademicYearDateConstraints().maxDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {getAcademicYearDateConstraints().minDate && (
                          <p className="mt-1 text-xs text-gray-500">
                            Must be within academic year period
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={holiday.endDate}
                          onChange={(e) =>
                            updateHoliday(index, "endDate", e.target.value)
                          }
                          min={holiday.startDate ? (() => {
                            const startDate = new Date(holiday.startDate);
                            return startDate.toISOString().split('T')[0];
                          })() : getAcademicYearDateConstraints().minDate}
                          max={getAcademicYearDateConstraints().maxDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {holiday.startDate && (
                          <p className="mt-1 text-xs text-gray-500">
                            Must be on or after start date
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={holiday.description}
                          onChange={(e) =>
                            updateHoliday(index, "description", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Lunar New Year"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                        id={`holiday-recurring-${index}`}
                        checked={holiday.isRecurring}
                        onChange={(e) =>
                          updateHoliday(index, "isRecurring", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`holiday-recurring-${index}`}
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        Recurring Holiday
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
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
                    Create Calendar
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
