import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notificationService";
import { NotificationResponse } from "@/types/notification.types";

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [notifs, count] = await Promise.all([
                notificationService.getAdminNotifications(1, 10),
                notificationService.getUnreadCount(),
            ]);

            const processedNotifs = notifs.map(notif => ({
                ...notif,
                isRead: notif.status === 1 || notif.status === 2 || notif.isRead === true
            }));

            setNotifications(processedNotifs);
            setUnreadCount(count);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === notificationId
                        ? { ...notif, status: 1, isRead: true }
                        : notif
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, status: 1, isRead: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
};
