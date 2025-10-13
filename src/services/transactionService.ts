import { apiService } from '@/lib/api';
import { TransactionListRequest, TransactionListResponseDto, TransactionDetailResponseDto } from '@/types/transaction';

export interface CalculateFeeRequest {
	distanceKm: number;
	unitPriceId?: string;
}

export interface CalculateFeeResponse {
	totalFee: number;
	unitPricePerKm: number;
	distanceKm: number;
	totalSchoolDays: number;
	totalTrips: number;
	totalDistanceKm: number;
	semesterName: string;
	academicYear: string;
	semesterStartDate: string;
	semesterEndDate: string;
	holidays: string[];
	calculationDetails: string;
}

export const transactionService = {
	calculateTransportFee: (request: CalculateFeeRequest) =>
		apiService.post<CalculateFeeResponse>('/Transaction/calculate-fee', request),
	
	getTransactionList: (request: TransactionListRequest) => {
		const params = new URLSearchParams();
		if (request.page) params.append('page', request.page.toString());
		if (request.pageSize) params.append('pageSize', request.pageSize.toString());
		if (request.status) params.append('status', request.status);
		if (request.parentId) params.append('parentId', request.parentId);
		if (request.studentId) params.append('studentId', request.studentId);
		if (request.from) params.append('from', request.from);
		if (request.to) params.append('to', request.to);
		if (request.sortBy) params.append('sortBy', request.sortBy);
		if (request.sortOrder) params.append('sortOrder', request.sortOrder);
		
		return apiService.get<TransactionListResponseDto>(`/Transaction?${params.toString()}`);
	},
	
	getTransactionDetail: (transactionId: string) =>
		apiService.get<TransactionDetailResponseDto>(`/Transaction/${transactionId}`),
};