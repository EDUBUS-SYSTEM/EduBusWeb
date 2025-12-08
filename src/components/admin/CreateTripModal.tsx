"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CreateTripDto, TripDto } from '@/types';
import { scheduleService } from "@/services/api/scheduleService";
import { Schedule } from "@/types";
import { routeService } from "@/services/routeService/routeService.api";
import { RouteDto } from "@/services/routeService/routeService.types";
import { routeScheduleService } from "@/services/routeScheduleService/routeSchedule.api";
import { FaTimes } from 'react-icons/fa';
import { formatDate } from "@/utils/dateUtils";

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: CreateTripDto) => void;
  initialServiceDate?: string;
  existingTrips?: TripDto[];
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onSubmit,
  initialServiceDate,
  existingTrips = [],
}: CreateTripModalProps) {
  console.log('CreateTripModal - existingTrips:', existingTrips);

  // New: Schedules state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [routeScheduleIds, setRouteScheduleIds] = useState<string[]>([]);

  // Existing: Routes state
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTripDto>({
    routeId: '',
    serviceDate: new Date().toISOString().split('T')[0],
    plannedStartAt: '',
    plannedEndAt: '',
    status: 'Scheduled',
    vehicleId: '',
    scheduleSnapshot: {
      scheduleId: '',
      name: '',
      startTime: '',
      endTime: '',
      rRule: ''
    },
    stops: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Load data on modal open ---
  useEffect(() => {
    if (isOpen) {
      loadRoutes();
      loadSchedules();

      // Set initial service date if provided (from calendar click)
      if (initialServiceDate) {
        setFormData(prev => ({
          ...prev,
          serviceDate: initialServiceDate
        }));
      }
    }
  }, [isOpen, initialServiceDate]);

  // Set vehicleId from route selection and load route schedules
  useEffect(() => {
    if (formData.routeId) {
      const selectedRoute = routes.find(r => r.id === formData.routeId);
      if (selectedRoute) {
        setFormData(prev => ({
          ...prev,
          vehicleId: selectedRoute.vehicleId
        }));

        // Load route schedules
        loadRouteSchedules(formData.routeId);
      }
    } else {
      setRouteScheduleIds([]);
    }
  }, [formData.routeId, routes]);

  const loadRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const data = await routeService.getAll();
      setRoutes(data.filter(r => r.isActive && !r.isDeleted));
    } catch {
      setErrors(e => ({ ...e, routes: "Failed to load routes" }));
    } finally {
      setLoadingRoutes(false);
    }
  };

  const loadSchedules = async () => {
    setScheduleLoading(true);
    try {
      const scList = await scheduleService.getSchedules({ activeOnly: true });
      setSchedules(scList);
    } catch {
      setErrors(e => ({ ...e, schedules: "Failed to load schedules" }));
    } finally {
      setScheduleLoading(false);
    }
  };

  const loadRouteSchedules = async (routeId: string) => {
    try {
      const routeSchedules = await routeScheduleService.getByRoute(routeId);
      const scheduleIds = routeSchedules.map(rs => rs.scheduleId);
      setRouteScheduleIds(scheduleIds);
    } catch (error) {
      console.error('Error loading route schedules:', error);
      setRouteScheduleIds([]);
    }
  };

  // Filter schedules to exclude those already used on the selected date
  const availableSchedules = useMemo(() => {
    if (!formData.serviceDate) return schedules;

    // Get schedule IDs already used on this date
    const usedScheduleIds = existingTrips
      .filter(trip => {
        // Normalize date format (YYYY-MM-DD)
        const tripDate = trip.serviceDate.split('T')[0]; // Handle ISO format
        return tripDate === formData.serviceDate;
      })
      .map(trip => trip.scheduleSnapshot?.scheduleId)
      .filter(Boolean);

    console.log('Service Date:', formData.serviceDate, 'Used Schedules:', usedScheduleIds, 'Existing Trips:', existingTrips);

    // Return schedules that are not used on this date
    return schedules.filter(s => !usedScheduleIds.includes(s.id));
  }, [schedules, formData.serviceDate, existingTrips]);

  const selectedRoute = routes.find(r => r.id === formData.routeId);

  // Filter schedules based on selected route and exclude already used schedules on this date
  const filteredSchedules = useMemo(() => {
    if (!formData.routeId || routeScheduleIds.length === 0) return [];

    // Filter schedules that are linked to this route AND not already used on this date
    return availableSchedules.filter(s => routeScheduleIds.includes(s.id));
  }, [formData.routeId, routeScheduleIds, availableSchedules]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.routeId) newErrors.routeId = 'Route is required';
    if (!formData.serviceDate) newErrors.serviceDate = 'Service date is required';
    if (!formData.plannedStartAt) newErrors.plannedStartAt = 'Planned start time is required';
    if (!formData.plannedEndAt) newErrors.plannedEndAt = 'Planned end time is required';
    if (formData.plannedStartAt && formData.plannedEndAt) {
      const start = new Date(formData.plannedStartAt);
      const end = new Date(formData.plannedEndAt);
      if (start >= end) newErrors.plannedEndAt = 'End time must be after start time';
    }
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle ID is required (set from route)';
    if (!formData.scheduleSnapshot?.scheduleId) newErrors.scheduleSnapshot = 'Schedule is required';

    // Validate service date is within schedule effective date range
    if (formData.serviceDate && formData.scheduleSnapshot?.scheduleId) {
      const selectedSchedule = schedules.find(s => s.id === formData.scheduleSnapshot?.scheduleId);
      if (selectedSchedule) {
        const serviceDate = new Date(formData.serviceDate);
        const effectiveFrom = new Date(selectedSchedule.effectiveFrom);
        const effectiveTo = selectedSchedule.effectiveTo ? new Date(selectedSchedule.effectiveTo) : null;

        if (serviceDate < effectiveFrom) {
          newErrors.serviceDate = `Service date must be on or after ${formatDate(effectiveFrom)}`;
        } else if (effectiveTo && serviceDate > effectiveTo) {
          newErrors.serviceDate = `Service date must be on or before ${formatDate(effectiveTo)}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (validate()) {
      try {
        // Check for duplicate trip before submitting
        const tripExists = await checkTripExists(
          formData.routeId,
          formData.scheduleSnapshot?.scheduleId || '',
          formData.serviceDate
        );

        if (tripExists) {
          setSubmissionError('A trip already exists for this route, schedule, and service date. Please choose a different date or schedule.');
          return;
        }

        await onSubmit(formData);
        setSubmissionError(null);
      } catch (error: unknown) {
        console.log(error);

        if (error && typeof error === 'object' && 'data' in error) {
          const errorWithData = error as { data?: { message?: string } };
          setSubmissionError(errorWithData.data?.message || 'Failed to create trip. Please try again.');
        } else if (error instanceof Error) {
          setSubmissionError(error.message);
        } else {
          setSubmissionError('Failed to create trip. Please try again.');
        }
      }
    }
  };

  const checkTripExists = async (routeId: string, scheduleId: string, serviceDate: string): Promise<boolean> => {
    try {
      // Import tripService if not already imported
      // For now, we'll do a simple check - in production, you'd call an API endpoint
      // This is a placeholder - you may need to implement this in the backend
      return false; // TODO: Implement actual duplicate check via API
    } catch (error) {
      console.error('Error checking for duplicate trip:', error);
      return false;
    }
  };

  // Auto-fill planned times when schedule is selected
  const handleScheduleChange = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule && formData.serviceDate) {
      // Parse schedule times and combine with service date
      const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
      const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);

      // Create date in local timezone (not UTC)
      const [year, month, day] = formData.serviceDate.split('-').map(Number);

      const plannedStart = new Date(year, month - 1, day, startHours, startMinutes, 0, 0);
      const plannedEnd = new Date(year, month - 1, day, endHours, endMinutes, 0, 0);

      // Format as HH:mm for time input
      const startTimeStr = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
      const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      // Format as ISO string for datetime-local compatibility (YYYY-MM-DDTHH:mm)
      const plannedStartAt = `${formData.serviceDate}T${startTimeStr}`;
      const plannedEndAt = `${formData.serviceDate}T${endTimeStr}`;

      setFormData({
        ...formData,
        plannedStartAt: plannedStartAt,
        plannedEndAt: plannedEndAt,
        scheduleSnapshot: {
          scheduleId: schedule.id,
          name: schedule.name,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          rRule: schedule.rRule
        }
      });
    } else {
      setFormData({
        ...formData,
        scheduleSnapshot: { scheduleId: '', name: '', startTime: '', endTime: '', rRule: '' }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-[#463B3B]">Create New Trip</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route <span className="text-red-500">*</span>
            </label>
            {loadingRoutes ? (
              <div className="text-sm text-gray-500">Loading routes...</div>
            ) : (
              <>
                <select
                  value={formData.routeId}
                  onChange={e => setFormData({ ...formData, routeId: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.routeId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Route</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>{route.routeName} ({route.vehicleNumberPlate})</option>
                  ))}
                </select>
                {selectedRoute && (
                  <p className="mt-1 text-sm text-gray-600">
                    Vehicle: {selectedRoute.vehicleNumberPlate} (Capacity: {selectedRoute.vehicleCapacity})
                  </p>
                )}
                {errors.routeId && (
                  <p className="mt-1 text-sm text-red-500">{errors.routeId}</p>
                )}
              </>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule <span className="text-red-500">*</span>
            </label>
            {!formData.routeId ? (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
                Please select a route first to see available schedules
              </div>
            ) : scheduleLoading ? (
              <div className="text-sm text-gray-500">Loading schedules...</div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
                No schedules available for this route
              </div>
            ) : (
              <select
                value={formData.scheduleSnapshot?.scheduleId || ""}
                onChange={e => handleScheduleChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.scheduleSnapshot ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Schedule</option>
                {filteredSchedules.map(sc =>
                  <option key={sc.id} value={sc.id}>
                    {sc.name} ({sc.startTime} - {sc.endTime})
                  </option>
                )}
              </select>
            )}
            {errors.scheduleSnapshot && (
              <p className="mt-1 text-sm text-red-500">{errors.scheduleSnapshot}</p>
            )}
          </div>

          {/* Service Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.serviceDate}
              onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.serviceDate ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.serviceDate && (
              <p className="mt-1 text-sm text-red-500">{errors.serviceDate}</p>
            )}
          </div>

          {/* Planned Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.plannedStartAt ? formData.plannedStartAt.slice(11, 16) : ''}
              onChange={(e) => {
                if (formData.serviceDate && e.target.value) {
                  const dateTime = `${formData.serviceDate}T${e.target.value}`;
                  setFormData({ ...formData, plannedStartAt: dateTime });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.plannedStartAt ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.plannedStartAt && (
              <p className="mt-1 text-sm text-red-500">{errors.plannedStartAt}</p>
            )}
          </div>

          {/* Planned End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.plannedEndAt ? formData.plannedEndAt.slice(11, 16) : ''}
              onChange={(e) => {
                if (formData.serviceDate && e.target.value) {
                  const dateTime = `${formData.serviceDate}T${e.target.value}`;
                  setFormData({ ...formData, plannedEndAt: dateTime });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.plannedEndAt ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.plannedEndAt && (
              <p className="mt-1 text-sm text-red-500">{errors.plannedEndAt}</p>
            )}
          </div>

          {submissionError && (
            <div className="mt-4 p-2 text-red-600 bg-red-100 rounded">
              {submissionError}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}