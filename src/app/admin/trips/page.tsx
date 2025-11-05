"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TripTable from "@/components/admin/TripTable";
import TripDetails from "@/components/admin/TripDetails";
import CreateTripModal from "@/components/admin/CreateTripModal";
import EditTripModal from "@/components/admin/EditTripModal";
import GenerateTripsModal from "@/components/admin/GenerateTripsModal";
import Calendar from "@/components/calendar/Calendar";
import { TripDto, CreateTripDto, UpdateTripDto, CalendarEvent, CalendarView } from "@/types";
import { tripService } from "@/services/tripService";
import { FaPlus, FaMagic, FaTable, FaCalendarAlt, FaSearch, FaMapMarkedAlt, FaUsers, FaClock } from 'react-icons/fa';

type ViewMode = 'table' | 'calendar';

export default function TripManagementPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'week',
    date: new Date()
  });
  
  // Calendar search (for future use)
  // const [calendarSearchTerm, setCalendarSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('serviceDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Calendar route filter
  const [routeFilter, setRouteFilter] = useState<string>('all');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  
  // Data for dropdowns
  const [routes] = useState<{ id: string; routeName: string }[]>([]);
  const [schedules] = useState<{ id: string; name: string }[]>([]);
  
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

  useEffect(() => {
    loadTrips();
    loadRoutes();
    loadSchedules();
  }, [currentPage, perPage, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // Generate mock trips for testing calendar
  const generateMockTrips = (): TripDto[] => {
    const today = new Date();
    const mockTrips: TripDto[] = [];
    const statuses: ("Scheduled" | "InProgress" | "Completed" | "Cancelled")[] = 
      ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
    
    // Generate trips for the current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i - today.getDay()); // Start from Sunday
      
      // Generate 2-4 trips per day
      const tripsPerDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < tripsPerDay; j++) {
        const startHour = Math.floor(Math.random() * 12) + 6; // Between 6 AM and 6 PM
        const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
        const duration = Math.floor(Math.random() * 3 + 1) * 60; // 1-3 hours
        
        const plannedStartAt = new Date(date);
        plannedStartAt.setHours(startHour, startMinute, 0, 0);
        
        const plannedEndAt = new Date(plannedStartAt);
        plannedEndAt.setMinutes(plannedStartAt.getMinutes() + duration);
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const routeNum = Math.floor(Math.random() * 5) + 1;
        mockTrips.push({
          id: `mock-trip-${i}-${j}`,
          routeId: `route-${routeNum}`,
          serviceDate: date.toISOString().split('T')[0],
          plannedStartAt: plannedStartAt.toISOString(),
          plannedEndAt: plannedEndAt.toISOString(),
          status: status,
          scheduleSnapshot: {
            scheduleId: `schedule-${i}-${j}`,
            name: `Route ${routeNum} - ${startHour < 12 ? 'Morning' : startHour < 17 ? 'Afternoon' : 'Evening'}`,
            startTime: plannedStartAt.toISOString(),
            endTime: plannedEndAt.toISOString(),
            rRule: 'FREQ=DAILY'
          },
          stops: [],
          createdAt: new Date().toISOString()
        });
      }
    }
    
    return mockTrips;
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        perPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceDate: dateFilter || undefined,
        sortBy,
        sortOrder
      };
      
      let response;
      try {
        response = await tripService.getAllTrips(params);
        // If no data or empty response, use mock data
        if (!response.data || response.data.length === 0) {
          const mockTrips = generateMockTrips();
          response = {
            data: mockTrips,
            total: mockTrips.length,
            page: 1,
            perPage: mockTrips.length,
            totalPages: 1
          };
        }
      } catch (error) {
        // If API fails, use mock data
        console.warn('API call failed, using mock data:', error);
        const mockTrips = generateMockTrips();
        response = {
          data: mockTrips,
          total: mockTrips.length,
          page: 1,
          perPage: mockTrips.length,
          totalPages: 1
        };
      }
      
      setTrips(response.data || []);
      setTotalPages(response.totalPages || 1);
      
      // Calculate stats
      if (response.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tripsToday = response.data.filter(t => {
          const serviceDate = new Date(t.serviceDate);
          return serviceDate >= today && serviceDate < tomorrow;
        });
        
        const uniqueRoutes = new Set(response.data.map(t => t.routeId));
        
        // Calculate students transported (estimated from completed trips and stops)
        // Note: This is an estimate based on number of stops in completed trips
        // Actual student count should come from attendance data if available
        const studentsTransported = response.data
          .filter(t => t.status === 'Completed')
          .reduce((sum, trip) => {
            return sum + (trip.stops?.length || 0);
          }, 0);
        
        // Calculate on-time performance (trips that started within 5 minutes of planned time)
        const onTimeTrips = response.data.filter(t => {
          if (!t.startTime) return false;
          const plannedStart = new Date(t.plannedStartAt);
          const actualStart = new Date(t.startTime);
          const diffMinutes = Math.abs((actualStart.getTime() - plannedStart.getTime()) / (1000 * 60));
          return diffMinutes <= 5;
        }).length;
        const onTimePerformance = response.data.length > 0 
          ? Math.round((onTimeTrips / response.data.length) * 100) 
          : 0;
        
        const statsData = {
          total: response.total || 0,
          scheduled: response.data.filter(t => t.status === 'Scheduled').length,
          inProgress: response.data.filter(t => t.status === 'InProgress').length,
          completed: response.data.filter(t => t.status === 'Completed').length,
          cancelled: response.data.filter(t => t.status === 'Cancelled').length,
          totalToday: tripsToday.length,
          activeRoutes: uniqueRoutes.size,
          studentsTransported: studentsTransported,
          onTimePerformance: onTimePerformance
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateTrip = async (tripData: CreateTripDto) => {
    try {
      await tripService.createTrip(tripData);
      setShowCreateModal(false);
      loadTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const handleUpdateTrip = async (tripData: UpdateTripDto) => {
    try {
      await tripService.updateTrip(tripData.id, tripData);
      setShowEditModal(false);
      setSelectedTrip(null);
      loadTrips();
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip. Please try again.');
    }
  };

  const handleDeleteTrip = async (trip: TripDto) => {
    if (!confirm(`Are you sure you want to delete this trip?`)) {
      return;
    }

    try {
      await tripService.deleteTrip(trip.id);
      loadTrips();
      if (selectedTrip?.id === trip.id) {
        setShowDetailsModal(false);
        setSelectedTrip(null);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const handleGenerateTrips = async (scheduleId: string, startDate: string, endDate: string) => {
    try {
      await tripService.generateTripsFromSchedule(scheduleId, startDate, endDate);
      setShowGenerateModal(false);
      loadTrips();
      alert('Trips generated successfully!');
    } catch (error) {
      console.error('Error generating trips:', error);
      alert('Failed to generate trips. Please try again.');
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
    setSortBy(column);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const filteredTrips = trips.filter(trip => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        trip.routeId.toLowerCase().includes(searchLower) ||
        trip.id.toLowerCase().includes(searchLower) ||
        trip.status.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Get unique routes from trips for dropdown
  const availableRoutes = useMemo(() => {
    const routeSet = new Set<string>();
    trips.forEach(trip => {
      if (trip.routeId) {
        routeSet.add(trip.routeId);
      }
    });
    return Array.from(routeSet).sort().map(routeId => ({
      id: routeId,
      name: routeId
    }));
  }, [trips]);

  // Convert trips to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    // Filter trips by route if routeFilter is set
    const tripsToShow = routeFilter === 'all' 
      ? filteredTrips 
      : filteredTrips.filter(trip => trip.routeId === routeFilter);
    
    return tripsToShow.map(trip => {
      const startDate = new Date(trip.plannedStartAt);
      const endDate = new Date(trip.plannedEndAt);
      
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
        description: `Route: ${trip.routeId} | Status: ${trip.status}`,
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

  const handleCalendarEventCreate = (_date: Date) => {
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
        status: trip.status,
        scheduleSnapshot: trip.scheduleSnapshot,
        stops: trip.stops
      };
      
      await handleUpdateTrip(updateData);
    } catch (error) {
      console.error('Error moving trip:', error);
      alert('Failed to move trip. Please try again.');
    }
  };

  // const handleTodayClick = () => {
  //   const today = new Date();
  //   setCalendarView({ ...calendarView, date: today });
  // };

  const handleCalendarDateChange = (date: Date) => {
    setCalendarView({ ...calendarView, date });
  };

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6 justify-end">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              <FaMagic />
              Generate from Schedule
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 font-semibold"
            >
              <FaPlus />
              Create Trip
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Trip Management
            </h1>
            <p className="text-gray-600">
              Manage bus trips, schedules, and routes with our interactive calendar.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips Today</p>
                  <p className="text-2xl font-bold text-[#463B3B]">{stats.totalToday}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeRoutes}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <FaMapMarkedAlt className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students Transported</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.studentsTransported}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On-time Performance</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.onTimePerformance}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and View Toggle */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl shadow-soft-lg p-6 border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search trips..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
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
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                    placeholder="Filter by date"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-white text-[#463B3B] shadow-sm"
                  >
                    <FaTable />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                  >
                    <FaCalendarAlt />
                    Calendar
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* View Toggle for Calendar */}
          {viewMode === 'calendar' && (
            <div className="mb-6 flex justify-end">
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <FaTable />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 bg-white text-[#463B3B] shadow-sm"
                >
                  <FaCalendarAlt />
                  Calendar
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'table' ? (
            <TripTable
              trips={filteredTrips}
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setCurrentPage(1);
              }}
              onView={handleViewTrip}
              onEdit={handleEditTrip}
              onDelete={handleDeleteTrip}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          ) : (
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
                onRouteChange={setRouteFilter}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateTripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTrip}
          routes={routes}
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
          routes={routes}
        />
      )}

      {showGenerateModal && (
        <GenerateTripsModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSubmit={handleGenerateTrips}
          schedules={schedules}
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
