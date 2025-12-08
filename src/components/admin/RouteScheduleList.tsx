"use client";
import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaRoute,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { scheduleService, RouteSchedule } from "@/services/api/scheduleService";
import { formatDate } from "@/utils/dateUtils";

interface RouteScheduleListProps {
  searchTerm: string;
  filterActive: boolean | null;
  refreshTrigger?: number;
}

export default function RouteScheduleList({
  searchTerm,
  filterActive,
  refreshTrigger,
}: RouteScheduleListProps) {
  const [routeSchedules, setRouteSchedules] = useState<RouteSchedule[]>([]);
  const [loading, setLoading] = useState(true);

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
        return "Route schedule not found or backend server is not running.";
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
  const [selectedRouteSchedule, setSelectedRouteSchedule] =
    useState<RouteSchedule | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load route schedules from API
  const loadRouteSchedules = async () => {
    try {
      setLoading(true);
      const routeSchedulesData = await scheduleService.getRouteSchedules();
      setRouteSchedules(routeSchedulesData);
    } catch (error) {
      console.error("Error loading route schedules:", error);
      // Fallback to empty array on error
      setRouteSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteSchedules();
  }, [refreshTrigger]);

  const filteredRouteSchedules = routeSchedules.filter((routeSchedule) => {
    const matchesSearch =
      routeSchedule.routeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      routeSchedule.scheduleName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      routeSchedule.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || routeSchedule.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  // Using centralized formatDate from @/utils/dateUtils

  const handleDeleteRouteSchedule = async (routeScheduleId: string) => {
    if (!confirm("Are you sure you want to delete this route schedule?")) {
      return;
    }

    try {
      await scheduleService.deleteRouteSchedule(routeScheduleId);
      // Refresh the list after deletion
      loadRouteSchedules();
    } catch (error: unknown) {
      console.error("Error deleting route schedule:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to delete route schedule. Please try again."
      );

      alert(errorMessage);
    }
  };

  const handleEditRouteSchedule = (routeSchedule: RouteSchedule) => {
    setSelectedRouteSchedule(routeSchedule);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading route schedules...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Route Schedules</h2>
        <div className="text-sm text-gray-600">
          {filteredRouteSchedules.length} of {routeSchedules.length} route
          schedules
        </div>
      </div>

      {filteredRouteSchedules.length === 0 ? (
        <div className="text-center py-12">
          <FaRoute className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No route schedules found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterActive !== null
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first route schedule"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRouteSchedules.map((routeSchedule) => (
            <div
              key={routeSchedule.id}
              className="bg-gradient-to-r from-white to-yellow-50 border border-gray-100 rounded-2xl p-6 hover:shadow-soft-lg transition-all duration-300 hover:border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {routeSchedule.routeName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${routeSchedule.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {routeSchedule.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <FaClock className="w-4 h-4 text-[#fad23c]" />
                    <span className="text-gray-700 font-medium">
                      {routeSchedule.scheduleName}
                    </span>
                  </div>

                  {routeSchedule.notes && (
                    <p className="text-gray-600 mb-4">{routeSchedule.notes}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="w-4 h-4 text-[#fad23c]" />
                      <span className="text-sm">
                        {formatDate(routeSchedule.effectiveFrom)} -{" "}
                        {formatDate(routeSchedule.effectiveTo)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {formatDate(routeSchedule.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRouteSchedule(routeSchedule);
                      setShowDetails(true);
                    }}
                    className="p-2 text-[#463B3B] hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditRouteSchedule(routeSchedule)}
                    className="p-2 text-[#fad23c] hover:bg-yellow-100 rounded-lg transition-colors duration-200"
                    title="Edit Route Schedule"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRouteSchedule(routeSchedule.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Delete Route Schedule"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Route Schedule Details Modal */}
      {showDetails && selectedRouteSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Route Schedule Details
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
                    {selectedRouteSchedule.routeName}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      {selectedRouteSchedule.scheduleName}
                    </span>
                  </div>
                  {selectedRouteSchedule.notes && (
                    <p className="text-gray-600">
                      {selectedRouteSchedule.notes}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route ID
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {selectedRouteSchedule.routeId}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule ID
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {selectedRouteSchedule.scheduleId}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Effective Period
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedRouteSchedule.effectiveFrom)} -{" "}
                        {formatDate(selectedRouteSchedule.effectiveTo)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedRouteSchedule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {selectedRouteSchedule.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
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
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Edit Route Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
