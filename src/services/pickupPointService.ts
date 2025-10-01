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
	unitPriceVndPerKm?: number;
	estimatedPriceVnd: number;
}

export interface SubmitPickupPointRequestResponseDto {
	requestId: string;
	status: string;
	message: string;
	estimatedPriceVnd: number;
	createdAt: string;
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
	unitPriceVndPerKm: number;
	estimatedPriceVnd: number;
	status: "Pending" | "Approved" | "Rejected";
	adminNotes: string;
	reviewedAt?: string;
	reviewedByAdminId?: string;
	createdAt: string;
	updatedAt?: string;
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

export interface PickupPointDto {
	id: string;
	description: string;
	location: string;
	latitude: number;
	longitude: number;
	studentCount: number;
	createdAt: string;
	updatedAt?: string;
}

export interface PickupPointsResponse {
	pickupPoints: PickupPointDto[];
	totalCount: number;
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
	getUnassignedPickupPoints: () =>
		apiService.get<PickupPointsResponse>('/PickupPoint/unassigned'),
};
