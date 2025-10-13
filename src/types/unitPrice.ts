// Unit Price Types
export interface UnitPriceResponseDto {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isDeleted: boolean;
  byAdminId: string;
  byAdminName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitPriceDto {
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
  byAdminId?: string;
  byAdminName?: string;
}

export interface UpdateUnitPriceDto {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UnitPriceFilters {
  isActive?: boolean;
  effectiveDate?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UnitPriceListResponse {
  data: UnitPriceResponseDto[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}
