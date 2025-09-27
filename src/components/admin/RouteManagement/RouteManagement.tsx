// src/components/admin/RouteManagement.tsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FaBus, FaUser, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { routeService } from '@/services/routeService/routeService.api';
import { RouteDto, PickupPointInfoDto } from '@/services/routeService/routeService.types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateRouteModal from './CreateRouteModal';
import EditRouteModal from './EditRouteModal';
import RouteRow from './RouteRow';
import LobbyArea from './LobbyArea';

// Create 100 pickup points with a capacity of 1 each
const allPickupPoints: PickupPointInfoDto[] = Array.from({ length: 100 }, (_, i) => ({
  pickupPointId: `pp-${i + 1}`,
  sequenceOrder: i + 1,
  location: {
    latitude: 10.75 + i * 0.001, // shifts slightly per point
    longitude: 106.66 + i * 0.001,
    address: `Street ${i + 1}, District ${((i % 5) + 1)}, City`
  },
  studentCount: 1 // Each pickup point has 1 student
}));

// Start with empty routes (no pickup points)
const initialRoutes: RouteDto[] = [
  // {
  //   id: 'route-1',
  //   routeName: 'Route 1',
  //   vehicleId: 'vehicle1',
  //   isActive: true,
  //   vehicleCapacity: 16,
  //   pickupPoints: [], // Empty initially
  // },
  // {
  //   id: 'route-2',
  //   routeName: 'Route 2',
  //   vehicleId: 'vehicle2',
  //   isActive: true,
  //   vehicleCapacity: 16,
  //   pickupPoints: [], // Empty initially
  // },
  // {
  //   id: 'route-3',
  //   routeName: 'Route 3',
  //   vehicleId: 'vehicle3',
  //   isActive: true,
  //   vehicleCapacity: 16,
  //   pickupPoints: [], // Empty initially
  // },
];

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<RouteDto[]>(initialRoutes);
  const [lobby, setLobby] = useState<PickupPointInfoDto[]>(allPickupPoints); // All pickup points start in lobby
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await routeService.getAll();
        setRoutes(data);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      }
    };

    fetchRoutes();
  }, []);

  const handleRouteCreated = (newRoute: RouteDto) => {
    // Add the new route to the existing routes instead of refetching
    setRoutes(prevRoutes => [...prevRoutes, newRoute]);
  };

  const handleRouteClick = (route: RouteDto) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  };

  const handleRouteUpdated = (updatedRoute: RouteDto) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route =>
        route.id === updatedRoute.id ? updatedRoute : route
      )
    );
  };

  const handleRouteDeleted = (routeId: string) => {
    setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceList = source.droppableId === 'lobby' ? lobby : routes.find(route => route.id === source.droppableId)!.pickupPoints;
    const destinationList = destination.droppableId === 'lobby' ? lobby : routes.find(route => route.id === destination.droppableId)!.pickupPoints;

    const [moved] = sourceList.splice(source.index, 1);

    if (destination.droppableId !== 'lobby') {
      const destinationRoute = routes.find(route => route.id === destination.droppableId)!;
      const totalStudents = destinationList.reduce((sum, point) => sum + point.studentCount, 0) + moved.studentCount;

      if (totalStudents > destinationRoute.vehicleCapacity) {
        toast.error('Cannot move pickup point: vehicle capacity exceeded.');
        // Revert the move
        sourceList.splice(source.index, 0, moved);
        return;
      }
    }

    destinationList.splice(destination.index, 0, moved);

    if (source.droppableId === 'lobby') {
      setLobby([...sourceList]);
    } else {
      const updatedRoutes = Array.from(routes);
      const sourceRouteIndex = routes.findIndex(route => route.id === source.droppableId);
      updatedRoutes[sourceRouteIndex].pickupPoints = sourceList;
      setRoutes(updatedRoutes);
    }

    if (destination.droppableId === 'lobby') {
      setLobby([...destinationList]);
    } else {
      const updatedRoutes = Array.from(routes);
      const destinationRouteIndex = routes.findIndex(route => route.id === destination.droppableId);
      updatedRoutes[destinationRouteIndex].pickupPoints = destinationList;
      setRoutes(updatedRoutes);
    }
  };

  return (
    <>
      <ToastContainer />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="p-4 bg-gray-100 min-h-screen">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Route
            </button>
          </div>

          <div className="space-y-4">
            {routes.map(route => (
              <RouteRow
                key={route.id}
                route={route}
                onRouteClick={handleRouteClick}
              />
            ))}
            <LobbyArea lobby={lobby} />
          </div>
        </div>
      </DragDropContext>

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRouteCreated={handleRouteCreated}
      />

      {/* Edit Route Modal */}
      <EditRouteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        route={selectedRoute}
        onRouteUpdated={handleRouteUpdated}
        onRouteDeleted={handleRouteDeleted}
      />
    </>
  );
};

export default RouteManagement;