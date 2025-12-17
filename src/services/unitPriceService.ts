import { apiService } from '@/lib/api';
import { UnitPriceResponseDto, CreateUnitPriceDto, UpdateUnitPriceDto } from '@/types/unitPrice';

export type { UnitPriceResponseDto, CreateUnitPriceDto, UpdateUnitPriceDto };

export const unitPriceService = {
  getCurrentEffective: () =>
    apiService.get<UnitPriceResponseDto>('/UnitPrice/current-effective'),
  
  getAllUnitPrices: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice'),
  
  getAll: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice'),
  
  getActive: () =>
    apiService.get<UnitPriceResponseDto[]>('/UnitPrice/active'),
  
  createUnitPrice: (data: CreateUnitPriceDto) =>
    apiService.post<UnitPriceResponseDto>('/UnitPrice', data),
  
  updateUnitPrice: (id: string, data: UpdateUnitPriceDto) =>
    apiService.put<UnitPriceResponseDto>(`/UnitPrice/${id}`, data),
  
  deleteUnitPrice: (id: string) =>
    apiService.delete(`/UnitPrice/${id}`),
  
  activateUnitPrice: (id: string) =>
    apiService.put(`/UnitPrice/${id}/activate`),
  
  deactivateUnitPrice: (id: string) =>
    apiService.put(`/UnitPrice/${id}/deactivate`),
};