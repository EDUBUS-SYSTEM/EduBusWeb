import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  parentLeaveReportService,
  ParentLeaveReportDetail,
  ParentLeaveReportListResult,
  ParentLeaveReportSummary,
  ParentLeaveStatus,
} from "@/services/parentLeaveReportService";
import { studentService } from "@/services/studentService/studentService.api";

export type DateRangeOption = "today" | "thisWeek" | "thisMonth" | "all";

export const PAGE_SIZE = 6;

interface ParentLeaveReportsState {
  reports: ParentLeaveReportSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
  filters: {
    searchText: string;
    statusFilter: ParentLeaveStatus | "";
    dateRange: DateRangeOption;
  };
  loading: boolean;
  error: string | null;
  selectedReport: ParentLeaveReportDetail | null;
  detailsCache: Record<string, ParentLeaveReportDetail>;
  detailLoading: boolean;
  detailError: string | null;
  actionLoading: boolean;
  studentNameLookup: Record<string, string>;
}

const initialState: ParentLeaveReportsState = {
  reports: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: PAGE_SIZE,
  },
  filters: {
    searchText: "",
    statusFilter: "",
    dateRange: "thisWeek",
  },
  loading: false,
  error: null,
  selectedReport: null,
  detailsCache: {},
  detailLoading: false,
  detailError: null,
  actionLoading: false,
  studentNameLookup: {},
};

const createDetailFromSummary = (summary: ParentLeaveReportSummary): ParentLeaveReportDetail => ({
  ...summary,
  parentId: "",
  notes: null,
  reviewedAt: summary.updatedAt ?? null,
  reviewedBy: null,
});

const getDateRangeBoundaries = (range: DateRangeOption) => {
  const now = new Date();

  const startOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  if (range === "today") {
    return {
      startDateParam: startOfDay(now).toISOString(),
      endDateParam: endOfDay(now).toISOString(),
    };
  }

  if (range === "thisWeek") {
    const monday = new Date(now);
    const day = now.getDay();
    const diff = (day + 6) % 7;
    monday.setDate(now.getDate() - diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDateParam: startOfDay(monday).toISOString(),
      endDateParam: endOfDay(sunday).toISOString(),
    };
  }

  if (range === "thisMonth") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDateParam: startOfDay(first).toISOString(),
      endDateParam: endOfDay(last).toISOString(),
    };
  }

  return { startDateParam: undefined, endDateParam: undefined };
};

const upsertReportSummary = (
  reports: ParentLeaveReportSummary[],
  updated: ParentLeaveReportDetail,
): ParentLeaveReportSummary[] =>
  reports.map((report) => (report.id === updated.id ? { ...report, ...updated } : report));

export const fetchParentLeaveReports = createAsyncThunk<
  { items: ParentLeaveReportSummary[]; pagination: ParentLeaveReportListResult["pagination"] },
  void,
  { state: RootState; rejectValue: string }
>("parentLeaveReports/fetchAll", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().parentLeaveReports;
    const {
      filters: { searchText, statusFilter, dateRange },
      pagination: { currentPage },
    } = state;
    const { startDateParam, endDateParam } = getDateRangeBoundaries(dateRange);

    const response = await parentLeaveReportService.listReports({
      search: searchText.trim() || undefined,
      status: statusFilter || undefined,
      startDate: startDateParam,
      endDate: endDateParam,
      page: currentPage,
      perPage: PAGE_SIZE,
      sort: "Newest",
    });

    return response;
  } catch (error) {
    console.error("fetchParentLeaveReports", error);
    return rejectWithValue("Unable to load leave reports. Please try again.");
  }
});

export const fetchParentLeaveReportDetail = createAsyncThunk<
  ParentLeaveReportDetail,
  string,
  { rejectValue: string }
>("parentLeaveReports/fetchDetail", async (reportId, { rejectWithValue }) => {
  try {
    return await parentLeaveReportService.getReportById(reportId);
  } catch (error) {
    console.error("fetchParentLeaveReportDetail", error);
    return rejectWithValue("Unable to load request details. Please try again.");
  }
});

export const approveParentLeaveReport = createAsyncThunk<
  ParentLeaveReportDetail,
  { reportId: string; notes?: string },
  { rejectValue: string }
