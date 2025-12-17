import { apiClient } from "@/lib/api";
import {
  AcademicCalendar,
  CreateAcademicCalendarDto,
  UpdateAcademicCalendarDto,
  AcademicCalendarQueryParams,
  AcademicSemester,
  SchoolHoliday,
  SchoolDay,
} from "@/types";

class AcademicCalendarService {
  async testConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get("/academiccalendar/active");
      return response.status === 200;
    } catch (error) {
      console.error("Academic Calendar API connection test failed:", error);
      return false;
    }
  }

  async getAcademicCalendars(
    params?: AcademicCalendarQueryParams
  ): Promise<AcademicCalendar[]> {
    const queryParams = new URLSearchParams();

    if (params?.academicYear)
      queryParams.append("academicYear", params.academicYear);
    if (params?.activeOnly !== undefined)
      queryParams.append("activeOnly", params.activeOnly.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.perPage)
      queryParams.append("perPage", params.perPage.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await apiClient.get(
      `/academiccalendar?${queryParams.toString()}`
    );
    return response.data;
  }

  async getAcademicCalendarById(id: string): Promise<AcademicCalendar> {
    const response = await apiClient.get(`/academiccalendar/${id}`);
    return response.data;
  }

  async createAcademicCalendar(
    academicCalendar: CreateAcademicCalendarDto
  ): Promise<AcademicCalendar> {
    const response = await apiClient.post(
      "/academiccalendar",
      academicCalendar
    );
    return response.data;
  }

  async updateAcademicCalendar(
    id: string,
    academicCalendar: UpdateAcademicCalendarDto
  ): Promise<void> {
    console.log("Update academic calendar request:", {
      url: `/academiccalendar/${id}`,
      data: academicCalendar,
    });

    const response = await apiClient.put(
      `/academiccalendar/${id}`,
      academicCalendar
    );
    console.log("Update academic calendar response:", response);
  }

  async deleteAcademicCalendar(id: string): Promise<void> {
    await apiClient.delete(`/academiccalendar/${id}`);
  }

  async getActiveAcademicCalendars(): Promise<AcademicCalendar[]> {
    const response = await apiClient.get("/academiccalendar/active");
    return response.data;
  }

  async getAcademicCalendarByYear(
    academicYear: string
  ): Promise<AcademicCalendar> {
    const response = await apiClient.get(
      `/academiccalendar/year/${academicYear}`
    );
    return response.data;
  }

  async getHolidays(academicCalendarId: string): Promise<SchoolHoliday[]> {
    const response = await apiClient.get(
      `/academiccalendar/${academicCalendarId}/holidays`
    );
    return response.data;
  }

  async addHoliday(
    academicCalendarId: string,
    holiday: SchoolHoliday
  ): Promise<AcademicCalendar> {
    const response = await apiClient.post(
      `/academiccalendar/${academicCalendarId}/holidays`,
      holiday
    );
    return response.data;
  }

  async removeHoliday(
    academicCalendarId: string,
    date: string
  ): Promise<AcademicCalendar> {
    const response = await apiClient.delete(
      `/academiccalendar/${academicCalendarId}/holidays/${date}`
    );
    return response.data;
  }

  async getSchoolDays(academicCalendarId: string): Promise<SchoolDay[]> {
    const response = await apiClient.get(
      `/academiccalendar/${academicCalendarId}/schooldays`
    );
    return response.data;
  }

  async addSchoolDay(
    academicCalendarId: string,
    schoolDay: SchoolDay
  ): Promise<AcademicCalendar> {
    const response = await apiClient.post(
      `/academiccalendar/${academicCalendarId}/schooldays`,
      schoolDay
    );
    return response.data;
  }

  async removeSchoolDay(
    academicCalendarId: string,
    date: string
  ): Promise<AcademicCalendar> {
    const response = await apiClient.delete(
      `/academiccalendar/${academicCalendarId}/schooldays/${date}`
    );
    return response.data;
  }

  async isSchoolDay(
    academicCalendarId: string,
    date: string
  ): Promise<boolean> {
    const response = await apiClient.get(
      `/academiccalendar/${academicCalendarId}/isschoolday/${date}`
    );
    return response.data;
  }

  async isHoliday(academicCalendarId: string, date: string): Promise<boolean> {
    const response = await apiClient.get(
      `/academiccalendar/${academicCalendarId}/isholiday/${date}`
    );
    return response.data;
  }

  async getAcademicYears(): Promise<string[]> {
    const calendars = await this.getActiveAcademicCalendars();
    return calendars.map((calendar) => calendar.academicYear);
  }

  async getCurrentAcademicYear(): Promise<string | null> {
    try {
      const calendars = await this.getActiveAcademicCalendars();
      const now = new Date();

      for (const calendar of calendars) {
        const startDate = new Date(calendar.startDate);
        const endDate = new Date(calendar.endDate);

        if (now >= startDate && now <= endDate) {
          return calendar.academicYear;
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting current academic year:", error);
      return null;
    }
  }

  async getSemesters(academicCalendarId: string): Promise<AcademicSemester[]> {
    const calendar = await this.getAcademicCalendarById(academicCalendarId);
    return calendar.semesters;
  }

  async getActiveSemesters(
    academicCalendarId: string
  ): Promise<AcademicSemester[]> {
    const semesters = await this.getSemesters(academicCalendarId);
    return semesters.filter((semester) => semester.isActive);
  }

  async validateDateRange(
    academicCalendarId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    isValid: boolean;
    conflicts: string[];
  }> {
    try {
      const calendar = await this.getAcademicCalendarById(academicCalendarId);
      const conflicts: string[] = [];

      const start = new Date(startDate);
      const end = new Date(endDate);
      const calendarStart = new Date(calendar.startDate);
      const calendarEnd = new Date(calendar.endDate);

      if (start < calendarStart || end > calendarEnd) {
        conflicts.push(
          `Date range must be within academic year ${calendar.academicYear} (${calendar.startDate} - ${calendar.endDate})`
        );
      }

      for (const holiday of calendar.holidays) {
        const holidayStart = new Date(holiday.startDate);
        const holidayEnd = new Date(holiday.endDate);

        if (start <= holidayEnd && end >= holidayStart) {
          conflicts.push(
            `Date range conflicts with holiday: ${holiday.name} (${holiday.startDate} - ${holiday.endDate})`
          );
        }
      }

      return {
        isValid: conflicts.length === 0,
        conflicts,
      };
    } catch (error) {
      console.error("Error validating date range:", error);
      return {
        isValid: false,
        conflicts: ["Error validating date range"],
      };
    }
  }
}

export const academicCalendarService = new AcademicCalendarService();
