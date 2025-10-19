import { apiService } from "@/lib/api";
import { RouteScheduleDto, CreateRouteScheduleDto } from "./routeSchedule.type";

export const routeScheduleService = {
  // POST /api/routeschedule
  create: async (data: CreateRouteScheduleDto): Promise<RouteScheduleDto> => {
    return await apiService.post<RouteScheduleDto>("/routeschedule", data);
  },

  // DELETE /api/routeschedule/{id}
  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/routeschedule/${id}`);
  },

  // GET /api/routeschedule/route/{routeId}
  getByRoute: async (routeId: string): Promise<RouteScheduleDto[]> => {
    return await apiService.get<RouteScheduleDto[]>(`/routeschedule/route/${routeId}`);
  },
};