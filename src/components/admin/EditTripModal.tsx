"use client";

import React, { useState, useEffect } from 'react';
import { UpdateTripDto, TripDto } from '@/types';
import { FaTimes } from 'react-icons/fa';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trip: UpdateTripDto) => void;
  trip: TripDto | null;
  routes?: { id: string; routeName: string }[];
}

export default function EditTripModal({
  isOpen,
  onClose,
  onSubmit,
  trip,
  routes = []
}: EditTripModalProps) {
  const [formData, setFormData] = useState<UpdateTripDto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trip) {
      setFormData({
        id: trip.id,
        routeId: trip.routeId,
        serviceDate: trip.serviceDate.split('T')[0],
        plannedStartAt: trip.plannedStartAt,
        plannedEndAt: trip.plannedEndAt,
        startTime: trip.startTime || undefined,
        endTime: trip.endTime || undefined,
        status: trip.status,
        scheduleSnapshot: trip.scheduleSnapshot,
        stops: trip.stops
      });
    }
  }, [trip]);

  if (!isOpen || !trip || !formData) return null;

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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-[#463B3B]">Edit Trip</h3>
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

          {/* Actual Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                startTime: e.target.value ? new Date(e.target.value).toISOString() : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>

          {/* Actual End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual End Time
            </label>
            <input
              type="datetime-local"
              value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                endTime: e.target.value ? new Date(e.target.value).toISOString() : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
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

