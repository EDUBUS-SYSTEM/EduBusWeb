
import { apiService } from '@/lib/api';
import { 
  VehicleListResponse, 
  VehicleFilters, 
  CreateVehicleRequest, 
  CreateVehicleResponse, 
  VehicleGetResponse, 
  VehicleUpdateResponse,
  UpdateVehicleRequest,
  DriverAssignmentRequest,
  DriverAssignmentResponse,
  VehicleDriversResponse
} from '@/types/vehicle';

export class VehicleService {
  async getVehicles(filters: VehicleFilters): Promise<VehicleListResponse> {
    const params: Record<string, unknown> = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.capacity) params.capacity = filters.capacity;
    if (filters.adminId) params.adminId = filters.adminId;
    if (filters.page) params.page = filters.page;
    if (filters.perPage) params.perPage = filters.perPage;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    return apiService.get<VehicleListResponse>('/vehicle', params);
  }

  async createVehicle(vehicleData: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    try {
      return await apiService.post<CreateVehicleResponse>('/vehicle', vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: unknown } } };
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }

  async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleRequest): Promise<VehicleUpdateResponse> {
    try {
      return await apiService.put<VehicleUpdateResponse>(`/vehicle/${vehicleId}`, vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: unknown } } };
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }

  async partialUpdateVehicle(vehicleId: string, vehicleData: Partial<CreateVehicleRequest>): Promise<VehicleUpdateResponse> {
    try {
      return await apiService.patch<VehicleUpdateResponse>(`/vehicle/${vehicleId}`, vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: unknown } } };
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }

  async deleteVehicle(vehicleId: string): Promise<{ success: boolean }> {
    try {
      return await apiService.delete<{ success: boolean }>(`/vehicle/${vehicleId}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async assignDriver(vehicleId: string, request: DriverAssignmentRequest): Promise<DriverAssignmentResponse> {
    try {
      return await apiService.post<DriverAssignmentResponse>(`/Vehicle/${vehicleId}/drivers`, request);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getVehicleDrivers(vehicleId: string, isActive?: boolean): Promise<VehicleDriversResponse> {
    try {
      const params = isActive !== undefined ? `?isActive=${isActive}` : '';
      return await apiService.get<VehicleDriversResponse>(`/Vehicle/${vehicleId}/drivers${params}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getVehicleById(vehicleId: string): Promise<VehicleGetResponse> {
    try {
      return await apiService.get<VehicleGetResponse>(`/vehicle/${vehicleId}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }
}

export const vehicleService = new VehicleService();
export default vehicleService;