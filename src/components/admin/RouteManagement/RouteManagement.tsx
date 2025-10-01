// EduBusWeb/src/components/admin/RouteManagement/RouteManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { FaPlus, FaSave } from 'react-icons/fa';
import { routeService } from '@/services/routeService/routeService.api';
import { RouteDto, PickupPointInfoDto, UpdateBulkRouteRequest, RoutePickupPointRequest, UpdateBulkRouteItem } from '@/services/routeService/routeService.types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateRouteModal from './CreateRouteModal';
import EditRouteModal from './EditRouteModal';
import RouteRow from './RouteRow';
import LobbyArea from './LobbyArea';
import { pickupPointService, PickupPointDto } from '@/services/pickupPointService';

// Create 100 pickup points with a capacity of 1 each
const allPickupPoints: PickupPointInfoDto[] = Array.from({ length: 100 }, (_, i) => ({
  pickupPointId: `pp-${i + 1}`,
  sequenceOrder: i + 1,
  location: {
    latitude: 10.75 + i * 0.001,
    longitude: 106.66 + i * 0.001,
    address: `Street ${i + 1}, District ${((i % 5) + 1)}, City`
  },
  studentCount: 1
}));

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [lobby, setLobby] = useState<PickupPointInfoDto[]>(allPickupPoints);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [modifiedRoutes, setModifiedRoutes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store original routes for comparison
  const originalRoutesRef = useRef<RouteDto[]>([]);

  const convertToPickupPointInfo = (unassignedPoint: PickupPointDto): PickupPointInfoDto => ({
    pickupPointId: unassignedPoint.id,
    sequenceOrder: 0, // Will be set when added to a route
    location: {
      latitude: unassignedPoint.latitude,
      longitude: unassignedPoint.longitude,
      address: unassignedPoint.location
    },
    studentCount: unassignedPoint.studentCount
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch routes and unassigned pickup points in parallel
        const [routesData, unassignedData] = await Promise.all([
          routeService.getAll(),
          pickupPointService.getUnassignedPickupPoints()
        ]);

        setRoutes(routesData);
        originalRoutesRef.current = JSON.parse(JSON.stringify(routesData)); // Deep copy

        // Convert unassigned pickup points to PickupPointInfoDto format
        const lobbyPickupPoints = unassignedData.pickupPoints.map(convertToPickupPointInfo);
        setLobby(lobbyPickupPoints);

        // Clear any existing modifications when fetching fresh data
        setModifiedRoutes(new Set());
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load route and pickup point data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to compare pickup points arrays
  const arePickupPointsEqual = (a: PickupPointInfoDto[], b: PickupPointInfoDto[]): boolean => {
    if (a.length !== b.length) return false;

    // Create maps for easier comparison
    const mapA = new Map(a.map(point => [point.pickupPointId, point.sequenceOrder]));
    const mapB = new Map(b.map(point => [point.pickupPointId, point.sequenceOrder]));

    // Check if all pickup points have the same sequence order
    for (const [pickupPointId, sequenceOrder] of mapA) {
      if (mapB.get(pickupPointId) !== sequenceOrder) {
        return false;
      }
    }

    return true;
  };

  // Check if a route has been modified by comparing with original
  const isRouteModified = (routeId: string): boolean => {
    const currentRoute = routes.find(r => r.id === routeId);
    const originalRoute = originalRoutesRef.current.find(r => r.id === routeId);

    if (!currentRoute || !originalRoute) return false;

    return !arePickupPointsEqual(currentRoute.pickupPoints, originalRoute.pickupPoints);
  };

  // Update modified routes based on current state
  const updateModifiedRoutes = () => {
    const newModifiedRoutes = new Set<string>();

    routes.forEach(route => {
      if (isRouteModified(route.id)) {
        newModifiedRoutes.add(route.id);
      }
    });

    setModifiedRoutes(newModifiedRoutes);
  };

  // Call this whenever routes change to update modification status
  useEffect(() => {
    updateModifiedRoutes();
  }, [routes]);

  const handleRouteCreated = (newRoute: RouteDto) => {
    setRoutes(prevRoutes => [...prevRoutes, newRoute]);
    // Add to original routes as well
    originalRoutesRef.current = [...originalRoutesRef.current, newRoute];
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
    originalRoutesRef.current = originalRoutesRef.current.map(route => {
      if (route.id === updatedRoute.id) {
        return {
          ...route,
          routeName: updatedRoute.routeName,        // Update name
          vehicleId: updatedRoute.vehicleId,       // Update vehicle
          vehicleCapacity: updatedRoute.vehicleCapacity,
          vehicleNumberPlate: updatedRoute.vehicleNumberPlate
          // ✅ IMPORTANT: Do NOT update pickupPoints - keep original!
        };
      }
      return route;
    });
  };

  const handleRouteDeleted = (routeId: string) => {
    setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
    originalRoutesRef.current = originalRoutesRef.current.filter(route => route.id !== routeId);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Create deep copies to avoid mutations
    const updatedRoutes = routes.map(route => ({
      ...route,
      pickupPoints: [...route.pickupPoints]
    }));

    const updatedLobby = [...lobby];

    // Get the lists to work with
    const sourceList = source.droppableId === 'lobby'
      ? updatedLobby
      : updatedRoutes.find(route => route.id === source.droppableId)!.pickupPoints;

    const destinationList = destination.droppableId === 'lobby'
      ? updatedLobby
      : updatedRoutes.find(route => route.id === destination.droppableId)!.pickupPoints;

    // Perform the move
    const [moved] = sourceList.splice(source.index, 1);

    // Validate capacity if moving to a route
    if (destination.droppableId !== 'lobby') {
      const destinationRoute = updatedRoutes.find(route => route.id === destination.droppableId)!;
      const totalStudents = destinationList.reduce((sum, point) => sum + point.studentCount, 0) + moved.studentCount;

      if (totalStudents > destinationRoute.vehicleCapacity) {
        toast.error('Cannot move pickup point: vehicle capacity exceeded.');
        return;
      }
    }

    destinationList.splice(destination.index, 0, moved);

    // Update sequence orders for affected routes
    if (source.droppableId !== 'lobby') {
      const sourceRoute = updatedRoutes.find(route => route.id === source.droppableId)!;
      sourceRoute.pickupPoints.forEach((point, index) => {
        point.sequenceOrder = index + 1;
      });
    }

    if (destination.droppableId !== 'lobby') {
      const destinationRoute = updatedRoutes.find(route => route.id === destination.droppableId)!;
      destinationRoute.pickupPoints.forEach((point, index) => {
        point.sequenceOrder = index + 1;
      });
    }

    // Single state updates
    setRoutes(updatedRoutes);
    setLobby(updatedLobby);
  };

  const handleSaveChanges = async () => {
    if (modifiedRoutes.size === 0) return;

    setIsSaving(true);
    try {
      // Prepare bulk update data
      const bulkUpdateData: UpdateBulkRouteRequest = {
        routes: Array.from(modifiedRoutes).map(routeId => {
          const route = routes.find(r => r.id === routeId);
          if (!route) return null;

          // Convert PickupPointInfoDto to RoutePickupPointRequest
          const pickupPointsRequest: RoutePickupPointRequest[] = route.pickupPoints.map((point, index) => ({
            pickupPointId: point.pickupPointId,
            sequenceOrder: index + 1 // Update sequence order based on new position
          }));

          return {
            routeId: routeId,
            pickupPoints: pickupPointsRequest
          };
        }).filter(Boolean) as UpdateBulkRouteItem[] // Remove null entries
      };

      console.log(`Bulk updating ${bulkUpdateData.routes.length} routes:`, bulkUpdateData);

      // Use bulk update method (all or nothing)
      const response = await routeService.bulkUpdate(bulkUpdateData);

      if (response.success) {
        // Update original routes with the saved data
        const freshRoutes = await routeService.getAll();
        setRoutes(freshRoutes);
        originalRoutesRef.current = JSON.parse(JSON.stringify(freshRoutes));

        // Clear modified routes
        setModifiedRoutes(new Set());

        toast.success(`Successfully saved ${modifiedRoutes.size} route(s)`);
      } else {
        // Handle bulk update failure
        toast.error(response.errorMessage || 'Failed to save changes. All changes were reverted.');

        // Refresh routes to revert any changes
        const freshRoutes = await routeService.getAll();
        setRoutes(freshRoutes);
        originalRoutesRef.current = JSON.parse(JSON.stringify(freshRoutes));
        setModifiedRoutes(new Set());
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes. Please try again.');

      // Refresh routes to revert any changes
      try {
        const freshRoutes = await routeService.getAll();
        setRoutes(freshRoutes);
        originalRoutesRef.current = JSON.parse(JSON.stringify(freshRoutes));
        setModifiedRoutes(new Set());
      } catch (refreshError) {
        console.error('Failed to refresh routes after error:', refreshError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Debug function to help troubleshoot (remove in production)
  const debugModifications = () => {
    console.log('Current routes:', routes);
    console.log('Original routes:', originalRoutesRef.current);
    console.log('Modified routes:', Array.from(modifiedRoutes));

    routes.forEach(route => {
      const originalRoute = originalRoutesRef.current.find(r => r.id === route.id);
      if (originalRoute) {
        const isModified = !arePickupPointsEqual(route.pickupPoints, originalRoute.pickupPoints);
        console.log(`Route ${route.routeName}:`, {
          current: route.pickupPoints.map(p => ({ id: p.pickupPointId, order: p.sequenceOrder })),
          original: originalRoute.pickupPoints.map(p => ({ id: p.pickupPointId, order: p.sequenceOrder })),
          isModified
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes and pickup points...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="p-4 bg-gray-100 min-h-screen">
          {/* Header with Save and Create Buttons */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>

            <div className="flex items-center space-x-3">
              {/* Debug button - remove in production */}
              <button
                onClick={debugModifications}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Debug
              </button>

              {/* Save Changes Button */}
              {modifiedRoutes.size > 0 && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Saving...' : `Save Changes (${modifiedRoutes.size})`}
                </button>
              )}

              {/* Create Route Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaPlus className="mr-2" />
                Create Route
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Render Route Rows */}
            {routes.map(route => (
              <RouteRow
                key={route.id}
                route={route}
                onRouteClick={handleRouteClick}
                isModified={isRouteModified(route.id)}
              />
            ))}

            {/* Render Lobby Area */}
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