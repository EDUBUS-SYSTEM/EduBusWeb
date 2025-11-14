// EduBusWeb/src/components/admin/RouteManagement/PickupPoint.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { PickupPointInfoDto } from '@/services/routeService/routeService.types';

interface PickupPointProps {
  point: PickupPointInfoDto;
  index: number;
  className?: string;
}

// Portal-based Tooltip Component
const Tooltip: React.FC<{ 
  children: React.ReactNode; 
  content: React.ReactNode; 
  className?: string;
}> = ({ children, content, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  const tooltipElement = isVisible ? createPortal(
    <div 
      className="fixed px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 whitespace-nowrap max-w-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 99999
      }}
    >
      {content}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>,
    document.body
  ) : null;

  return (
    <div 
      ref={elementRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {tooltipElement}
    </div>
  );
};

const PickupPoint: React.FC<PickupPointProps> = ({ point, index, className = "" }) => {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 12): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Create meaningful display text
  const displayText = point.location.address || point.pickupPointId;
  const truncatedText = truncateText(displayText);

  // Tooltip content with full information
  const tooltipContent = (
    <div className="text-left">
      <div className="font-semibold mb-1">{point.location.address}</div>
      <div className="text-xs text-gray-300 space-y-1">
        <div>📍 {point.location.latitude.toFixed(4)}, {point.location.longitude.toFixed(4)}</div>
        <div>👥 {point.studentCount} student{point.studentCount !== 1 ? 's' : ''}</div>
        <div>🆔 ID: {point.pickupPointId}</div>
      </div>
    </div>
  );

  return (
    <Draggable
      key={point.pickupPointId}
      draggableId={point.pickupPointId}
      index={index}
    >
      {(provided, snapshot) => (
        <Tooltip content={tooltipContent}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] hover:from-[#BAE6FD] hover:to-[#7DD3FC] border-2 border-[#0EA5E9] hover:border-[#0284C7] p-2 rounded-full flex flex-col items-center justify-center min-w-[60px] max-w-[60px] h-[60px] cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md hover:shadow-lg passenger-seat ${className} ${
              snapshot.isDragging ? 'opacity-70 rotate-6 scale-125 shadow-xl ring-3 ring-[#0EA5E9]' : ''
            }`}
          >
            {/* Passenger Icon */}
            <div className="w-6 h-6 bg-[#0EA5E9] rounded-full flex items-center justify-center mb-1">
              <FaUser className="text-white text-xs" />
            </div>
            
            {/* Student Count */}
            <div className="text-xs font-bold text-[#0284C7] bg-white/90 rounded-full px-2 py-0.5 min-w-[24px] text-center">
              {point.studentCount}
            </div>
          </div>
        </Tooltip>
      )}
    </Draggable>
  );
};

export default PickupPoint;