"use client";

import React, { useState, useRef } from 'react';
import { CalendarView, CalendarEvent } from '@/types';
import EventCard from './EventCard';
import { FaTimes, FaBus, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { formatDate, formatTime } from "@/utils/dateUtils";

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);


  const calculateEventPosition = (event: CalendarEvent, date: Date) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if (eventStart.toDateString() !== date.toDateString()) {
      return { top: 0, height: 0 };
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
    const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
    const duration = endMinutes - startMinutes;

    const top = startMinutes;
    const height = Math.max(duration, 30);

    return { top, height };
  };

  const formatHour = (hour: number) => {
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
    const hourHeight = 60;
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
    const dayDate = formatDate(day);

    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.toDateString();
    });

    return (
      <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-2xl font-bold text-[#463B3B]">{dayName}</h2>
          <p className="text-gray-600">{dayDate}</p>
        </div>

        <div className="relative overflow-y-auto max-h-[calc(100vh-400px)]" ref={containerRef}>
          <div className="flex">
            <div className="w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 px-3 flex items-start pt-1"
                >
                  <span className="text-xs text-gray-600 font-medium">
                    {formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors"
                  onDragOver={(e) => handleDragOver(e, day, hour)}
                  onDrop={(e) => handleDrop(e, day, hour)}
                  onClick={() => handleCellClick(day, hour)}
                >
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
              <div className={`text-lg font-bold ${isToday(day)
                ? 'text-[#463B3B] bg-[#fad23c] rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                : 'text-gray-800'
                }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="relative overflow-y-auto max-h-[calc(100vh-400px)]" ref={containerRef}>
          <div className="flex">
            <div className="w-24 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 px-3 flex items-start pt-1"
                >
                  <span className="text-xs text-gray-600 font-medium">
                    {formatHour(hour)}
                  </span>
                </div>
              ))}
            </div>

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
      <div className="bg-white rounded-b-2xl shadow-soft-lg overflow-hidden border border-gray-100 border-t-0">
        {/* Header */}
        <div className="grid grid-cols-7 gap-0 border-b border-gray-100">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-semibold text-gray-600 bg-gray-50 border-r border-gray-100 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => {
            const dayTripsCount = day ? getEventsForDate(day).length : 0;
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] border-r border-b border-gray-100 p-2 cursor-pointer
                  hover:bg-gray-50 transition-colors duration-200 last:border-r-0
                  ${day ? 'bg-white' : 'bg-gray-50'}
                  ${day && isToday(day) ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : ''}
                `}
                onClick={() => {
                  if (!day) return;
                  if (dayTripsCount > 0) {
                    setSelectedDate(day);
                  } else {
                    onEventCreate?.(day);
                  }
                }}
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

                    {dayTripsCount > 0 && (
                      <div className="flex items-center justify-center">
                        <div className="bg-gradient-to-br from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-md hover:shadow-lg transition-shadow">
                          {dayTripsCount}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DayTripsModal = ({ date, trips }: { date: Date; trips: CalendarEvent[] }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-gray-200">
          <div className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaBus className="w-6 h-6 text-[#463B3B]" />
              <h2 className="text-xl font-bold text-[#463B3B]">
                {formatDate(date)}
              </h2>
              <span className="text-sm font-semibold text-[#463B3B] bg-white px-3 py-1 rounded-full">
                {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[#463B3B] hover:bg-[#FDC700] p-2 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-b from-white to-gray-50">
            {trips.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No trips for this date</p>
            ) : (
              <div className="space-y-3">
                {trips.map((trip, index) => (
                  <div
                    key={trip.id}
                    className="bg-white border-l-4 border-[#fad23c] rounded-lg p-4 hover:shadow-lg hover:border-[#FDC700] transition-all duration-200 cursor-pointer hover:scale-[1.02] transform"
                    onClick={() => {
                      onEventClick?.(trip);
                      setSelectedDate(null);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#fad23c] to-[#FDC700] rounded-lg flex items-center justify-center">
                        <FaBus className="w-5 h-5 text-[#463B3B]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#463B3B] text-base">
                            {trip.title}
                          </h3>
                          {(() => {
                            const startHour = new Date(trip.start).getHours();
                            const ismorning = startHour < 12;
                            return (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${ismorning
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                                }`}>
                                {ismorning ? '🌅 Morning' : '🌆 Afternoon'}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaMapMarkerAlt className="w-4 h-4 text-[#fad23c] flex-shrink-0" />
                            <span className="font-medium">Route:</span>
                            <span className="text-gray-600">{trip.description?.split('|')[0] || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FaClock className="w-4 h-4 text-[#fad23c] flex-shrink-0" />
                            <span className="font-medium">Time:</span>
                            <span className="text-gray-600">
                              {formatTime(trip.start)} - {formatTime(trip.end)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${trip.status === 'planned'
                          ? 'bg-blue-100 text-blue-800'
                          : trip.status === 'in-progress'
                            ? 'bg-green-100 text-green-800'
                            : trip.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {trip.status === 'planned'
                          ? 'Scheduled'
                          : trip.status === 'in-progress'
                            ? 'In Progress'
                            : trip.status === 'completed'
                              ? 'Completed'
                              : trip.status === 'cancelled'
                                ? 'Cancelled'
                                : 'Unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const monthView = renderMonthView();

  return (
    <>
      {monthView}
      {selectedDate && (
        <DayTripsModal
          date={selectedDate}
          trips={events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === selectedDate.toDateString();
          })}
        />
      )}
    </>
  );
}
