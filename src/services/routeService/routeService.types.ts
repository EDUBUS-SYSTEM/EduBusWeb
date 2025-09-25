// src/services/routeService.types.ts
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
}

export interface LocationInfoDto {
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreateRouteRequest {
  routeName: string;
  vehicleId: string;
  pickupPoints: PickupPointInfoDto[];
}

export interface UpdateRouteRequest {
  routeName?: string;
  vehicleId?: string;
  pickupPoints?: PickupPointInfoDto[];
}