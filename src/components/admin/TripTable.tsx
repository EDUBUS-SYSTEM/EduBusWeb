"use client";

import React, { useState } from 'react';
import { TripDto } from '@/types';
import { FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatDate, formatDateTimeShort } from '@/utils/dateUtils';

interface TripTableProps {
  trips: TripDto[];
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems: number; // ADD THIS PROP
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onView: (trip: TripDto) => void;
  onEdit: (trip: TripDto) => void;
  onDelete: (trip: TripDto) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

// Tooltip component
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  className?: string;
}> = ({ children, content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TripTable({
  trips,
  currentPage,
  totalPages,
  perPage,
  totalItems,
  onPageChange,
  onPerPageChange,
  onView,
  onEdit,
  onDelete,
  sortBy = 'serviceDate',
  sortOrder = 'desc',
  onSort
}: TripTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      InProgress: { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' },
      Completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Scheduled;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Using centralized formatDate and formatDateTime from @/utils/dateUtils

  const getScheduleTime = (trip: TripDto, timeType: 'start' | 'end') => {
    // Use schedule snapshot time if available
    if (trip.scheduleSnapshot) {
      const timeStr = timeType === 'start' ? trip.scheduleSnapshot.startTime : trip.scheduleSnapshot.endTime;
      if (timeStr) {
        const serviceDate = new Date(trip.serviceDate);
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(serviceDate);
        date.setHours(hours, minutes, 0, 0);
        return formatDateTimeShort(date.toISOString());
      }
    }
    // Fallback to planned time
    return formatDateTimeShort(timeType === 'start' ? trip.plannedStartAt : trip.plannedEndAt);
  };

  const handleSort = (column: string) => {
    if (!onSort) return;
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Truncate route name helper
  const truncateRouteName = (routeName: string, maxLength: number = 20): string => {
    if (!routeName) return 'N/A';
    if (routeName.length <= maxLength) return routeName;
    return routeName.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('serviceDate')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon column="serviceDate" />
                </div>
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Route
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('plannedStartAt')}
              >
                <div className="flex items-center gap-1">
                  Start
                  <SortIcon column="plannedStartAt" />
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('plannedEndAt')}
              >
                <div className="flex items-center gap-1">
                  End
                  <SortIcon column="plannedEndAt" />
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                Stops
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trips.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                  No trips found
                </td>
              </tr>
            ) : (
              trips.map((trip) => {
                const displayRouteName = truncateRouteName(trip.routeName || trip.routeId);
                const fullRouteName = trip.routeName || trip.routeId;
                const showTooltip = (trip.routeName || trip.routeId).length > 20;

                return (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(trip.serviceDate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {showTooltip ? (
                        <Tooltip content={fullRouteName}>
                          <span className="cursor-help underline decoration-dotted">
                            {displayRouteName}
                          </span>
                        </Tooltip>
                      ) : (
                        <span>{displayRouteName}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {getScheduleTime(trip, 'start')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {getScheduleTime(trip, 'end')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${trip.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          trip.status === 'InProgress' ? 'bg-green-100 text-green-800' :
                            trip.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {trip.status === 'InProgress' ? 'In Progress' : trip.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-900">
                      {trip.stops.length}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(trip)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(trip)}
                          className="text-yellow-600 hover:text-yellow-900 p-1.5 hover:bg-yellow-50 rounded transition-colors"
                          title="Edit Trip"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(trip)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete Trip"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex flex-col items-center justify-center text-sm gap-3">
        <div className="text-gray-700">
          Showing <span className="font-semibold">{totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0}</span> to{" "}
          <span className="font-semibold">{Math.min(currentPage * perPage, totalItems)}</span> of{" "}
          <span className="font-semibold">{totalItems}</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-gray-700 px-2">
              {currentPage}/{totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}