"use client";

import React, { useState, useEffect } from 'react';
import { UpdateTripDto, TripDto } from '@/types';
import { scheduleService } from "@/services/api/scheduleService";
import { Schedule } from "@/types";
import { routeService } from "@/services/routeService/routeService.api";
import { RouteDto } from "@/services/routeService/routeService.types";
import { FaTimes } from 'react-icons/fa';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: UpdateTripDto) => void;
  trip: TripDto | null;
}

// Extract YYYY-MM-DD from an ISO string without timezone conversion
function extractDate(iso?: string): string {
  if (!iso) return "";
  return iso.split("T")[0] || "";
}

// Extract HH:mm from an ISO string without timezone conversion
function extractTime(iso?: string): string {
  if (!iso) return "";
  // Expecting format YYYY-MM-DDTHH:mm[:ss]
  const timePart = iso.split("T")[1];
  if (!timePart) return "";
  return timePart.slice(0, 5);
}

export default function EditTripModal({
  isOpen,
  onClose,
  onSubmit,
  trip,
}: EditTripModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const [formData, setFormData] = useState<UpdateTripDto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoutes();
      loadSchedules();
    }
  }, [isOpen]);

  useEffect(() => {
    if (trip) {
      console.log(trip);
      setFormData({
        id: trip.id,
        routeId: trip.routeId,
        // Keep raw ISO strings but derive date/time for inputs separately
        serviceDate: extractDate(trip.serviceDate),
        plannedStartAt: trip.plannedStartAt,
        plannedEndAt: trip.plannedEndAt,
        startTime: trip.startTime,
        endTime: trip.endTime,
        status: trip.status,
        vehicleId: trip.vehicleId,
        driverVehicleId: trip.driverVehicleId,
        vehicle: trip.vehicle,
        driver: trip.driver,
        scheduleSnapshot: trip.scheduleSnapshot,
        stops: trip.stops
      });
      
      // Auto-select schedule if trip has scheduleSnapshot
      if (trip.scheduleSnapshot?.scheduleId) {
        // Schedule will be auto-selected when schedules are loaded
      }
    }
  }, [trip]);

  useEffect(() => {
    if (formData?.routeId) {
      const selectedRoute = routes.find(r => r.id === formData.routeId);
      if (selectedRoute) {
        setFormData(prev => prev ? { ...prev, vehicleId: selectedRoute.vehicleId } : null);
      }
    }
  }, [formData?.routeId, routes]);

  // Auto-select schedule when schedules are loaded and trip has scheduleSnapshot
  useEffect(() => {
    if (schedules.length > 0 && formData?.scheduleSnapshot?.scheduleId && !formData.scheduleSnapshot.name) {
      const schedule = schedules.find(s => s.id === formData.scheduleSnapshot?.scheduleId);
      if (schedule) {
        // Parse schedule times and update form
        const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
        const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
        
        const startTimeStr = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
        const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        
        setFormData(prev => prev ? {
          ...prev,
          plannedStartAt: startTimeStr,
          plannedEndAt: endTimeStr,
          scheduleSnapshot: {
            scheduleId: schedule.id,
            name: schedule.name,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            rRule: schedule.rRule
          }
        } : null);
      }
    }
  }, [schedules, formData?.scheduleSnapshot?.scheduleId]);

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

  if (!isOpen || !trip || !formData) return null;

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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScheduleChange = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule && formData) {
      // Parse schedule times (format: HH:mm)
      const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
      const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
      
      // Format as HH:mm strings
      const startTimeStr = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
      const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      // Combine with current service date for ISO-like storage
      const serviceDate = formData.serviceDate || extractDate(trip?.serviceDate);
      const plannedStartAtIso = serviceDate ? `${serviceDate}T${startTimeStr}` : formData.plannedStartAt;
      const plannedEndAtIso = serviceDate ? `${serviceDate}T${endTimeStr}` : formData.plannedEndAt;
      
      setFormData({
        ...formData,
        plannedStartAt: plannedStartAtIso,
        plannedEndAt: plannedEndAtIso,
        scheduleSnapshot: {
          scheduleId: schedule.id,
          name: schedule.name,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          rRule: schedule.rRule
        }
      });
    } else {
      setFormData(formData => formData && {
        ...formData,
        scheduleSnapshot: { scheduleId: '', name: '', startTime: '', endTime: '', rRule: '' }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (validate()) {
      try {
        await onSubmit(formData);
        setSubmissionError(null);
      } catch (error: unknown) {
        console.log(error);

        if (error && typeof error === 'object' && 'data' in error) {
          const errorWithData = error as { data?: { message?: string } };
          setSubmissionError(errorWithData.data?.message || 'Failed to update trip. Please try again.');
        } else if (error instanceof Error) {
          setSubmissionError(error.message);
        } else {
          setSubmissionError('Failed to update trip. Please try again.');
        }
      }
    }
  };

  const selectedRoute = routes.find(r => r.id === formData.routeId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-[#463B3B]">Edit Trip</h3>
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
            {scheduleLoading ? (
              <div className="text-sm text-gray-500">Loading schedules...</div>
            ) : (
              <select
                value={formData.scheduleSnapshot?.scheduleId || ""}
                onChange={e => handleScheduleChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${errors.scheduleSnapshot ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Schedule</option>
                {schedules.map(sc =>
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
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
              lang="en-US"
              value={formData.plannedStartAt ? extractTime(formData.plannedStartAt) : ''}
              onChange={(e) => {
                const time = e.target.value;
                if (formData.serviceDate && time) {
                  const dateTime = `${formData.serviceDate}T${time}`;
                  setFormData({ ...formData, plannedStartAt: dateTime });
                } else {
                  setFormData({ ...formData, plannedStartAt: '' });
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
              lang="en-US"
              value={formData.plannedEndAt ? extractTime(formData.plannedEndAt) : ''}
              onChange={(e) => {
                const time = e.target.value;
                if (formData.serviceDate && time) {
                  const dateTime = `${formData.serviceDate}T${time}`;
                  setFormData({ ...formData, plannedEndAt: dateTime });
                } else {
                  setFormData({ ...formData, plannedEndAt: '' });
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${errors.plannedEndAt ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.plannedEndAt && (
              <p className="mt-1 text-sm text-red-500">{errors.plannedEndAt}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "Scheduled" | "InProgress" | "Completed" | "Cancelled" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
              Update Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}