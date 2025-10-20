// EduBusWeb/src/components/admin/RouteManagement/RouteRow.tsx
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { FaBus, FaMapMarkerAlt, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { RouteDto } from '@/services/routeService/routeService.types';
import PickupPoint from './PickupPoint';

interface RouteRowProps {
  route: RouteDto;
  onRouteClick: (route: RouteDto) => void;
  onRouteMapToggle: (routeId: string) => void; // ✅ ADDED: Separate handler for map toggle
  onScheduleClick: (route: RouteDto) => void;
  isModified: boolean;
  isDraft: boolean;
  isSelectedInMap?: boolean;
}

// Simple Tooltip Component
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}> = ({ children, content, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          {content}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const RouteRow: React.FC<RouteRowProps> = ({
  route,
  onRouteClick,
  onRouteMapToggle,
  onScheduleClick,
  isModified,
  isDraft = false,
  isSelectedInMap = false
}) => {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 11): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const tooltipContent = (
    <div>
      <div className="font-semibold">{route.routeName}</div>
      <div className="text-xs text-gray-300">Plate: {route.vehicleNumberPlate}</div>
      {isSelectedInMap && (
        <div className="text-xs text-green-300 mt-1">📍 Visible on map</div>
      )}
    </div>
  );

  return (
    <Droppable droppableId={route.id} direction="horizontal">
      {(provided) => (
        <div className={`bg-yellow-200 p-4 rounded shadow-md flex items-center relative ${isModified ? 'ring-2 ring-red-400' : ''} ${isSelectedInMap ? 'ring-2 ring-blue-400' : ''}`}>
          {/* Modification Indicator */}
          {isModified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}

          {/* ✅ Map Selection Indicator */}
          {isSelectedInMap && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <FaMapMarkerAlt className="text-white" size={8} />
            </div>
          )}

          {/* ✅ Route Info Section - Click to toggle map visibility */}
          <Tooltip content={tooltipContent}>
            <div
              className="w-40 flex-shrink-0 cursor-pointer hover:opacity-80"
              onClick={() => onRouteMapToggle(route.id)} // ✅ Changed: Now toggles map visibility
            >
              {/* Line 1: Route name and capacity */}
              <h3 className="text-base font-bold leading-tight">
                {truncateText(route.routeName)} (
                {route.pickupPoints.reduce((sum, point) => sum + point.studentCount, 0)}/
                {route.vehicleCapacity})
              </h3>

              {/* Line 2: Bus icon + plate number */}
              <div className="flex items-center justify-start mt-1 space-x-2">
                <FaBus className="text-3xl text-gray-700" />
                <span className="text-sm font-semibold text-gray-800">
                  {route.vehicleNumberPlate}
                </span>
              </div>
            </div>
          </Tooltip>

          <div className="flex-shrink-0 ml-3 flex flex-col gap-2 items-center"
            style={{ visibility: isDraft ? 'hidden' : 'visible' }}>
            {/* Schedule Management Button */}
            <button
              onClick={() => onScheduleClick(route)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Manage schedules"
            >
              <FaCalendarAlt size={16} />
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onRouteClick(route)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit route"
            >
              <FaEdit size={16} />
            </button>
          </div>

          {/* Pickup Points Area */}
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex space-x-2 overflow-x-auto flex-1 min-w-[150px] min-h-[80px] border-2 border-dashed border-gray-300 rounded p-2"
          >
            {route.pickupPoints.map((point, index) => (
              <PickupPoint
                key={point.pickupPointId}
                point={point}
                index={index}
                className="m-1"
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default RouteRow;