import { apiService } from "@/lib/api";
import {
  RouteDto,
  CreateRouteRequest,
  UpdateRouteRequest,
  UpdateBulkRouteRequest,
  UpdateBulkRouteResponse,
  UpdateRouteBasicRequest,
  RouteSuggestionResponse,
  RouteSuggestionDto,
  RoutePickupPointInfoDto,
  RouteVehicleInfo,
  ReplaceAllRoutesRequest,
  ReplaceAllRoutesResponse,
} from "./routeService.types";

type AnyObject = Record<string, unknown>;

const getValue = <T = unknown>(obj: AnyObject, keys: string[], fallback: T): T => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return fallback;
};

const normalizePickupPoint = (point: AnyObject): RoutePickupPointInfoDto => ({
  pickupPointId: getValue(point, ["pickupPointId", "PickupPointId"], ""),
  description: getValue(point, ["description", "Description"], ""),
  address: getValue(point, ["address", "Address"], ""),
  latitude: getValue(point, ["latitude", "Latitude"], 0),
  longitude: getValue(point, ["longitude", "Longitude"], 0),
  sequenceOrder: getValue(point, ["sequenceOrder", "SequenceOrder"], 0),
  studentCount: getValue(point, ["studentCount", "StudentCount"], 0),
  arrivalTime: getValue(point, ["arrivalTime", "ArrivalTime"], ""),
});

const normalizeVehicle = (vehicle: AnyObject | null | undefined): RouteVehicleInfo | null => {
  if (!vehicle) return null;
  return {
    vehicleId: getValue(vehicle, ["vehicleId", "VehicleId"], ""),
    licensePlate: getValue(vehicle, ["licensePlate", "LicensePlate"], ""),
    capacity: getValue(vehicle, ["capacity", "Capacity"], 0),
    assignedStudents: getValue(vehicle, ["assignedStudents", "AssignedStudents"], 0),
    utilizationPercentage: getValue(vehicle, ["utilizationPercentage", "UtilizationPercentage"], 0),
  };
};

const normalizeRouteSuggestion = (route: AnyObject): RouteSuggestionDto => ({
  pickupPoints: getValue(route, ["pickupPoints", "PickupPoints"], []).map(normalizePickupPoint),
  vehicle: normalizeVehicle(getValue(route, ["vehicle", "Vehicle"], null)),
  totalStudents: getValue(route, ["totalStudents", "TotalStudents"], 0),
  totalDistance: getValue(route, ["totalDistance", "TotalDistance"], 0),
  estimatedCost: getValue(route, ["estimatedCost", "EstimatedCost"], 0),
  generatedAt: getValue(route, ["generatedAt", "GeneratedAt"], new Date().toISOString()),
});

const normalizeRouteSuggestionResponse = (data: AnyObject): RouteSuggestionResponse => ({
  success: getValue<boolean>(data, ["success", "Success"], false),
  message: getValue<string>(data, ["message", "Message"], ""),
  routes: getValue<AnyObject[]>(data, ["routes", "Routes"], []).map(normalizeRouteSuggestion),
  totalRoutes: getValue<number>(data, ["totalRoutes", "TotalRoutes"], 0),
  generatedAt: getValue<string>(data, ["generatedAt", "GeneratedAt"], new Date().toISOString()),
});

export const routeService = {
  getAll: async (): Promise<RouteDto[]> => {
    return await apiService.get<RouteDto[]>("/routes");
  },

  getById: async (id: string): Promise<RouteDto> => {
    return await apiService.get<RouteDto>(`/routes/${id}`);
  },

  create: async (data: CreateRouteRequest): Promise<RouteDto> => {
    return await apiService.post<RouteDto>("/routes", data);
  },

  update: async (id: string, data: UpdateRouteRequest): Promise<RouteDto> => {
    return await apiService.put<RouteDto>(`/routes/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/routes/${id}`);
  },

  bulkUpdate: async (data: UpdateBulkRouteRequest): Promise<UpdateBulkRouteResponse> => {
    return await apiService.put<UpdateBulkRouteResponse>("/routes/bulk", data);
  },

  updateBasic: async (id: string, data: UpdateRouteBasicRequest): Promise<RouteDto> => {
    return await apiService.put<RouteDto>(`/routes/${id}/basic`, data);
  },

  generateSuggestions: async (): Promise<RouteSuggestionResponse> => {
    const raw = await apiService.get<AnyObject>(
      "/routes/suggestions",
      undefined,
      {
        timeout: 120000, 
      }
    );
    const normalized = normalizeRouteSuggestionResponse(raw);
    return normalized;
  },

  replaceAll: async (data: ReplaceAllRoutesRequest): Promise<ReplaceAllRoutesResponse> => {
    return await apiService.post<ReplaceAllRoutesResponse>("/routes/replace-all", data);
  },
};