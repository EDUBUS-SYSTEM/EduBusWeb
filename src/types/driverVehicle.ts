import { BaseEntity, ApiResponse } from './index';

// Enums
export type DriverVehicleStatus = "Unassigned" | "Assigned";

// Base Entities
export interface DriverVehicleDto extends BaseEntity {
  driverId: string;
  vehicleId: string;
  isPrimaryDriver: boolean;
  startTimeUtc: string;
  endTimeUtc?: string;
  status: number; // 0 = Unassigned, 1 = Assigned
  assignmentReason?: string;
  assignedByAdminId: string;
  approvedAt?: string;
  approvedByAdminId?: string;
  approvalNote?: string;
  driver?: DriverInfoDto;
  vehicle?: VehicleInfoDto;
  assignedByAdmin?: AdminInfoDto;
  approvedByAdmin?: AdminInfoDto;
}

export interface DriverInfoDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  licenseNumber?: string;
  hasValidLicense?: boolean;
  hasHealthCertificate?: boolean;
}

export interface VehicleInfoDto {
  id: string;
  licensePlate: string;
  capacity: number;
  status: string;
  description?: string;
}

export interface AdminInfoDto {
  id: string;
  fullName: string;
  email: string;
}

// Request types
export interface AssignmentFilters {
  driverId?: string;
  vehicleId?: string;
  status?: number;
  isPrimaryDriver?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  isActive?: boolean;
  isUpcoming?: boolean;
  searchTerm?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DriverAssignmentRequest {
  driverId: string;
  isPrimaryDriver: boolean;
  startTimeUtc: string;
  endTimeUtc?: string;
  assignmentReason?: string;
}

export interface ReplaceDriverRequest {
  newDriverId: string;
  replacementReason: string;
  replacementDate: string;
  isNewDriverPrimary: boolean;
}

export interface UpdateAssignmentRequest {
  startTimeUtc?: string;
  endTimeUtc?: string;
  isPrimaryDriver?: boolean;
  assignmentReason?: string;
}

export interface PrimaryDriverInfo {
  hasPrimaryDriver: boolean;
  data?: DriverVehicleDto;
}

export interface UpdateAssignmentRequest {
  isPrimaryDriver?: boolean;
  startTimeUtc?: string;
  endTimeUtc?: string;
  assignmentReason?: string;
}

export interface UpdateAssignmentStatusRequest {
  status: number;
  note?: string;
}

export interface ReplaceDriverRequest {
  newDriverId: string;
  replacementReason: string;
  replacementDate: string;
  isNewDriverPrimary: boolean;
}

export interface PrimaryDriverInfo {
  success: boolean;
  hasPrimaryDriver: boolean;
  data?: DriverVehicleDto;
}

// Response types
export interface AssignmentListResponse {
  success: boolean;
  data: DriverVehicleDto[];
  pagination?: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: FilterSummary;
  error?: string;
}

export interface FilterSummary {
  totalAssignments: number;
  activeAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  upcomingAssignments: number;
  earliestStartDate?: string;
  latestEndDate?: string;
}

export interface DriverAssignmentResponse {
  success: boolean;
  data: DriverVehicleDto;
  message?: string;
  error?: string;
}

export interface DeleteAssignmentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Available drivers response
export interface AvailableDriversResponse {
  success: boolean;
  data: DriverInfoDto[];
  error?: string;
}

// Assignment summary for a driver
export interface DriverAssignmentSummaryDto {
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverStatus: string;
  currentAssignments: DriverVehicleDto[];
  totalCurrentAssignments: number;
  hasActiveAssignments: boolean;
  totalAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  pendingAssignments: number;
  totalWorkingHours: string;
  lastAssignmentDate?: string;
  nextAssignmentDate?: string;
  totalVehiclesAssigned: number;
  assignmentCompletionRate: number;
  punctualityRate: number;
}

export interface DriverAssignmentSummaryResponse {
  success: boolean;
  data: DriverAssignmentSummaryDto;
  error?: string;
}

// Conflict detection
export interface AssignmentConflictDto {
  conflictId: string;
  conflictType: string;
  description: string;
  severity: string;
  conflictTime: string;
  isResolvable: boolean;
}

// UI Types
export interface AssignmentTableRow {
  id: string;
  driverName: string;
  driverEmail?: string;
  licensePlate: string;
  startTime: string;
  endTime?: string;
  status: DriverVehicleStatus;
  isPrimaryDriver: boolean;
  driverId: string;
  vehicleId: string;
}

