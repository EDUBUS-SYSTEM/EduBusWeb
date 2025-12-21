import { apiService } from '@/lib/api';

export interface DailyStudentCount {
    date: string;
    count: number;
}

export interface DailyStudentsDto {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    last7Days: DailyStudentCount[];
}

export interface AttendanceRateDto {
    todayRate: number;
    weekRate: number;
    monthRate: number;
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalExcused: number;
    totalPending: number;
}

export interface VehicleUsage {
    vehicleId: string;
    licensePlate: string;
    totalHours: number;
    tripCount: number;
}

export interface VehicleRuntimeDto {
    totalHoursToday: number;
    averageHoursPerTrip: number;
    totalTripsToday: number;
    topVehicles: VehicleUsage[];
}

export interface RouteStatisticsDto {
    routeId: string;
    routeName: string;
    totalTrips: number;
    totalStudents: number;
    attendanceRate: number;
    averageRuntime: number;
    activeVehicles: number;
    // Status indicators
    isDeleted: boolean;
    isActive: boolean;
    status: string; // "Active" | "Inactive" | "Deleted"
}

export interface DashboardStatisticsDto {
    dailyStudents: DailyStudentsDto;
    attendanceRate: AttendanceRateDto;
    vehicleRuntime: VehicleRuntimeDto;
    routeStatistics: RouteStatisticsDto[];
}

export interface ActiveSemesterDto {
    semesterName: string;
    semesterCode: string;
    academicYear: string;
    semesterStartDate: string;
    semesterEndDate: string;
    registrationStartDate?: string;
    registrationEndDate?: string;
}

export interface RevenueStatisticsDto {
    totalRevenue: number;
    pendingAmount: number;
    failedAmount: number;
    currency: string;
    paidTransactionCount: number;
    pendingTransactionCount: number;
    failedTransactionCount: number;
}

export interface RevenueTimelinePointDto {
    date: string;
    amount: number;
    count: number;
}

class DashboardService {
    async getDashboardStatistics(from?: string, to?: string): Promise<DashboardStatisticsDto> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiService.get<{ success: boolean; data: DashboardStatisticsDto }>(
            `/Dashboard/statistics${params.toString() ? `?${params.toString()}` : ''}`
        );
        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to fetch dashboard statistics');
    }

    async getDailyStudents(date?: string): Promise<DailyStudentsDto> {
        const params = new URLSearchParams();
        if (date) params.append('date', date);

        const response = await apiService.get<{ success: boolean; data: DailyStudentsDto }>(
            `/Dashboard/daily-students${params.toString() ? `?${params.toString()}` : ''}`
        );
        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to fetch daily students');
    }

    async getAttendanceRate(period: 'today' | 'week' | 'month' = 'today'): Promise<AttendanceRateDto> {
        const response = await apiService.get<{ success: boolean; data: AttendanceRateDto }>(
            `/Dashboard/attendance-rate?period=${period}`
        );
        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to fetch attendance rate');
    }

    async getVehicleRuntime(vehicleId?: string, from?: string, to?: string): Promise<VehicleRuntimeDto> {
        const params = new URLSearchParams();
        if (vehicleId) params.append('vehicleId', vehicleId);
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiService.get<{ success: boolean; data: VehicleRuntimeDto }>(
            `/Dashboard/vehicle-runtime${params.toString() ? `?${params.toString()}` : ''}`
        );
        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to fetch vehicle runtime');
    }

    async getRouteStatistics(routeId?: string, from?: string, to?: string): Promise<RouteStatisticsDto[]> {
        const params = new URLSearchParams();
        if (routeId) params.append('routeId', routeId);
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiService.get<{ success: boolean; data: RouteStatisticsDto[] }>(
            `/Dashboard/route-statistics${params.toString() ? `?${params.toString()}` : ''}`
        );
        if (response.data) {
            return response.data;
        }
        throw new Error('Failed to fetch route statistics');
    }

    async getRevenueStatistics(from?: string, to?: string): Promise<RevenueStatisticsDto> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiService.get<{ success: boolean; data: RevenueStatisticsDto }>(
            `/Dashboard/revenue${params.toString() ? `?${params.toString()}` : ''}`
        );

        if (response.data) {
            return response.data;
        }

        throw new Error('Failed to fetch revenue statistics');
    }

    async getRevenueTimeline(from?: string, to?: string): Promise<RevenueTimelinePointDto[]> {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to) params.append('to', to);

        const response = await apiService.get<{ success: boolean; data: RevenueTimelinePointDto[] }>(
            `/Dashboard/revenue/timeline${params.toString() ? `?${params.toString()}` : ''}`
        );

        if (response.data) {
            return response.data;
        }

        throw new Error('Failed to fetch revenue timeline');
    }

    async getCurrentSemester(): Promise<ActiveSemesterDto> {
        const response = await apiService.get<{ success: boolean; data: ActiveSemesterDto }>('/Dashboard/current-semester');

        if (response.data) {
            return response.data;
        }

        throw new Error('Failed to fetch current semester');
    }

    async getSemesters(): Promise<ActiveSemesterDto[]> {
        const response = await apiService.get<{ success: boolean; data: ActiveSemesterDto[] }>('/Dashboard/semesters');

        if (response.data) {
            return response.data;
        }

        throw new Error('Failed to fetch semesters');
    }
}

export const dashboardService = new DashboardService();
export default dashboardService;
