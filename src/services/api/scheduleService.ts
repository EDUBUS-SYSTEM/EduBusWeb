import { apiClient } from "@/lib/api";
import { Schedule, ScheduleTimeOverride } from "@/types";

// Legacy interface for backward compatibility - will be removed
export interface LegacySchedule {
  id: string;
  name: string;
  scheduleType: string;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  name: string;
  scheduleType: string;
  startTime: string;
  endTime: string;
  rRule: string;
  timezone: string;
  academicYear: string; // Added to match backend
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: Date[]; // Changed from string[] to Date[] to match backend
  isActive: boolean;
}

export interface UpdateScheduleDto {
  id: string;
  name: string;
  scheduleType: string;
  startTime: string;
  endTime: string;
  rRule: string;
  timezone: string;
  academicYear: string; // Added to match backend
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: Date[]; // Changed from string[] to Date[] to match backend
  isActive: boolean;
  timeOverrides?: ScheduleTimeOverride[]; // Added to preserve overrides
  updatedAt?: string; // Added for optimistic locking
}

export interface ScheduleQueryParams {
  scheduleType?: string;
  startDate?: string;
  endDate?: string;
  activeOnly?: boolean;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface RouteSchedule {
  id: string;
  routeId: string;
  routeName: string;
  scheduleId: string;
  scheduleName: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteScheduleDto {
  routeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  isActive: boolean;
}

export interface UpdateRouteScheduleDto {
  id: string;
  routeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  isActive: boolean;
}

export interface RouteScheduleQueryParams {
  routeId?: string;
  scheduleId?: string;
  startDate?: string;
  endDate?: string;
  activeOnly?: boolean;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface Route {
  id: string;
  routeName: string;
  isActive: boolean;
  vehicleId: number;
  pickupPoints: PickupPointInfo[];
}

export interface PickupPointInfo {
  pickupPointId: string;
  sequenceOrder: number;
  location: LocationInfo;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
}

class ScheduleService {
  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get("/schedule/active");
      return response.status === 200;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }

  // Schedule CRUD operations
  async getSchedules(params?: ScheduleQueryParams): Promise<Schedule[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.scheduleType)
        queryParams.append("scheduleType", params.scheduleType);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.activeOnly !== undefined)
        queryParams.append("activeOnly", params.activeOnly.toString());
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.perPage)
        queryParams.append("perPage", params.perPage.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const response = await apiClient.get(
        `/schedule?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw new Error("Failed to fetch schedules. Please try again.");
    }
  }

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      const response = await apiClient.get(`/schedule/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw new Error("Failed to fetch schedule. Please try again.");
    }
  }

  async createSchedule(schedule: CreateScheduleDto): Promise<Schedule> {
    try {
      const response = await apiClient.post("/schedule", schedule);
      return response.data;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw new Error("Failed to create schedule. Please try again.");
    }
  }

  async updateSchedule(id: string, schedule: UpdateScheduleDto): Promise<void> {
    try {
      const response = await apiClient.put(`/schedule/${id}`, schedule);
      console.log("Update schedule response:", response);
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw new Error("Failed to update schedule. Please try again.");
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      await apiClient.delete(`/schedule/${id}`);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw new Error("Failed to delete schedule. Please try again.");
    }
  }

