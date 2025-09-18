"use client";

import React from 'react';
import { CalendarView, CalendarEvent } from '@/types';
import EventCard from './EventCard';

interface CalendarGridProps {
  view: CalendarView;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
}

export default function CalendarGrid({ 
  view, 
  events, 
  onEventClick, 
  onEventCreate 
}: CalendarGridProps) {
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      return eventDate.toDateString() === date.toDateString() && eventHour === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === view.date.getMonth();
  };

  const handleCellClick = (date: Date, hour?: number) => {
    if (onEventCreate) {
      const newDate = new Date(date);
      if (hour !== undefined) {
        newDate.setHours(hour, 0, 0, 0);
      }
      onEventCreate(newDate);
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(view.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header with day names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-semibold text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[120px] border-r border-b border-gray-100 p-2 cursor-pointer
                hover:bg-gray-50 transition-colors duration-200
                ${day ? 'bg-white' : 'bg-gray-50'}
                ${day && isToday(day) ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : ''}
              `}
              onClick={() => day && handleCellClick(day)}
            >
              {day && (
                <>
                  <div className={`
                    text-sm font-medium mb-2
                    ${isToday(day) ? 'text-[#463B3B]' : 'text-gray-800'}
                    ${!isCurrentMonth(day) ? 'text-gray-400' : ''}
                  `}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {getEventsForDate(day).slice(0, 3).map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                        className="text-xs"
                      />
                    ))}
                    {getEventsForDate(day).length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{getEventsForDate(day).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(view.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header with day names and dates */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-r border-gray-100 last:border-r-0">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {dayNames[index]}
              </div>
              <div className={`
                text-lg font-bold
                ${isToday(day) ? 'text-[#463B3B] bg-[#fad23c] rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-800'}
              `}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div key={index} className="border-r border-gray-100 last:border-r-0">
              {Array.from({ length: 24 }, (_, hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-gray-50 p-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => handleCellClick(day, hour)}
                >
                  {getEventsForTimeSlot(day, hour).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      className="text-xs mb-1"
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const day = view.date;
    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    const dayDate = day.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-2xl font-bold text-gray-800">{dayName}</h2>
          <p className="text-gray-600">{dayDate}</p>
        </div>
        
        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {Array.from({ length: 24 }, (_, hour) => {
            const timeString = new Date(2024, 0, 1, hour).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-100">
                  {timeString}
                </div>
                <div
                  className="flex-1 p-3 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => handleCellClick(day, hour)}
                >
                  {getEventsForTimeSlot(day, hour).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      className="mb-2"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (view.type) {
    case 'day':
      return renderDayView();
    case 'week':
      return renderWeekView();
    case 'month':
      return renderMonthView();
    default:
      return renderMonthView();
  }
}
