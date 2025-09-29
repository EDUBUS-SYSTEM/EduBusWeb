// src/services/routeService.ts
import { apiService } from "@/lib/api";
import { RouteDto, CreateRouteRequest, UpdateRouteRequest, UpdateBulkRouteRequest, UpdateBulkRouteResponse } from "./routeService.types";

export const routeService = {
  // Get all routes
  getAll: async (): Promise<RouteDto[]> => {
    return await apiService.get<RouteDto[]>("/routes");
  },

  // Get route by ID
  getById: async (id: string): Promise<RouteDto> => {
    return await apiService.get<RouteDto>(`/routes/${id}`);
  },

  // Create a new route
  create: async (data: CreateRouteRequest): Promise<RouteDto> => {
    return await apiService.post<RouteDto>("/routes", data);
  },

  // Update a route
  update: async (id: string, data: UpdateRouteRequest): Promise<RouteDto> => {
    return await apiService.put<RouteDto>(`/routes/${id}`, data);
  },

  // Delete a route
  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/routes/${id}`);
  },

  bulkUpdate: async (data: UpdateBulkRouteRequest): Promise<UpdateBulkRouteResponse> => {
    return await apiService.put<UpdateBulkRouteResponse>("/routes/bulk", data);
  },
};