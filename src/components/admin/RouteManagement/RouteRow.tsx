// EduBusWeb/src/components/admin/RouteManagement/RouteRow.tsx
import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { FaBus, FaUser } from 'react-icons/fa';
import { RouteDto, PickupPointInfoDto } from '@/services/routeService/routeService.types';

interface RouteRowProps {
  route: RouteDto;
  onRouteClick: (route: RouteDto) => void;
  isModified: boolean;
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

const RouteRow: React.FC<RouteRowProps> = ({ route, onRouteClick, isModified }) => {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 11): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const tooltipContent = (
    <div>
      <div className="font-semibold">{route.routeName}</div>
      <div className="text-xs text-gray-300">Plate: {route.vehicleNumberPlate}</div>
    </div>
  );

  return (
    <Droppable droppableId={route.id} direction="horizontal">
      {(provided) => (
        <div className={`bg-yellow-200 p-4 rounded shadow-md flex items-center relative ${isModified ? 'ring-2 ring-red-400' : ''}`}>
          {/* Modification Indicator */}
          {isModified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
          
          <Tooltip content={tooltipContent}>
            <div
              className="w-40 flex-shrink-0 cursor-pointer hover:opacity-80"
              onClick={() => onRouteClick(route)}
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

          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex space-x-2 overflow-x-auto flex-1 min-w-[150px] min-h-[80px] border-2 border-dashed border-gray-300 rounded"
          >
            {route.pickupPoints.map((point, index) => (
              <Draggable
                key={point.pickupPointId}
                draggableId={point.pickupPointId}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-blue-100 p-2 rounded flex items-center min-w-[120px]"
                  >
                    <FaUser className="mr-2" />
                    {point.pickupPointId} ({point.studentCount})
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default RouteRow;