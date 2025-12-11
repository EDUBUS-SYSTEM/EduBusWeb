"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TripTable from "@/components/admin/TripTable";
import TripDetails from "@/components/admin/TripDetails";
import CreateTripModal from "@/components/admin/CreateTripModal";
import EditTripModal from "@/components/admin/EditTripModal";
import GenerateTripsModal from "@/components/admin/GenerateTripsModal";
import Calendar from "@/components/calendar/Calendar";
import { TripDto, CreateTripDto, UpdateTripDto, CalendarEvent, CalendarView } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  setFilters,
  setCurrentPage,
  setPerPage,
  generateTripsFromSchedule
} from "@/store/slices/tripsSlice";
import { FaPlus, FaTable, FaCalendarAlt, FaMapMarkedAlt, FaUsers, FaClock } from 'react-icons/fa';
import LiveTripMonitoring from "@/components/admin/LiveTripMonitoring";

type ViewMode = 'table' | 'calendar' | 'live';

export default function TripManagementPage() {
  const dispatch = useAppDispatch();
  const { trips, loading, error, pagination, filters } = useAppSelector(state => state.trips);

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    date: new Date()
  });

  // Filters - managed through Redux
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalToday: 0,
    activeRoutes: 0,
    studentsTransported: 0,
    onTimePerformance: 0
  });

  // Fetch trips with current filters
  const fetchTripsData = useCallback(() => {
    // Use a large page size so we always retrieve the full list (past + present + future)
    const perPageAll = 1000;
    const params = {
      page: pagination.currentPage,
      perPage: perPageAll,
      routeId: routeFilter !== 'all' ? routeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      serviceDate: dateFilter || undefined,
      // Keep date window wide so backend doesn't drop past trips
      startDate: '1900-01-01',
      endDate: '2100-12-31',
      sortBy: filters.sortBy || 'serviceDate',
      sortOrder: filters.sortOrder || 'desc',
    };

    dispatch(fetchTrips(params));
  }, [dispatch, pagination.currentPage, pagination.perPage, routeFilter, statusFilter, dateFilter, filters.sortBy, filters.sortOrder]);

  // Load trips when filters or pagination changes
  useEffect(() => {
    fetchTripsData();
  }, [fetchTripsData]);

  // Update stats when trips change
  useEffect(() => {
    if (trips && trips.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tripsToday = trips.filter(t => {
        const serviceDate = new Date(t.serviceDate);
        return serviceDate >= today && serviceDate < tomorrow;
      });

      const uniqueRoutes = new Set(trips.map(t => t.routeId));

      // Calculate students transported (estimated from completed trips and stops)
      const studentsTransported = trips
        .filter(t => t.status === 'Completed')
        .reduce((sum, trip) => {
          return sum + (trip.stops?.length || 0);
        }, 0);

      // Calculate on-time performance (trips that started within 5 minutes of planned time)
      const onTimeTrips = trips.filter(t => {
        if (!t.startTime) return false;
        const plannedStart = new Date(t.plannedStartAt);
        const actualStart = new Date(t.startTime);
        const diffMinutes = Math.abs((actualStart.getTime() - plannedStart.getTime()) / (1000 * 60));
        return diffMinutes <= 5;
      }).length;

      const onTimePerformance = trips.length > 0
        ? Math.round((onTimeTrips / trips.length) * 100)
        : 0;

      setStats({
        total: pagination.totalItems,
        scheduled: trips.filter(t => t.status === 'Scheduled').length,
        inProgress: trips.filter(t => t.status === 'InProgress').length,
        completed: trips.filter(t => t.status === 'Completed').length,
        cancelled: trips.filter(t => t.status === 'Cancelled').length,
        totalToday: tripsToday.length,
        activeRoutes: uniqueRoutes.size,
        studentsTransported: studentsTransported,
        onTimePerformance: onTimePerformance
      });
    } else {
      setStats({
        total: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        totalToday: 0,
        activeRoutes: 0,
        studentsTransported: 0,
        onTimePerformance: 0
      });
    }
  }, [trips, pagination.totalItems]);

  const loadRoutes = async () => {
    try {
      // TODO: Replace with actual route service
      // const routesData = await routeService.getAllRoutes();
      // setRoutes(routesData.map(r => ({ id: r.id, routeName: r.name })));
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      // TODO: Replace with actual schedule service
      // const schedulesData = await scheduleService.getAllSchedules();
      // setSchedules(schedulesData.map(s => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  useEffect(() => {
    loadRoutes();
    loadSchedules();
  }, []);

  const handleCreateTrip = async (tripData: CreateTripDto) => {
    await dispatch(createTrip(tripData)).unwrap();
    setShowCreateModal(false);
    fetchTripsData();
  };

  const handleUpdateTrip = async (tripData: UpdateTripDto) => {
    await dispatch(updateTrip({ id: tripData.id, data: tripData })).unwrap();
    setShowEditModal(false);
    setSelectedTrip(null);
    fetchTripsData();
  };

  const handleDeleteTrip = async (trip: TripDto) => {
    if (!confirm(`Are you sure you want to delete this trip?`)) {
      return;
    }

    try {
      await dispatch(deleteTrip(trip.id)).unwrap();
      if (selectedTrip?.id === trip.id) {
        setShowDetailsModal(false);
        setSelectedTrip(null);
      }
      fetchTripsData(); // Refresh trips
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const handleGenerateTrips = async (scheduleId: string, startDate: string, endDate: string) => {
    try {
      // Convert dates to ISO format for API
      const startDateIso = new Date(startDate).toISOString();
      const endDateIso = new Date(endDate).toISOString();

      // Dispatch the generate action
      const result = await dispatch(generateTripsFromSchedule({
        scheduleId,
        startDate: startDateIso,
        endDate: endDateIso
      })).unwrap();

      // Refresh trips list after successful generation
      fetchTripsData();

      // Show success message
      alert(`Successfully generated ${result.length} trip(s)!`);

      // Close modal
      setShowGenerateModal(false);
    } catch (error: unknown) {
      // Error is handled by Redux, but we need to extract it for the modal
      let errorMessage = 'Failed to generate trips. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        if (axiosError.response?.data) {
          if (axiosError.response.data.message) {
            errorMessage = axiosError.response.data.message;
          }
          if (axiosError.response.data.error) {
            errorMessage += `: ${axiosError.response.data.error}`;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Re-throw so modal can display it
      throw new Error(errorMessage);
    }
  };

  const handleViewTrip = (trip: TripDto) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const handleEditTrip = (trip: TripDto) => {
    setSelectedTrip(trip);
    setShowEditModal(true);
  };

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    dispatch(setFilters({ sortBy: column, sortOrder: order }));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handlePerPageChange = (value: number) => {
    dispatch(setPerPage(value));
  };

  // No client-side filtering needed since search is removed
  const filteredTrips = trips;

  // Get unique routes from trips for dropdown
  const availableRoutes = useMemo(() => {
    const routeMap = new Map<string, string>();
    trips.forEach(trip => {
      if (trip.routeId && trip.routeName) {
        routeMap.set(trip.routeId, trip.routeName);
      }
    });
    return Array.from(routeMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([routeId, routeName]) => ({
        id: routeId,
        name: routeName
      }));
  }, [trips]);

  // Convert trips to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    // Filter trips by route if routeFilter is set
    const tripsToShow = routeFilter === 'all'
      ? filteredTrips
      : filteredTrips.filter(trip => trip.routeId === routeFilter);

    return tripsToShow.map(trip => {
      // Use schedule snapshot times if available, otherwise use planned times
      const serviceDate = new Date(trip.serviceDate);

      // Parse schedule times (format: HH:mm or similar)
      const parseTimeString = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours, minutes };
      };

      let startDate: Date;
      let endDate: Date;

      if (trip.scheduleSnapshot?.startTime && trip.scheduleSnapshot?.endTime) {
        const startTime = parseTimeString(trip.scheduleSnapshot.startTime);
        const endTime = parseTimeString(trip.scheduleSnapshot.endTime);

        startDate = new Date(serviceDate);
        startDate.setHours(startTime.hours, startTime.minutes, 0, 0);

        endDate = new Date(serviceDate);
        endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
      } else {
        startDate = new Date(trip.plannedStartAt);
        endDate = new Date(trip.plannedEndAt);
      }

      // Map status to calendar event status
      const statusMap: Record<string, "planned" | "in-progress" | "completed" | "cancelled"> = {
        'Scheduled': 'planned',
        'InProgress': 'in-progress',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      };

      // Color based on status
      const colorMap: Record<string, string> = {
        'Scheduled': '#3B82F6', // blue
        'InProgress': '#10B981', // green
        'Completed': '#6B7280', // gray
        'Cancelled': '#EF4444' // red
      };

      return {
        id: trip.id,
        title: trip.scheduleSnapshot?.name || `Trip ${trip.id.substring(0, 8)}`,
        start: startDate,
        end: endDate,
        allDay: false,
        color: colorMap[trip.status] || '#3B82F6',
        type: 'trip',
        description: `${trip.routeName || trip.routeId} | Status: ${trip.status}`,
        routeId: trip.routeId,
        tripId: trip.id,
        status: statusMap[trip.status] || 'planned',
        metadata: {
          trip: trip
        }
      };
    });
  }, [filteredTrips, routeFilter]);

  const handleCalendarEventClick = (event: CalendarEvent) => {
    const trip = trips.find(t => t.id === event.tripId);
    if (trip) {
      handleViewTrip(trip);
    }
  };

  const [initialServiceDate, setInitialServiceDate] = useState<string>('');

  const handleCalendarEventCreate = (date: Date) => {
    // Set the service date to the clicked date (YYYY-MM-DD format) in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const serviceDate = `${year}-${month}-${day}`;
    setInitialServiceDate(serviceDate);
    setShowCreateModal(true);
  };

  const handleCalendarEventMove = async (eventId: string, newStart: Date, newEnd: Date) => {
    try {
      const trip = trips.find(t => t.id === eventId);
      if (!trip) return;

      const updateData: UpdateTripDto = {
        id: trip.id,
        routeId: trip.routeId,
        serviceDate: newStart.toISOString().split('T')[0],
        plannedStartAt: newStart.toISOString(),
        plannedEndAt: newEnd.toISOString(),
        startTime: trip.startTime,
        endTime: trip.endTime,
        status: trip.status,
        vehicleId: trip.vehicleId,
        driverVehicleId: trip.driverVehicleId,
        vehicle: trip.vehicle,
        driver: trip.driver,
        scheduleSnapshot: trip.scheduleSnapshot,
        stops: trip.stops
      };

      await handleUpdateTrip(updateData);
    } catch (error) {
      console.error('Error moving trip:', error);
      alert('Failed to move trip. Please try again.');
    }
  };

  const handleCalendarDateChange = (date: Date) => {
    setCalendarView({ ...calendarView, date });
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    dispatch(setCurrentPage(1));
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    dispatch(setCurrentPage(1));
  };

  const handleRouteFilterChange = (value: string) => {
    setRouteFilter(value);
    dispatch(setCurrentPage(1));
  };

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Page Header with Create Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#463B3B]">
              Trip Management
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold"
            >
              <FaPlus />
              Create Trip
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Today</p>
                  <p className="text-lg font-bold text-[#463B3B]">{stats.totalToday}</p>
                </div>
                <FaCalendarAlt className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Routes</p>
                  <p className="text-lg font-bold text-green-600">{stats.activeRoutes}</p>
                </div>
                <FaMapMarkedAlt className="w-5 h-5 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Students</p>
                  <p className="text-lg font-bold text-orange-600">{stats.studentsTransported}</p>
                </div>
                <FaUsers className="w-5 h-5 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">On-time</p>
                  <p className="text-lg font-bold text-blue-600">{stats.onTimePerformance}%</p>
                </div>
                <FaClock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters and View Toggle for Table */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    placeholder="Filter by date"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('table')}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 bg-white text-[#463B3B] shadow-sm"
                  >
                    <FaTable className="w-4 h-4" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('live')}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                  >
                    <FaMapMarkedAlt className="w-4 h-4" />
                    Live
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Toggle for Calendar */}
          {viewMode === 'calendar' && (
            <div className="mb-4 flex justify-end">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <FaTable className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 bg-white text-[#463B3B] shadow-sm"
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('live')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <FaMapMarkedAlt className="w-4 h-4" />
                  Live
                </button>
              </div>
            </div>
          )}

          {/* View Toggle for Live */}
          {viewMode === 'live' && (
            <div className="mb-4 flex justify-end">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <FaTable className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-800"
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('live')}
                  className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 bg-white text-[#463B3B] shadow-sm"
                >
                  <FaMapMarkedAlt className="w-4 h-4" />
                  Live
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'table' ? (
            <TripTable
              trips={filteredTrips}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              perPage={pagination.perPage}
              totalItems={pagination.totalItems}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
              onView={handleViewTrip}
              onEdit={handleEditTrip}
              onDelete={handleDeleteTrip}
              sortBy={filters.sortBy || 'serviceDate'}
              sortOrder={filters.sortOrder || 'desc'}
              onSort={handleSort}
            />
          ) : viewMode === 'calendar' ? (
            <div className="bg-white rounded-2xl shadow-soft-lg border border-gray-100">
              <Calendar
                events={calendarEvents}
                view={calendarView}
                onViewChange={setCalendarView}
                onEventClick={handleCalendarEventClick}
                onEventCreate={handleCalendarEventCreate}
                onEventMove={handleCalendarEventMove}
                onDateChange={handleCalendarDateChange}
                routes={availableRoutes}
                selectedRoute={routeFilter}
                onRouteChange={handleRouteFilterChange}
              />
            </div>
          ) : (
            <LiveTripMonitoring />
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setInitialServiceDate('');
          }}
          onSubmit={handleCreateTrip}
          initialServiceDate={initialServiceDate}
          existingTrips={trips}
        />
      )}

      {showEditModal && selectedTrip && (
        <EditTripModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTrip(null);
          }}
          onSubmit={handleUpdateTrip}
          trip={selectedTrip}
        />
      )}

      {showGenerateModal && (
        <GenerateTripsModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSubmit={handleGenerateTrips}
        />
      )}

      {showDetailsModal && selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTrip(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            handleEditTrip(selectedTrip);
          }}
          onDelete={() => {
            handleDeleteTrip(selectedTrip);
          }}
        />
      )}
    </div>
  );
}