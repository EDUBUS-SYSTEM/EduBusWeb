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
      className="fixed z-[99999] px-4 py-3 bg-[#1e293b] text-white text-sm rounded-xl shadow-2xl border border-blue-700/50 max-w-xs sm:max-w-sm pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {content}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1e293b]"></div>
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
    <div className="text-left min-w-[220px]">
      <div className="font-bold text-white mb-2 border-b border-blue-700/30 pb-2 leading-snug text-sm">
        {point.location.address}
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-xs text-blue-200">
          <FaMapMarkerAlt className="mr-1.5 text-blue-400" />
          {point.location.latitude.toFixed(5)}, {point.location.longitude.toFixed(5)}
        </div>

        <div className="bg-[#0f172a]/50 rounded-lg p-2.5 border border-blue-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-200/70 uppercase tracking-wider">
              Students
            </span>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              {point.studentCount}
            </span>
          </div>

          {point.students && point.students.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
              <ul className="text-sm text-blue-50 space-y-1.5">
                {point.students.map((student, i) => (
                  <li key={student.id} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-1.5 flex-shrink-0 shadow-[0_0_4px_rgba(74,222,128,0.5)]"></span>
                    <span className="leading-tight">
                      {student.fullName || `${student.firstName} ${student.lastName}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-xs text-blue-300/60 italic py-1">
              No students assigned
            </div>
          )}
        </div>
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
            className={`bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] hover:from-[#BAE6FD] hover:to-[#7DD3FC] border-2 border-[#0EA5E9] hover:border-[#0284C7] p-2 rounded-full flex flex-col items-center justify-center min-w-[60px] max-w-[60px] h-[60px] cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md hover:shadow-lg passenger-seat ${className} ${snapshot.isDragging ? 'opacity-70 rotate-6 scale-125 shadow-xl ring-3 ring-[#0EA5E9]' : ''
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