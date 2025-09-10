// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
// UserAccount types (API /UserAccount)
export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string; // ISO string from backend
  gender?: number;
  role: "admin";
  userPhotoFileId?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  fullName: string;
  role: "admin" | "user" | "moderator";
  accessToken: string;
  refreshToken: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
// UI Component types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  shadow?: "sm" | "md" | "lg";
  padding?: "sm" | "md" | "lg";
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// Table types
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  className?: string;
}

// Account Creation types
export interface DriverAccountData {
  email: string;
  driverPhoto?: File[];
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth?: string;
  healthCertificate?: File[];
  licenseNumber?: string;
  dateOfIssue?: string;
  issuedBy?: string;
  licenseImages?: File[];
}

export interface StudentInfo {
  id: string;
  fullName: string;
  grade: string;
  gender: string;
  dateOfBirth: string;
  images?: string[];
  parentId?: string | null;
}

// Student types based on backend model
export interface Student {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  parent: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female';
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    role: 'parent';
  };
}

export interface ParentAccountData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  studentIds: string[];
  students: StudentInfo[];
}

export interface AccountFormErrors {
  [key: string]: string;
}

export interface BasicSuccessResponse {
  success: boolean;
  data?: {
    message: string;
    affectedRows?: number;
  };
  error?: {
    message: string;
    statusCode: number;
    details?: string;
  };
}

// Schedule and Calendar types based on backend models
export interface Schedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  rrule: string;
  timezone: string;
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: string[];
  scheduleType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSchedule {
  id: string;
  routeId: string;
  scheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  routeName: string;
  isActive: boolean;
  vehicleId: number;
  pickupPoints: PickupPointInfo[];
  createdAt: string;
  updatedAt: string;
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

export interface Trip {
  id: string;
  routeId: string;
  serviceDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  startTime?: string;
  endTime?: string;
  status: string;
  scheduleSnapshot: ScheduleSnapshot;
  stops: TripStop[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSnapshot {
  scheduleId: string;
  name: string;
  startTime: string;
  endTime: string;
  rrule: string;
}

export interface TripStop {
  sequenceOrder: number;
  pickupPointId: string;
  plannedAt: string;
  arrivedAt?: string;
  departedAt?: string;
  location: LocationInfo;
  attendance: Attendance[];
}

export interface Attendance {
  studentId: string;
  boardedAt?: string;
  state: string;
}

// Calendar UI types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  type: 'trip' | 'schedule' | 'maintenance' | 'other';
  description?: string;
  routeId?: string;
  tripId?: string;
  scheduleId?: string;
  status?: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}

export interface CalendarView {
  type: 'day' | 'week' | 'month';
  date: Date;
}

export interface CalendarProps {
  events: CalendarEvent[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
}