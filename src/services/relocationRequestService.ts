import { apiService } from '@/lib/api';

// TypeScript interfaces matching backend DTOs

export interface AIRecommendationDto {
  recommendation: string;
  confidence: string;
  score: number;
  summary: string;
  reasons: string[];
  suggestedActions: string[];
  riskFactors: string[];
  calculatedAt: string;
}

export interface RelocationRequestDto {
  id: string;
  requestType: string;
  requestStatus: string;
  priority: string;

  // Student & Parent
  parentId: string;
  parentEmail: string;
  studentId: string;
  studentName: string;

  // Semester
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  totalSchoolDays: number;
  daysServiced: number;
  daysRemaining: number;

  // Old Location
  oldPickupPointId: string;
  oldPickupPointAddress: string;
  oldDistanceKm: number;

  // New Location
  newPickupPointAddress: string;
  newLatitude: number;
  newLongitude: number;
  newDistanceKm: number;
  newPickupPointId?: string;
  isOnExistingRoute: boolean;

  // Financial
  originalPaymentAmount: number;
  valueServiced: number;
  valueRemaining: number;
  newLocationCost: number;
  refundAmount: number;
  additionalPaymentRequired: number;
  processingFee: number;
  unitPricePerKm: number;

  // Request Details
  reason: string;
  description: string;
  evidenceUrls: string[];
  urgentRequest: boolean;
  requestedEffectiveDate: string;

  // AI Recommendation
  aiRecommendation?: AIRecommendationDto;

  // Admin Review
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  adminNotes: string;
  adminDecision?: string;
  rejectionReason?: string;

  // Implementation
  implementedAt?: string;
  effectiveDate?: string;

  // Tracking
  submittedAt: string;
  lastStatusUpdate: string;
  createdAt: string;
}

export interface RelocationRequestListResponse {
  data: RelocationRequestDto[];
  totalCount: number;
  page: number;
  perPage: number;
}

export interface ApproveRelocationRequestDto {
  adminNotes?: string;
  effectiveDate?: string;
}

export interface RejectRelocationRequestDto {
  rejectionReason: string;
  adminNotes?: string;
}

export interface RelocationRequestListQuery {
  status?: string;
  semesterCode?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  perPage?: number;
  [key: string]: unknown;
}

export const relocationRequestService = {
  // Admin: Get all relocation requests
  listRequests: (query?: RelocationRequestListQuery) =>
    apiService.get<RelocationRequestListResponse>('/RelocationRequest', query),

  // Get request by ID
  getRequestById: (requestId: string) =>
    apiService.get<RelocationRequestDto>(`/RelocationRequest/${requestId}`),

  // Admin: Approve request
  approveRequest: (requestId: string, data: ApproveRelocationRequestDto) =>
    apiService.post(`/RelocationRequest/${requestId}/approve`, data),

  // Admin: Reject request
  rejectRequest: (requestId: string, data: RejectRelocationRequestDto) =>
    apiService.post(`/RelocationRequest/${requestId}/reject`, data),
};
