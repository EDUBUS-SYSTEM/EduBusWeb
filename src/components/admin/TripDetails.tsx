"use client";

import React from 'react';
import { TripDto } from '@/types';
import { FaRoute, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

interface TripDetailsProps {
  trip: TripDto;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TripDetails({ trip, onClose, onEdit, onDelete }: TripDetailsProps) {
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
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
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Trip ID</label>
            <p className="text-sm text-gray-700 font-mono mt-1">{trip.id}</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-[#fad23c]" />
                Service Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Service Date</label>
                  <p className="text-gray-800 font-medium">{formatDate(trip.serviceDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Route ID</label>
                  <p className="text-gray-800 font-medium font-mono text-sm">{trip.routeId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <FaClock className="text-[#fad23c]" />
                Time Information
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Planned Start</label>
                  <p className="text-gray-800 font-medium">{formatDateTime(trip.plannedStartAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Planned End</label>
                  <p className="text-gray-800 font-medium">{formatDateTime(trip.plannedEndAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Planned Duration</label>
                  <p className="text-gray-800 font-medium">
                    {calculateDuration(trip.plannedStartAt, trip.plannedEndAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actual Times */}
          {(trip.startTime || trip.endTime) && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Actual Times
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Actual Start</label>
                  <p className="text-gray-800 font-medium">
                    {trip.startTime ? formatDateTime(trip.startTime) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Actual End</label>
                  <p className="text-gray-800 font-medium">
                    {trip.endTime ? formatDateTime(trip.endTime) : '-'}
                  </p>
                </div>
                {trip.startTime && trip.endTime && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500">Actual Duration</label>
                    <p className="text-gray-800 font-medium">
                      {calculateDuration(trip.startTime, trip.endTime)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                  {trip.scheduleSnapshot.scheduleId && (
                    <div>
                      <label className="text-sm text-gray-500">Schedule ID</label>
                      <p className="text-gray-800 font-medium font-mono text-sm">{trip.scheduleSnapshot.scheduleId}</p>
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
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#fad23c]" />
                Trip Stops ({trip.stops.length})
              </h4>
              <div className="space-y-3">
                {trip.stops.map((stop, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#fad23c] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">
                            {stop.name || `Stop ${index + 1}`}
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            {stop.plannedArrival && (
                              <div>
                                <label className="text-xs text-gray-500">Planned Arrival</label>
                                <p className="text-sm text-gray-800">{formatDateTime(stop.plannedArrival)}</p>
                              </div>
                            )}
                            {stop.plannedDeparture && (
                              <div>
                                <label className="text-xs text-gray-500">Planned Departure</label>
                                <p className="text-sm text-gray-800">{formatDateTime(stop.plannedDeparture)}</p>
                              </div>
                            )}
                            {stop.actualArrival && (
                              <div>
                                <label className="text-xs text-gray-500">Actual Arrival</label>
                                <p className="text-sm text-gray-800">{formatDateTime(stop.actualArrival)}</p>
                              </div>
                            )}
                            {stop.actualDeparture && (
                              <div>
                                <label className="text-xs text-gray-500">Actual Departure</label>
                                <p className="text-sm text-gray-800">{formatDateTime(stop.actualDeparture)}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Sequence: {stop.sequence}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold"
            >
              Edit Trip
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold"
            >
              Delete Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
