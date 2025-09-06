import { BaseEntity, ApiResponse, PaginatedResponse } from './index';

export interface VehicleDto extends BaseEntity {
  licensePlate: string;
  capacity: number;
  status: "Active" | "Inactive" | "Maintenance";
  adminId: string;
}

export type VehicleListResponse = ApiResponse<VehicleDto[]>;
export type VehicleGetResponse = ApiResponse<VehicleDto>;
export type VehicleUpdateResponse = ApiResponse<VehicleDto>;

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

export interface UpdateVehicleRequest {
  licensePlate: string;
  capacity: number;
  status: number;
}

export interface PartialUpdateVehicleRequest {
  licensePlate?: string;
  capacity?: number;
  status?: number;
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

// Driver Assignment Types
export interface DriverAssignmentRequest {
  driverId: string;
  isPrimaryDriver: boolean;
  startTimeUtc: string;
  endTimeUtc?: string;
}

export interface DriverAssignmentResponse {
  success: boolean;
  data?: DriverAssignmentDto;
  error?: string;
}

export interface DriverAssignmentDto {
  id: string;
  driverId: string;
  vehicleId: string;
  isPrimaryDriver: boolean;
  startTimeUtc: string;
  endTimeUtc?: string;
  driver?: DriverInfoDto;
  createdAt: string;
  updatedAt?: string;
  assignedByAdminId: string;
}

export interface DriverInfoDto {
  id: string;
  fullName: string;
  phoneNumber: string;
}

export interface VehicleDriversResponse {
  success: boolean;
  data: DriverAssignmentDto[];
  error?: string;
}
