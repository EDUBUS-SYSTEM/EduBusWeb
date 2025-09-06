import { apiClient } from "@/lib/api";

export interface UploadResponse {
  FileId: string;
  Message: string;
}

export const uploadUserPhoto = async (
  userId: string,
  file: File
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<UploadResponse>(
    `/useraccount/${userId}/upload-user-photo`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};