  async getActiveSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get("/schedule/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching active schedules:", error);
      throw new Error("Failed to fetch active schedules. Please try again.");
    }
  }

  async getSchedulesByType(scheduleType: string): Promise<Schedule[]> {
    try {
      const response = await apiClient.get(`/schedule/type/${scheduleType}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching schedules by type:", error);
      throw new Error("Failed to fetch schedules by type. Please try again.");
    }
  }

  // Route Schedule CRUD operations
  async getRouteSchedules(
    params?: RouteScheduleQueryParams
  ): Promise<RouteSchedule[]> {
    const queryParams = new URLSearchParams();

    if (params?.routeId) queryParams.append("routeId", params.routeId);
    if (params?.scheduleId) queryParams.append("scheduleId", params.scheduleId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.activeOnly !== undefined)
      queryParams.append("activeOnly", params.activeOnly.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.perPage)
      queryParams.append("perPage", params.perPage.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await apiClient.get(
      `/routeschedule?${queryParams.toString()}`
    );
    return response.data;
  }

  async getRouteScheduleById(id: string): Promise<RouteSchedule> {
    const response = await apiClient.get(`/routeschedule/${id}`);
    return response.data;
  }

  async createRouteSchedule(
    routeSchedule: CreateRouteScheduleDto
  ): Promise<RouteSchedule> {
    const response = await apiClient.post("/routeschedule", routeSchedule);
    return response.data;
  }

  async updateRouteSchedule(
    id: string,
    routeSchedule: UpdateRouteScheduleDto
  ): Promise<void> {
    await apiClient.put(`/routeschedule/${id}`, routeSchedule);
  }

  async deleteRouteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/routeschedule/${id}`);
  }

  async getActiveRouteSchedules(): Promise<RouteSchedule[]> {
    const response = await apiClient.get("/routeschedule/active");
    return response.data;
  }

  async getRouteSchedulesByRoute(routeId: string): Promise<RouteSchedule[]> {
    const response = await apiClient.get(`/routeschedule/route/${routeId}`);
    return response.data;
  }

  async getRouteSchedulesBySchedule(
    scheduleId: string
  ): Promise<RouteSchedule[]> {
    const response = await apiClient.get(
      `/routeschedule/schedule/${scheduleId}`
    );
    return response.data;
  }

  // Helper methods for dropdowns
  async getRoutes(): Promise<Route[]> {
    // TODO: Implement RouteController in backend
    // For now, return mock data to avoid 404 error
    return [
      {
        id: "1",
        routeName: "Route 1 - Downtown to School",
        isActive: true,
        vehicleId: 1,
        pickupPoints: [],
      },
      {
        id: "2",
        routeName: "Route 2 - Suburb to School",
        isActive: true,
        vehicleId: 2,
        pickupPoints: [],
      },
      {
        id: "3",
        routeName: "Route 3 - City Center to School",
        isActive: true,
        vehicleId: 3,
        pickupPoints: [],
      },
    ];
  }

  async getSchedulesForDropdown(): Promise<Schedule[]> {
    // Get all active schedules for dropdown selection
    return this.getActiveSchedules();
  }

  // Time Override management
  async addTimeOverride(
    scheduleId: string,
    timeOverride: ScheduleTimeOverride,
    updatedAt?: string
  ): Promise<Schedule> {
    const url = updatedAt
      ? `/schedule/${scheduleId}/overrides?updatedAt=${encodeURIComponent(updatedAt)}`
      : `/schedule/${scheduleId}/overrides`;
    const response = await apiClient.put(url, timeOverride);
    return response.data;
  }

  async addTimeOverridesBatch(
    scheduleId: string,
    timeOverrides: ScheduleTimeOverride[]
  ): Promise<Schedule> {
    const response = await apiClient.put(
      `/schedule/${scheduleId}/overrides/batch`,
      timeOverrides
    );
    return response.data;
  }

  async removeTimeOverride(
    scheduleId: string,
    date: string,
    updatedAt?: string
  ): Promise<Schedule> {
    const url = updatedAt
      ? `/schedule/${scheduleId}/overrides?date=${encodeURIComponent(date)}&updatedAt=${encodeURIComponent(updatedAt)}`
      : `/schedule/${scheduleId}/overrides?date=${encodeURIComponent(date)}`;
    const response = await apiClient.delete(url);
    return response.data;
  }

  async removeTimeOverridesBatch(
    scheduleId: string,
    dates: string[]
  ): Promise<Schedule> {
    const response = await apiClient.delete(
      `/schedule/${scheduleId}/overrides/batch`,
      { data: dates }
    );
    return response.data;
  }

  async getTimeOverrides(scheduleId: string): Promise<ScheduleTimeOverride[]> {
    const response = await apiClient.get(`/schedule/${scheduleId}/overrides`);
    return response.data;
  }

  async getTimeOverride(
    scheduleId: string,
    date: string
  ): Promise<ScheduleTimeOverride> {
    const response = await apiClient.get(
      `/schedule/${scheduleId}/overrides/${date}`
    );
    return response.data;
  }

  async updateTimeOverride(
    scheduleId: string,
    timeOverride: ScheduleTimeOverride
  ): Promise<Schedule> {
    const response = await apiClient.put(
      `/schedule/${scheduleId}/overrides`,
      timeOverride
    );
    return response.data;
  }

  // Schedule generation and validation
  async generateScheduleDates(
    scheduleId: string,
    startDate: string,
    endDate: string
  ): Promise<Date[]> {
    const response = await apiClient.get(
      `/schedule/${scheduleId}/generate-dates?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async isDateMatchingSchedule(
    scheduleId: string,
    date: string
  ): Promise<boolean> {
    const response = await apiClient.get(
      `/schedule/${scheduleId}/match-date/${date}`
    );
    return response.data;
  }

  // Academic Year integration
  async getSchedulesByAcademicYear(academicYear: string): Promise<Schedule[]> {
    const response = await apiClient.get(
      `/schedule?academicYear=${academicYear}`
    );
    return response.data;
  }

  // Helper methods for date handling
  formatDateForBackend(date: Date): string {
    return date.toISOString();
  }

  parseDateFromBackend(dateString: string): Date {
    return new Date(dateString);
  }

  // Validation helpers
  async validateScheduleDates(
    scheduleId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    isValid: boolean;
    conflicts: string[];
  }> {
    try {
      const schedule = await this.getScheduleById(scheduleId);
      const conflicts: string[] = [];

      const start = new Date(startDate);
      const end = new Date(endDate);
      const effectiveStart = new Date(schedule.effectiveFrom);
      const effectiveEnd = schedule.effectiveTo
        ? new Date(schedule.effectiveTo)
        : null;

      // Check if date range is within effective period
      if (start < effectiveStart) {
        conflicts.push(
          `Start date must be after effective from date: ${schedule.effectiveFrom}`
        );
      }

      if (effectiveEnd && end > effectiveEnd) {
        conflicts.push(
          `End date must be before effective to date: ${schedule.effectiveTo}`
        );
      }

      // Check for exception conflicts
      for (const exception of schedule.exceptions) {
        const exceptionDate = new Date(exception);
        if (start <= exceptionDate && end >= exceptionDate) {
          conflicts.push(`Date range includes exception date: ${exception}`);
        }
      }

      return {
        isValid: conflicts.length === 0,
        conflicts,
      };
    } catch (error) {
      console.error("Error validating schedule dates:", error);
      return {
        isValid: false,
        conflicts: ["Error validating schedule dates"],
      };
    }
  }
}

export const scheduleService = new ScheduleService();
