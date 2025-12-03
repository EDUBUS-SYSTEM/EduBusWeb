import { apiService } from '@/lib/api';
import { UnitPriceResponseDto, CreateUnitPriceDto, UpdateUnitPriceDto } from '@/types/unitPrice';

// Re-export types for convenience
export type { UnitPriceResponseDto, CreateUnitPriceDto, UpdateUnitPriceDto };

export const unitPriceService = {
  // Public endpoint to get current effective unit price
  getCurrentEffective: () =>
    apiService.get<UnitPriceResponseDto>('/UnitPrice/current-effective'),
  
  // Admin endpoints
  getAllUnitPrices: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice'),
  
  getAll: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice'),
  
  getActive: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice/active'),
  
  // Additional admin methods (if needed)
  createUnitPrice: (data: CreateUnitPriceDto) =>
    apiService.post<UnitPriceResponseDto>('/UnitPrice', data),
  
  updateUnitPrice: (id: string, data: UpdateUnitPriceDto) =>
    apiService.put<UnitPriceResponseDto>(`/UnitPrice/${id}`, data),
  
  deleteUnitPrice: (id: string) =>
    apiService.delete(`/UnitPrice/${id}`),
  
  // Status toggles use PUT to match backend controller
  activateUnitPrice: (id: string) =>
    apiService.put(`/UnitPrice/${id}/activate`),
  
  deactivateUnitPrice: (id: string) =>
    apiService.put(`/UnitPrice/${id}/deactivate`),
};