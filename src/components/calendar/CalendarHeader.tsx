"use client";

import React from 'react';
import { CalendarView } from '@/types';

interface CalendarHeaderProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  onTodayClick: () => void;
}

export default function CalendarHeader({ 
  view, 
  onViewChange, 
  onDateChange, 
  onTodayClick 
}: CalendarHeaderProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.date);
    
    switch (view.type) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 mb-4 md:mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Today button and navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <button
            onClick={onTodayClick}
            className="px-3 md:px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-xl font-medium hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            Today
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 md:p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 md:p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 sm:ml-4">
            {formatDate(view.date)}
          </h1>
        </div>

        {/* Right side - View selector and search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-9 md:pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200 w-full sm:w-48 md:w-64 text-sm md:text-base"
            />
          </div>

          {/* View selector */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['day', 'week', 'month'] as const).map((viewType) => (
              <button
                key={viewType}
                onClick={() => onViewChange({ ...view, type: viewType })}
                className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 capitalize text-xs md:text-sm ${
                  view.type === viewType
                    ? 'bg-white text-[#463B3B] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>

          {/* Calendar icon */}
          <button className="p-1.5 md:p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
