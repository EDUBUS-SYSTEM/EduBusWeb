import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOngoingTrips } from '@/store/slices/liveTripsSlice';
import { getTripHubService } from '@/services/tripHubService';
import * as signalR from "@microsoft/signalr";

export function useLiveTripMonitoring() {
  const dispatch = useAppDispatch();
  const { 
    connectionStatus, 
    ongoingTrips, 
    locationUpdates,
    attendanceUpdates,
    selectedTripIds, 
    stats,
    loading,
    error 
  } = useAppSelector(state => state.liveTrips);
  const hubServiceRef = useRef<ReturnType<typeof getTripHubService> | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    const hubService = getTripHubService();
    hubServiceRef.current = hubService;

    if (hubService.connectionState !== signalR.HubConnectionState.Connected) {
      hubService.connect().catch((error) => {
        console.error('Failed to connect to TripHub:', error);
      });
    }

    dispatch(fetchOngoingTrips());

    return () => {
    };
  }, [dispatch]);

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
    attendanceUpdates,
    selectedTripIds, 
    stats,
    loading,
    error,
    isConnected: connectionStatus === 'connected',
    getLocationUpdate,
    refreshTrips,
  };
}