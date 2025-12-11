"use client";
import { useState, useEffect, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaTag,
  FaPlus,
  FaCalendarPlus,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { scheduleService } from "@/services/api/scheduleService";
import { Schedule, ScheduleTimeOverride } from "@/types";
import TimeOverrideModal from "./TimeOverrideModal";
import ExceptionModal from "./ExceptionModal";
import Pagination from "../ui/Pagination";
import { formatDate, formatDateForInput, formatTime } from "@/utils/dateUtils";

interface ScheduleListProps {
  searchTerm: string;
  filterActive: boolean | null;
  refreshTrigger?: number;
}

export default function ScheduleList({
  searchTerm,
  filterActive,
  refreshTrigger,
}: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [showTimeOverrides, setShowTimeOverrides] = useState(false);
  const [timeOverrides, setTimeOverrides] = useState<ScheduleTimeOverride[]>(
    []
  );
  const [showTimeOverrideModal, setShowTimeOverrideModal] = useState(false);
  const [editingOverride, setEditingOverride] =
    useState<ScheduleTimeOverride | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(
    null
  );
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Reduced to 5 for pagination testing

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
        return "Schedule not found or backend server is not running. Please check:\n1. Backend server is running on port 7061\n2. You are logged in with admin account\n3. Schedule ID is correct";
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

  // Load schedules from API
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedulesData = await scheduleService.getSchedules();
      setSchedules(schedulesData);
    } catch (error: unknown) {
      console.error("Error loading schedules:", error);

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
            "Backend server is not running. Please start the backend server."
          );
          // You could show a toast notification here
        }
      }

      if (error && typeof error === "object" && "message" in error) {
        console.log("Error message:", (error as { message: string }).message);
      }

      // Fallback to empty array on error
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [refreshTrigger]);

  // Reset to first page when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterActive]);

  // When opening details, fetch time overrides to enrich selectedSchedule
  useEffect(() => {
    const loadOverridesForDetails = async () => {
      if (!showDetails || !selectedSchedule) return;
      try {
        const overrides = await scheduleService.getTimeOverrides(
          selectedSchedule.id
        );
        setSelectedSchedule((prev) =>
          prev ? { ...prev, timeOverrides: overrides } : prev
        );
      } catch (err) {
        // Silently ignore; details can still render without overrides
        console.error("Error loading overrides for details:", err);
      }
    };
    loadOverridesForDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetails, selectedSchedule?.id]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const q = (searchTerm || "").toString().toLowerCase();
      const name = (schedule?.name || "").toString().toLowerCase();
      const type = (schedule?.scheduleType || "").toString().toLowerCase();
      const year = (schedule?.academicYear || "").toString().toLowerCase();

      const matchesSearch =
        !q || name.includes(q) || type.includes(q) || year.includes(q);

      const matchesFilter =
        filterActive === null || schedule.isActive === filterActive;

      return matchesSearch && matchesFilter;
    });
  }, [schedules, searchTerm, filterActive]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getScheduleTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "daily":
        return "bg-green-100 text-green-800";
      case "weekday":
        return "bg-blue-100 text-blue-800";
      case "weekend":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Using centralized formatDate, formatDateForInput, and formatTime from @/utils/dateUtils
  // Helper to format time string (HH:mm) to display format
  const formatTimeString = (time: string) => {
    if (!time) return 'N/A';
    // If time is already in HH:mm format, convert to Date object
    if (/^\d{2}:\d{2}$/.test(time)) {
      return formatTime(`2000-01-01T${time}`);
    }
    // Otherwise use formatTime directly
    return formatTime(time);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

    setDeletingScheduleId(scheduleId);
    try {
      await scheduleService.deleteSchedule(scheduleId);
      // Refresh the list after deletion
      loadSchedules();
    } catch (error: unknown) {
      console.error("Error deleting schedule:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to delete schedule. Please try again."
      );

      alert(errorMessage);
    } finally {
      setDeletingScheduleId(null);
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowEditForm(true);
  };

  const handleViewTimeOverrides = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    try {
      const overrides = await scheduleService.getTimeOverrides(schedule.id);
      setTimeOverrides(overrides);
      setShowTimeOverrides(true);
    } catch (error) {
      console.error("Error loading time overrides:", error);
      setTimeOverrides([]);
      setShowTimeOverrides(true);
    }
  };

  const handleAddTimeOverride = () => {
    setEditingOverride(null);
    setShowTimeOverrideModal(true);
  };

  const handleEditTimeOverride = (override: ScheduleTimeOverride) => {
    setEditingOverride(override);
    setShowTimeOverrideModal(true);
  };

  const handleTimeOverrideSuccess = async () => {
    if (selectedSchedule) {
      try {
        const overrides = await scheduleService.getTimeOverrides(
          selectedSchedule.id
        );
        setTimeOverrides(overrides);
        // Also update the details view if it's open
        setSelectedSchedule((prev) =>
          prev ? { ...prev, timeOverrides: overrides } : prev
        );
      } catch (error) {
        console.error("Error refreshing time overrides:", error);
      }
    }
  };

  const handleViewExceptions = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowExceptionModal(true);
  };

  const handleExceptionSuccess = async () => {
    if (selectedSchedule) {
      try {
        const updatedSchedule = await scheduleService.getScheduleById(
          selectedSchedule.id
        );
        setSelectedSchedule(updatedSchedule);
        // Refresh the schedules list
        loadSchedules();
      } catch (error) {
        console.error("Error refreshing schedule:", error);
      }
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;

    // Simple validation
    const errors: Record<string, string> = {};

    if (!selectedSchedule.name.trim()) {
      errors.name = "Schedule name is required";
    }

    const startTime = selectedSchedule.startTime;
    const endTime = selectedSchedule.endTime;
    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = "End time must be after start time";
    }

    const effFrom = selectedSchedule.effectiveFrom
      ? new Date(selectedSchedule.effectiveFrom)
      : null;
    const effTo = selectedSchedule.effectiveTo
      ? new Date(selectedSchedule.effectiveTo)
      : null;
    if (effFrom && effTo && effTo <= effFrom) {
      errors.effectiveTo =
        "Effective to date must be after effective from date";
    }

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Show custom confirmation modal instead of browser confirm
    setShowUpdateConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedSchedule) return;

    setShowUpdateConfirmation(false);

    try {
      const updateScheduleDto = {
        id: selectedSchedule.id || "", // Backend will convert string to Guid
        name: selectedSchedule.name.trim(), // Simple trim instead of sanitization
        scheduleType: selectedSchedule.scheduleType || "",
        tripType: selectedSchedule.tripType ?? 0, // TripType enum number
        startTime: selectedSchedule.startTime || "",
        endTime: selectedSchedule.endTime || "",
        rRule: selectedSchedule.rRule || "", // Use actual RRule from schedule
        timezone: selectedSchedule.timezone || "UTC",
        academicYear: selectedSchedule.academicYear || "", // Include academic year
        effectiveFrom: selectedSchedule.effectiveFrom
          ? new Date(selectedSchedule.effectiveFrom).toISOString()
          : new Date().toISOString(),
        effectiveTo: selectedSchedule.effectiveTo
          ? new Date(selectedSchedule.effectiveTo).toISOString()
          : undefined,
        exceptions: selectedSchedule.exceptions
          ? selectedSchedule.exceptions.map((ex: Date | string) =>
            typeof ex === 'string' ? ex : new Date(ex).toISOString()
          )
          : [], // Convert Date[] to ISO string[]
        isActive:
          selectedSchedule.isActive !== undefined
            ? selectedSchedule.isActive
            : true,
        timeOverrides: selectedSchedule.timeOverrides
          ? selectedSchedule.timeOverrides
          : [], // Preserve overrides
        updatedAt: selectedSchedule.updatedAt, // Send current timestamp for optimistic locking
      };

      console.log("Sending update request:", updateScheduleDto); // Debug log

      await scheduleService.updateSchedule(
        selectedSchedule.id,
        updateScheduleDto
      );
      setShowEditForm(false);
      // Refresh the list after update
      loadSchedules();
    } catch (error: unknown) {
      console.error("Error updating schedule:", error);

      // Simple error handling with concurrent update detection
      let errorMessage = "Failed to update schedule. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string };
          };
        };

        // Handle concurrent update conflicts (409 Conflict)
        if (axiosError.response?.status === 409) {
          errorMessage =
            "This schedule was modified by another user. Please refresh and try again.";
          // Refresh the schedule list to get latest data
          await loadSchedules();
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Schedules</h2>
        <div className="text-sm text-gray-600">
          {filteredSchedules.length} of {schedules.length} schedules
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <FaClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No schedules found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterActive !== null
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first schedule"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-gradient-to-r from-white to-yellow-50 border border-gray-100 rounded-2xl p-6 hover:shadow-soft-lg transition-all duration-300 hover:border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {schedule.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getScheduleTypeColor(schedule.scheduleType)}`}
                    >
                      <FaTag className="inline w-3 h-3 mr-1" />
                      {schedule.scheduleType}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {schedule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Description field removed as it's not in the Schedule type */}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock className="w-4 h-4 text-[#fad23c]" />
                      <span className="text-sm">
                        {formatTimeString(schedule.startTime)} -{" "}
                        {formatTimeString(schedule.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="w-4 h-4 text-[#fad23c]" />
                      <span className="text-sm">
                        {formatDate(schedule.effectiveFrom)} -{" "}
                        {schedule.effectiveTo
                          ? formatDate(schedule.effectiveTo)
                          : "No end date"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {formatDate(schedule.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 self-center">
                  <button
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowDetails(true);
                    }}
                    className="p-2 text-[#463B3B] hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewTimeOverrides(schedule)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="Time Overrides"
                  >
                    <FaCalendarPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewExceptions(schedule)}
                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors duration-200"
                    title="Manage Exceptions"
                  >
                    <FaExclamationTriangle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="p-2 text-[#fad23c] hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                    title="Edit Schedule"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    disabled={deletingScheduleId === schedule.id}
                    className={`p-2 rounded-lg transition-colors duration-200 ${deletingScheduleId === schedule.id
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-100"
                      }`}
                    title={
                      deletingScheduleId === schedule.id
                        ? "Deleting..."
                        : "Delete Schedule"
                    }
                  >
                    {deletingScheduleId === schedule.id ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - Always show */}
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2 text-center">
          Showing {startIndex + 1}-
          {Math.min(endIndex, filteredSchedules.length)} of{" "}
          {filteredSchedules.length} schedules
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Schedule Details Modal */}
      {showDetails && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Schedule Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Header card */}
                <div className="rounded-2xl bg-gradient-to-r from-white to-yellow-50 border border-yellow-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedSchedule.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Academic Year:{" "}
                        <span className="font-medium">
                          {selectedSchedule.academicYear}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${selectedSchedule.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${selectedSchedule.isActive ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      {selectedSchedule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Schedule Type
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getScheduleTypeColor(selectedSchedule.scheduleType)}`}
                    >
                      {selectedSchedule.scheduleType}
                    </span>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Time Range
                    </p>
                    <p className="text-gray-900">
                      {formatTimeString(selectedSchedule.startTime)}
                      <span className="mx-1 text-gray-400">—</span>
                      {formatTimeString(selectedSchedule.endTime)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Effective Period
                    </p>
                    <p className="text-gray-900">
                      {formatDate(selectedSchedule.effectiveFrom)}
                      <span className="mx-1 text-gray-400">→</span>
                      {selectedSchedule.effectiveTo ? (
                        <>{formatDate(selectedSchedule.effectiveTo)}</>
                      ) : (
                        <span className="italic text-gray-500">
                          No end date
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* RRule box */}
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    Recurrence Rule (RRULE)
                  </p>
                  <div className="text-sm font-mono text-gray-800 bg-yellow-100 px-3 py-2 rounded w-full max-w-full whitespace-pre-wrap break-words overflow-x-auto">
                    {selectedSchedule.rRule}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <FaCalendarAlt className="w-3 h-3" /> Exceptions:{" "}
                    {selectedSchedule.exceptions.length}
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FaClock className="w-3 h-3" /> Overrides:{" "}
                    {selectedSchedule.timeOverrides?.length || 0}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exceptions ({selectedSchedule.exceptions.length})
                    </label>
                    {selectedSchedule.exceptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No exceptions</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedSchedule.exceptions.map(
                          (exception: Date, index: number) => (
                            <p key={index} className="text-sm text-gray-700">
                              {formatDate(exception)}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Overrides (
                      {selectedSchedule.timeOverrides?.length || 0})
                    </label>
                    {!selectedSchedule.timeOverrides ||
                      selectedSchedule.timeOverrides.length === 0 ? (
                      <p className="text-gray-500 text-sm">No time overrides</p>
                    ) : (
                      <div className="space-y-1">
                        {selectedSchedule.timeOverrides
                          .slice(0, 3)
                          .map(
                            (override: ScheduleTimeOverride, index: number) => (
                              <p key={index} className="text-sm text-gray-700">
                                {formatDate(override.date)}:{" "}
                                {override.startTime} - {override.endTime}
                              </p>
                            )
                          )}
                        {selectedSchedule.timeOverrides.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{selectedSchedule.timeOverrides.length - 3} more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Form Modal */}
      {showEditForm && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Edit Schedule
                </h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={selectedSchedule.name}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Type
                  </label>
                  <select
                    value={selectedSchedule.scheduleType}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        scheduleType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    required
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Type
                  </label>
                  <select
                    value={selectedSchedule.tripType ?? 1}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        tripType: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    required
                  >
                    <option value={1}>Departure</option>
                    <option value={2}>Return</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={selectedSchedule.startTime}
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={selectedSchedule.endTime}
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                      required
                    />
                    {editErrors.endTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {editErrors.endTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective From
                    </label>
                    <input
                      type="date"
                      value={
                        selectedSchedule.effectiveFrom
                          ? formatDateForInput(selectedSchedule.effectiveFrom)
                          : ""
                      }
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          effectiveFrom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective To
                    </label>
                    <input
                      type="date"
                      value={
                        selectedSchedule.effectiveTo
                          ? formatDateForInput(selectedSchedule.effectiveTo)
                          : ""
                      }
                      min={
                        selectedSchedule.effectiveFrom
                          ? formatDateForInput(selectedSchedule.effectiveFrom)
                          : undefined
                      }
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          effectiveTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    />
                    {editErrors.effectiveTo && (
                      <p className="mt-1 text-sm text-red-600">
                        {editErrors.effectiveTo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={selectedSchedule.isActive}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-[#fad23c] focus:ring-[#fad23c] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 shadow-soft hover:shadow-soft-lg"
                  >
                    Update Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Time Overrides Modal */}
      {showTimeOverrides && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#463B3B] flex items-center">
                  <FaCalendarPlus className="w-6 h-6 mr-3 text-blue-600" />
                  Time Overrides - {selectedSchedule.name}
                </h3>
                <button
                  onClick={() => setShowTimeOverrides(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-6">
                <button
                  onClick={handleAddTimeOverride}
                  className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] px-4 py-2 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center gap-2 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Time Override
                </button>
              </div>

              {timeOverrides.length === 0 ? (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No time overrides found for this schedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeOverrides.map((override, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-white to-yellow-50 border border-gray-100 rounded-xl p-4 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="text-sm font-medium">
                                {formatDate(override.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Start Time
                              </p>
                              <p className="text-sm font-medium">
                                {override.startTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">End Time</p>
                              <p className="text-sm font-medium">
                                {override.endTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${override.isCancelled
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                  }`}
                              >
                                {override.isCancelled ? "Cancelled" : "Active"}
                              </span>
                            </div>
                          </div>
                          {override.reason && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Reason</p>
                              <p className="text-sm text-gray-700">
                                {override.reason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditTimeOverride(override)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit Override"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!selectedSchedule) return;
                              if (!confirm("Delete this time override?"))
                                return;
                              try {
                                await scheduleService.removeTimeOverride(
                                  selectedSchedule.id,
                                  new Date(override.date).toISOString()
                                );
                                handleTimeOverrideSuccess();
                              } catch (err) {
                                console.error("Error deleting override", err);
                                alert("Failed to delete. Please try again.");
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete Override"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowTimeOverrides(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Override Modal */}
      {showTimeOverrideModal && selectedSchedule && (
        <TimeOverrideModal
          isOpen={showTimeOverrideModal}
          onClose={() => setShowTimeOverrideModal(false)}
          scheduleId={selectedSchedule.id}
          scheduleName={selectedSchedule.name}
          onSuccess={handleTimeOverrideSuccess}
          override={editingOverride}
          effectiveFrom={
            selectedSchedule.effectiveFrom
              ? new Date(selectedSchedule.effectiveFrom).toISOString()
              : ""
          }
          effectiveTo={
            selectedSchedule.effectiveTo
              ? new Date(selectedSchedule.effectiveTo).toISOString()
              : undefined
          }
          existingExceptions={selectedSchedule.exceptions}
          updatedAt={selectedSchedule.updatedAt}
        />
      )}

      {/* Exception Modal */}
      {showExceptionModal && selectedSchedule && (
        <ExceptionModal
          isOpen={showExceptionModal}
          onClose={() => setShowExceptionModal(false)}
          schedule={selectedSchedule}
          onSuccess={handleExceptionSuccess}
        />
      )}

      {/* Update Confirmation Modal */}
      {showUpdateConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Important Notice
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p className="leading-relaxed">
                      <strong className="text-gray-800">These changes will only apply to trips generated after the update time.</strong>
                    </p>
                    <p className="leading-relaxed">
                      Trips that have already been generated will retain the schedule information from before the update.
                    </p>
                    <p className="leading-relaxed">
                      If you want to update information for already generated trips, please edit the specific trip!
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUpdateConfirmation(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 shadow-soft hover:shadow-soft-lg font-medium"
                >
                  Continue Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
