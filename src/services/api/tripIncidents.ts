import { apiService } from "@/lib/api";

export enum TripIncidentStatus {
  Open = "Open",
  Acknowledged = "Acknowledged",
  Resolved = "Resolved"
}

export enum TripIncidentReason {
  VehicleIssue = "VehicleIssue",
  StudentIssue = "StudentIssue",
  RouteBlocked = "RouteBlocked",
  Weather = "Weather",
  SafetyConcern = "SafetyConcern",
  IoTDeviceIssue = "IoTDeviceIssue",
  Other = "Other"
}

export interface TripIncident {
  id: string;
  tripId: string;
  supervisorId: string;
  supervisorName: string;
  reason: TripIncidentReason;
  title: string;
  description?: string;
  status: TripIncidentStatus;
  createdAt: string;
  updatedAt?: string;
  serviceDate: string;
  tripStatus: string;
  routeName: string;
  vehiclePlate: string;
  adminNote?: string;
  handledBy?: string;
  handledAt?: string;
}

export interface TripIncidentListItem {
  id: string;
  tripId: string;
  reason: TripIncidentReason;
  title: string;
  description?: string;
  status: TripIncidentStatus;
  createdAt: string;
  routeName: string;
  vehiclePlate: string;
  serviceDate: string;
}

export interface TripIncidentFilters {
  tripId?: string;
  supervisorId?: string;
  status?: TripIncidentStatus;
  page?: number;
  perPage?: number;
}

export interface TripIncidentListResponse {
  data: TripIncidentListItem[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UpdateTripIncidentStatusRequest {
  status: TripIncidentStatus;
  adminNote?: string;
}

export const tripIncidentService = {
  getAll: async (filters: TripIncidentFilters = {}): Promise<TripIncidentListResponse> => {
    const params: Record<string, unknown> = {
      page: filters.page || 1,
      perPage: filters.perPage || 20,
    };

    if (filters.tripId) params.tripId = filters.tripId;
    if (filters.supervisorId) params.supervisorId = filters.supervisorId;
    if (filters.status) params.status = filters.status;

    return apiService.get<TripIncidentListResponse>("/trip-incidents", params);
  },

  getById: async (id: string): Promise<TripIncident> => {
    return apiService.get<TripIncident>(`/trip-incidents/${id}`);
  },

  updateStatus: async (
    id: string,
    request: UpdateTripIncidentStatusRequest
  ): Promise<TripIncident> => {
    const getStatusNumber = (status: TripIncidentStatus): number => {
      switch (status) {
        case TripIncidentStatus.Open:
          return 0;
        case TripIncidentStatus.Acknowledged:
          return 1;
        case TripIncidentStatus.Resolved:
          return 2;
        default:
          return 0;
      }
    };

    const payload = {
      status: getStatusNumber(request.status),
      adminNote: request.adminNote
    };
    return apiService.patch<TripIncident>(`/trip-incidents/${id}/status`, payload);
  },
};