>("parentLeaveReports/approve", async ({ reportId, notes }, { rejectWithValue }) => {
  try {
    return await parentLeaveReportService.approveReport(reportId, { notes });
  } catch (error) {
    console.error("approveParentLeaveReport", error);
    return rejectWithValue("Failed to approve request, please try again.");
  }
});

export const rejectParentLeaveReport = createAsyncThunk<
  ParentLeaveReportDetail,
  { reportId: string; reason: string },
  { rejectValue: string }
>("parentLeaveReports/reject", async ({ reportId, reason }, { rejectWithValue }) => {
  try {
    return await parentLeaveReportService.rejectReport(reportId, { reason });
  } catch (error) {
    console.error("rejectParentLeaveReport", error);
    return rejectWithValue("Failed to reject request, please try again.");
  }
});

export const fetchStudentNamesByIds = createAsyncThunk<Record<string, string>, string[]>(
  "parentLeaveReports/fetchStudentNames",
  async (studentIds) => {
    if (!studentIds.length) {
      return {};
    }

    const results = await Promise.all(
      studentIds.map(async (id) => {
        try {
          const student = await studentService.getById(id);
          const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
          return fullName ? { id, name: fullName } : null;
        } catch (error) {
          console.error(`fetchStudentNamesByIds -> ${id}`, error);
          return null;
        }
      }),
    );

    return results.reduce<Record<string, string>>((acc, result) => {
      if (result) {
        acc[result.id] = result.name;
      }
      return acc;
    }, {});
  },
);

const parentLeaveReportsSlice = createSlice({
  name: "parentLeaveReports",
  initialState,
  reducers: {
    setSearchText(state, action: PayloadAction<string>) {
      state.filters.searchText = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatusFilter(state, action: PayloadAction<ParentLeaveStatus | "">) {
      state.filters.statusFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setDateRange(state, action: PayloadAction<DateRangeOption>) {
      state.filters.dateRange = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    openReport(state, action: PayloadAction<ParentLeaveReportSummary>) {
      const existingDetail = state.detailsCache[action.payload.id];
      state.selectedReport = existingDetail ?? createDetailFromSummary(action.payload);
      state.detailError = null;
    },
    closeReport(state) {
      state.selectedReport = null;
      state.detailError = null;
      state.detailLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParentLeaveReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentLeaveReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.items;
        state.pagination = {
          ...state.pagination,
          ...action.payload.pagination,
        };
      })
      .addCase(fetchParentLeaveReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to load leave reports. Please try again.";
      })
      .addCase(fetchParentLeaveReportDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchParentLeaveReportDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedReport = action.payload;
        state.detailsCache[action.payload.id] = action.payload;
      })
      .addCase(fetchParentLeaveReportDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload ?? "Unable to load request details. Please try again.";
      })
      .addCase(approveParentLeaveReport.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(approveParentLeaveReport.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedReport = action.payload;
        state.detailsCache[action.payload.id] = action.payload;
        state.reports = upsertReportSummary(state.reports, action.payload);
      })
      .addCase(approveParentLeaveReport.rejected, (state, action) => {
        state.actionLoading = false;
        state.detailError = action.payload ?? "Failed to approve request, please try again.";
      })
      .addCase(rejectParentLeaveReport.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectParentLeaveReport.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedReport = action.payload;
        state.detailsCache[action.payload.id] = action.payload;
        state.reports = upsertReportSummary(state.reports, action.payload);
      })
      .addCase(rejectParentLeaveReport.rejected, (state, action) => {
        state.actionLoading = false;
        state.detailError = action.payload ?? "Failed to reject request, please try again.";
      })
      .addCase(fetchStudentNamesByIds.fulfilled, (state, action) => {
        state.studentNameLookup = { ...state.studentNameLookup, ...action.payload };
      });
  },
});

export const { setSearchText, setStatusFilter, setDateRange, setCurrentPage, openReport, closeReport } =
  parentLeaveReportsSlice.actions;

export const selectParentLeaveReportsState = (state: RootState) => state.parentLeaveReports;

export default parentLeaveReportsSlice.reducer;

