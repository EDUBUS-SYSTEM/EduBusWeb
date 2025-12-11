// EduBusWeb/src/components/admin/LiveVehicleMapModal.tsx
'use client';

import React from 'react';
import { TripDto } from '@/types';
import { LocationUpdateData } from '@/store/slices/liveTripsSlice';
import { FaTimes, FaMapMarkerAlt, FaBus, FaCheck, FaCrosshairs } from 'react-icons/fa'; // ✅ Added FaCrosshairs
import LiveVehicleMap from './LiveVehicleMap';
import { formatTime } from '@/utils/dateUtils';

interface LiveVehicleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripDto[];
  locationUpdates: Record<string, LocationUpdateData>;
  selectedTripIds: string[];
  onTripToggle: (tripId: string) => void;
  onSelectAllTrips: () => void;
  onDeselectAllTrips: () => void;
  schoolLocation?: { lat: number; lng: number };
}

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

const LiveVehicleMapModal: React.FC<LiveVehicleMapModalProps> = ({
  isOpen,
  onClose,
  trips,
  locationUpdates,
  selectedTripIds,
  onTripToggle,
  onSelectAllTrips,
  onDeselectAllTrips,
  schoolLocation
}) => {
  // ✅ Added: State to track which trip to focus on
  const [focusTripId, setFocusTripId] = React.useState<string | null>(null);

  // ✅ Added: Handler to focus on a trip
  const handleFocusTrip = (tripId: string) => {
    setFocusTripId(tripId);
    // Reset after a short delay so it can be triggered again
    setTimeout(() => setFocusTripId(null), 100);
  };

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
              selectedTripIds={selectedTripIds}
              focusTripId={focusTripId} // ✅ Pass focus trip ID
              className="w-full h-full"
              showControls={true}
              schoolLocation={schoolLocation}
            />
          </div>

          {/* Trip Selection Panel */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaBus className="mr-2 text-blue-500" />
                  Ongoing Trips ({trips.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={onSelectAllTrips}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Select All
                  </button>
                  <button
                    onClick={onDeselectAllTrips}
                    className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>

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
                    const isSelected = selectedTripIds.includes(trip.id);
                    const color = getVehicleColor(trip.id);

                    return (
                      <div
                        key={trip.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => onTripToggle(trip.id)}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white"
                                style={{ backgroundColor: isSelected ? color : '#ccc' }}
                              />
                              {isSelected && (
                                <FaCheck className="text-blue-500 text-xs" style={{ marginLeft: '-24px', marginTop: '2px' }} />
                              )}
                              <div className="font-medium text-gray-800 text-sm">
                                {trip.routeName || 'Unknown Route'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1 ml-6">
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
                                    Updated: {formatTime(locationUpdate.timestamp)}
                                  </div>
                                </>
                              ) : (
                                <div className="text-yellow-600 text-xs">
                                  ⚠️ No location data
                                </div>
                              )}
                            </div>
                          </div>
                          {/* ✅ Added: Focus button for selected trips */}
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFocusTrip(trip.id);
                              }}
                              className="ml-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                              title="Focus on this vehicle"
                            >
                              <FaCrosshairs size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Route Legend */}
              {selectedTripIds.length > 0 && (
                <div className="mt-6 p-3 border-t bg-white rounded-lg">
                  <div className="text-xs text-gray-600 mb-2 font-medium">
                    Showing routes ({selectedTripIds.length}):
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedTripIds.map((tripId) => {
                      const trip = trips.find(t => t.id === tripId);
                      if (!trip) return null;
                      
                      const color = getVehicleColor(tripId);
                      
                      return (
                        <div key={tripId} className="flex items-center justify-between text-xs">
                          <div className="flex items-center flex-1">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-gray-700 truncate max-w-32">
                              {trip.routeName || 'Unknown Route'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* ✅ Added: Focus button in legend */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFocusTrip(tripId);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Focus on vehicle"
                            >
                              <FaCrosshairs size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTripToggle(tripId);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Hide route"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVehicleMapModal;