import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOngoingTrips } from '@/store/slices/liveTripsSlice';
import { getTripHubService } from '@/services/tripHubService';

export function useLiveTripMonitoring() {
  const dispatch = useAppDispatch();
  const {
    connectionStatus,
    ongoingTrips,
    locationUpdates,
    attendanceUpdates,
    stats,
    loading,
    error
  } = useAppSelector(state => state.liveTrips);
  const hubServiceRef = useRef<ReturnType<typeof getTripHubService> | null>(null);

  useEffect(() => {
    // Initialize SignalR connection
    const hubService = getTripHubService();
    hubServiceRef.current = hubService;

    // Connect to SignalR
    hubService.connect().catch((error) => {
      console.error('Failed to connect to TripHub:', error);
    });

    // Load ongoing trips
    dispatch(fetchOngoingTrips());
    
  }, [dispatch]);

  // Helper functions
  const getLocationUpdate = (tripId: string) => {
    return locationUpdates[tripId];
  };

  const refreshTrips = () => {
    dispatch(fetchOngoingTrips());
  };

  return {
    connectionStatus,
    ongoingTrips,
    locationUpdates,
    attendanceUpdates, // ✅ Add this line
    stats,
    loading,
    error,
    isConnected: connectionStatus === 'connected',
    getLocationUpdate,
    refreshTrips,
  };
}