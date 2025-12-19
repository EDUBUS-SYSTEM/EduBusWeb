import { apiService } from '@/lib/api';
import {
  AssignmentFilters,
  AssignmentListResponse,
  DriverAssignmentRequest,
  DriverAssignmentResponse,
  UpdateAssignmentRequest,
  UpdateAssignmentStatusRequest,
  DeleteAssignmentResponse,
  AvailableDriversResponse,
  DriverAssignmentSummaryResponse,
  ReplaceDriverRequest,
  PrimaryDriverInfo,
} from '@/types/driverVehicle';

export class DriverVehicleService {

  async getAssignments(filters: AssignmentFilters): Promise<AssignmentListResponse> {
    const params = new URLSearchParams();
    
    if (filters.driverId) params.append('driverId', filters.driverId);
    if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    if (filters.isPrimaryDriver !== undefined) params.append('isPrimaryDriver', filters.isPrimaryDriver.toString());
    if (filters.startDateFrom) params.append('startDateFrom', filters.startDateFrom);
    if (filters.startDateTo) params.append('startDateTo', filters.startDateTo);
    if (filters.endDateFrom) params.append('endDateFrom', filters.endDateFrom);
    if (filters.endDateTo) params.append('endDateTo', filters.endDateTo);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.isUpcoming !== undefined) params.append('isUpcoming', filters.isUpcoming.toString());
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    
    params.append('page', (filters.page ?? 1).toString());
    params.append('perPage', (filters.perPage ?? 20).toString());
    params.append('sortBy', filters.sortBy ?? 'startTime');
    params.append('sortOrder', filters.sortOrder ?? 'desc');

    return apiService.get<AssignmentListResponse>(`/DriverVehicle/assignments?${params.toString()}`);
  }


  async getDriverAssignments(
    driverId: string,
    isActive?: boolean,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<AssignmentListResponse> {
    const params = new URLSearchParams();
    
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('perPage', perPage.toString());

    return apiService.get<AssignmentListResponse>(
      `/DriverVehicle/driver/${driverId}/assignments?${params.toString()}`
    );
  }

  async getDriverAssignmentSummary(driverId: string): Promise<DriverAssignmentSummaryResponse> {
    return apiService.get<DriverAssignmentSummaryResponse>(
      `/DriverVehicle/driver/${driverId}/assignments/summary`
    );
  }


  async getVehicleDrivers(vehicleId: string, isActive?: boolean): Promise<AssignmentListResponse> {
    const params = new URLSearchParams();
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    return apiService.get<AssignmentListResponse>(
      `/DriverVehicle/vehicle/${vehicleId}/drivers?${params.toString()}`
    );
  }

  async getAvailableDrivers(
    vehicleId: string,
    startTimeUtc: string,
    endTimeUtc?: string
  ): Promise<AvailableDriversResponse> {
    const params = new URLSearchParams();
    params.append('availableOnly', 'true');
    params.append('startTimeUtc', startTimeUtc);
    if (endTimeUtc) params.append('endTimeUtc', endTimeUtc);

    return apiService.get<AvailableDriversResponse>(
      `/DriverVehicle/vehicle/${vehicleId}/drivers?${params.toString()}`
    );
  }


  async assignDriver(
    vehicleId: string,
    request: DriverAssignmentRequest
  ): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.post<DriverAssignmentResponse>(
        `/DriverVehicle/vehicle/${vehicleId}/drivers`,
        request
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async assignDriverWithValidation(
    vehicleId: string,
    request: DriverAssignmentRequest
  ): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.post<DriverAssignmentResponse>(
        `/DriverVehicle/vehicle/${vehicleId}/drivers/assign-enhanced`,
        request
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async updateAssignment(
    assignmentId: string,
    request: UpdateAssignmentRequest
  ): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.put<DriverAssignmentResponse>(
        `/DriverVehicle/assignments/${assignmentId}`,
        request
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async updateAssignmentStatus(
    assignmentId: string,
    request: UpdateAssignmentStatusRequest
  ): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.put<DriverAssignmentResponse>(
        `/DriverVehicle/assignments/${assignmentId}/status`,
        request
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async deleteAssignment(assignmentId: string): Promise<DeleteAssignmentResponse> {
    try {
      return await apiService.delete<DeleteAssignmentResponse>(
        `/DriverVehicle/assignments/${assignmentId}`
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async approveAssignment(assignmentId: string, note?: string): Promise<DriverAssignmentResponse> {
    try {
      const params = note ? new URLSearchParams({ note }) : '';
      return await apiService.put<DriverAssignmentResponse>(
        `/DriverVehicle/assignments/${assignmentId}/approve${params ? '?' + params : ''}`
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async rejectAssignment(assignmentId: string, reason: string): Promise<DriverAssignmentResponse> {
    try {
      const params = new URLSearchParams({ reason });
      return await apiService.put<DriverAssignmentResponse>(
        `/DriverVehicle/assignments/${assignmentId}/reject?${params}`
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async getPrimaryDriverForVehicle(vehicleId: string): Promise<PrimaryDriverInfo> {
    try {
      return await apiService.get<PrimaryDriverInfo>(`/DriverVehicle/vehicle/${vehicleId}/primary-driver`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }


  async replaceDriver(assignmentId: string, data: ReplaceDriverRequest): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.post<DriverAssignmentResponse>(`/DriverVehicle/assignments/${assignmentId}/replace`, data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }
}


export const driverVehicleService = new DriverVehicleService();
export default driverVehicleService;

