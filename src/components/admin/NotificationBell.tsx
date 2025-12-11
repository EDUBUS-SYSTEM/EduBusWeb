"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaBell,
    FaUserClock,
    FaUserPlus,
    FaCheckCircle,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaCalendarAlt,
    FaBus,
    FaUserCheck,
} from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationResponse, NotificationType } from "@/types/notification.types";

const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "text-lg flex-shrink-0";

    switch (type) {
        case NotificationType.DriverLeaveRequest:
            return <FaUserClock className={`${iconClass} text-blue-500`} />;
        case NotificationType.ReplacementSuggestion:
            return <FaUserPlus className={`${iconClass} text-green-500`} />;
        case NotificationType.LeaveApproval:
            return <FaCheckCircle className={`${iconClass} text-green-600`} />;
        case NotificationType.ConflictDetected:
            return <FaExclamationTriangle className={`${iconClass} text-amber-500`} />;
        case NotificationType.EmergencyNotification:
            return <FaExclamationCircle className={`${iconClass} text-red-500`} />;
        case NotificationType.ScheduleChange:
            return <FaCalendarAlt className={`${iconClass} text-purple-500`} />;
        case NotificationType.TripInfo:
            return <FaBus className={`${iconClass} text-blue-600`} />;
        case NotificationType.EnrollmentRegistration:
            return <FaUserCheck className={`${iconClass} text-indigo-500`} />;
        default:
            return <FaBell className={`${iconClass} text-gray-500`} />;
    }
};

const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - notifTime.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notifTime.toLocaleDateString();
};

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="relative z-[9999]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-[#463B3B] hover:bg-[#FFF085] rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Notifications"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="fixed left-[240px] top-[60px] w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
                    style={{ maxHeight: "640px" }}
                >
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-[#fad23c] to-[#f8c537] px-5 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaBell className="text-[#463B3B] text-lg" />
                                <h3 className="text-lg font-bold text-[#463B3B]">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-white text-[#463B3B] text-xs font-semibold rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-[#463B3B] hover:text-blue-600 font-semibold transition-colors px-3 py-1.5 bg-white rounded-lg hover:shadow-md"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications list */}
                    <div className="overflow-y-auto bg-gray-50" style={{ maxHeight: "560px" }}>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#fad23c] border-t-transparent"></div>
                                <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-4">
                                    <FaBell className="text-5xl text-gray-400" />
                                </div>
                                <h4 className="text-base font-semibold text-gray-700 mb-1">No notifications</h4>
                                <p className="text-sm text-gray-500 text-center">You're all caught up! Check back later for updates.</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`mx-2 mb-2 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${!notification.isRead
                                            ? "bg-gradient-to-r from-[#FFFBF0] to-[#FFF9DB] border-[#fad23c] hover:shadow-md hover:scale-[1.01]"
                                            : "bg-white border-gray-100 hover:bg-gray-50 hover:shadow-sm"
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <div className={`p-2.5 rounded-xl ${!notification.isRead ? "bg-white shadow-sm" : "bg-gray-50"
                                                    }`}>
                                                    {getNotificationIcon(notification.notificationType)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-[#463B3B] line-clamp-1">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && (
                                                        <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {getRelativeTime(notification.timeStamp)}
                                                    </span>
                                                    {notification.actionRequired && (
                                                        <span className="text-xs px-2 py-0.5 bg-[#fdf0d5] text-[#463B3B] rounded-full font-semibold">
                                                            Action needed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
