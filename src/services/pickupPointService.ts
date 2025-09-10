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

export const pickupPointService = {
	registerParent: (data: ParentRegistrationRequestDto) =>
		apiService.post<ParentRegistrationResponseDto>('/PickupPoint/register', data),
	verifyOtp: (data: VerifyOtpRequest) =>
		apiService.post<VerifyOtpWithStudentsResponseDto>('/PickupPoint/verify-otp', data),
	submitRequest: (data: SubmitPickupPointRequestDto) =>
		apiService.post<SubmitPickupPointRequestResponseDto>('/PickupPoint/submit-request', data),
};
