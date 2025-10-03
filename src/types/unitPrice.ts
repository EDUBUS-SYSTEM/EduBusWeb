export interface UnitPrice {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  byAdminId: string;
  byAdminName: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface CreateUnitPriceRequest {
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateUnitPriceRequest {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface UnitPriceFilters {
  isActive?: boolean;
  effectiveDate?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UnitPriceListResponse {
  data: UnitPrice[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UnitPriceResponse {
  success: boolean;
  data: UnitPrice;
  message?: string;
}

export interface UnitPriceListResponse {
  success: boolean;
  data: UnitPrice[];
  message?: string;
}
