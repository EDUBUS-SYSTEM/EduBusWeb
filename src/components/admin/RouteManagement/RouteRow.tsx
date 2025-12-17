import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { FaBus, FaMapMarkerAlt, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { RouteDto } from '@/services/routeService/routeService.types';
import PickupPoint from './PickupPoint';

interface RouteRowProps {
  route: RouteDto;
  onRouteClick: (route: RouteDto) => void;
  onRouteMapToggle: (routeId: string) => void;
  onScheduleClick: (route: RouteDto) => void;
  isModified: boolean;
  isDraft: boolean;
  isSelectedInMap?: boolean;
}

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

  const currentStudents = route.pickupPoints.reduce((sum, point) => sum + point.studentCount, 0);
  const utilizationPercentage = route.vehicleCapacity > 0 ? (currentStudents / route.vehicleCapacity) * 100 : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <Droppable droppableId={route.id} direction="horizontal">
      {(provided) => (
        <div className={`bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border-2 border-[#fad23c] rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex items-center relative overflow-hidden bus-container ${isModified ? 'ring-2 ring-red-400 border-red-300' : ''} ${isSelectedInMap ? 'ring-4 ring-[#fad23c]/50 border-[#fad23c] shadow-2xl' : ''}`}>
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#fad23c]/20 via-[#FEF3C7]/80 to-[#fad23c]/20 pointer-events-none rounded-3xl"></div>
          
          <div className="absolute top-2 left-8 right-8 h-3 bg-gradient-to-r from-[#87CEEB]/30 to-[#87CEEB]/50 rounded-full opacity-60"></div>
          <div className="absolute top-6 left-8 right-8 h-2 bg-gradient-to-r from-[#87CEEB]/20 to-[#87CEEB]/40 rounded-full opacity-40"></div>
          
          {isModified && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          )}

          {isSelectedInMap && (
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#fad23c] rounded-full flex items-center justify-center shadow-lg z-10">
              <FaMapMarkerAlt className="text-[#463B3B]" size={10} />
            </div>
          )}

          <Tooltip content={tooltipContent}>
            <div
              className="w-48 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-200 relative z-10"
              onClick={() => onRouteMapToggle(route.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#463B3B] leading-tight">
                  {truncateText(route.routeName, 15)}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getUtilizationColor(utilizationPercentage)}`}>
                  {utilizationPercentage.toFixed(0)}%
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#FEF3C7] rounded-full flex items-center justify-center">
                    <FaBus className="text-[#fad23c]" size={14} />
                  </div>
                  <span className="text-sm font-medium text-[#463B3B]">
                    {route.vehicleNumberPlate}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#463B3B]/80">
                  {currentStudents}/{route.vehicleCapacity}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    utilizationPercentage >= 90 ? 'bg-red-500' :
                    utilizationPercentage >= 70 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-[#463B3B]/60 flex items-center">
                <FaMapMarkerAlt className="mr-1 text-[#fad23c]" size={10} />
                {route.pickupPoints.length} pickup points
              </div>
            </div>
          </Tooltip>

          <div className="flex-shrink-0 ml-4 flex gap-2 relative z-10"
            style={{ visibility: isDraft ? 'hidden' : 'visible' }}>
            <button
              onClick={() => onScheduleClick(route)}
              className="p-3 text-[#463B3B]/60 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              title="Manage schedules"
            >
              <FaCalendarAlt size={16} />
            </button>

            <button
              onClick={() => onRouteClick(route)}
              className="p-3 text-[#463B3B]/60 hover:text-[#fad23c] hover:bg-[#FEF3C7] rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              title="Edit route"
            >
              <FaEdit size={16} />
            </button>
          </div>

          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex space-x-2 overflow-x-auto flex-1 min-w-[150px] min-h-[80px] border-2 border-dashed border-[#463B3B]/20 rounded-2xl p-3 ml-4 bg-gradient-to-r from-[#FEFCE8]/80 to-[#FEF3C7]/60 transition-colors duration-200 relative z-10 custom-scrollbar bus-interior"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(70, 59, 59, 0.1) 40px, rgba(70, 59, 59, 0.1) 42px)`
            }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="flex h-full items-center justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-6 bg-[#463B3B]/30 rounded-full"></div>
                ))}
              </div>
            </div>
            
            {route.pickupPoints.length === 0 && (
              <div className="flex items-center justify-center w-full text-[#463B3B]/40 text-sm relative z-10">
                <FaMapMarkerAlt className="mr-2 text-[#fad23c]/60" />
                Drop passengers here
              </div>
            )}
            {route.pickupPoints.map((point, index) => (
              <PickupPoint
                key={point.pickupPointId}
                point={point}
                index={index}
                className="flex-shrink-0 relative z-10"
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