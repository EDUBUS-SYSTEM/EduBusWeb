"use client";

import React from 'react';
import Link from 'next/link';

export default function CalendarIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            EduBus Calendar System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Interactive calendar interface for managing bus schedules, trips, and maintenance
          </p>
          <div className="inline-flex items-center space-x-2 bg-white rounded-2xl px-6 py-3 shadow-soft-lg border border-gray-100">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">Live Demo Available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link href="/calendar-demo" className="group">
            <div className="bg-white rounded-3xl shadow-soft-lg p-8 border border-gray-100 hover:shadow-soft-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                    Interactive Demo
                  </h2>
                  <p className="text-gray-600">Fully functional calendar with real interactions</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-700">Click events to view details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-700">Switch between day/week/month views</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-700">Navigate through dates</span>
                </div>
              </div>

              <div className="flex items-center text-cyan-600 font-semibold group-hover:text-cyan-700">
                Try it now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/calendar-samples" className="group">
            <div className="bg-white rounded-3xl shadow-soft-lg p-8 border border-gray-100 hover:shadow-soft-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                    Design Samples
                  </h2>
                  <p className="text-gray-600">Explore different calendar layouts and designs</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-700">Multiple view layouts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-700">Color scheme variations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span className="text-gray-700">UI feature showcase</span>
                </div>
              </div>

              <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                View samples
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-soft-lg p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Live tracking of bus locations and trip status</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">Intelligent route planning and conflict detection</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Maintenance Tracking</h3>
              <p className="text-gray-600">Comprehensive vehicle maintenance scheduling</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl shadow-soft-lg p-8 border border-cyan-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Backend Integration
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Built with real backend models and ready for production deployment
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Schedule Models</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Schedule - Main schedule configuration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>RouteSchedule - Route associations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Trip - Actual trip instances</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>TripStop - Individual stop details</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Advanced Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>RRule support for recurring schedules</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>Timezone handling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span>Exception date management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span>Real-time notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
