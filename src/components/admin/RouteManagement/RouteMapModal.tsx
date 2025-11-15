'use client';

import React from 'react';
import { RouteDto } from '@/services/routeService/routeService.types';
import { FaTimes, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import VietMapComponent from './VietMapComponent';

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: RouteDto[];
  selectedRouteIds: string[];
  onRouteToggle: (routeId: string) => void;
  onSelectAllRoutes: () => void;
  onDeselectAllRoutes: () => void;
  schoolLocation?: { lat: number; lng: number };
}

// Stable color assignment - same as VietMapComponent
const ROUTE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

// Hash function for stable color assignment based on route ID
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get stable color for a route based on its ID
const getRouteColor = (routeId: string): string => {
  const hash = hashString(routeId);
  return ROUTE_COLORS[hash % ROUTE_COLORS.length];
};

const RouteMapModal: React.FC<RouteMapModalProps> = ({
  isOpen,
  onClose,
  routes,
  selectedRouteIds,
  onRouteToggle,
  onSelectAllRoutes,
  onDeselectAllRoutes,
  schoolLocation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Route Map - Full View
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
            <VietMapComponent
              routes={routes}
              selectedRouteIds={selectedRouteIds}
              className="w-full h-full"
              showControls={true}
              markerSize="large"
              strokeWeight={6}
              schoolLocation={schoolLocation}
            />
          </div>

          {/* Route Selection Panel */}
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Selection</h3>
              
              {/* Quick Actions */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={onSelectAllRoutes}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={onDeselectAllRoutes}
                  className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Deselect All
                </button>
              </div>

              {/* Route List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Available Routes ({routes.length})
                </h4>
                {routes.map((route) => {
                  const isSelected = selectedRouteIds.includes(route.id);
                  // Use stable color based on route ID - same as map
                  const color = getRouteColor(route.id);
                  const totalStudents = route.pickupPoints.reduce((sum, point) => sum + point.studentCount, 0);
                  
                  return (
                    <div
                      key={route.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => onRouteToggle(route.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 text-sm">
                              {route.routeName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {totalStudents}/{route.vehicleCapacity} students • {route.pickupPoints.length} stops
                            </div>
                            <div className="text-xs text-gray-400">
                              {route.vehicleNumberPlate}
                            </div>
                          </div>
                        </div>
                        <div className="ml-2">
                          {isSelected ? (
                            <FaCheck className="text-blue-500" size={16} />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Routes Summary */}
              {selectedRouteIds.length > 0 && (
                <div className="mt-6 p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Selected Routes ({selectedRouteIds.length})
                  </h4>
                  <div className="space-y-1">
                    {selectedRouteIds.map((routeId) => {
                      const route = routes.find(r => r.id === routeId);
                      if (!route) return null;
                      // Use stable color based on route ID - same as map
                      const color = getRouteColor(routeId);
                      return (
                        <div key={routeId} className="flex items-center text-xs">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-green-700">{route.routeName}</span>
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

export default RouteMapModal;