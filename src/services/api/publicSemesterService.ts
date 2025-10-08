import { apiClient } from "@/lib/api";

export interface AcademicSemesterInfo {
  name: string;
  code: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  holidays: string[];
  totalSchoolDays: number;
  totalTrips: number;
}

class PublicSemesterService {
  /**
   * Lấy thông tin kỳ học tiếp theo mà không cần phân quyền
   * Sử dụng API /api/transaction/next-semester với [AllowAnonymous]
   */
  async getNextSemester(): Promise<AcademicSemesterInfo | null> {
    try {
      const response = await apiClient.get("/transaction/next-semester");
      return response.data;
    } catch (error) {
      console.error("Error getting next semester:", error);
      return null;
    }
  }

  /**
   * Kiểm tra kết nối API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get("/transaction/next-semester");
      return response.status === 200;
    } catch (error) {
      console.error("Public Semester API connection test failed:", error);
      return false;
    }
  }
}

export const publicSemesterService = new PublicSemesterService();
