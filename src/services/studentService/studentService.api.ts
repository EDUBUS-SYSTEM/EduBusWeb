import { apiService, apiClient } from "@/lib/api";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentDto,
  ImportStudentResult,
  StudentStatus
} from "./studentService.types";

export const studentService = {
  // Get all students
  getAll: async (): Promise<StudentDto[]> => {
    return await apiService.get<StudentDto[]>("/Student");
  },

  // Get student by ID
  getById: async (id: string): Promise<StudentDto> => {
    return await apiService.get<StudentDto>(`/Student/${id}`);
  },

  // Get students by parent ID
  getByParent: async (parentId: string): Promise<StudentDto[]> => {
    return await apiService.get<StudentDto[]>(`/Student/parent/${parentId}`);
  },

  // Create new student
  create: async (data: CreateStudentRequest): Promise<StudentDto> => {
    return await apiService.post<StudentDto>("/Student", data);
  },

  // Update student
  update: async (id: string, data: UpdateStudentRequest): Promise<StudentDto> => {
    return await apiService.put<StudentDto>(`/Student/${id}`, data);
  },

  // Import students from Excel
  importFromExcel: async (file: File): Promise<ImportStudentResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/Student/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to import students');
    }

    const result = await response.json();
    console.log(result);
    return result;
  },

  // Export students to Excel
  exportToExcel: async (): Promise<Blob> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/Student/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to export students');
    }

    return await response.blob();
  },

  // Status management methods
  activate: async (id: string): Promise<StudentDto> => {
    return await apiService.post<StudentDto>(`/Student/${id}/activate`);
  },

  deactivate: async (id: string, reason: string): Promise<StudentDto> => {
    return await apiService.post<StudentDto>(`/Student/${id}/deactivate`, { reason });
  },

  restore: async (id: string): Promise<StudentDto> => {
    return await apiService.post<StudentDto>(`/Student/${id}/restore`);
  },

  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/Student/${id}`);
  },

  getByStatus: async (status: StudentStatus): Promise<StudentDto[]> => {
    return await apiService.get<StudentDto[]>(`/Student/status/${status}`);
  },

  getUnassigned: async (): Promise<StudentDto[]> => {
    return await apiService.get<StudentDto[]>("/Student/unassigned");
  },

  uploadPhoto: async (studentId: string, file: File): Promise<{ FileId: string; Message?: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post<{ FileId: string; Message?: string }>(
      `/Student/${studentId}/upload-photo`,
      formData
    );
  },

  getPhotoUrl: (studentId: string): string => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:5223/api";
    return `${baseURL}/Student/${studentId}/photo`;
  },
};