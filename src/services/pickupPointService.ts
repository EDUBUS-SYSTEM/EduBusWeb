import { apiService } from '@/lib/api';

export type Gender = 1 | 2 | 3; // align with API enum range constraint

export interface ParentRegistrationRequestDto {
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	address: string;
	dateOfBirth: string; // ISO date (yyyy-MM-dd)
	gender: Gender;
}

export interface ParentRegistrationResponseDto {
	registrationId: string;
	email: string;
	emailExists: boolean;
	otpSent: boolean;
	message: string;
}

export interface VerifyOtpRequest {
	email: string;
	otp: string;
}

export interface StudentBriefDto {
	id: string;
	firstName: string;
	lastName: string;
}

export interface VerifyOtpWithStudentsResponseDto {
	verified: boolean;
	message: string;
	students: StudentBriefDto[];
	emailExists: boolean;
}

export interface SubmitPickupPointRequestDto {
	email: string;
	studentIds: string[];
	addressText: string;
	latitude: number;
	longitude: number;
	distanceKm: number;
	description?: string;
	reason?: string;
}

export interface SubmitPickupPointRequestResponseDto {
	requestId: string;
	status: string;
	message: string;
	totalFee: number;
	createdAt: string;
	semesterName: string;
	academicYear: string;
	totalSchoolDays: number;
	calculationDetails: string;
}

// Admin interfaces
export interface ParentRegistrationInfoDto {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	address: string;
	dateOfBirth: string;
	gender: number;
	createdAt: string;
}

export interface PickupPointRequestDetailDto {
	id: string;
	parentEmail: string;
	parentInfo?: ParentRegistrationInfoDto;
	students: StudentBriefDto[];
	addressText: string;
	latitude: number;
	longitude: number;
	distanceKm: number;
	description: string;
	reason: string;
	unitPricePerKm: number; // Changed from unitPriceVndPerKm to match backend
	totalFee: number;
	status: "Pending" | "Approved" | "Rejected";
	adminNotes: string;
	reviewedAt?: string;
	reviewedByAdminId?: string;
	createdAt: string;
	updatedAt?: string;
	// Semester information
	semesterName?: string;
	academicYear?: string;
	totalSchoolDays?: number;
}

export interface PickupPointRequestListQuery {
	status?: string;
	parentEmail?: string;
	skip?: number;
	take?: number;
	[key: string]: unknown;
}

export interface ApprovePickupPointRequestDto {
	notes?: string;
}

export interface RejectPickupPointRequestDto {
	reason: string;
}

export const pickupPointService = {
	// Public endpoints
	registerParent: (data: ParentRegistrationRequestDto) =>
		apiService.post<ParentRegistrationResponseDto>('/PickupPoint/register', data),
	verifyOtp: (data: VerifyOtpRequest) =>
		apiService.post<VerifyOtpWithStudentsResponseDto>('/PickupPoint/verify-otp', data),
	submitRequest: (data: SubmitPickupPointRequestDto) =>
		apiService.post<SubmitPickupPointRequestResponseDto>('/PickupPoint/submit-request', data),
	
	// Admin endpoints
	listRequests: (query?: PickupPointRequestListQuery) =>
		apiService.get<PickupPointRequestDetailDto[]>('/PickupPoint/requests', query),
	approveRequest: (requestId: string, data: ApprovePickupPointRequestDto) =>
		apiService.post(`/PickupPoint/requests/${requestId}/approve`, data),
	rejectRequest: (requestId: string, data: RejectPickupPointRequestDto) =>
		apiService.post(`/PickupPoint/requests/${requestId}/reject`, data),
};
