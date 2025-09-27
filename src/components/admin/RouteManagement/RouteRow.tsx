// EduBusWeb/src/components/admin/RouteManagement/RouteRow.tsx
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { FaBus, FaUser } from 'react-icons/fa';
import { RouteDto, PickupPointInfoDto } from '@/services/routeService/routeService.types';

interface RouteRowProps {
  route: RouteDto;
  onRouteClick: (route: RouteDto) => void;
}

const RouteRow: React.FC<RouteRowProps> = ({ route, onRouteClick }) => {
  return (
    <Droppable droppableId={route.id} direction="horizontal">
      {(provided) => (
        <div className="bg-yellow-200 p-4 rounded shadow-md flex items-center">
          <div
            className="w-40 flex-shrink-0 cursor-pointer hover:opacity-80"
            onClick={() => onRouteClick(route)}
          >
            {/* Line 1: Route name and capacity */}
            <h3 className="text-base font-bold leading-tight">
              {route.routeName} (
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