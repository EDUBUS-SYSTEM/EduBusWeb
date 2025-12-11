import { apiService } from "@/lib/api";
import { NotificationResponse } from "@/types/notification.types";

export const notificationService = {
    async getAdminNotifications(
        page: number = 1,
        pageSize: number = 10
    ): Promise<NotificationResponse[]> {
        return apiService.get<NotificationResponse[]>("/notification/admin", {
            page,
            pageSize,
        });
    },

    async getUnreadCount(): Promise<number> {
        return apiService.get<number>("/notification/unread-count");
    },

    async markAsRead(notificationId: string): Promise<NotificationResponse> {
        return apiService.put<NotificationResponse>(
            `/notification/${notificationId}/read`
        );
    },

    async markAllAsRead(): Promise<NotificationResponse[]> {
        return apiService.put<NotificationResponse[]>("/notification/mark-all-read");
    },
};
