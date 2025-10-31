
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
  ApiListResponse,      
  DriverInfoDto,  
} from '@/types/vehicle';

export class VehicleService {
  async getVehicles(filters: VehicleFilters): Promise<VehicleListResponse> {
  const searchParams = new URLSearchParams();
  
  // Only add status if it's not "all"
  if (filters.status && filters.status !== "all") {
    searchParams.append('status', filters.status);
  }
  
  if (filters.capacity)  searchParams.append('capacity', filters.capacity.toString());
  if (filters.adminId)   searchParams.append('adminId', filters.adminId);
  if (filters.search)    searchParams.append('search', filters.search);
  
  searchParams.append('page', (filters.page ?? 1).toString());
  searchParams.append('perPage', (filters.perPage ?? 20).toString());
  searchParams.append('sortBy', filters.sortBy ?? 'createdAt');
  searchParams.append('sortOrder', filters.sortOrder ?? 'desc');

  const url = `/vehicle?${searchParams.toString()}`;
  
  return apiService.get<VehicleListResponse>(url);
}


  async createVehicle(vehicleData: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    try {
      return await apiService.post<CreateVehicleResponse>('/vehicle', vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { success?: boolean, error?: string, message?: string, errors?: unknown } } };
      
      // Handle duplicate license plate error
      if (axiosError.response?.data?.error === 'LICENSE_PLATE_ALREADY_EXISTS') {
        throw new Error(axiosError.response.data.message || 'Vehicle with this license plate already exists.');
      }
      
      // Handle validation errors
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      
      // Handle other errors
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      throw error;
    }
  }

  async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleRequest): Promise<VehicleUpdateResponse> {
    try {
      return await apiService.put<VehicleUpdateResponse>(`/vehicle/${vehicleId}`, vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { success?: boolean, error?: string, message?: string, errors?: unknown } } };
      
      // Handle duplicate license plate error
      if (axiosError.response?.data?.error === 'LICENSE_PLATE_ALREADY_EXISTS') {
        throw new Error(axiosError.response.data.message || 'Vehicle with this license plate already exists.');
      }
      
      // Handle validation errors
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      
      // Handle other errors
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      throw error;
    }
  }

  async partialUpdateVehicle(vehicleId: string, vehicleData: Partial<CreateVehicleRequest>): Promise<VehicleUpdateResponse> {
    try {
      return await apiService.patch<VehicleUpdateResponse>(`/vehicle/${vehicleId}`, vehicleData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { success?: boolean, error?: string, message?: string, errors?: unknown } } };
      
      // Handle duplicate license plate error
      if (axiosError.response?.data?.error === 'LICENSE_PLATE_ALREADY_EXISTS') {
        throw new Error(axiosError.response.data.message || 'Vehicle with this license plate already exists.');
      }
      
      // Handle validation errors
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      
      // Handle other errors
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
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
      // Use assign-enhanced endpoint to ensure full time conflict validation
      return await apiService.post<DriverAssignmentResponse>(`/DriverVehicle/vehicle/${vehicleId}/drivers/assign-enhanced`, request);
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
  async getVehicleAvailableDrivers(
    vehicleId: string,
    startTimeUtc?: string,
    endTimeUtc?: string
  ): Promise<ApiListResponse<DriverInfoDto[]>> {
    try {
      const q = new URLSearchParams();
      q.set('availableOnly', 'true');
      if (startTimeUtc) q.set('startTimeUtc', startTimeUtc);
      if (endTimeUtc)   q.set('endTimeUtc', endTimeUtc);
      const qs = `?${q.toString()}`;
      return await apiService.get<ApiListResponse<DriverInfoDto[]>>(
        `/DriverVehicle/vehicle/${vehicleId}/drivers${qs}`
      );
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) throw new Error(axiosError.response.data.error);
      throw error;
    }
  }

  async getUnassignedVehicles(excludeRouteId?: string): Promise<VehicleListResponse> {
    try {
      const params: Record<string, unknown> = {};
      if (excludeRouteId) {
        params.excludeRouteId = excludeRouteId;
      }

      return await apiService.get<VehicleListResponse>('/vehicle/unassigned', params);
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