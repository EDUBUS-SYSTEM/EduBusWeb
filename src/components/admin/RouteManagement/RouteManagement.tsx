// EduBusWeb/src/components/admin/RouteManagement/RouteManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { FaPlus, FaSave, FaMagic, FaTimes, FaCheck, FaBus } from 'react-icons/fa';
import { routeService } from '@/services/routeService/routeService.api';
import { RouteDto, PickupPointInfoDto, UpdateBulkRouteRequest, ReplaceAllRoutesRequest, RoutePickupPointRequest, UpdateBulkRouteItem, RouteSuggestionDto } from '@/services/routeService/routeService.types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/route-management.css';
import CreateRouteModal from './CreateRouteModal';
import EditRouteModal from './EditRouteModal';
import ApplySuggestionsModal from './ApplySuggestionsModal'
import RouteRow from './RouteRow';
import LobbyArea from './LobbyArea';
import { pickupPointService, PickupPointDto } from '@/services/pickupPointService';
import MiniRouteMap from './MiniRouteMap';
import RouteScheduleModal from './RouteScheduleModal';

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<RouteDto[]>([]);
  const [lobby, setLobby] = useState<PickupPointInfoDto[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteDto | null>(null);
  const [modifiedRoutes, setModifiedRoutes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSuggestions, setHasSuggestions] = useState(false); // Track if current routes are suggestions
  const [isApplySuggestionsModalOpen, setIsApplySuggestionsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [selectedRouteForSchedule, setSelectedRouteForSchedule] = useState<RouteDto | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

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

  const convertSuggestionToRoute = (suggestion: RouteSuggestionDto, index: number): RouteDto => {
    return {
      id: `generated-route-${index + 1}-${Date.now()}`, // Temporary ID for UI
      routeName: `Generated Route ${index + 1}`,
      isActive: true,
      vehicleId: suggestion.vehicle?.vehicleId || '',
      vehicleCapacity: suggestion.vehicle?.capacity || 0,
      vehicleNumberPlate: suggestion.vehicle?.licensePlate || '',
      pickupPoints: suggestion.pickupPoints.map(pp => ({
        pickupPointId: pp.pickupPointId,
        sequenceOrder: pp.sequenceOrder,
        location: {
          latitude: pp.latitude,
          longitude: pp.longitude,
          address: pp.address
        },
        studentCount: pp.studentCount
      })),
      createdAt: suggestion.generatedAt,
      updatedAt: suggestion.generatedAt,
      isDeleted: false
    };
  };

  const handleScheduleClick = (route: RouteDto) => {
    setSelectedRouteForSchedule(route);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleModalClose = () => {
    setSelectedRouteForSchedule(null);
    setIsScheduleModalOpen(false);
  };

  const handleScheduleSuccess = () => {
    console.log('Schedule management completed successfully');
  };

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
  
  const handleRouteMapToggle = (routeId: string) => {
    setSelectedRouteIds(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

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

  const handleGenerateRoutes = async () => {
    setIsGenerating(true);
    try {
      const response = await routeService.generateSuggestions();

      if (response.success && response.routes.length > 0) {
        const generatedRoutes = response.routes.map((suggestion, index) =>
          convertSuggestionToRoute(suggestion, index)
        );
        setRoutes(generatedRoutes);
        originalRoutesRef.current = generatedRoutes.map(route => ({ ...route }));
        setModifiedRoutes(new Set());
        setLobby([]);
        setHasSuggestions(true);
        toast.success(`Successfully generated ${response.totalRoutes} optimized routes!`);
      } else {
        toast.error(response.message || 'Failed to generate routes');
      }
    } catch (error: unknown) {
      console.error('Failed to generate routes:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          }
        };

        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        } else {
          toast.error('Failed to generate routes. Please try again.');
        }
      } else {
        toast.error('Failed to generate routes. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestions = () => {
    setIsApplySuggestionsModalOpen(true);
  };

  // ✅ NEW: Handle applying the suggestions (calls replace-all API and refetches)
  const handleConfirmApplySuggestions = async () => {
    setIsApplying(true);
    try {
      // Convert current UI routes to CreateRouteRequest format
      const routesToCreate = routes.map((route) => ({
        routeName: route.routeName,
        vehicleId: route.vehicleId,
        pickupPoints: route.pickupPoints.map(pp => ({
          pickupPointId: pp.pickupPointId,
          sequenceOrder: pp.sequenceOrder
        }))
      }));

      const replaceRequest: ReplaceAllRoutesRequest = {
        routes: routesToCreate,
        forceDelete: false
      };

      const response = await routeService.replaceAll(replaceRequest);

      if (response.success) {
        // ✅ Close modal and clear suggestions flag
        setIsApplySuggestionsModalOpen(false);
        setHasSuggestions(false);

        // ✅ Refetch routes to get the latest data from database
        const [routesData, unassignedData] = await Promise.all([
          routeService.getAll(),
          pickupPointService.getUnassignedPickupPoints()
        ]);

        setRoutes(routesData);
        originalRoutesRef.current = JSON.parse(JSON.stringify(routesData));

        // Convert unassigned pickup points to PickupPointInfoDto format
        const lobbyPickupPoints = unassignedData.pickupPoints.map(convertToPickupPointInfo);
        setLobby(lobbyPickupPoints);

        // Clear any existing modifications
        setModifiedRoutes(new Set());

        toast.success(`Successfully applied suggestions! Deleted ${response.deletedRoutes} old routes and created ${response.successfulRoutes} new routes.`);
      } else {
        toast.error(response.errorMessage || 'Failed to apply suggestions');
      }
    } catch (error: unknown) {
      console.error('Failed to apply suggestions:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          }
        };

        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
        } else {
          toast.error('Failed to apply suggestions. Please try again.');
        }
      } else {
        toast.error('Failed to apply suggestions. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  // ✅ NEW: Handle closing the apply suggestions modal
  const handleCloseApplySuggestionsModal = () => {
    if (!isApplying) {
      setIsApplySuggestionsModalOpen(false);
    }
  };

  // ✅ NEW: Handle discarding suggestions (refetch original routes)
  const handleDiscardChanges = async () => {
    try {
      setIsLoading(true);

      // Refetch original routes from database
      const [routesData, unassignedData] = await Promise.all([
        routeService.getAll(),
        pickupPointService.getUnassignedPickupPoints()
      ]);

      setRoutes(routesData);
      originalRoutesRef.current = JSON.parse(JSON.stringify(routesData));

      // Convert unassigned pickup points to PickupPointInfoDto format
      const lobbyPickupPoints = unassignedData.pickupPoints.map(convertToPickupPointInfo);
      setLobby(lobbyPickupPoints);

      // Clear modifications and suggestions flag
      setModifiedRoutes(new Set());
      setHasSuggestions(false);

      toast.info('Route suggestions discarded');
    } catch (error) {
      console.error('Failed to refetch routes:', error);
      toast.error('Failed to discard suggestions');
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading || isGenerating) {
    return (
      <div className="p-4 bg-[#FEFCE8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700] mx-auto mb-4"></div>
          <p className="text-[#463B3B] font-medium">
            {isGenerating ? 'Generating optimized routes...' : 'Loading routes and pickup points...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="p-6 bg-[#FEFCE8] min-h-screen">
          {/* Header with Save and Create Buttons */}
          <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fad23c]/10 via-transparent to-[#fad23c]/5"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h1 className="text-3xl font-bold text-[#463B3B] mb-2">Route Management</h1>
                <p className="text-[#463B3B]/80 flex items-center">
                  <FaBus className="mr-2 text-[#fad23c]" />
                  Manage bus routes and pickup points
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Save Changes Button */}
                {modifiedRoutes.size > 0 && !hasSuggestions &&(
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white px-4 py-2 rounded-full flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaSave className="mr-2 relative z-10" size={14} />
                    <span className="font-medium relative z-10 text-sm">
                      {isSaving ? 'Saving...' : `Save Changes (${modifiedRoutes.size})`}
                    </span>
                  </button>
                )}

                {(hasSuggestions || modifiedRoutes.size > 0) && (
                  <button
                    onClick={handleDiscardChanges}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-full flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaTimes className="mr-2 relative z-10" size={14} />
                    <span className="font-medium relative z-10 text-sm">
                      {isLoading ? 'Loading...' : 'Discard'}
                    </span>
                  </button>
                )}

                {hasSuggestions && (
                  <button
                    onClick={handleApplySuggestions}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <FaCheck className="mr-2" />
                    Apply Suggestions ({routes.length})
                  </button>
                )}
                
                {!hasSuggestions && modifiedRoutes.size === 0 && (
                  <button
                    onClick={handleGenerateRoutes}
                    disabled={isGenerating || isLoading}
                    className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] disabled:from-[#FDE68A] disabled:to-[#FCD34D] text-white px-4 py-2 rounded-full flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:transform-none relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FBBF24]/20 to-[#F59E0B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <FaMagic className="mr-2 relative z-10" size={14} />
                    <span className="font-medium relative z-10 text-sm">
                      {isGenerating ? 'Generating...' : 'Generate Routes'}
                    </span>
                  </button>
                )}

                {/* Create Route Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-[#fad23c] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] text-[#463B3B] px-4 py-2 rounded-full flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg relative overflow-hidden group font-semibold"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FBBF24]/20 to-[#F59E0B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaPlus className="mr-2 relative z-10" size={14} />
                  <span className="font-medium relative z-10 text-sm">Create Route</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Render Route Rows */}
            {routes.map(route => (
              <RouteRow
                key={route.id}
                route={route}
                onScheduleClick={handleScheduleClick} 
                onRouteClick={handleRouteClick} 
                onRouteMapToggle={handleRouteMapToggle}
                isModified={isRouteModified(route.id)}
                isDraft={hasSuggestions}
                isSelectedInMap={selectedRouteIds.includes(route.id)}
              />
            ))}

            {/* Render Lobby Area */}
            <LobbyArea lobby={lobby} />
          </div>
        </div>
      </DragDropContext>
      
      {/* Mini Route Map */}
      <MiniRouteMap
        routes={routes}
        selectedRouteIds={selectedRouteIds}
        onRouteToggle={handleRouteMapToggle}
        onSelectAllRoutes={() => setSelectedRouteIds(routes.map(r => r.id))}
        onDeselectAllRoutes={() => setSelectedRouteIds([])}
      />

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

      {/* Apply Suggestions Modal */}
      <ApplySuggestionsModal
        isOpen={isApplySuggestionsModalOpen}
        onClose={handleCloseApplySuggestionsModal}
        onApply={handleConfirmApplySuggestions}
        isApplying={isApplying}
        suggestedRoutesCount={routes.length}
      />

      {/* Route Schedule Management Modal */}
      {isScheduleModalOpen && selectedRouteForSchedule && (
        <RouteScheduleModal
          route={selectedRouteForSchedule}
          onClose={handleScheduleModalClose}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </>
  );
};

export default RouteManagement;