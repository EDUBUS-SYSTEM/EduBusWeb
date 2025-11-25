import { apiService } from '@/lib/api';

export interface EnrollmentSemesterSettingsDto {
  id: string;
  semesterName: string;
  academicYear: string;
  semesterCode: string;
  semesterStartDate: string; // ISO date string
  semesterEndDate: string; // ISO date string
  registrationStartDate: string; // ISO date string
  registrationEndDate: string; // ISO date string
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EnrollmentSemesterSettingsCreateDto {
  semesterName: string;
  academicYear: string;
  semesterCode: string;
  semesterStartDate: string; // ISO date string
  semesterEndDate: string; // ISO date string
  registrationStartDate: string; // ISO date string
  registrationEndDate: string; // ISO date string
  isActive: boolean;
  description?: string;
}

export interface EnrollmentSemesterSettingsUpdateDto {
  registrationStartDate: string; // ISO date string
  registrationEndDate: string; // ISO date string
  isActive: boolean;
  description?: string;
}

export interface EnrollmentSemesterSettingsQueryResultDto {
  items: EnrollmentSemesterSettingsDto[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface EnrollmentSemesterSettingsQueryParams {
  semesterCode?: string;
  academicYear?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const enrollmentSemesterSettingsService = {
  // Get list with filters
  getEnrollmentSemesterSettings: (params?: EnrollmentSemesterSettingsQueryParams) => {
    const queryParams: Record<string, string> = {};
    if (params?.semesterCode) queryParams.semesterCode = params.semesterCode;
    if (params?.academicYear) queryParams.academicYear = params.academicYear;
    if (params?.isActive !== undefined) queryParams.isActive = params.isActive.toString();
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.perPage) queryParams.perPage = params.perPage.toString();
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    return apiService.get<EnrollmentSemesterSettingsQueryResultDto>(
      '/EnrollmentSemesterSettings',
      queryParams
    );
  },

  // Get by ID
  getEnrollmentSemesterSetting: (id: string) =>
    apiService.get<EnrollmentSemesterSettingsDto>(`/EnrollmentSemesterSettings/${id}`),

  // Create
  createEnrollmentSemesterSetting: (data: EnrollmentSemesterSettingsCreateDto) =>
    apiService.post<EnrollmentSemesterSettingsDto>('/EnrollmentSemesterSettings', data),

  // Update
  updateEnrollmentSemesterSetting: (id: string, data: EnrollmentSemesterSettingsUpdateDto) =>
    apiService.put(`/EnrollmentSemesterSettings/${id}`, data),

  // Delete
  deleteEnrollmentSemesterSetting: (id: string) =>
    apiService.delete(`/EnrollmentSemesterSettings/${id}`),

  // Get active settings
  getActiveSettings: () =>
    apiService.get<EnrollmentSemesterSettingsDto>('/EnrollmentSemesterSettings/active'),

  // Get current open registration
  getCurrentOpenRegistration: () =>
    apiService.get<EnrollmentSemesterSettingsDto>('/EnrollmentSemesterSettings/current-open'),
};

