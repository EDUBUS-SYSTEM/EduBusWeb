import { apiService } from "@/lib/api";

// Driver Leave Request Types
export interface DriverLeaveRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  driverEmail: string;
  driverLicenseNumber: string;
  primaryVehicleId?: string;
  primaryVehicleLicensePlate?: string;
  leaveType: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: undefined, 1: Annual, 2: Sick, 3: Personal, 4: Emergency, 5: Training, 6: Other
  startDate: string;
  endDate: string;
  reason: string;
  status: 0 | 1 | 2 | 3 | 4 | 5; // 0: undefined, 1: Pending, 2: Approved, 3: Rejected, 4: Cancelled, 5: Completed
  requestedAt: string;
  approvedAt?: string;
  approvedByAdminId?: string;
  approvedByAdminName?: string;
  approvalNote?: string;
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

export interface DriverLeaveRequestFilters {
  status?: string;
  leaveType?: string;
  searchTerm?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
}

export interface DriverLeaveRequestResponse {
  data: DriverLeaveRequest[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
  pendingLeavesCount: number;
  error?: string;
}

export interface ApproveLeaveRequestData {
  notes?: string;
  replacementDriverId?: string; 
}

export interface RejectLeaveRequestData {
  reason?: string;
  rejectionReason?: string; // Alternative field name
}

// API Service for Driver Leave Requests
export const driverLeaveRequestService = {
  // Get all driver leave requests with filters
  getLeaveRequests: async (filters: DriverLeaveRequestFilters = {}): Promise<DriverLeaveRequestResponse> => {
    const params = {
      status: filters.status || undefined,
      leaveType: filters.leaveType || undefined,
      searchTerm: filters.searchTerm || undefined,
      sortOrder: filters.sortBy || "desc",
      page: filters.page || 1,
      perPage: filters.perPage || 10,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params];
      }
    });

    return apiService.get<DriverLeaveRequestResponse>("/Driver/leaves", params);
  },

  // Get a single leave request by ID
  getLeaveRequestById: async (id: string): Promise<DriverLeaveRequest> => {
    return apiService.get<DriverLeaveRequest>(`/driver-leave-requests/${id}`);
  },

  // Approve a leave request
  approveLeaveRequest: async (id: string, data: ApproveLeaveRequestData): Promise<DriverLeaveRequest> => {
    return apiService.patch<DriverLeaveRequest>(`/Driver/leaves/${id}/approve`, data);
  },

  // Reject a leave request
  rejectLeaveRequest: async (id: string, data: RejectLeaveRequestData): Promise<DriverLeaveRequest> => {
    return apiService.patch<DriverLeaveRequest>(`/Driver/leaves/${id}/reject`, data);
  },

  // Get leave request statistics
  getLeaveRequestStats: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> => {
    return apiService.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>("/driver-leave-requests/stats");
  },
};