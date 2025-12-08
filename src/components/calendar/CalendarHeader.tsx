"use client";

import React from 'react';
import { CalendarView } from '@/types';
import { formatMonthYear } from '@/utils/dateUtils';

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onTodayClick: () => void;
  routes?: { id: string; name: string }[];
  selectedRoute?: string;
  onRouteChange?: (routeId: string) => void;
}

export default function CalendarHeader({
  view,
  onViewChange,
  onDateChange,
  onTodayClick,
  routes = [],
  selectedRoute = 'all',
  onRouteChange
}: CalendarHeaderProps) {
  // Using centralized formatMonthYear from @/utils/dateUtils

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.date);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  return (
    <div className="sticky top-0 z-40 bg-white rounded-t-2xl shadow-soft-lg p-6 mb-0 border border-gray-100 border-b-0 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Left side - Today button and navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onTodayClick}
            className="px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-xl font-medium hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Today
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 ml-4">
            {formatMonthYear(view.date)}
          </h1>
        </div>

        {/* Right side - View selector and search */}
        <div className="flex items-center space-x-4">
          {/* Route Filter Dropdown */}
          {routes.length > 0 && onRouteChange && (
            <div className="relative">
              <select
                value={selectedRoute}
                onChange={(e) => onRouteChange(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer min-w-[180px]"
              >
                <option value="all">All Routes</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}


          {/* Calendar icon */}
          <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
