"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import { AcademicCalendar, AcademicCalendarQueryParams } from "@/types";

interface AcademicCalendarListProps {
  searchTerm: string;
  filterActive: boolean | null;
  refreshTrigger?: number;
}

export default function AcademicCalendarList({
  searchTerm,
  filterActive,
  refreshTrigger,
}: AcademicCalendarListProps) {
  const [academicCalendars, setAcademicCalendars] = useState<
    AcademicCalendar[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] =
    useState<AcademicCalendar | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to handle error responses
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        code?: string;
      };

      if (axiosError.response?.status === 404) {
        return "Academic calendar not found or backend server is not running. Please check:\n1. Backend server is running on port 7061\n2. You are logged in with admin account\n3. Academic calendar ID is correct";
      } else if (axiosError.response?.status === 401) {
        return "Authentication required. Please login again.";
      } else if (axiosError.response?.status === 403) {
        return "You don't have permission to perform this action. Admin role required.";
      } else if (axiosError.response?.status === 400) {
        return `Bad request: ${axiosError.response?.data?.message || "Invalid data format"}`;
      } else if (axiosError.response?.status === 500) {
        return `Server error: ${axiosError.response?.data?.message || "Internal server error"}`;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        return "Cannot connect to backend server. Please ensure the backend is running on http://localhost:7061";
      } else if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }

    if (error && typeof error === "object" && "message" in error) {
      return (error as { message: string }).message;
    }

    return defaultMessage;
  };

  // Load academic calendars from API
  const loadAcademicCalendars = useCallback(async () => {
    try {
      setLoading(true);
      const params: AcademicCalendarQueryParams = {
        activeOnly: filterActive === null ? undefined : filterActive,
        page: 1,
        perPage: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const calendarsData =
        await academicCalendarService.getAcademicCalendars(params);
      setAcademicCalendars(calendarsData);
    } catch (error: unknown) {
      console.error("Error loading academic calendars:", error);

      // Debug information
      console.log(
        "API Base URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:7061/api"
      );

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number };
          code?: string;
        };
        console.log("Error status:", axiosError.response?.status);
        console.log("Error code:", axiosError.code);

        // Show user-friendly error message
        if (
          axiosError.response?.status === 404 ||
          axiosError.code === "ECONNREFUSED"
        ) {
          console.log(
            "Backend server might not be running or API endpoint not found"
          );
        }
      }

      // Fallback to empty array on error
      setAcademicCalendars([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive]);

  useEffect(() => {
    loadAcademicCalendars();
  }, [refreshTrigger, filterActive, loadAcademicCalendars]);

  const filteredCalendars = academicCalendars.filter((calendar) => {
    const matchesSearch =
      calendar.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calendar.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || calendar.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this academic calendar? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await academicCalendarService.deleteAcademicCalendar(calendarId);
      // Refresh the list after deletion
      loadAcademicCalendars();
    } catch (error: unknown) {
      console.error("Error deleting academic calendar:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to delete academic calendar. Please try again."
      );

      alert(errorMessage);
    }
  };

  const handleViewDetails = (calendar: AcademicCalendar) => {
    setSelectedCalendar(calendar);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading academic calendars...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {filteredCalendars.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Academic Calendars Found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterActive !== null
              ? "No academic calendars match your current filters."
              : "Get started by creating your first academic calendar."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalendars.map((calendar) => (
            <div
              key={calendar.id}
              className="bg-gradient-to-r from-white to-yellow-50 border border-gray-100 rounded-2xl p-6 hover:shadow-soft-lg transition-all duration-300 hover:border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {calendar.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Academic Year: {calendar.academicYear}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        calendar.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calendar.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="text-sm font-medium">
                          {formatDate(calendar.startDate)} -{" "}
                          {formatDate(calendar.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaExclamationTriangle className="w-4 h-4 mr-2 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Semesters</p>
                        <p className="text-sm font-medium">
                          {calendar.semesters.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaClock className="w-4 h-4 mr-2 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Holidays</p>
                        <p className="text-sm font-medium">
                          {calendar.holidays.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {formatDate(calendar.createdAt)}
                    {calendar.updatedAt && (
                      <span className="ml-4">
                        Updated: {formatDate(calendar.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(calendar)}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    title="View Details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCalendar(calendar.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    title="Delete Calendar"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Academic Calendar Details Modal */}
      {showDetails && selectedCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaGraduationCap className="w-6 h-6 mr-3 text-blue-600" />
                  {selectedCalendar.name}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Academic Year:</span>{" "}
                      {selectedCalendar.academicYear}
                    </div>
                    <div>
                      <span className="font-medium">Start Date:</span>{" "}
                      {formatDate(selectedCalendar.startDate)}
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>{" "}
                      {formatDate(selectedCalendar.endDate)}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedCalendar.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedCalendar.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-cyan-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Statistics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Semesters:</span>{" "}
                      {selectedCalendar.semesters.length}
                    </div>
                    <div>
                      <span className="font-medium">Holidays:</span>{" "}
                      {selectedCalendar.holidays.length}
                    </div>
                    <div>
                      <span className="font-medium">School Days:</span>{" "}
                      {selectedCalendar.schoolDays.length}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(selectedCalendar.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Semesters */}
              {selectedCalendar.semesters.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Semesters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCalendar.semesters.map((semester, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="font-medium text-gray-800">
                          {semester.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {semester.code}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(semester.startDate)} -{" "}
                          {formatDate(semester.endDate)}
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            semester.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {semester.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Holidays */}
              {selectedCalendar.holidays.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Holidays</h4>
                  <div className="space-y-2">
                    {selectedCalendar.holidays.map((holiday, index) => (
                      <div key={index} className="bg-red-50 rounded-lg p-4">
                        <div className="font-medium text-gray-800">
                          {holiday.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(holiday.startDate)} -{" "}
                          {formatDate(holiday.endDate)}
                        </div>
                        {holiday.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {holiday.description}
                          </div>
                        )}
                        {holiday.isRecurring && (
                          <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                            Recurring
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
