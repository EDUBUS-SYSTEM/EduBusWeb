"use client";

import React from 'react';
import { CalendarEvent } from '@/types';

interface TripDetailsProps {
  trip: CalendarEvent;
  onClose: () => void;
  onEdit?: () => void;
}

export default function TripDetails({ trip, onClose, onEdit }: TripDetailsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'in-progress':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#463B3B] mb-2">
              Trip Details
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                {getStatusIcon(trip.status)}
                <span className="ml-1 capitalize">{trip.status || 'planned'}</span>
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Trip Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Trip Name</label>
                  <p className="text-gray-800 font-medium">{trip.title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Start Time</label>
                  <p className="text-gray-800 font-medium">
                    {trip.start.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">End Time</label>
                  <p className="text-gray-800 font-medium">
                    {trip.end.toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Duration</label>
                  <p className="text-gray-800 font-medium">
                    {Math.round((trip.end.getTime() - trip.start.getTime()) / (1000 * 60))} minutes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Route Information</h4>
              <div className="space-y-3">
                {trip.metadata && (
                  <>
                    {trip.metadata.route && (
                      <div>
                        <label className="text-sm text-gray-500">Route</label>
                        <p className="text-gray-800 font-medium">{String(trip.metadata.route)}</p>
                      </div>
                    )}
                    {trip.metadata.driver && (
                      <div>
                        <label className="text-sm text-gray-500">Driver</label>
                        <p className="text-gray-800 font-medium">{String(trip.metadata.driver)}</p>
                      </div>
                    )}
                    {trip.metadata.vehicle && (
                      <div>
                        <label className="text-sm text-gray-500">Vehicle</label>
                        <p className="text-gray-800 font-medium">{String(trip.metadata.vehicle)}</p>
                      </div>
                    )}
                    {trip.metadata.students && (
                      <div>
                        <label className="text-sm text-gray-500">Students</label>
                        <p className="text-gray-800 font-medium">{String(trip.metadata.students)} students</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Description</h4>
              <p className="text-gray-800 bg-gray-50 rounded-lg p-4">{trip.description}</p>
            </div>
          )}

          {/* Trip Progress */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Trip Progress</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-800">
                  {trip.status === 'completed' ? '100%' : 
                   trip.status === 'in-progress' ? '50%' : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    trip.status === 'completed' ? 'bg-green-500' :
                    trip.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ 
                    width: trip.status === 'completed' ? '100%' : 
                           trip.status === 'in-progress' ? '50%' : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Additional Metadata */}
          {trip.metadata && Object.keys(trip.metadata).length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Additional Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(trip.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-800 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
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
        </div>
      </div>
    </div>
  );
}
