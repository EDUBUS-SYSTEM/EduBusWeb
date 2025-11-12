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
    gender: "Male" | "Female";
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    role: "parent";
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
  rRule: string; // Changed from rrule to match backend
  timezone: string;
  academicYear: string; // Added to match backend
  effectiveFrom: string;
  effectiveTo?: string;
  exceptions: Date[]; // Changed from string[] to Date[] to match backend
  scheduleType: string;
  isActive: boolean;
  timeOverrides: ScheduleTimeOverride[]; // Added to match backend
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleTimeOverride {
  date: Date; // Override date
  exceptionDate?: Date; // Exception date - optional for standalone overrides
  startTime: string;
  endTime: string;
  reason: string;
  createdBy: string;
  createdAt: Date;
  isCancelled: boolean;
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
  // Note: routeName and scheduleName are not in backend model
  // They should be populated from related entities if needed
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
  rRule: string; // Changed from rrule to match backend
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

// Trip DTOs matching backend API
export interface ScheduleSnapshotDto {
  scheduleId: string;
  name: string;
  startTime: string;
  endTime: string;
  rRule: string;
}

export interface TripDto {
  id: string;
  routeId: string;
  routeName: string;
  serviceDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  startTime?: string;
  endTime?: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  vehicleId: string;
  driverVehicleId?: string;
  vehicle?: VehicleSnapshotDto;
  driver?: DriverSnapshotDto;
  scheduleSnapshot: ScheduleSnapshotDto;
  stops: TripStopDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface VehicleSnapshotDto {
  id: string;
  maskedPlate: string;
  capacity: number;
  status: string;
}

export interface DriverSnapshotDto {
  id: string;
  fullName: string;
  phone: string;
  isPrimary: boolean;
  snapshottedAtUtc: string;
}

export interface TripStopDto {
  id: string;
  name: string;
  plannedArrival: string; // ISO datetime string
  actualArrival?: string; // ISO datetime string
  plannedDeparture: string; // ISO datetime string
  actualDeparture?: string; // ISO datetime string
  sequence: number;
  attendance?: ParentAttendanceDto[];
}

export interface ParentAttendanceDto {
  studentId: string;
  studentName: string;
  boardedAt?: string;
  state: string;
}

export interface CreateTripDto {
  routeId: string;
  serviceDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  status?: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  vehicleId: string;
  driverVehicleId?: string;
  vehicle?: VehicleSnapshotDto;
  driver?: DriverSnapshotDto;
  scheduleSnapshot: ScheduleSnapshotDto;
  stops: TripStopDto[];
}

export interface UpdateTripDto {
  id: string;
  routeId: string;
  serviceDate: string;
  plannedStartAt: string;
  plannedEndAt: string;
  startTime?: string;
  endTime?: string;
  status: "Scheduled" | "InProgress" | "Completed" | "Cancelled";
  vehicleId: string;
  driverVehicleId?: string;
  vehicle?: VehicleSnapshotDto;
  driver?: DriverSnapshotDto;
  scheduleSnapshot: ScheduleSnapshotDto;
  stops: TripStopDto[];
}

export interface GenerateTripsFromScheduleDto {
  scheduleId: string;
  routeId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
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
  type: "trip" | "schedule" | "maintenance" | "other";
  description?: string;
  routeId?: string;
  tripId?: string;
  scheduleId?: string;
  status?: "planned" | "in-progress" | "completed" | "cancelled";
  metadata?: Record<string, unknown>;
}

export interface CalendarView {
  type: "day" | "week" | "month";
  date: Date;
}

export interface CalendarProps {
  events: CalendarEvent[];
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onEventMove?: (eventId: string, newStart: Date, newEnd: Date) => void;
  onDateChange?: (date: Date) => void;
  className?: string;
  routes?: { id: string; name: string }[];
  selectedRoute?: string;
  onRouteChange?: (routeId: string) => void;
}

// Academic Calendar types based on backend models
export interface AcademicCalendar {
  id: string;
  academicYear: string;
  name: string;
  startDate: string;
  endDate: string;
  semesters: AcademicSemester[];
  holidays: SchoolHoliday[];
  schoolDays: SchoolDay[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSemester {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SchoolHoliday {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isRecurring: boolean;
}

export interface SchoolDay {
  date: string;
  isSchoolDay: boolean;
  description: string;
}

// DTOs for Academic Calendar operations
export interface CreateAcademicCalendarDto {
  academicYear: string;
  name: string;
  startDate: string;
  endDate: string;
  semesters: AcademicSemester[];
  holidays: SchoolHoliday[];
  schoolDays: SchoolDay[];
  isActive: boolean;
}

export interface UpdateAcademicCalendarDto {
  academicYear: string;
  name: string;
  startDate: string;
  endDate: string;
  semesters: AcademicSemester[];
  holidays: SchoolHoliday[];
  schoolDays: SchoolDay[];
  isActive: boolean;
}

export interface AcademicCalendarQueryParams {
  academicYear?: string;
  activeOnly?: boolean;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
}
