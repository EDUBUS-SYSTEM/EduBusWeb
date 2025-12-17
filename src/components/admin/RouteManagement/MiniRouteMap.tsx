'use client';

import React, { useState } from 'react';
import { RouteDto } from '@/services/routeService/routeService.types';
import { FaMapMarkerAlt, FaExpand } from 'react-icons/fa';
import VietMapComponent from './VietMapComponent';
import RouteMapModal from './RouteMapModal';

interface MiniRouteMapProps {
  routes: RouteDto[];
  selectedRouteIds: string[];
  onRouteToggle: (routeId: string) => void;
  onSelectAllRoutes: () => void;
  onDeselectAllRoutes: () => void;
  schoolLocation?: { lat: number; lng: number };
}

const ROUTE_COLORS = [
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

const getRouteColor = (routeId: string): string => {
  const hash = hashString(routeId);
  return ROUTE_COLORS[hash % ROUTE_COLORS.length];
};

const MiniRouteMap: React.FC<MiniRouteMapProps> = ({
  routes,
  selectedRouteIds,
  onRouteToggle,
  onSelectAllRoutes,
  onDeselectAllRoutes,
  schoolLocation
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border w-80 h-60 z-50">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" size={14} />
            Route Map
          </h3>
          <div className="flex items-center space-x-2">
            {routes.length > 0 && (
              <>
                <button
                  onClick={onSelectAllRoutes}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                  title="Show all routes"
                >
                  All
                </button>
                <button
                  onClick={onDeselectAllRoutes}
                  className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50"
                  title="Hide all routes"
                >
                  None
                </button>
              </>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Open full map"
            >
              <FaExpand size={14} />
            </button>
          </div>
        </div>

        <div className="relative">
          <VietMapComponent
            routes={routes}
            selectedRouteIds={selectedRouteIds}
            className="h-44 w-full cursor-pointer"
            showControls={false}
            markerSize="small"
            strokeWeight={3}
            schoolLocation={schoolLocation}
          />
          
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {selectedRouteIds.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <div className="text-xs text-gray-600 mb-2">Showing routes:</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {selectedRouteIds.map((routeId) => {
                const route = routes.find(r => r.id === routeId);
                if (!route) return null;
                
                const color = getRouteColor(routeId);
                
                return (
                  <div key={routeId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-700 truncate max-w-32">
                        {route.routeName}
                      </span>
                    </div>
                    <button
                      onClick={() => onRouteToggle(routeId)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Hide route"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <RouteMapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        onRouteToggle={onRouteToggle}
        onSelectAllRoutes={onSelectAllRoutes}
        onDeselectAllRoutes={onDeselectAllRoutes}
        schoolLocation={schoolLocation}
      />
    </>
  );
};

export default MiniRouteMap;