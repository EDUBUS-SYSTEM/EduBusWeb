"use client";

import React from 'react';
import { TripDto } from '@/types';
import { FaRoute, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaCar } from 'react-icons/fa';

interface TripDetailsProps {
  trip: TripDto;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TripDetails({ trip, onClose, onEdit, onDelete }: TripDetailsProps) {
  console.log(trip);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'InProgress':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] px-6 py-5 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-[#463B3B] mb-2">
              Trip Details
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                {trip.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#463B3B] hover:bg-[#FDC700] transition-colors p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-3">
                <FaCalendarAlt className="text-blue-600" />
                Service Information
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-blue-700 font-medium">Service Date</label>
                  <p className="text-blue-900 font-semibold">{formatDate(trip.serviceDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-blue-700 font-medium">Route</label>
                  <p className="text-blue-900 font-semibold">{trip.routeName || trip.routeId}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-3">
                <FaClock className="text-purple-600" />
                Time Information
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-purple-700 font-medium">Planned Start</label>
                  <p className="text-purple-900 font-semibold text-sm">{formatTime(trip.plannedStartAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-purple-700 font-medium">Planned End</label>
                  <p className="text-purple-900 font-semibold text-sm">{formatTime(trip.plannedEndAt)}</p>
                </div>
                <div>
                  <label className="text-xs text-purple-700 font-medium">Duration</label>
                  <p className="text-purple-900 font-semibold text-sm">
                    {calculateDuration(trip.plannedStartAt, trip.plannedEndAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information - NEW */}
          {trip.driver && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaUser className="text-[#fad23c]" />
                Driver Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Driver Name</label>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      {trip.driver.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {trip.driver.phone || 'N/A'}
                    </p>
                  </div>
                  {trip.driver.isPrimary && (
                    <div className="md:col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Primary Driver
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Information - UPDATED */}
          {trip.vehicle && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaCar className="text-[#fad23c]" />
                Vehicle Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Vehicle Number Plate</label>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      <FaCar className="text-gray-400" />
                      {trip.vehicle.maskedPlate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Capacity</label>
                    <p className="text-gray-800 font-medium">{trip.vehicle.capacity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="text-gray-800 font-medium">{trip.vehicle.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actual Times - UPDATED to always show */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Actual Times
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-green-700 font-medium">Actual Start</label>
                <p className="text-green-900 font-semibold text-sm">
                  {trip.startTime ? formatTime(trip.startTime) : <span className="text-orange-600">Not Yet</span>}
                </p>
              </div>
              <div>
                <label className="text-xs text-green-700 font-medium">Actual End</label>
                <p className="text-green-900 font-semibold text-sm">
                  {trip.endTime ? formatTime(trip.endTime) : <span className="text-orange-600">Not Yet</span>}
                </p>
              </div>
              {trip.startTime && trip.endTime && (
                <div>
                  <label className="text-xs text-green-700 font-medium">Actual Duration</label>
                  <p className="text-green-900 font-semibold text-sm">
                    {calculateDuration(trip.startTime, trip.endTime)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Snapshot */}
          {trip.scheduleSnapshot && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4">Schedule Snapshot</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.scheduleSnapshot.name && (
                    <div>
                      <label className="text-sm text-gray-500">Schedule Name</label>
                      <p className="text-gray-800 font-medium">{trip.scheduleSnapshot.name}</p>
                    </div>
                  )}
                  {trip.scheduleSnapshot.startTime && (
                    <div>
                      <label className="text-sm text-gray-500">Start Time</label>
                      <p className="text-gray-800 font-medium">{trip.scheduleSnapshot.startTime}</p>
                    </div>
                  )}
                  {trip.scheduleSnapshot.endTime && (
                    <div>
                      <label className="text-sm text-gray-500">End Time</label>
                      <p className="text-gray-800 font-medium">{trip.scheduleSnapshot.endTime}</p>
                    </div>
                  )}
                  {trip.scheduleSnapshot.rRule && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500">Recurrence Rule (RRule)</label>
                      <p className="text-gray-800 font-medium font-mono text-sm break-all">{trip.scheduleSnapshot.rRule}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stops */}
          {trip.stops && trip.stops.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                <FaMapMarkerAlt className="text-[#fad23c]" />
                Trip Stops ({trip.stops.length})
              </h4>
              <div className="space-y-1.5">
                {trip.stops.map((stop, index) => (
                  <div key={index} className="flex items-start gap-2 py-2 px-2 hover:bg-gray-50 rounded transition-colors">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#fad23c] rounded-full flex items-center justify-center text-white font-bold text-sm mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm leading-tight">
                        {stop.name || `Stop ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-600 leading-tight">
                        {stop.attendance && stop.attendance.length > 0 
                          ? stop.attendance.map(a => a.studentName).join(', ')
                          : 'No students'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}