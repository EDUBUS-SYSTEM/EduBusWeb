import { apiService } from "@/lib/api";
import { apiClient } from "@/lib/api";

export interface CreateDriverLicensePayload {
  licenseNumber: string;
  dateOfIssue: string; 
  issuedBy: string;
  driverId: string;
}

export interface DriverLicenseResponse {
  id: string;
  licenseNumber: string;
  dateOfIssue: string;
  issuedBy: string;
  driverId: string;
}

export const createDriverLicense = async (
  payload: CreateDriverLicensePayload
): Promise<DriverLicenseResponse> => {
  const res = await apiService.post<DriverLicenseResponse>("/driverlicense", payload);
  return res as unknown as DriverLicenseResponse;
};

export const uploadLicenseImage = async (
  driverLicenseId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(
    `/driverlicense/license-image/${driverLicenseId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data as { FileId: string; Message: string };
};


