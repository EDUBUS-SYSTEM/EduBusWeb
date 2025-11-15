import { apiService, apiClient } from "@/lib/api";

export interface FileUploadResponse {
  fileId: string;
  message: string;
  entityType: string;
  entityId: string;
  fileType: string;
}

export type SchoolImageType = "Logo" | "Banner" | "StayConnected" | "FeatureHighlight" | "Gallery";

export interface SchoolImageInfo {
  fileId: string;
  fileType: SchoolImageType;
  originalFileName: string;
  contentType: string;
  uploadedAt: string;
}

export const fileService = {
  // Upload file
  upload: async (
    file: File,
    entityType: string,
    fileType: string,
    entityId?: string
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);
    formData.append("fileType", fileType);
    if (entityId) {
      formData.append("entityId", entityId);
    }

    const response = await apiClient.post<FileUploadResponse>(
      "/File/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get file URL - use Next.js API route proxy for authenticated requests
  getFileUrl: (fileId: string): string => {
    // Use Next.js API route proxy to handle authentication
    return `/api/file/${fileId}`;
  },

  // Delete file
  delete: async (fileId: string): Promise<void> => {
    await apiService.delete(`/File/${fileId}`);
  },

  // Get school images (Logo, Banner, Gallery)
  getSchoolImages: async (): Promise<SchoolImageInfo[]> => {
    return await apiService.get<SchoolImageInfo[]>("/School/images");
  },
};

