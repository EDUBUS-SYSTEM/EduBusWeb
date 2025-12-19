import { apiService } from "@/lib/api";
import { apiClient } from "@/lib/api";

export interface CreateParentPayload {
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

export interface ImportParentsResponse {
  totalProcessed: number;
  successUsers: ImportUserSuccess[];
  failedUsers: ImportUserError[];
}

export const createParent = async (
  payload: CreateParentPayload
): Promise<CreateUserResponse> => {
  console.log("Calling createParent with URL:", "/parent");
  console.log("Payload:", payload);
  const result = await apiService.post<CreateUserResponse>("/parent", payload);
  console.log("API result:", result);
  return result as unknown as CreateUserResponse;
};

export const importParentsFromExcel = async (
  file: File
): Promise<ImportParentsResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<ImportParentsResponse>(
    "/parent/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};

export const exportParentsToExcel = async (): Promise<Blob> => {
  const res = await apiClient.get("/parent/export", {
    responseType: "blob",
  });
  return res.data;
};
