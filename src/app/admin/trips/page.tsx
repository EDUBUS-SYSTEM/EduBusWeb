"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Calendar } from "@/components/calendar";
import TripDetails from "@/components/admin/TripDetails";
import { CalendarView, CalendarEvent } from "@/types";
import { mockCalendarEvents } from "@/data/mockCalendarData";

export default function TripManagementPage() {
  const [view, setView] = useState<CalendarView>({
    type: 'week',
    date: new Date()
  });

  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleEventCreate = (date: Date) => {
    console.log('Create trip for:', date);
    setShowCreateModal(true);
  };

  const handleDateChange = (date: Date) => {
    console.log('Date changed to:', date);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Trip Management
            </h1>
            <p className="text-gray-600">
              Manage bus trips, schedules, and routes with our interactive calendar
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips Today</p>
                  <p className="text-2xl font-bold text-[#463B3B]">12</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-[#463B3B]">8</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students Transported</p>
                  <p className="text-2xl font-bold text-[#463B3B]">245</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-time Performance</p>
                  <p className="text-2xl font-bold text-[#463B3B]">94%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
            <Calendar
              events={events}
              view={view}
              onViewChange={handleViewChange}
              onEventClick={handleEventClick}
              onEventCreate={handleEventCreate}
              onDateChange={handleDateChange}
            />
          </div>
        </div>
      </main>

      {/* Trip Details Modal */}
      {selectedEvent && (
        <TripDetails
          trip={selectedEvent}
          onClose={closeEventModal}
          onEdit={() => {
            console.log('Edit trip:', selectedEvent);
            closeEventModal();
          }}
        />
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Create New Trip
              </h3>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  placeholder="Enter trip name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent">
                  <option>Select Route</option>
                  <option>Route A - District A</option>
                  <option>Route B - District B</option>
                  <option>Route C - District C</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent">
                  <option>Select Driver</option>
                  <option>John Smith</option>
                  <option>Sarah Johnson</option>
                  <option>Mike Wilson</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeCreateModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold">
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
