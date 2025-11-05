"use client";

import React, { useState } from "react";
import { CalendarProps, CalendarView } from "@/types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";

export default function Calendar({
  events,
  view: initialView,
  onViewChange,
  onEventClick,
  onEventCreate,
  onEventMove,
  onDateChange,
  className = "",
  routes = [],
  selectedRoute = 'all',
  onRouteChange,
}: CalendarProps) {
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);

  const handleViewChange = (newView: CalendarView) => {
    setCurrentView(newView);
    onViewChange(newView);
  };

  const handleDateChange = (newDate: Date) => {
    const newView = { ...currentView, date: newDate };
    setCurrentView(newView);
    onDateChange?.(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    handleDateChange(today);
  };

  const handleEventCreate = (date: Date) => {
    onEventCreate?.(date);
  };

  const handleEventMove = (eventId: string, newStart: Date, newEnd: Date) => {
    onEventMove?.(eventId, newStart, newEnd);
  };

  return (
    <div className={`calendar-container ${className}`}>
      <CalendarHeader
        view={currentView}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onTodayClick={handleTodayClick}
        routes={routes}
        selectedRoute={selectedRoute}
        onRouteChange={onRouteChange}
      />

      <CalendarGrid
        view={currentView}
        events={events}
        onEventClick={onEventClick}
        onEventCreate={handleEventCreate}
        onEventMove={handleEventMove}
      />
    </div>
  );
}
