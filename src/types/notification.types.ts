export enum NotificationType {
    DriverLeaveRequest = 1,
    ReplacementSuggestion = 2,
    LeaveApproval = 3,
    ConflictDetected = 4,
    ReplacementAccepted = 5,
    ReplacementRejected = 6,
    SystemAlert = 7,
    MaintenanceReminder = 8,
    ScheduleChange = 9,
    EmergencyNotification = 10,
    TripInfo = 11,
    EnrollmentRegistration = 12,
}

export enum NotificationStatus {
    Unread = 0,
    Read = 1,
    Acknowledged = 2,
}

export enum RecipientType {
    User = 0,
    Admin = 1,
    Driver = 2,
    Parent = 3,
    All = 4,
}

export interface NotificationResponse {
    id: string;
    userId: string;
    title: string;
    message: string;
    notificationType: NotificationType;
    recipientType: RecipientType;
    status: NotificationStatus;
    timeStamp: string;
    readAt?: string;
    acknowledgedAt?: string;
    expiresAt?: string;
    priority: number;
    relatedEntityId?: string;
    relatedEntityType?: string;
    actionRequired: boolean;
    actionUrl?: string;
    metadata?: Record<string, any>;
    isExpired?: boolean;
    isRead?: boolean;
}
