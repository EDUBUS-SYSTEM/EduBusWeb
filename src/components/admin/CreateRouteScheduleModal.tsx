"use client";
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaRoute,
  FaClock,
  FaCalendarAlt,
  FaSave,
} from "react-icons/fa";
import {
  scheduleService,
  CreateRouteScheduleDto,
  Route,
} from "@/services/api/scheduleService";
import { Schedule } from "@/types";

interface CreateRouteScheduleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRouteScheduleModal({
  onClose,
  onSuccess,
}: CreateRouteScheduleModalProps) {
  const [formData, setFormData] = useState({
    routeId: "",
    scheduleId: "",
    effectiveFrom: "",
    effectiveTo: "",
    notes: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Load routes and schedules from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [routesData, schedulesData] = await Promise.all([
          scheduleService.getRoutes(),
          scheduleService.getSchedulesForDropdown(),
        ]);
        setRoutes(routesData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error("Error loading routes and schedules:", error);
        // Fallback to empty arrays on error
        setRoutes([]);
        setSchedules([]);
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.routeId) {
      newErrors.routeId = "Route is required";
    }

    if (!formData.scheduleId) {
      newErrors.scheduleId = "Schedule is required";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const createRouteScheduleDto: CreateRouteScheduleDto = {
        routeId: formData.routeId,
        scheduleId: formData.scheduleId,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || undefined,
        priority: 0,
        isActive: formData.isActive,
      };

      await scheduleService.createRouteSchedule(createRouteScheduleDto);
      onSuccess();
    } catch (error) {
      console.error("Error creating route schedule:", error);
      // You might want to show an error message to the user here
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

  const selectedRoute = routes.find((route) => route.id === formData.routeId);
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === formData.scheduleId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              Create New Route Schedule
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
            {/* Route Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaRoute className="inline w-4 h-4 mr-2" />
                Route *
              </label>
              <select
                value={formData.routeId}
                onChange={(e) => handleInputChange("routeId", e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                  errors.routeId
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName}
                  </option>
                ))}
              </select>
              {errors.routeId && (
                <p className="mt-1 text-sm text-red-600">{errors.routeId}</p>
              )}
            </div>

            {/* Schedule Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline w-4 h-4 mr-2" />
                Schedule *
              </label>
              <select
                value={formData.scheduleId}
                onChange={(e) =>
                  handleInputChange("scheduleId", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
                  errors.scheduleId
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select a schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} ({schedule.scheduleType})
                  </option>
                ))}
              </select>
              {errors.scheduleId && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduleId}</p>
              )}
            </div>

            {/* Preview */}
            {(selectedRoute || selectedSchedule) && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Assignment Preview
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedRoute && (
                    <div className="flex items-center gap-2">
                      <FaRoute className="w-4 h-4 text-[#fad23c]" />
                      <span className="text-gray-700">
                        <strong>Route:</strong> {selectedRoute.routeName}
                      </span>
                    </div>
                  )}
                  {selectedSchedule && (
                    <div className="flex items-center gap-2">
                      <FaClock className="w-4 h-4 text-[#fad23c]" />
                      <span className="text-gray-700">
                        <strong>Schedule:</strong> {selectedSchedule.name} (
                        {selectedSchedule.scheduleType})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
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
                  onChange={(e) =>
                    handleInputChange("effectiveTo", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 ${
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Enter additional notes (optional)"
              />
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
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-[#fad23c] focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Active Route Schedule
              </label>
            </div>

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
                    Create Route Schedule
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
