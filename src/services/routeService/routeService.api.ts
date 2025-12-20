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
  students: getValue<AnyObject[]>(point, ["students", "Students"], []).map((s: AnyObject) => ({
    id: getValue(s, ["id", "Id"], ""),
    firstName: getValue(s, ["firstName", "FirstName"], ""),
    lastName: getValue(s, ["lastName", "LastName"], ""),
    parentEmail: getValue(s, ["parentEmail", "ParentEmail"], ""),
  }))
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
    const response = await apiService.get<unknown[]>("/routes");

    return (response as AnyObject[]).map((route: AnyObject) => ({
      id: route.id || route.Id,
      routeName: route.routeName || route.RouteName,
      isActive: route.isActive !== undefined ? route.isActive : route.IsActive,
      vehicleId: route.vehicleId || route.VehicleId,
      vehicleCapacity: route.vehicleCapacity || route.VehicleCapacity || 0,
      vehicleNumberPlate: route.vehicleNumberPlate || route.VehicleNumberPlate || "",
      createdAt: route.createdAt || route.CreatedAt,
      updatedAt: route.updatedAt || route.UpdatedAt,
      isDeleted: route.isDeleted !== undefined ? route.isDeleted : route.IsDeleted,
      pickupPoints: ((route.pickupPoints || route.PickupPoints || []) as AnyObject[]).map((pp: AnyObject) => ({
        pickupPointId: pp.pickupPointId || pp.PickupPointId,
        sequenceOrder: pp.sequenceOrder || pp.SequenceOrder,
        location: {
          latitude: (pp.location as AnyObject)?.latitude || (pp.Location as AnyObject)?.Latitude || 0,
          longitude: (pp.location as AnyObject)?.longitude || (pp.Location as AnyObject)?.Longitude || 0,
          address: (pp.location as AnyObject)?.address || (pp.Location as AnyObject)?.Address || "",
        },
        studentCount: pp.studentCount || pp.StudentCount || 0,
        students: ((pp.students || pp.Students || []) as AnyObject[]).map((s: AnyObject) => ({
          id: s.id || s.Id,
          firstName: s.firstName || s.FirstName || "",
          lastName: s.lastName || s.LastName || "",
          fullName: s.fullName || s.FullName || `${s.firstName || s.FirstName || ""} ${s.lastName || s.LastName || ""}`.trim(),
          status: s.status !== undefined ? s.status : (s.Status !== undefined ? s.Status : 0),
          pickupPointAssignedAt: s.pickupPointAssignedAt || s.PickupPointAssignedAt || null,
        })),
      })),
    })) as RouteDto[];
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