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
  routeId?: string;
  serviceDate?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  upcomingDays?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAllTripsResponse {
  data: TripDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export const tripService = {
  getAllTrips: async (params?: GetAllTripsParams): Promise<GetAllTripsResponse> => {
    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;
    if (params?.routeId) queryParams.routeId = params.routeId;
    if (params?.serviceDate) queryParams.serviceDate = params.serviceDate;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.status) queryParams.status = params.status;
    if (params?.upcomingDays) queryParams.upcomingDays = params.upcomingDays;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    const response = await apiService.get<GetAllTripsResponse>('/Trip', queryParams);


    return response;
  },

  getTripById: async (id: string): Promise<TripDto> => {
    return await apiService.get<TripDto>(`/Trip/${id}`);
  },

  createTrip: async (data: CreateTripDto): Promise<TripDto> => {
    return await apiService.post<TripDto>("/Trip", data);
  },

  updateTrip: async (id: string, data: UpdateTripDto): Promise<void> => {
    return await apiService.put<void>(`/Trip/${id}`, data);
  },

  deleteTrip: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/Trip/${id}`);
  },

  generateTripsFromSchedule: async (
    scheduleId: string,
    startDate: string,
    endDate: string
  ): Promise<TripDto[]> => {
    const response = await apiClient.post<TripDto[]>("/Trip/generate-from-schedule", null, {
      params: {
        scheduleId,
        startDate,
        endDate
      }
    });
    return response.data;
  },

  getTripsByRoute: async (routeId: string): Promise<TripDto[]> => {
    return await apiService.get<TripDto[]>(`/Trip/route/${routeId}`);
  },

  updateTripStatus: async (id: string, status: string, reason?: string): Promise<{ tripId: string; status: string; reason?: string; message: string }> => {
    return await apiService.put<{ tripId: string; status: string; reason?: string; message: string }>(`/Trip/${id}/status`, { status, reason });
  },

  getOngoingTrips: async (): Promise<TripDto[]> => {
    const response = await apiService.get<GetAllTripsResponse>('/Trip', {
      status: 'InProgress',
      perPage: 100 
    });
    return response.data;
  },
};