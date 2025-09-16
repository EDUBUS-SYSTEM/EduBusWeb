"use client";
import { useState, useEffect } from "react";
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
  const [showTimeOverrides, setShowTimeOverrides] = useState(false);
  const [timeOverrides, setTimeOverrides] = useState<ScheduleTimeOverride[]>(
    []
  );
  const [showTimeOverrideModal, setShowTimeOverrideModal] = useState(false);
  const [editingOverride, setEditingOverride] =
    useState<ScheduleTimeOverride | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState(false);

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

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.scheduleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.academicYear.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || schedule.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return;
    }

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

    try {
      const updateScheduleDto = {
        id: selectedSchedule.id, // Backend will convert string to Guid
        name: selectedSchedule.name,
        scheduleType: selectedSchedule.scheduleType,
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
        rRule: selectedSchedule.rRule, // Use actual RRule from schedule
        timezone: selectedSchedule.timezone || "UTC",
        academicYear: selectedSchedule.academicYear, // Include academic year
        effectiveFrom: new Date(selectedSchedule.effectiveFrom).toISOString(),
        effectiveTo: selectedSchedule.effectiveTo
          ? new Date(selectedSchedule.effectiveTo).toISOString()
          : undefined,
        exceptions: selectedSchedule.exceptions, // Keep as Date[]
        isActive: selectedSchedule.isActive,
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
      console.error("Error response:", error); // Debug log

      const errorMessage = getErrorMessage(
        error,
        "Failed to update schedule. Please try again."
      );

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
          {filteredSchedules.map((schedule) => (
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        schedule.isActive
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
                        {formatTime(schedule.startTime)} -{" "}
                        {formatTime(schedule.endTime)}
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

                <div className="flex items-center gap-2 ml-4">
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
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete Schedule"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedSchedule.name}
                  </h4>
                  <p className="text-gray-600">
                    Academic Year: {selectedSchedule.academicYear}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Type
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScheduleTypeColor(selectedSchedule.scheduleType)}`}
                      >
                        {selectedSchedule.scheduleType}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Range
                      </label>
                      <p className="text-gray-900">
                        {formatTime(selectedSchedule.startTime)} -{" "}
                        {formatTime(selectedSchedule.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Year
                      </label>
                      <p className="text-gray-900">
                        {selectedSchedule.academicYear}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RRule Pattern
                      </label>
                      <p className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedSchedule.rRule}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Effective Period
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedSchedule.effectiveFrom)} -{" "}
                        {selectedSchedule.effectiveTo
                          ? formatDate(selectedSchedule.effectiveTo)
                          : "No end date"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedSchedule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedSchedule.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
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
                        {selectedSchedule.exceptions
                          .slice(0, 3)
                          .map((exception: Date, index: number) => (
                            <p key={index} className="text-sm text-gray-700">
                              {new Date(exception).toLocaleDateString()}
                            </p>
                          ))}
                        {selectedSchedule.exceptions.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{selectedSchedule.exceptions.length - 3} more...
                          </p>
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
                                {new Date(override.date).toLocaleDateString()}:{" "}
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
                          ? new Date(selectedSchedule.effectiveFrom)
                              .toISOString()
                              .split("T")[0]
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
                          ? new Date(selectedSchedule.effectiveTo)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          effectiveTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    />
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
                                {new Date(override.date).toLocaleDateString()}
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
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  override.isCancelled
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
                            onClick={() => {
                              // TODO: Implement delete time override functionality
                              alert(
                                "Delete Time Override functionality will be implemented"
                              );
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
        />
      )}

      {/* Exception Modal */}
      {showExceptionModal && selectedSchedule && (
        <ExceptionModal
          isOpen={showExceptionModal}
          onClose={() => setShowExceptionModal(false)}
          scheduleId={selectedSchedule.id}
          scheduleName={selectedSchedule.name}
          onSuccess={handleExceptionSuccess}
          exceptions={selectedSchedule.exceptions}
        />
      )}
    </div>
  );
}
