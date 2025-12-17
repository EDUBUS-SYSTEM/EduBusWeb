"use client";

import React from 'react';
import { FaFilter, FaSearch, FaCalendarAlt } from 'react-icons/fa';

export interface TripFilters {
  routeId?: string;
  status?: string;
  serviceDate?: string;
  startDate?: string;
  endDate?: string;
  upcomingDays?: number;
  searchTerm?: string;
}

interface TripFilterBarProps {
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
  onReset: () => void;
  routes?: { id: string; routeName: string }[];
}

export default function TripFilterBar({
  filters,
  onFiltersChange,
  onReset,
  routes = []
}: TripFilterBarProps) {
  const handleFilterChange = (key: keyof TripFilters, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#463B3B] flex items-center gap-2">
          <FaFilter className="text-[#fad23c]" />
          Filters & Search
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Route
          </label>
          <select
            value={filters.routeId || ''}
            onChange={(e) => handleFilterChange('routeId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value="">All Routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.routeName}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Date
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.serviceDate || ''}
              onChange={(e) => handleFilterChange('serviceDate', e.target.value || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upcoming Days
          </label>
          <input
            type="number"
            min="1"
            max="30"
            placeholder="e.g., 7"
            value={filters.upcomingDays || ''}
            onChange={(e) => handleFilterChange('upcomingDays', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

