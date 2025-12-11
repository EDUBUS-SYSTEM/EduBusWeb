"use client";

import React, { useState } from 'react';
import { CalendarView, CalendarEvent } from '@/types';
import { Calendar } from '@/components/calendar';
import { mockCalendarEvents } from '@/data/mockCalendarData';
import { formatDateTime } from '@/utils/dateUtils';

export default function CalendarDemoPage() {
  const [view, setView] = useState<CalendarView>({
    type: 'week',
    date: new Date(2024, 8, 10) // September 10, 2024
  });

  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEventCreate = (date: Date) => {
    console.log('Create event for:', date);
    // Here you would typically open a modal to create a new event
  };

  const handleDateChange = (date: Date) => {
    console.log('Date changed to:', date);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            EduBus Calendar Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive calendar interface for managing bus schedules, trips, and maintenance
          </p>
        </div>

        {/* Calendar Component */}
        <div className="mb-8">
          <Calendar
            events={events}
            view={view}
            onViewChange={handleViewChange}
            onEventClick={handleEventClick}
            onEventCreate={handleEventCreate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Event Details
                </h3>
                <button
                  onClick={closeEventModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Title</h4>
                  <p className="text-gray-800">{selectedEvent.title}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Time</h4>
                  <p className="text-gray-800">
                    {formatDateTime(selectedEvent.start)} - {formatDateTime(selectedEvent.end)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Type</h4>
                  <span className={`
                    inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${selectedEvent.type === 'trip' ? 'bg-blue-100 text-blue-800' :
                      selectedEvent.type === 'schedule' ? 'bg-cyan-100 text-cyan-800' :
                      selectedEvent.type === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'}
                  `}>
                    {selectedEvent.type}
                  </span>
                </div>

                {selectedEvent.status && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Status</h4>
                    <span className={`
                      inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${selectedEvent.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        selectedEvent.status === 'in-progress' ? 'bg-green-100 text-green-800' :
                        selectedEvent.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'}
                    `}>
                      {selectedEvent.status}
                    </span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-800">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.metadata && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Details</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between mb-1">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-gray-800 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEventModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300">
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Demo Information */}
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Demo Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">View Modes</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Day view with hourly slots</li>
                <li>• Week view with daily columns</li>
                <li>• Month view with date grid</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Event Types</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Trip events (blue)</li>
                <li>• Schedule events (cyan)</li>
                <li>• Maintenance events (orange)</li>
                <li>• Other events (purple)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Interactions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click events to view details</li>
                <li>• Click empty slots to create events</li>
                <li>• Navigate between dates</li>
                <li>• Switch between view modes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
