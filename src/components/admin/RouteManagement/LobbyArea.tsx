// EduBusWeb/src/components/admin/RouteManagement/LobbyArea.tsx
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { PickupPointInfoDto } from '@/services/routeService/routeService.types';

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
            <h3 className="text-lg font-bold">Lobby</h3>
          </div>

          {/* Scrollable pickup points (actual droppable area) */}
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex space-x-2 overflow-x-auto flex-1 min-h-[100px] min-w-[200px] 
              border-2 border-dashed border-gray-300 rounded
              ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "bg-gray-50"}`}
          >
            {lobby.map((point, index) => (
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
                    className="bg-blue-100 p-2 rounded flex items-center min-w-[100px] m-2"
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

export default LobbyArea;