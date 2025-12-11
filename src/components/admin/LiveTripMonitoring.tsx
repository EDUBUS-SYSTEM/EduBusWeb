"use client";

import React, { useState, useEffect } from 'react';
import { useLiveTripMonitoring } from '@/hooks/useLiveTripMonitoring';
import { useAppDispatch } from '@/store/hooks';
import { toggleTripSelection, selectAllTrips, deselectAllTrips } from '@/store/slices/liveTripsSlice';
import { FaMapMarkerAlt, FaMap, FaUser, FaCar, FaClock, FaUsers, FaCheckCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import LiveVehicleMapModal from './LiveVehicleMapModal';
import TripDetails from './TripDetails';
import { TripDto, TripStopDto, ParentAttendanceDto } from '@/types';
import { tripService } from '@/services/tripService';
import { schoolService } from '@/services/schoolService/schoolService.api';
import { formatTime } from '@/utils/dateUtils';

export default function LiveTripMonitoring() {
  const dispatch = useAppDispatch();
  const {
    connectionStatus,
    ongoingTrips,
    locationUpdates,
    attendanceUpdates,
    selectedTripIds, // ✅ Get from Redux via hook
    stats,
    loading,
    getLocationUpdate,
    refreshTrips
  } = useLiveTripMonitoring();

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [loadingTripDetails, setLoadingTripDetails] = useState(false);
  const [schoolLocation, setSchoolLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

  // Load school location for map center and school marker
  useEffect(() => {
    let isMounted = true;

    const loadSchoolLocation = async () => {
      try {
        const school = await schoolService.getForAdmin();
        if (school.latitude && school.longitude && isMounted) {
          setSchoolLocation({
            lat: school.latitude,
            lng: school.longitude,
          });
        }
      } catch (error) {
        console.error('Error loading school location for live map:', error);
        // Nếu lỗi thì map sẽ tự dùng default location trong LiveVehicleMap
      }
    };

    loadSchoolLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Use Redux actions for trip selection
  const handleTripToggle = (tripId: string) => {
    dispatch(toggleTripSelection(tripId));
  };

  const handleSelectAllTrips = () => {
    dispatch(selectAllTrips());
  };

  const handleDeselectAllTrips = () => {
    dispatch(deselectAllTrips());
  };

  const handleTripCardClick = async (tripId: string) => {
    try {
      setLoadingTripDetails(true);
      const tripDetails = await tripService.getTripById(tripId);
      setSelectedTrip(tripDetails);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      alert('Failed to load trip details. Please try again.');
    } finally {
      setLoadingTripDetails(false);
    }
  };

  const getStatusBadge = (trip: TripDto) => {
    if (trip.status === 'InProgress') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">On Time</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Delayed</span>;
  };

  const getCurrentLocation = (trip: TripDto) => {
    const locationUpdate = getLocationUpdate(trip.id);
    if (locationUpdate) {
      return `Lat: ${locationUpdate.latitude.toFixed(6)}, Lng: ${locationUpdate.longitude.toFixed(6)}`;
    }
    return 'No location data';
  };

  const calculateProgress = (trip: TripDto) => {
    if (!trip.stops || trip.stops.length === 0) return 0;
    const completedStops = trip.stops.filter((s: TripStopDto) => s.actualArrival).length;
    return Math.round((completedStops / trip.stops.length) * 100);
  };

  const getAttendanceSummary = (trip: TripDto) => {
    const tripAttendanceUpdates = attendanceUpdates[trip.id];

    let total = 0;
    let present = 0;
    let absent = 0;
    let pending = 0;
    let late = 0;
    let excused = 0;

    const stopsWithRealTimeUpdates = tripAttendanceUpdates
      ? new Set(Object.keys(tripAttendanceUpdates).map(id => id.toLowerCase()))
      : new Set<string>();

    trip.stops?.forEach((stop: TripStopDto) => {
      const stopId = String(stop.id || '').toLowerCase();
      const hasRealTimeUpdate = stopId && stopsWithRealTimeUpdates.has(stopId);

      if (hasRealTimeUpdate && tripAttendanceUpdates) {
        const matchingStopId = Object.keys(tripAttendanceUpdates).find(id =>
          id.toLowerCase() === stopId
        );

        if (matchingStopId) {
          const stopUpdate = tripAttendanceUpdates[matchingStopId];
          if (stopUpdate && stopUpdate.attendance) {
            const summary = stopUpdate.attendance;
            total += summary.total || 0;
            present += summary.present || 0;
            absent += summary.absent || 0;
            pending += summary.pending || 0;
            late += summary.late || 0;
            excused += summary.excused || 0;
          }
        }
      } else {
        stop.attendance?.forEach((att: ParentAttendanceDto) => {
          total++;
          if (att.state === 'Present') present++;
          else if (att.state === 'Pending') pending++;
          else if (att.state === 'Absent') absent++;
          else if (att.state === 'Late') late++;
          else if (att.state === 'Excused') excused++;
        });
      }
    });

    return { total, present, pending, absent, late, excused };
  };

  if (loading && ongoingTrips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Loading trips...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 border border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
          <span className="text-sm text-gray-600">
            {connectionStatus === 'connected' ? 'Connected' :
              connectionStatus === 'connecting' ? 'Connecting...' :
                connectionStatus === 'reconnecting' ? 'Reconnecting...' :
                  'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors border border-blue-200"
            title="View all vehicles on map"
          >
            <FaMap className="w-4 h-4" />
            Map View
          </button>
          <button
            onClick={refreshTrips}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            <FaSync className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Active Trips</p>
              <p className="text-lg font-bold text-[#463B3B]">{stats.activeTrips}</p>
            </div>
            <FaMapMarkerAlt className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Students On Board</p>
              <p className="text-lg font-bold text-green-600">{stats.studentsOnBoard}</p>
            </div>
            <FaUsers className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">On-Time</p>
              <p className="text-lg font-bold text-blue-600">{stats.onTimeTrips}</p>
            </div>
            <FaCheckCircle className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Issues</p>
              <p className="text-lg font-bold text-red-600">{stats.issues}</p>
            </div>
            <FaExclamationTriangle className="w-5 h-5 text-red-500" />
          </div>
        </div> */}
      </div>

      {/* Trip Cards */}
      {ongoingTrips.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
          <FaMapMarkerAlt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No active trips at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ongoingTrips.map(trip => {
            const attendance = getAttendanceSummary(trip);
            const progress = calculateProgress(trip);
            const locationUpdate = getLocationUpdate(trip.id);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTripCardClick(trip.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#463B3B] text-sm">{trip.routeName || 'Unknown Route'}</h3>
                  {getStatusBadge(trip)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{trip.vehicle?.maskedPlate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUser className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{trip.driver?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs break-words">{getCurrentLocation(trip)}</span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progress: Stop {trip.stops?.filter((s: TripStopDto) => s.actualArrival).length || 0} of {trip.stops?.length || 0}</span>
                      <span className="font-semibold text-[#463B3B]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#fad23c] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <FaUsers className="w-3 h-3" />
                      <span>Attendance: {attendance.present}/{attendance.total}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-600 font-medium">✓ {attendance.present}</span>
                      <span className="text-yellow-600 font-medium">⏳ {attendance.pending}</span>
                      <span className="text-red-600 font-medium">✗ {attendance.absent}</span>
                    </div>
                  </div>

                  {locationUpdate && (
                    <div className="text-xs text-gray-500 pt-1 flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      <span>Updated: {formatTime(locationUpdate.timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Map Modal */}
      <LiveVehicleMapModal
        isOpen={isMapModalOpen}
        onClose={() => {
          setIsMapModalOpen(false);
          // Optional: Reset selection when modal closes
          // dispatch(deselectAllTrips());
        }}
        trips={ongoingTrips}
        locationUpdates={locationUpdates}
        selectedTripIds={selectedTripIds} // ✅ Pass from Redux
        onTripToggle={handleTripToggle} // ✅ Pass Redux action
        onSelectAllTrips={handleSelectAllTrips} // ✅ Pass Redux action
        onDeselectAllTrips={handleDeselectAllTrips} // ✅ Pass Redux action
        schoolLocation={schoolLocation}
      />

      {/* Trip Details Modal */}
      {isDetailsModalOpen && selectedTrip && (
        <TripDetails
          trip={selectedTrip}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {loadingTripDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading trip details...</p>
          </div>
        </div>
      )}
    </div>
  );
}