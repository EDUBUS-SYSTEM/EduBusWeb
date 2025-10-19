export interface RouteScheduleDto {
  id: string;
  routeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRouteScheduleDto {
  routeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  priority: number;
  isActive: boolean;
}