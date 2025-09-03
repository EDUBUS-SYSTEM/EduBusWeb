import { BaseEntity, ApiResponse, PaginatedResponse } from './index';

export interface VehicleDto extends BaseEntity {
  licensePlate: string;
  capacity: number;
  status: "Active" | "Inactive" | "Maintenance";
  adminId: string;
}

export type VehicleListResponse = ApiResponse<VehicleDto[]>;

export type VehiclePaginatedResponse = PaginatedResponse<VehicleDto>;

export interface VehicleFilters {
  status?: string;
  capacity?: number;
  adminId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface CreateVehicleRequest {
  licensePlate: string;
  capacity: number;
  status: number;
}
export interface CreateVehicleResponse {
  success: boolean;
  data: VehicleResponse;
  error?: string;
}
export interface VehicleResponse {
  id: string;
  capacity: number;
  licensePlate: string;
  status: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
export interface VehicleFormErrors {
  licensePlate?: string;
  capacity?: string;
  status?: string;
}
