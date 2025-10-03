import { apiService } from '@/lib/api';

export enum TransportFeeItemStatus {
  Unbilled = 0,
  Invoiced = 1,
  Paid = 2,
  Cancelled = 3
}

export enum TransportFeeItemType {
  Register = 0,
  Extend = 1
}

export interface TransportFeeItemListRequest {
  page?: number;
  pageSize?: number;
  transactionId?: string;
  studentId?: string;
  parentEmail?: string;
  status?: TransportFeeItemStatus;
  semesterName?: string;
  academicYear?: string;
  type?: TransportFeeItemType;
}

export interface TransportFeeItemListResponse {
  items: TransportFeeItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TransportFeeItem {
  id: string;
  studentId: string;
  studentName?: string;
  description: string;
  distanceKm: number;
  unitPriceVndPerKm: number;
  subtotal: number;
  parentEmail: string;
  semesterName: string;
  semesterCode: string;
  academicYear: string;
  semesterStartDate: string;
  semesterEndDate: string;
  type: TransportFeeItemType;
  status: TransportFeeItemStatus;
  transactionId?: string;
  transactionCode?: string;
  unitPriceId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransportFeeItemDetailResponse {
  id: string;
  transactionId: string;
  transactionCode: string;
  studentId: string;
  studentName: string;
  parentEmail: string;
  description: string;
  distanceKm: number;
  unitPricePerKm: number;
  subtotal: number;
  semesterName: string;
  academicYear: string;
  semesterStartDate: string;
  semesterEndDate: string;
  totalSchoolDays: number;
  status: TransportFeeItemStatus;
  type: TransportFeeItemType;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransportFeeItemRequest {
  transactionId: string;
  studentId: string;
  parentEmail: string;
  description: string;
  distanceKm: number;
  unitPricePerKm: number;
  subtotal: number;
  unitPriceId: string;
  semesterName: string;
  academicYear: string;
  semesterStartDate: string;
  semesterEndDate: string;
  totalSchoolDays: number;
  type?: TransportFeeItemType;
}

export interface UpdateTransportFeeItemStatusRequest {
  id: string;
  status: TransportFeeItemStatus;
  notes?: string;
}

export interface UpdateStatusBatchRequest {
  ids: string[];
  status: TransportFeeItemStatus;
}

export interface TransportFeeItemSummary {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  subtotal: number;
  status: TransportFeeItemStatus;
  createdAt: string;
}

export class TransportFeeItemService {
  async getList(request: TransportFeeItemListRequest = {}): Promise<TransportFeeItemListResponse> {
    try {
      const params = new URLSearchParams();
      if (request.page) params.append('page', request.page.toString());
      if (request.pageSize) params.append('pageSize', request.pageSize.toString());
      if (request.transactionId) params.append('transactionId', request.transactionId);
      if (request.studentId) params.append('studentId', request.studentId);
      if (request.parentEmail) params.append('parentEmail', request.parentEmail);
      if (request.status !== undefined) params.append('status', request.status.toString());
      if (request.semesterName) params.append('semesterName', request.semesterName);
      if (request.academicYear) params.append('academicYear', request.academicYear);
      if (request.type !== undefined) params.append('type', request.type.toString());

      return await apiService.get<TransportFeeItemListResponse>(`/TransportFeeItem?${params.toString()}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getDetail(id: string): Promise<TransportFeeItemDetailResponse> {
    try {
      return await apiService.get<TransportFeeItemDetailResponse>(`/TransportFeeItem/${id}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async create(request: CreateTransportFeeItemRequest): Promise<TransportFeeItem> {
    try {
      return await apiService.post<TransportFeeItem>('/TransportFeeItem', request);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async updateStatus(request: UpdateTransportFeeItemStatusRequest): Promise<void> {
    try {
      await apiService.put(`/TransportFeeItem/${request.id}/status`, request);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async updateStatusBatch(request: UpdateStatusBatchRequest): Promise<void> {
    try {
      await apiService.put('/TransportFeeItem/status/batch', request);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getByTransactionId(transactionId: string): Promise<TransportFeeItemSummary[]> {
    try {
      return await apiService.get<TransportFeeItemSummary[]>(`/TransportFeeItem/transaction/${transactionId}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getByStudentId(studentId: string): Promise<TransportFeeItemSummary[]> {
    try {
      return await apiService.get<TransportFeeItemSummary[]>(`/TransportFeeItem/student/${studentId}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getByParentEmail(parentEmail: string): Promise<TransportFeeItemSummary[]> {
    try {
      return await apiService.get<TransportFeeItemSummary[]>(`/TransportFeeItem/parent/${parentEmail}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getTotalAmountByTransactionId(transactionId: string): Promise<number> {
    try {
      return await apiService.get<number>(`/TransportFeeItem/transaction/${transactionId}/total`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async getCountByStatus(status: TransportFeeItemStatus): Promise<number> {
    try {
      return await apiService.get<number>(`/TransportFeeItem/count/${status}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.delete(`/TransportFeeItem/${id}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw error;
    }
  }
}

export const transportFeeItemService = new TransportFeeItemService();
