import { apiService, apiClient } from "@/lib/api";

export interface CreateSupervisorPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: number; 
  dateOfBirth: string; 
  address: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
  message: string;
}

export interface ImportUserSuccess {
  rowNumber: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  id: string;
}

export interface ImportUserError {
  rowNumber: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  errorMessage: string;
}

export interface ImportSupervisorsResponse {
  totalProcessed: number;
  successUsers: ImportUserSuccess[];
  failedUsers: ImportUserError[];
}

export const createSupervisor = async (
  payload: CreateSupervisorPayload
): Promise<CreateUserResponse> => {
  const result = await apiService.post<CreateUserResponse>("/supervisor", payload);
  return result as unknown as CreateUserResponse;
};

export interface SupervisorResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth?: string;
  gender: string | number;
  userPhotoFileId?: string;
  status: string;
  lastActiveDate?: string;
}

export const getAllSupervisors = async (): Promise<SupervisorResponse[]> => {
  const res = await apiService.get<SupervisorResponse[]>("/supervisor");
  return Array.isArray(res) ? res : [];
};

export const importSupervisorsFromExcel = async (
  file: File
): Promise<ImportSupervisorsResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<ImportSupervisorsResponse>(
    "/supervisor/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};

export const exportSupervisorsToExcel = async (): Promise<Blob> => {
  const res = await apiClient.get("/supervisor/export", {
    responseType: "blob",
  });
  return res.data;
};


