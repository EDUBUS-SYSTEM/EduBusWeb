import { apiService } from "@/lib/api";
import { apiClient } from "@/lib/api";

export interface CreateDriverPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: number; // 1: Male, 2: Female, 3: Other
  dateOfBirth: string; // ISO string
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

export interface ImportDriversResponse {
  totalProcessed: number;
  successfulUsers: ImportUserSuccess[];
  failedUsers: ImportUserError[];
}

export const createDriver = async (
  payload: CreateDriverPayload
): Promise<CreateUserResponse> => {
  // Backend endpoint: POST /api/driver
  console.log('Calling createDriver with URL:', '/driver');
  console.log('Payload:', payload);
  const result = await apiService.post<CreateUserResponse>("/driver", payload);
  console.log('API result:', result);
  return result as unknown as CreateUserResponse;
};

export const importDriversFromExcel = async (
  file: File
): Promise<ImportDriversResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  console.log('Sending import request to /driver/import');
  const res = await apiClient.post<ImportDriversResponse>(
    "/driver/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  console.log('Raw API response:', res);
  console.log('Response data:', res.data);
  
  // Handle potential response format differences
  const responseData = res.data;
  console.log('Response data type:', typeof responseData);
  console.log('Response data keys:', Object.keys(responseData || {}));
  
  return responseData;
};

export const exportDriversToExcel = async (): Promise<Blob> => {
  const res = await apiClient.get("/driver/export", {
    responseType: 'blob'
  });
  return res.data;
};

export const uploadHealthCertificate = async (
  driverId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(
    `/driver/${driverId}/upload-health-certificate`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data as { FileId: string; Message: string };
};


