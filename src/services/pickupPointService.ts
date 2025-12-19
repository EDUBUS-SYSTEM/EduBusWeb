import { apiService } from '@/lib/api';

export type Gender = 1 | 2 | 3; 

export interface ParentRegistrationRequestDto {
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	address: string;
	dateOfBirth: string; 
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
	estimatedPriceVnd: number;
	createdAt: string;
}


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
	unitPricePerKm: number; 
	totalFee: number; 
	semesterName: string;
	academicYear: string;
	semesterStartDate: string;
	semesterEndDate: string;
	totalSchoolDays: number;
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


export interface GetPickupPointsBySemesterRequest {
	semesterCode: string;
	academicYear: string;
	semesterStartDate: string; 
	semesterEndDate: string; 
	semesterName?: string;
}

export interface StudentAssignmentDto {
	studentId: string;
	firstName: string;
	lastName: string;
	parentId?: string;
	parentEmail?: string;
	assignedAt: string;
	changeReason?: string;
	changedBy?: string;
}

export interface PickupPointWithStudentsDto {
	pickupPointId: string;
	description: string;
	location: string;
	latitude: number;
	longitude: number;
	createdAt: string;
	updatedAt?: string;
	students: StudentAssignmentDto[];
	studentCount: number;
}

export interface GetPickupPointsBySemesterResponse {
	semesterCode: string;
	academicYear: string;
	semesterStartDate: string;
	semesterEndDate: string;
	semesterName?: string;
	pickupPoints: PickupPointWithStudentsDto[];
	totalPickupPoints: number;
	totalStudents: number;
}

export interface ResetPickupPointBySemesterRequest {
	semesterCode: string;
	academicYear: string;
	semesterStartDate: string; 
	semesterEndDate: string; 
	semesterName?: string;
}

export interface StudentUpdateFailure {
	studentId: string;
	reason: string;
}

export interface ResetPickupPointBySemesterResponse {
	semesterCode: string;
	academicYear: string;
	semesterStartDate: string;
	semesterEndDate: string;
	totalRecordsFound: number;
	studentsUpdated: number;
	studentsFailed: number;
	updatedStudentIds: string[];
	failedStudentIds: StudentUpdateFailure[];
	message: string;
}

export interface AvailableSemesterDto {
	semesterCode: string;
	academicYear: string;
	semesterStartDate: string;
	semesterEndDate: string;
	semesterName?: string;
	studentCount: number;
	displayLabel: string;
}

export interface GetAvailableSemestersResponse {
	semesters: AvailableSemesterDto[];
	totalCount: number;
}

export interface PickupPointWithStudentStatusDto {
	id: string; 
	description: string;
	location: string;
	latitude?: number | null;
	longitude?: number | null;
	totalStudents: number;
	activeStudents: number;
	pendingStudents: number;
	inactiveStudents: number;
	createdAt: string;
	updatedAt?: string | null;
	assignedStudentCount?: number; 
	assignedStudents?: Array<{
		id: string;
		firstName: string;
		lastName: string;
		status: number;
		pickupPointAssignedAt?: string | null;
	}>;
}

export const pickupPointService = {
	registerParent: (data: ParentRegistrationRequestDto) =>
		apiService.post<ParentRegistrationResponseDto>('/PickupPoint/register', data),
	verifyOtp: (data: VerifyOtpRequest) =>
		apiService.post<VerifyOtpWithStudentsResponseDto>('/PickupPoint/verify-otp', data),
	submitRequest: async (data: SubmitPickupPointRequestDto) => {
		const serializedData = JSON.stringify(data, (key, value) => {
			if (key === 'studentIds' && Array.isArray(value)) {
				return value.map((id: string) => {
					if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
						return id;
					}
					return id;
				});
			}
			return value;
		});

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/PickupPoint/submit-request`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: serializedData
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || errorData.message || 'Failed to submit request');
		}

		return response.json();
	},

	listRequests: (query?: PickupPointRequestListQuery) =>
		apiService.get<PickupPointRequestDetailDto[]>('/PickupPoint/requests', query),
	approveRequest: (requestId: string, data: ApprovePickupPointRequestDto) =>
		apiService.post(`/PickupPoint/requests/${requestId}/approve`, data),
	rejectRequest: (requestId: string, data: RejectPickupPointRequestDto) =>
		apiService.post(`/PickupPoint/requests/${requestId}/reject`, data),
	getUnassignedPickupPoints: () =>
		apiService.get<PickupPointsResponse>('/PickupPoint/unassigned'),
	getPickupPointsWithStudentStatus: () =>
		apiService.get<PickupPointWithStudentStatusDto[]>('/PickupPoint/with-student-status'),
	getPickupPointsBySemester: (data: GetPickupPointsBySemesterRequest) =>
		apiService.post<GetPickupPointsBySemesterResponse>('/PickupPoint/admin/get-by-semester', data),
	resetPickupPointBySemester: (data: ResetPickupPointBySemesterRequest) =>
		apiService.post<ResetPickupPointBySemesterResponse>('/PickupPoint/admin/reset-by-semester', data),
	getAvailableSemesters: () =>
		apiService.get<GetAvailableSemestersResponse>('/PickupPoint/admin/available-semesters'),
};
