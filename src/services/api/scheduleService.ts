import { apiClient } from '@/lib/api';

export interface Schedule {
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
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: string[];
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
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: string[];
  isActive: boolean;
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
      const response = await apiClient.get('/schedule/active');
      return response.status === 200;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }

  // Schedule CRUD operations
  async getSchedules(params?: ScheduleQueryParams): Promise<Schedule[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.scheduleType) queryParams.append('scheduleType', params.scheduleType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/schedule?${queryParams.toString()}`);
    return response.data;
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await apiClient.get(`/schedule/${id}`);
    return response.data;
  }

  async createSchedule(schedule: CreateScheduleDto): Promise<Schedule> {
    const response = await apiClient.post('/schedule', schedule);
    return response.data;
  }

  async updateSchedule(id: string, schedule: UpdateScheduleDto): Promise<void> {
    console.log("Update schedule request:", {
      url: `/schedule/${id}`,
      data: schedule
    });
    
    const response = await apiClient.put(`/schedule/${id}`, schedule);
    console.log("Update schedule response:", response);
  }

  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/schedule/${id}`);
  }

  async getActiveSchedules(): Promise<Schedule[]> {
    const response = await apiClient.get('/schedule/active');
    return response.data;
  }

  async getSchedulesByType(scheduleType: string): Promise<Schedule[]> {
    const response = await apiClient.get(`/schedule/type/${scheduleType}`);
    return response.data;
  }

  // Route Schedule CRUD operations
  async getRouteSchedules(params?: RouteScheduleQueryParams): Promise<RouteSchedule[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.routeId) queryParams.append('routeId', params.routeId);
    if (params?.scheduleId) queryParams.append('scheduleId', params.scheduleId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/routeschedule?${queryParams.toString()}`);
    return response.data;
  }

  async getRouteScheduleById(id: string): Promise<RouteSchedule> {
    const response = await apiClient.get(`/routeschedule/${id}`);
    return response.data;
  }

  async createRouteSchedule(routeSchedule: CreateRouteScheduleDto): Promise<RouteSchedule> {
    const response = await apiClient.post('/routeschedule', routeSchedule);
    return response.data;
  }

  async updateRouteSchedule(id: string, routeSchedule: UpdateRouteScheduleDto): Promise<void> {
    await apiClient.put(`/routeschedule/${id}`, routeSchedule);
  }

  async deleteRouteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/routeschedule/${id}`);
  }

  async getActiveRouteSchedules(): Promise<RouteSchedule[]> {
    const response = await apiClient.get('/routeschedule/active');
    return response.data;
  }

  async getRouteSchedulesByRoute(routeId: string): Promise<RouteSchedule[]> {
    const response = await apiClient.get(`/routeschedule/route/${routeId}`);
    return response.data;
  }

  async getRouteSchedulesBySchedule(scheduleId: string): Promise<RouteSchedule[]> {
    const response = await apiClient.get(`/routeschedule/schedule/${scheduleId}`);
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
        pickupPoints: []
      },
      {
        id: "2", 
        routeName: "Route 2 - Suburb to School",
        isActive: true,
        vehicleId: 2,
        pickupPoints: []
      },
      {
        id: "3",
        routeName: "Route 3 - City Center to School", 
        isActive: true,
        vehicleId: 3,
        pickupPoints: []
      }
    ];
  }

  async getSchedulesForDropdown(): Promise<Schedule[]> {
    // Get all active schedules for dropdown selection
    return this.getActiveSchedules();
  }
}

export const scheduleService = new ScheduleService();
