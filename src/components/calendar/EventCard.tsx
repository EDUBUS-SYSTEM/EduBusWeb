"use client";

import React from 'react';
import { CalendarEvent } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  className?: string;
}

export default function EventCard({ event, onClick, className = '' }: EventCardProps) {
  const getEventColor = (type: CalendarEvent['type'], status?: CalendarEvent['status']) => {
    const colorMap = {
      trip: {
        planned: 'bg-gradient-to-r from-blue-400 to-blue-500',
        'in-progress': 'bg-gradient-to-r from-green-400 to-green-500',
        completed: 'bg-gradient-to-r from-gray-400 to-gray-500',
        cancelled: 'bg-gradient-to-r from-red-400 to-red-500',
      },
      schedule: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
      maintenance: 'bg-gradient-to-r from-orange-400 to-orange-500',
      other: 'bg-gradient-to-r from-purple-400 to-purple-500',
    };

    if (type === 'trip' && status) {
      return colorMap.trip[status];
    }

    return colorMap[type] || colorMap.other;
  };

  const getStatusIcon = (type: CalendarEvent['type'], status?: CalendarEvent['status']) => {
    if (type === 'trip') {
      switch (status) {
        case 'in-progress':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          );
        case 'completed':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'cancelled':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          );
        default:
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          );
      }
    }

    switch (type) {
      case 'schedule':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };



  return (
    <div
      onClick={() => onClick?.(event)}
      className={`
        relative p-2 rounded-xl text-white text-sm font-medium cursor-pointer
        transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${getEventColor(event.type, event.status)}
        ${className}
      `}
      style={{
        background: event.color || undefined
      }}
    >
      <div className="flex items-center space-x-1 mb-1">
        {getStatusIcon(event.type, event.status)}
        <span className="text-xs opacity-90">
          {formatTime(event.start)}
        </span>
      </div>

      <div className="font-semibold text-sm leading-tight">
        {event.title}
      </div>

      {event.description && (
        <div className="text-xs opacity-80 mt-1 line-clamp-2">
          {event.description}
        </div>
      )}

      {event.type === 'trip' && event.status && (
        <div className="absolute top-1 right-1">
          <div className={`
            w-2 h-2 rounded-full
            ${event.status === 'in-progress' ? 'bg-green-300' :
              event.status === 'completed' ? 'bg-gray-300' :
                event.status === 'cancelled' ? 'bg-red-300' : 'bg-blue-300'}
          `} />
        </div>
      )}
    </div>
  );
}
