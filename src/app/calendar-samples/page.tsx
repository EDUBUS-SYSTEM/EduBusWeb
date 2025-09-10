"use client";

import React, { useState } from 'react';
import { CalendarView, CalendarEvent } from '@/types';
import { Calendar } from '@/components/calendar';
import { mockCalendarEvents } from '@/data/mockCalendarData';

export default function CalendarSamplesPage() {
  const [activeSample, setActiveSample] = useState<string>('week');

  // Different sample data sets
  const sampleData = {
    week: {
      title: 'Weekly View - Bus Schedule Overview',
      description: 'Perfect for viewing the week\'s bus routes and schedules',
      view: { type: 'week' as const, date: new Date(2024, 8, 10) },
      events: mockCalendarEvents.filter(e => 
        e.start >= new Date(2024, 8, 9) && e.start <= new Date(2024, 8, 15)
      )
    },
    month: {
      title: 'Monthly View - Long-term Planning',
      description: 'Ideal for monthly planning and overview of all activities',
      view: { type: 'month' as const, date: new Date(2024, 8, 10) },
      events: mockCalendarEvents
    },
    day: {
      title: 'Daily View - Detailed Schedule',
      description: 'Detailed hourly view for precise scheduling and monitoring',
      view: { type: 'day' as const, date: new Date(2024, 8, 10) },
      events: mockCalendarEvents.filter(e => 
        e.start.toDateString() === new Date(2024, 8, 10).toDateString()
      )
    }
  };

  const currentSample = sampleData[activeSample as keyof typeof sampleData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Calendar Design Samples
          </h1>
          <p className="text-gray-600 text-lg">
            Explore different calendar layouts and designs for EduBus scheduling system
          </p>
        </div>

        {/* Sample Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose a Sample</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(sampleData).map(([key, sample]) => (
                <button
                  key={key}
                  onClick={() => setActiveSample(key)}
                  className={`
                    p-4 rounded-xl text-left transition-all duration-300
                    ${activeSample === key 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <h3 className="font-semibold mb-2 capitalize">{key} View</h3>
                  <p className="text-sm opacity-90">{sample.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Sample */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentSample.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentSample.description}
            </p>
          </div>

          <Calendar
            events={currentSample.events}
            view={currentSample.view}
            onViewChange={() => {}}
            onEventClick={(event) => console.log('Event clicked:', event)}
            onEventCreate={(date) => console.log('Create event for:', date)}
            onDateChange={() => {}}
          />
        </div>

        {/* Design Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Color Scheme */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Color Scheme</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Primary Colors</p>
                  <p className="text-sm text-gray-500">Soft neon blue gradient</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Trip Events</p>
                  <p className="text-sm text-gray-500">Blue gradient for bus trips</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Schedule Events</p>
                  <p className="text-sm text-gray-500">Cyan gradient for schedules</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Maintenance Events</p>
                  <p className="text-sm text-gray-500">Orange gradient for maintenance</p>
                </div>
              </div>
            </div>
          </div>

          {/* UI Features */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">UI Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Soft rounded corners (border-radius: 12px+)</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Gentle shadows and hover effects</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Smooth transitions and animations</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Pastel gradients and soft colors</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">Playful toy store aesthetic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Integration Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Backend Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Schedule Models</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Schedule - Main schedule configuration</li>
                <li>• RouteSchedule - Route-schedule associations</li>
                <li>• Trip - Actual trip instances</li>
                <li>• TripStop - Individual stop details</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RRule support for recurring schedules</li>
                <li>• Timezone handling</li>
                <li>• Exception date management</li>
                <li>• Real-time trip tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
