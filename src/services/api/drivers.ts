import { apiService } from "@/lib/api";
import { apiClient } from "@/lib/api";

export interface CreateDriverPayload {
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

export interface ImportDriversResponse {
  totalProcessed: number;
  successUsers: ImportUserSuccess[];
  failedUsers: ImportUserError[];
}

export interface GetAvailableDriverDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number; 
  licenseNumber?: string;
  licenseExpiryDate?: string; 
  hasValidLicense: boolean;
  hasHealthCertificate: boolean;
  yearsOfExperience: number;
  lastActiveDate?: string; 
  isAvailable: boolean;
  availabilityReason?: string;
  checkedAt: string; 
}

export const createDriver = async (
  payload: CreateDriverPayload
): Promise<CreateUserResponse> => {
  console.log("Calling createDriver with URL:", "/driver");
  console.log("Payload:", payload);
  const result = await apiService.post<CreateUserResponse>("/driver", payload);
  console.log("API result:", result);
  return result as unknown as CreateUserResponse;
};

export const importDriversFromExcel = async (
  file: File
): Promise<ImportDriversResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<ImportDriversResponse>(
    "/driver/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};

export const exportDriversToExcel = async (): Promise<Blob> => {
  const res = await apiClient.get("/driver/export", {
    responseType: "blob",
  });
  return res.data;
};

export const uploadHealthCertificate = async (driverId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(
    `/driver/${driverId}/upload-health-certificate`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data as { FileId: string; Message: string };
};

export const getAvailableDrivers = async (
  startDate: Date,
  endDate: Date
): Promise<GetAvailableDriverDto[]> => {
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    0, 0, 0, 0
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    23, 59, 59, 999
  );

  const formatDateTime = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}:${String(d.getSeconds()).padStart(
      2,
      "0"
    )}.${String(d.getMilliseconds()).padStart(3, "0")}0000`;

  const params = new URLSearchParams({
    startDate: formatDateTime(start),
    endDate: formatDateTime(end),
  });

  const result = await apiService.get<GetAvailableDriverDto[]>(
    `/DriverVehicle/drivers/available?${params.toString()}`
  );
  console.log("Get available drivers result:", result);
  return result as unknown as GetAvailableDriverDto[];
};
