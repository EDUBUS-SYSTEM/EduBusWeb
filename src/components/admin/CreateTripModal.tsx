"use client";

import React, { useState } from 'react';
import { CreateTripDto, ScheduleSnapshotDto, TripStopDto } from '@/types';
import { FaTimes } from 'react-icons/fa';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: CreateTripDto) => void;
  routes?: { id: string; routeName: string }[];
}

export default function CreateTripModal({
  isOpen,
  onClose,
  onSubmit,
  routes = []
}: CreateTripModalProps) {
  const [formData, setFormData] = useState<CreateTripDto>({
    routeId: '',
    serviceDate: new Date().toISOString().split('T')[0],
    plannedStartAt: '',
    plannedEndAt: '',
    status: 'Scheduled',
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

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.routeId) {
      newErrors.routeId = 'Route is required';
    }
    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Service date is required';
    }
    if (!formData.plannedStartAt) {
      newErrors.plannedStartAt = 'Planned start time is required';
    }
    if (!formData.plannedEndAt) {
      newErrors.plannedEndAt = 'Planned end time is required';
    }
    if (formData.plannedStartAt && formData.plannedEndAt) {
      const start = new Date(formData.plannedStartAt);
      const end = new Date(formData.plannedEndAt);
      if (start >= end) {
        newErrors.plannedEndAt = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        routeId: '',
        serviceDate: new Date().toISOString().split('T')[0],
        plannedStartAt: '',
        plannedEndAt: '',
        status: 'Scheduled',
        scheduleSnapshot: {
          scheduleId: '',
          name: '',
          startTime: '',
          endTime: '',
          rRule: ''
        },
        stops: []
      });
      setErrors({});
    }
  };

  const handleDateTimeChange = (field: 'plannedStartAt' | 'plannedEndAt', value: string) => {
    const date = formData.serviceDate;
    const time = value;
    const datetime = `${date}T${time}:00`;
    setFormData({ ...formData, [field]: datetime });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-[#463B3B]">Create New Trip</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Route Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.routeId}
              onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.routeId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.routeName}
                </option>
              ))}
            </select>
            {errors.routeId && (
              <p className="mt-1 text-sm text-red-500">{errors.routeId}</p>
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.serviceDate ? 'border-red-500' : 'border-gray-300'
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
              type="datetime-local"
              value={formData.plannedStartAt}
              onChange={(e) => setFormData({ ...formData, plannedStartAt: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.plannedStartAt ? 'border-red-500' : 'border-gray-300'
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
              type="datetime-local"
              value={formData.plannedEndAt}
              onChange={(e) => setFormData({ ...formData, plannedEndAt: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${
                errors.plannedEndAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.plannedEndAt && (
              <p className="mt-1 text-sm text-red-500">{errors.plannedEndAt}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
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

          {/* Schedule Snapshot (Optional) */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Schedule Snapshot (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Schedule Name</label>
                <input
                  type="text"
                  value={formData.scheduleSnapshot.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleSnapshot: { ...formData.scheduleSnapshot, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                  placeholder="e.g., Morning Route"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Schedule ID</label>
                <input
                  type="text"
                  value={formData.scheduleSnapshot.scheduleId}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleSnapshot: { ...formData.scheduleSnapshot, scheduleId: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                  placeholder="Schedule UUID"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.scheduleSnapshot.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleSnapshot: { ...formData.scheduleSnapshot, startTime: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.scheduleSnapshot.endTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleSnapshot: { ...formData.scheduleSnapshot, endTime: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

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

