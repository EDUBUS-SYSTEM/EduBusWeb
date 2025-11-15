// EduBusWeb/src/components/admin/LiveVehicleMapModal.tsx
'use client';

import React from 'react';
import { TripDto } from '@/types';
import { LocationUpdateData } from '@/store/slices/liveTripsSlice';
import { FaTimes, FaMapMarkerAlt, FaBus } from 'react-icons/fa';
import LiveVehicleMap from './LiveVehicleMap';

interface LiveVehicleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripDto[];
  locationUpdates: Record<string, LocationUpdateData>;
}

const LiveVehicleMapModal: React.FC<LiveVehicleMapModalProps> = ({
  isOpen,
  onClose,
  trips,
  locationUpdates
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Live Vehicle Tracking
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <LiveVehicleMap
              trips={trips}
              locationUpdates={locationUpdates}
              className="w-full h-full"
              showControls={true}
            />
          </div>

          {/* Vehicle List Panel */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaBus className="mr-2 text-blue-500" />
                Active Vehicles ({trips.length})
              </h3>

              {trips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaBus className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No active trips</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const locationUpdate = locationUpdates[trip.id];
                    const hasLocation = !!locationUpdate;

                    return (
                      <div
                        key={trip.id}
                        className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 text-sm mb-1">
                              {trip.routeName || 'Unknown Route'}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                <strong>Vehicle:</strong> {trip.vehicle?.maskedPlate || 'N/A'}
                              </div>
                              <div>
                                <strong>Driver:</strong> {trip.driver?.fullName || 'N/A'}
                              </div>
                              {hasLocation ? (
                                <>
                                  <div className="text-green-600 font-medium">
                                    🟢 Live Location
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {locationUpdate.speed ? `${locationUpdate.speed.toFixed(1)} km/h` : 'Speed: N/A'}
                                    {locationUpdate.isMoving ? ' • Moving' : ' • Stopped'}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Updated: {new Date(locationUpdate.timestamp).toLocaleTimeString()}
                                  </div>
                                </>
                              ) : (
                                <div className="text-yellow-600 text-xs">
                                  ⚠️ No location data
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                            style={{ backgroundColor: getVehicleColor(trip.id) }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function (same as in LiveVehicleMap)
const VEHICLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getVehicleColor = (tripId: string): string => {
  const hash = hashString(tripId);
  return VEHICLE_COLORS[hash % VEHICLE_COLORS.length];
};

export default LiveVehicleMapModal;