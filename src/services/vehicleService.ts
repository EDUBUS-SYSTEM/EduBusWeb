
import { apiService } from '@/lib/api';
import { VehicleListResponse, VehicleFilters, CreateVehicleRequest, CreateVehicleResponse } from '@/types/vehicle';

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
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }
}

export const vehicleService = new VehicleService();
export default vehicleService;