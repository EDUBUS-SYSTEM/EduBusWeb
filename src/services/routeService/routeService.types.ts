export interface RouteDto {
  id: string;
  routeName: string;
  isActive: boolean;
  vehicleId: string;
  vehicleCapacity: number;
  vehicleNumberPlate: string;
  pickupPoints: PickupPointInfoDto[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface PickupPointInfoDto {
  pickupPointId: string;
  sequenceOrder: number;
  location: LocationInfoDto;
  studentCount: number;
  studentNames?: string[];
}

export interface LocationInfoDto {
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreateRouteRequest {
  routeName: string;
  vehicleId: string;
  pickupPoints: RoutePickupPointRequest[];
}

export interface UpdateRouteRequest {
  routeName?: string;
  vehicleId?: string;
  pickupPoints?: RoutePickupPointRequest[];
}

export interface UpdateBulkRouteRequest {
  routes: UpdateBulkRouteItem[];
}

export interface UpdateBulkRouteItem {
  routeId: string;
  routeName?: string;
  vehicleId?: string;
  pickupPoints?: RoutePickupPointRequest[];
}

export interface UpdateBulkRouteResponse {
  success: boolean;
  totalRoutes: number;
  updatedRoutes: RouteDto[];
  errorMessage?: string;
}

export interface RoutePickupPointRequest {
  pickupPointId: string;
  sequenceOrder: number;
}

export interface UpdateRouteBasicRequest {
  routeName?: string;
  vehicleId?: string;
}

export interface RouteSuggestionResponse {
  success: boolean;
  message: string;
  routes: RouteSuggestionDto[];
  totalRoutes: number;
  generatedAt: string;
}

export interface RouteSuggestionDto {
  pickupPoints: RoutePickupPointInfoDto[];
  vehicle: RouteVehicleInfo | null;
  totalStudents: number;
  totalDistance: number;
  estimatedCost: number;
  generatedAt: string;
}

export interface RoutePickupPointInfoDto {
  pickupPointId: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  studentCount: number;
  arrivalTime: string;
}

export interface RouteVehicleInfo {
  vehicleId: string;
  licensePlate: string;
  capacity: number;
  assignedStudents: number;
  utilizationPercentage: number;
}

export interface ReplaceAllRoutesRequest {
  routes: CreateRouteRequest[];
  forceDelete?: boolean;
}

export interface ReplaceAllRoutesResponse {
  success: boolean;
  deletedRoutes: number;
  totalNewRoutes: number;
  successfulRoutes: number;
  createdRoutes: RouteDto[];
  errorMessage?: string;
}