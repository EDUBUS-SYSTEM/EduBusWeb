"use client";

import React, { useState, useRef } from 'react';
import { CalendarView, CalendarEvent } from '@/types';
import EventCard from './EventCard';

interface CalendarGridProps {
  view: CalendarView;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onEventMove?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

export default function CalendarGrid({ 
  view, 
  events, 
  onEventClick, 
  onEventCreate,
  onEventMove
}: CalendarGridProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate time slots from 12 AM to 11 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Helper function for future use (filtering events by time slot)
  // const getEventsForTimeSlot = (date: Date, hour: number) => {
  //   return events.filter(event => {
  //     const eventStart = new Date(event.start);
  //     const eventEnd = new Date(event.end);
  //     const slotStart = new Date(date);
  //     slotStart.setHours(hour, 0, 0, 0);
  //     const slotEnd = new Date(date);
  //     slotEnd.setHours(hour + 1, 0, 0, 0);
  //     
  //     // Check if event overlaps with this time slot
  //     return eventStart < slotEnd && eventEnd > slotStart;
  //   });
  // };

  const calculateEventPosition = (event: CalendarEvent, date: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Check if event is on this date
    if (eventStart.toDateString() !== date.toDateString()) {
      return { top: 0, height: 0 };
    }
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    // Calculate position in minutes from start of day
    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
    const duration = endMinutes - startMinutes;
    
    // Height per minute (60px per hour = 1px per minute)
    const top = startMinutes;
    const height = Math.max(duration, 30); // Minimum 30 minutes height
    
    return { top, height };
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedEvent(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = 60; // 60px per hour
    const totalOffset = y - (hour * hourHeight);
    const minutes = Math.max(0, Math.min(59, Math.floor(totalOffset / (hourHeight / 60))));
    
    setDragOverSlot({ date, hour, minute: minutes });
  };

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    
    if (!draggedEvent || !onEventMove) return;
    
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId !== draggedEvent.id) return;
    
    const newStart = new Date(date);
    if (dragOverSlot) {
      newStart.setHours(dragOverSlot.hour, dragOverSlot.minute, 0, 0);
    } else {
      newStart.setHours(hour, 0, 0, 0);
    }
    
    // Calculate duration from original event
    const originalDuration = new Date(draggedEvent.end).getTime() - new Date(draggedEvent.start).getTime();
    const newEnd = new Date(newStart.getTime() + originalDuration);
    
    onEventMove(eventId, newStart, newEnd);
    setDraggedEvent(null);
    setDragOverSlot(null);
  };

  const handleCellClick = (date: Date, hour: number, minute: number = 0) => {
    if (onEventCreate && !draggedEvent) {
      const newDate = new Date(date);
      newDate.setHours(hour, minute, 0, 0);
      onEventCreate(newDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderDayView = () => {
    const day = view.date;
    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    const dayDate = day.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.toDateString();
    });

    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-2xl font-bold text-[#463B3B]">{dayName}</h2>
          <p className="text-gray-600">{dayDate}</p>
        </div>
        
        {/* Calendar Grid */}
        <div className="relative overflow-y-auto max-h-[calc(100vh-400px)]" ref={containerRef}>
          <div className="flex">
            {/* Time column */}
            <div className="w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 px-3 flex items-start pt-1"
                >
                  <span className="text-xs text-gray-600 font-medium">
                    {formatTime(hour)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Events column */}
            <div className="flex-1 relative">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors"
                  onDragOver={(e) => handleDragOver(e, day, hour)}
                  onDrop={(e) => handleDrop(e, day, hour)}
                  onClick={() => handleCellClick(day, hour)}
                >
                  {/* Drop indicator */}
                  {dragOverSlot && dragOverSlot.hour === hour && draggedEvent && (
                    <div
                      className="absolute left-0 right-0 bg-blue-200 opacity-50 border-2 border-blue-400 border-dashed z-10"
                      style={{
                        top: `${(dragOverSlot.minute / 60) * 100}%`,
                        height: '2px'
                      }}
                    />
                  )}
                </div>
              ))}
              
              {/* Render events */}
              {dayEvents.map((event) => {
                const { top, height } = calculateEventPosition(event, day);
                if (height === 0) return null;
                
                return (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={handleDragEnd}
                    className="absolute left-1 right-1 cursor-move z-20"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      minHeight: '30px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <EventCard
                      event={event}
                      onClick={onEventClick}
                      className="h-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(view.date);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex border-b border-gray-100">
          <div className="w-24 flex-shrink-0 p-4 border-r border-gray-100 bg-gray-50"></div>
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className="flex-1 p-4 text-center border-r border-gray-100 last:border-r-0 min-w-0"
            >
              <div className="text-sm font-medium text-gray-600 mb-1">
                {dayNames[index]}
              </div>
              <div className={`text-lg font-bold ${
                isToday(day) 
                  ? 'text-[#463B3B] bg-[#fad23c] rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                  : 'text-gray-800'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="relative overflow-y-auto max-h-[calc(100vh-400px)]" ref={containerRef}>
          <div className="flex">
            {/* Time column */}
            <div className="w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 px-3 flex items-start pt-1"
                >
                  <span className="text-xs text-gray-600 font-medium">
                    {formatTime(hour)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Days columns */}
            <div className="flex-1 flex">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.start);
                  return eventDate.toDateString() === day.toDateString();
                });

                return (
                  <div 
                    key={dayIndex} 
                    className="flex-1 border-r border-gray-100 last:border-r-0 relative min-w-0"
                  >
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors"
                        onDragOver={(e) => handleDragOver(e, day, hour)}
                        onDrop={(e) => handleDrop(e, day, hour)}
                        onClick={() => handleCellClick(day, hour)}
                      >
                        {/* Drop indicator */}
                        {dragOverSlot && 
                         dragOverSlot.date.toDateString() === day.toDateString() && 
                         dragOverSlot.hour === hour && 
                         draggedEvent && (
                          <div
                            className="absolute left-0 right-0 bg-blue-200 opacity-50 border-2 border-blue-400 border-dashed z-10"
                            style={{
                              top: `${(dragOverSlot.minute / 60) * 100}%`,
                              height: '2px'
                            }}
                          />
                        )}
                      </div>
                    ))}
                    
                    {/* Render events for this day */}
                    {dayEvents.map((event) => {
                      const { top, height } = calculateEventPosition(event, day);
                      if (height === 0) return null;
                      
                      return (
                        <div
                          key={event.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, event)}
                          onDragEnd={handleDragEnd}
                          className="absolute left-1 right-1 cursor-move z-20"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            minHeight: '30px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <EventCard
                            event={event}
                            onClick={onEventClick}
                            className="h-full text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const year = view.date.getFullYear();
    const month = view.date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getEventsForDate = (date: Date) => {
      return events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
      });
    };

    const isCurrentMonth = (date: Date) => {
      return date.getMonth() === month;
    };

    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        {/* Header */}
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
              onClick={() => day && handleCellClick(day, new Date().getHours())}
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

  switch (view.type) {
    case 'day':
      return renderDayView();
    case 'week':
      return renderWeekView();
    case 'month':
      return renderMonthView();
    default:
      return renderDayView();
  }
}
