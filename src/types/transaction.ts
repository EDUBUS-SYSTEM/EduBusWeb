export interface TransactionDetailResponseDto {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  transactionCode: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  provider: string;
  createdAt: string;
  paidAt?: string;
  updatedAt: string;
  transportFeeItems: TransportFeeItemSummary[];
}

export interface TransactionListResponseDto {
  transactions: TransactionSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TransactionSummary {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransportFeeItemSummary {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  distanceKm: number;
  unitPrice?: number; 
  unitPricePerKm?: number; 
  amount: number;
  semesterName: string;
  academicYear: string;
  status: TransportFeeItemStatus;
}

export interface TransactionListRequest {
  parentId?: string;
  studentId?: string;
  status?: TransactionStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateTransactionRequest {
  description?: string;
  amount?: number;
  currency?: string;
}

export interface CalculateFeeRequest {
  studentId: string;
  semesterId: string;
  academicYearId: string;
  distance: number;
}

export interface CalculateFeeResponse {
  unitPrice: number;
  distance: number;
  totalAmount: number;
  currency: string;
}

export enum TransactionStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
  Failed = 'Failed'
}

export enum TransportFeeItemStatus {
  Unbilled = 'Unbilled',
  Invoiced = 'Invoiced',
  Paid = 'Paid',
  Cancelled = 'Cancelled'
}

