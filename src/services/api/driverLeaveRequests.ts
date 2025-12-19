import { apiService } from "@/lib/api";

export interface DriverLeaveRequest {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  driverEmail: string;
  driverLicenseNumber: string;
  primaryVehicleId?: string;
  primaryVehicleLicensePlate?: string;
  leaveType: 0 | 1 | 2 | 3 | 4 | 5 | 6; 
  startDate: string;
  endDate: string;
  reason: string;
  status: 0 | 1 | 2 | 3 | 4 | 5; 
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
  rejectionReason?: string; 
}

export interface ReplacementInfoResponse {
  id: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhoneNumber: string;
  driverLicenseNumber: string;
  leaveType: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: number;
  requestedAt: string;
  approvedByAdminId?: string;
  approvedByAdminName?: string;
  approvedAt?: string;
  approvalNote?: string;
  autoReplacementEnabled: boolean;
  suggestedReplacementDriverId?: string;
  suggestedReplacementDriverName?: string;
  suggestedReplacementVehicleId?: string;
  suggestedReplacementVehiclePlate?: string;
  suggestionGeneratedAt?: string;
}

export interface ReplacementMatchDto {
  driverId: string;
  vehicleId: string | null;
  startDate: string;
  endDate: string;
}

export const driverLeaveRequestService = {
  getLeaveRequests: async (filters: DriverLeaveRequestFilters = {}): Promise<DriverLeaveRequestResponse> => {
    const params = {
      status: filters.status || undefined,
      leaveType: filters.leaveType || undefined,
      searchTerm: filters.searchTerm || undefined,
      sortOrder: filters.sortBy || "desc",
      page: filters.page || 1,
      perPage: filters.perPage || 10,
    };

    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params];
      }
    });

    return apiService.get<DriverLeaveRequestResponse>("/Driver/leaves", params);
  },

  getLeaveRequestById: async (id: string): Promise<DriverLeaveRequest> => {
    return apiService.get<DriverLeaveRequest>(`/driver-leave-requests/${id}`);
  },

  approveLeaveRequest: async (id: string, data: ApproveLeaveRequestData): Promise<DriverLeaveRequest> => {
    return apiService.patch<DriverLeaveRequest>(`/Driver/leaves/${id}/approve`, data);
  },

  rejectLeaveRequest: async (id: string, data: RejectLeaveRequestData): Promise<DriverLeaveRequest> => {
    return apiService.patch<DriverLeaveRequest>(`/Driver/leaves/${id}/reject`, data);
  },

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

  getReplacementInfo: async (driverId: string): Promise<ReplacementInfoResponse | null> => {
    try {
      const response = await apiService.get<ReplacementInfoResponse>(`/Driver/${driverId}/replacement-info`);
      
      if (response && response.id) {
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching replacement info:', error);
      return null;
    }
  },

  getActiveReplacementMatches: async (): Promise<ReplacementMatchDto[]> => {
    try {
      const response = await apiService.get<ReplacementMatchDto[]>("/Driver/active-replacement-matches");
      return response || [];
    } catch (error) {
      console.error('Error fetching active replacement matches:', error);
      return [];
    }
  },
};