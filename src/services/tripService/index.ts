import { apiService } from "@/lib/api";
import { apiClient } from "@/lib/api";
import { 
  TripDto, 
  CreateTripDto, 
  UpdateTripDto
} from "@/types";

export interface GetAllTripsParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  serviceDate?: string;
  routeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAllTripsResponse {
  data: TripDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const tripService = {
  // Get all trips with pagination and filters
  getAllTrips: async (params?: GetAllTripsParams): Promise<GetAllTripsResponse> => {
    const response = await apiService.get<GetAllTripsResponse>("/Trip", params as Record<string, unknown> | undefined);
    return response;
  },

  // Get trip by ID
  getTripById: async (id: string): Promise<TripDto> => {
    return await apiService.get<TripDto>(`/Trip/${id}`);
  },

  // Create a new trip
  createTrip: async (data: CreateTripDto): Promise<TripDto> => {
    return await apiService.post<TripDto>("/Trip", data);
  },

  // Update a trip
  updateTrip: async (id: string, data: UpdateTripDto): Promise<TripDto> => {
    return await apiService.put<TripDto>(`/Trip/${id}`, data);
  },

  // Delete a trip
  deleteTrip: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/Trip/${id}`);
  },

  // Generate trips from schedule
  generateTripsFromSchedule: async (
    scheduleId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TripDto[]> => {
    // API uses query parameters: /Trip/generate-from-schedule?scheduleId={guid}&startDate={datetime}&endDate={datetime}
    const response = await apiClient.post<TripDto[]>("/Trip/generate-from-schedule", null, {
      params: {
        scheduleId,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  // Get trips by route
  getTripsByRoute: async (routeId: string, params?: GetAllTripsParams): Promise<GetAllTripsResponse> => {
    return await apiService.get<GetAllTripsResponse>(`/Trip/route/${routeId}`, params as Record<string, unknown> | undefined);
  },

  // Get trips by date range
  getTripsByDateRange: async (
    startDate: string, 
    endDate: string, 
    params?: GetAllTripsParams
  ): Promise<GetAllTripsResponse> => {
    return await apiService.get<GetAllTripsResponse>("/Trip/date-range", {
      ...(params as Record<string, unknown> | undefined),
      startDate,
      endDate
    } as Record<string, unknown>);
  },

  // Update trip status
  updateTripStatus: async (id: string, status: "Scheduled" | "InProgress" | "Completed" | "Cancelled"): Promise<TripDto> => {
    return await apiService.patch<TripDto>(`/Trip/${id}/status`, { status });
  },
};

