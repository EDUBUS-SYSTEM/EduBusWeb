// EduBusWeb/src/components/admin/RouteManagement/LobbyArea.tsx
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { PickupPointInfoDto } from '@/services/routeService/routeService.types';
import PickupPoint from './PickupPoint';

interface LobbyAreaProps {
  lobby: PickupPointInfoDto[];
}

const LobbyArea: React.FC<LobbyAreaProps> = ({ lobby }) => {
  return (
    <Droppable droppableId="lobby" direction="horizontal">
      {(provided, snapshot) => (
        <div className="bg-white border-2 border-[#FDE68A] hover:border-[#fad23c] rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="flex items-stretch min-h-[120px]">
            {/* Header Section */}
            <div className="w-52 flex-shrink-0 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] p-5 flex flex-col justify-center border-r border-[#FDE68A] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fad23c]/10 to-[#fad23c]/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#fad23c] rounded-full flex items-center justify-center shadow-md">
                    <FaMapMarkerAlt className="text-[#463B3B]" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#463B3B]">Lobby</h3>
                    <p className="text-sm font-medium text-[#463B3B]/80">
                      {lobby.length} {lobby.length === 1 ? 'point' : 'points'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#463B3B]/70 bg-white/70 rounded-full px-3 py-1 inline-block">
                  Waiting passengers
                </div>
              </div>
            </div>

            {/* Scrollable pickup points (actual droppable area) */}
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 flex items-center gap-3 overflow-x-auto px-5 py-4 min-h-[120px] transition-all duration-300 custom-scrollbar ${snapshot.isDraggingOver
                  ? "bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border-2 border-dashed border-[#fad23c]"
                  : "bg-gradient-to-r from-[#FEFCE8]/30 to-[#FEF3C7]/30"
                }`}
            >
              {lobby.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#463B3B]/40 text-sm">
                  <FaMapMarkerAlt className="mr-2 text-[#fad23c]/60" />
                  No passengers waiting
                </div>
              ) : (
                lobby.map((point, index) => (
                  <PickupPoint
                    key={point.pickupPointId}
                    point={point}
                    index={index}
                    className="flex-shrink-0"
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default LobbyArea;