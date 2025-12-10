import * as signalR from "@microsoft/signalr";
import { store } from '@/store';
import {
  setConnectionStatus,
  setConnectionError,
  updateLocation,
  updateTripStatus,
  updateAttendance,
  removeOngoingTrip,
  LocationUpdateData,
  TripStatusChangedData,
  AttendanceUpdatedData
} from '@/store/slices/liveTripsSlice';
import { addIncidentToList } from '@/store/slices/driverRequestsSlice';
import { TripIncidentReason, TripIncidentStatus } from '@/services/api/tripIncidents';

export class TripHubService {
  private connection: signalR.HubConnection | null = null;
  private apiBaseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(apiBaseUrl: string) {
    // Remove /api suffix if present for SignalR hub URL
    this.apiBaseUrl = apiBaseUrl.replace(/\/api$/, "");
  }

  async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // If connecting, don't start another connection
    if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      console.log('Connection already in progress, waiting...');
      return;
    }

    // If reconnecting, let automatic reconnect handle it
    if (this.connection?.state === signalR.HubConnectionState.Reconnecting) {
      console.log('Connection is reconnecting, waiting...');
      return;
    }

    // Stop existing connection if it exists and is not disconnected
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
      this.connection = null;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      store.dispatch(setConnectionError("No authentication token found"));
      throw new Error("No authentication token found");
    }

    store.dispatch(setConnectionStatus('connecting'));

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiBaseUrl}/tripHub`, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            store.dispatch(setConnectionStatus('reconnecting'));
            return delay;
          }
          store.dispatch(setConnectionStatus('disconnected'));
          store.dispatch(setConnectionError("Max reconnection attempts reached"));
          return null;
        }
      })
      .build();

    // Set up event handlers that dispatch to Redux
    this.connection.on("ReceiveLocationUpdate", (data: LocationUpdateData) => {
      store.dispatch(updateLocation(data));
    });

    this.connection.on("TripStatusChanged", (data: TripStatusChangedData) => {
      store.dispatch(updateTripStatus(data));

      // If trip ended, remove from ongoing trips
      if (data.status !== 'InProgress') {
        store.dispatch(removeOngoingTrip(data.tripId));
      }
    });

    this.connection.on("AttendanceUpdated", (data: AttendanceUpdatedData) => {
      store.dispatch(updateAttendance(data));
    });

    this.connection.on("IncidentCreated", (data: {
      incidentId: string;
      tripId: string;
      supervisorId: string;
      supervisorName: string;
      reason: string;
      title: string;
      description?: string;
      status: string;
      routeName: string;
      vehiclePlate: string;
      serviceDate: string;
      createdAt: string;
      timestamp: string;
    }) => {
      store.dispatch(addIncidentToList({
        id: data.incidentId,
        tripId: data.tripId,
        reason: data.reason as TripIncidentReason,
        title: data.title,
        description: data.description,
        status: data.status as TripIncidentStatus,
        createdAt: data.createdAt,
        routeName: data.routeName,
        vehiclePlate: data.vehiclePlate,
        serviceDate: data.serviceDate
      }));
    });

    this.connection.on("Error", (error: string) => {
      store.dispatch(setConnectionError(error));
    });

    this.connection.onreconnecting((error) => {
      console.log("TripHub reconnecting:", error);
      store.dispatch(setConnectionStatus('reconnecting'));
    });

    this.connection.onreconnected((connectionId) => {
      console.log("TripHub reconnected:", connectionId);
      this.reconnectAttempts = 0;
      this.joinAdminMonitoring();
      store.dispatch(setConnectionStatus('connected'));
    });

    this.connection.onclose((error) => {
      console.log("TripHub connection closed:", error);
      store.dispatch(setConnectionStatus('disconnected'));
      if (error) {
        store.dispatch(setConnectionError(error.message || "Connection closed"));
      }
    });

    try {
      await this.connection.start();
      console.log("TripHub connected successfully");

      // Join admin monitoring group
      await this.joinAdminMonitoring();

      store.dispatch(setConnectionStatus('connected'));
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("Error starting TripHub:", error);
      store.dispatch(setConnectionStatus('disconnected'));
      store.dispatch(setConnectionError(error instanceof Error ? error.message : "Failed to connect"));
      throw error;
    }
  }

  private async joinAdminMonitoring(): Promise<void> {
    try {
      if (this.connection?.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("JoinAdminMonitoring");
        console.log("Joined admin monitoring group");
      }
    } catch (error) {
      console.error("Error joining admin monitoring:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    const currentState = this.connection.state;

    // If already disconnected, just clean up
    if (currentState === signalR.HubConnectionState.Disconnected) {
      this.connection = null;
      return;
    }

    // If connecting, wait for it to complete or timeout
    if (currentState === signalR.HubConnectionState.Connecting) {
      // Wait up to 3 seconds for negotiation to complete
      let waited = 0;
      while (this.connection?.state === signalR.HubConnectionState.Connecting && waited < 3000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waited += 100;
      }
    }

    // Now safely stop
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        // Connection might already be closed, ignore
      }
      this.connection = null;
      store.dispatch(setConnectionStatus('disconnected'));
      console.log("TripHub disconnected");
    }
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected || false;
  }

  get connectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }
}

// Singleton instance
let tripHubServiceInstance: TripHubService | null = null;

export const getTripHubService = (): TripHubService => {
  if (!tripHubServiceInstance) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    tripHubServiceInstance = new TripHubService(apiBaseUrl);
  }
  return tripHubServiceInstance;
};