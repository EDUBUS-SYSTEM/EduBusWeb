import { apiService } from "@/lib/api";
import { SchoolDto, UpdateSchoolRequest, SchoolLocationRequest } from "./schoolService.types";

export const schoolService = {
  // Get school information (public)
  get: async (): Promise<SchoolDto> => {
    return await apiService.get<SchoolDto>("/School");
  },

  // Get school information for admin (with internal notes)
  getForAdmin: async (): Promise<SchoolDto> => {
    return await apiService.get<SchoolDto>("/School/admin");
  },

  // Create school information (admin)
  create: async (data: UpdateSchoolRequest): Promise<SchoolDto> => {
    return await apiService.post<SchoolDto>("/School", data);
  },

  // Update school information (admin)
  update: async (id: string, data: UpdateSchoolRequest): Promise<SchoolDto> => {
    return await apiService.put<SchoolDto>(`/School/${id}`, data);
  },

  // Update school location (admin)
  updateLocation: async (id: string, data: SchoolLocationRequest): Promise<SchoolDto> => {
    return await apiService.put<SchoolDto>(`/School/${id}/location`, data);
  },
};

