import { apiService } from '@/lib/api';

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

export class TransactionService {
  async calculateTransportFee(request: CalculateFeeRequest): Promise<CalculateFeeResponse> {
    try {
      return await apiService.post<CalculateFeeResponse>('/Transaction/calculate-fee', request);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;

