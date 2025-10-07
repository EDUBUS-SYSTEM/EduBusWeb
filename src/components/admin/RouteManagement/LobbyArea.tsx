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
        <div className="bg-white p-4 rounded shadow-md flex items-center">
          {/* Fixed-width left side */}
          <div className="flex items-center w-40 flex-shrink-0">
            <FaMapMarkerAlt className="text-3xl text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-bold">Lobby</h3>
              <p className="text-sm text-gray-600">{lobby.length} pickup points</p>
            </div>
          </div>

          {/* Scrollable pickup points (actual droppable area) */}
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex space-x-2 overflow-x-auto flex-1 min-h-[100px] min-w-[200px] 
              border-2 border-dashed border-gray-300 rounded p-2
              ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "bg-gray-50"}`}
          >
            {lobby.map((point, index) => (
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

export default LobbyArea;