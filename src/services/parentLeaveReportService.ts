import { apiService } from "@/lib/api";

export type ParentLeaveStatus = "Pending" | "Approved" | "Rejected";

export interface ParentLeaveReportSummary {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  parentPhoneNumber: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: ParentLeaveStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export type ParentLeaveReportDetail = ParentLeaveReportSummary & {
  parentId: string;
  notes?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
};

export interface ParentLeaveReportListQuery {
  search?: string;
  status?: ParentLeaveStatus;
  startDate?: string;
  endDate?: string;
  sort?: "Newest" | "Oldest";
  page?: number;
  perPage?: number;
}

export interface ParentLeaveReportListResult {
  items: ParentLeaveReportSummary[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

const STATUS_PARAM: Record<ParentLeaveStatus, number> = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
};

const STATUS_LABELS: Record<number, ParentLeaveStatus> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
};

const pickValue = <T>(source: Record<string, unknown> | undefined, ...keys: string[]): T | undefined => {
  if (!source) {
    return undefined;
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }

  return undefined;
};

const mapStatus = (value: unknown): ParentLeaveStatus => {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized === "Pending" || normalized === "Approved" || normalized === "Rejected") {
      return normalized;
    }
    const numeric = Number(normalized);
    if (!Number.isNaN(numeric) && STATUS_LABELS[numeric as 0 | 1 | 2]) {
      return STATUS_LABELS[numeric as 0 | 1 | 2];
    }
  }

  if (typeof value === "number" && STATUS_LABELS[value as 0 | 1 | 2]) {
    return STATUS_LABELS[value as 0 | 1 | 2];
  }

  return "Pending";
};

const normalizeSummary = (item: Record<string, unknown>): ParentLeaveReportSummary => ({
  id: pickValue<string>(item, "id", "Id") ?? "",
  studentId: pickValue<string>(item, "studentId", "StudentId") ?? "",
  studentName: pickValue<string>(item, "studentName", "StudentName") ?? "Student",
  parentName: pickValue<string>(item, "parentName", "ParentName") ?? "",
  parentEmail: pickValue<string>(item, "parentEmail", "ParentEmail") ?? "",
  parentPhoneNumber: pickValue<string>(item, "parentPhoneNumber", "ParentPhoneNumber") ?? "",
  startDate: pickValue<string>(item, "startDate", "StartDate") ?? "",
  endDate: pickValue<string>(item, "endDate", "EndDate") ?? "",
  reason: pickValue<string>(item, "reason", "Reason") ?? "",
  status: mapStatus(pickValue(item, "status", "Status")),
  createdAt: pickValue<string>(item, "createdAt", "CreatedAt") ?? "",
  updatedAt: pickValue<string>(item, "updatedAt", "UpdatedAt"),
});

const normalizeDetail = (item: Record<string, unknown>): ParentLeaveReportDetail => {
  const summary = normalizeSummary(item);
  return {
    ...summary,
    parentId: pickValue<string>(item, "parentId", "ParentId") ?? "",
    notes: pickValue<string | null>(item, "notes", "Notes") ?? null,
    reviewedAt: pickValue<string | null>(item, "reviewedAt", "ReviewedAt") ?? null,
    reviewedBy: pickValue<string | null>(item, "reviewedBy", "ReviewedBy") ?? null,
  };
};

const normalizePagination = (item: Record<string, unknown> | undefined) => ({
  currentPage: pickValue<number>(item, "currentPage", "CurrentPage") ?? 1,
  perPage: pickValue<number>(item, "perPage", "PerPage") ?? 20,
  totalItems: pickValue<number>(item, "totalItems", "TotalItems") ?? 0,
  totalPages: pickValue<number>(item, "totalPages", "TotalPages") ?? 1,
});

export const parentLeaveReportService = {
  async listReports(query: ParentLeaveReportListQuery): Promise<ParentLeaveReportListResult> {
    const params: Record<string, unknown> = {
      search: query.search,
      status: query.status ? STATUS_PARAM[query.status] : undefined,
      startDate: query.startDate,
      endDate: query.endDate,
      sort: query.sort ?? "Newest",
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    console.log("parentLeaveReportService.listReports - calling API with params:", params);
    const response = await apiService.get<Record<string, unknown>>("/student-absence-requests", params);
    console.log("parentLeaveReportService.listReports - API response:", response);
    
    const itemsSource = (response?.data ?? response?.Data ?? []) as Record<string, unknown>[];
    const pagination = normalizePagination(
      (response?.pagination ?? response?.Pagination) as Record<string, unknown> | undefined,
    );

    console.log("parentLeaveReportService.listReports - normalized items:", itemsSource.length, "pagination:", pagination);

    return {
      items: itemsSource.map(normalizeSummary),
      pagination,
    };
  },

  async getReportById(requestId: string): Promise<ParentLeaveReportDetail> {
    const response = await apiService.get<Record<string, unknown>>(`/student-absence-requests/${requestId}`);
    return normalizeDetail(response ?? {});
  },

  async approveReport(requestId: string, payload?: { notes?: string }): Promise<ParentLeaveReportDetail> {
    const response = await apiService.patch<Record<string, unknown>>(
      `/student-absence-requests/${requestId}/approve`,
      {
        notes: payload?.notes,
      },
    );
    return normalizeDetail(response ?? {});
  },

  async rejectReport(requestId: string, payload: { reason: string }): Promise<ParentLeaveReportDetail> {
    const response = await apiService.patch<Record<string, unknown>>(
      `/student-absence-requests/${requestId}/reject`,
      {
        reason: payload.reason,
      },
    );
    return normalizeDetail(response ?? {});
  },

  statusLabelFromValue(value: number | string | undefined) {
    return mapStatus(value);
  },
};

