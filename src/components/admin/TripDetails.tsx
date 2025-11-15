"use client";

import React from 'react';
import { TripDto } from '@/types';
import { FaRoute, FaClock, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaCar, FaInfoCircle, FaUsers } from 'react-icons/fa';

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

  const getAttendanceStatusColor = (state: string) => {
    switch (state) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-orange-100 text-orange-800';
      case 'Excused':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
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

        {/* Non-Real-Time Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
          <div className="flex items-start">
            <FaInfoCircle className="text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Note: This data is not real-time
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                The information shown below reflects the current state of the trip at the time of loading.
                For real-time location updates, please refer to the live monitoring dashboard.
              </p>
            </div>
          </div>
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

          {/* Driver Information */}
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

          {/* Vehicle Information */}
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

          {/* Actual Times */}
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

          {/* Enhanced Stops Section with Address and Student Attendance */}
          {trip.stops && trip.stops.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#fad23c]" />
                Trip Stops ({trip.stops.length})
              </h4>
              <div className="space-y-4">
                {trip.stops.map((stop, index) => {
                  // Get stop address - prioritize stop.name, then location.address
                  const stopAddress = stop.name || stop.location?.address || `Stop ${index + 1}`;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        {/* Stop Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-[#fad23c] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>

                        {/* Stop Details */}
                        <div className="flex-1 min-w-0">
                          {/* Stop Address */}
                          <div className="mb-3">
                            <div className="font-semibold text-gray-800 text-base mb-1 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[#fad23c] text-sm" />
                              {stopAddress}
                            </div>
                            {/* Show additional address if name and location.address are different */}
                            {stop.name && stop.location?.address && stop.name !== stop.location.address && (
                              <div className="text-sm text-gray-600 mt-1 ml-6">
                                {stop.location.address}
                              </div>
                            )}
                          </div>

                          {/* Stop Times */}
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div className="bg-white rounded px-3 py-2 border border-gray-200">
                              <span className="text-gray-500 text-xs block mb-1">Planned Arrival</span>
                              <span className="text-gray-800 font-medium">
                                {formatTime(stop.plannedArrival)}
                              </span>
                            </div>
                            <div className={`rounded px-3 py-2 border ${stop.actualArrival ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                              <span className="text-gray-500 text-xs block mb-1">Actual Arrival</span>
                              <span className={`font-medium ${stop.actualArrival ? 'text-green-700' : 'text-gray-400'}`}>
                                {stop.actualArrival ? formatTime(stop.actualArrival) : 'Not arrived'}
                              </span>
                            </div>
                          </div>

                          {/* Students and Attendance */}
                          {stop.attendance && stop.attendance.length > 0 ? (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <FaUsers className="text-gray-500 text-sm" />
                                <span className="text-sm font-medium text-gray-700">
                                  Students ({stop.attendance.length})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {stop.attendance.map((attendance, attIndex) => (
                                  <div
                                    key={attIndex}
                                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-200 hover:border-gray-300 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                        {attIndex + 1}
                                      </div>
                                      <span className="text-sm font-medium text-gray-800">
                                        {attendance.studentName || `Student ${attIndex + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getAttendanceStatusColor(attendance.state)}`}>
                                        {attendance.state}
                                      </span>
                                      {attendance.boardedAt && (
                                        <span className="text-xs text-gray-500">
                                          {formatTime(attendance.boardedAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg px-3 py-4 border border-gray-200 text-center">
                              <p className="text-sm text-gray-500 italic">
                                No students assigned to this stop
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold text-sm"
          >
            Close
          </button>
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