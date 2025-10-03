import { apiService } from '@/lib/api';
import { 
  UnitPrice, 
  CreateUnitPriceRequest, 
  UpdateUnitPriceRequest, 
  UnitPriceFilters, 
  UnitPriceListResponse,
  UnitPriceResponse
} from '@/types/unitPrice';

export class UnitPriceService {
  async getAllUnitPrices(): Promise<UnitPrice[]> {
    try {
      return await apiService.get<UnitPrice[]>('/UnitPrice');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getAllIncludingDeleted(): Promise<UnitPrice[]> {
    try {
      return await apiService.get<UnitPrice[]>('/UnitPrice/all-including-deleted');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getUnitPriceById(id: string): Promise<UnitPrice> {
    try {
      return await apiService.get<UnitPrice>(`/UnitPrice/${id}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getActiveUnitPrices(): Promise<UnitPrice[]> {
    try {
      return await apiService.get<UnitPrice[]>('/UnitPrice/active');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getEffectiveUnitPrices(date?: string): Promise<UnitPrice[]> {
    try {
      const params = date ? { date } : {};
      return await apiService.get<UnitPrice[]>('/UnitPrice/effective', params);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async getCurrentEffectiveUnitPrice(): Promise<UnitPrice> {
    try {
      return await apiService.get<UnitPrice>('/UnitPrice/current-effective');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async createUnitPrice(unitPriceData: CreateUnitPriceRequest): Promise<UnitPrice> {
    try {
      return await apiService.post<UnitPrice>('/UnitPrice', unitPriceData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: unknown } } };
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }

  async updateUnitPrice(unitPriceData: UpdateUnitPriceRequest): Promise<UnitPrice> {
    try {
      return await apiService.put<UnitPrice>(`/UnitPrice/${unitPriceData.id}`, unitPriceData);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: unknown } } };
      if (axiosError.response?.data?.errors) {
        const validationErrors = axiosError.response.data.errors;
        throw new Error(JSON.stringify(validationErrors));
      }
      throw error;
    }
  }

  async deleteUnitPrice(id: string): Promise<{ success: boolean }> {
    try {
      return await apiService.delete<{ success: boolean }>(`/UnitPrice/${id}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async activateUnitPrice(id: string): Promise<{ success: boolean }> {
    try {
      return await apiService.put<{ success: boolean }>(`/UnitPrice/${id}/activate`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }

  async deactivateUnitPrice(id: string): Promise<{ success: boolean }> {
    try {
      return await apiService.put<{ success: boolean }>(`/UnitPrice/${id}/deactivate`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      throw error;
    }
  }
}

export const unitPriceService = new UnitPriceService();
export default unitPriceService;
