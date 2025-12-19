import { apiService } from "@/lib/api";
import { SchoolDto, UpdateSchoolRequest, SchoolLocationRequest } from "./schoolService.types";

export const schoolService = {
  get: async (): Promise<SchoolDto> => {
    return await apiService.get<SchoolDto>("/School");
  },

  getForAdmin: async (): Promise<SchoolDto> => {
    return await apiService.get<SchoolDto>("/School/admin");
  },

  create: async (data: UpdateSchoolRequest): Promise<SchoolDto> => {
    return await apiService.post<SchoolDto>("/School", data);
  },

  update: async (id: string, data: UpdateSchoolRequest): Promise<SchoolDto> => {
    return await apiService.put<SchoolDto>(`/School/${id}`, data);
  },

  updateLocation: async (id: string, data: SchoolLocationRequest): Promise<SchoolDto> => {
    return await apiService.put<SchoolDto>(`/School/${id}/location`, data);
  },
};

