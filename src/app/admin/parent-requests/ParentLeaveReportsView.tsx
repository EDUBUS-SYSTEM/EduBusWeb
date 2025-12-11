"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaEnvelope,
  FaExclamationTriangle,
  FaFilter,
  FaIdBadge,
  FaPhone,
  FaSearch,
  FaStickyNote,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import Pagination from "@/components/ui/Pagination";
import {
  ParentLeaveReportDetail,
  ParentLeaveReportSummary,
  ParentLeaveStatus,
} from "@/services/parentLeaveReportService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveParentLeaveReport,
  closeReport,
  DateRangeOption,
  fetchParentLeaveReportDetail,
  fetchParentLeaveReports,
  fetchStudentNamesByIds,
  openReport,
  PAGE_SIZE,
  rejectParentLeaveReport,
  selectParentLeaveReportsState,
  setCurrentPage,
  setDateRange,
  setSearchText,
  setStatusFilter,
} from "@/store/slices/parentLeaveReportsSlice";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

const DATE_RANGE_OPTIONS: Array<{ label: string; value: DateRangeOption }> = [
  { label: "Today", value: "today" },
  { label: "This week", value: "thisWeek" },
  { label: "This month", value: "thisMonth" },
  { label: "All time", value: "all" },
];

const STATUS_BADGE_STYLES: Record<ParentLeaveStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const TABLE_COLUMN_CLASSES = {
  student: "w-[20%]",
  parent: "w-[20%]",
  reason: "w-[20%]",
  dateRange: "w-[18%]",
  status: "w-[12%]",
  actions: "w-[10%]",
};

const APPROVAL_NOTE = "Attendance updated.";
const REJECTION_REASON = "Please attach additional verification.";

export default function ParentLeaveReportsView() {
  const dispatch = useAppDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const {
    reports,
    pagination,
    filters,
    loading,
    error,
    selectedReport,
    detailLoading,
    detailError,
    actionLoading,
    studentNameLookup,
  } = useAppSelector(selectParentLeaveReportsState);

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const totalItems = pagination.totalItems || 0;
  const statusFilterId = "parent-leave-status";
  const dateRangeLabelId = "parent-leave-date-range";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchParentLeaveReports());
    }, filters.searchText ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [dispatch, filters.searchText, filters.statusFilter, filters.dateRange, pagination.currentPage]);

  const resolveStudentName = useCallback(
    (report: { studentId: string; studentName: string }) => {
      const normalized = report.studentName?.trim();
      if (normalized) {
        return normalized;
      }

      const cached = report.studentId ? studentNameLookup[report.studentId] : undefined;
      if (cached) {
        return cached;
      }

      return "Student";
    },
    [studentNameLookup],
  );

  useEffect(() => {
    const missingIds = reports
      .filter((report) => !report.studentName?.trim() && report.studentId && !studentNameLookup[report.studentId])
      .map((report) => report.studentId)
      .filter((id, index, self): id is string => Boolean(id) && self.indexOf(id) === index);

    if (missingIds.length === 0) {
      return;
    }

    dispatch(fetchStudentNamesByIds(missingIds));
  }, [dispatch, reports, studentNameLookup]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage !== pagination.currentPage) {
      dispatch(setCurrentPage(nextPage));
    }
  };

  const handleOpenDetails = (report: ParentLeaveReportSummary) => {
    dispatch(openReport({ ...report, studentName: resolveStudentName(report) }));
    dispatch(fetchParentLeaveReportDetail(report.id));
  };

  const closeModal = () => {
    dispatch(closeReport());
  };

  const selectedStudentDisplayName = useMemo(
    () => (selectedReport ? resolveStudentName(selectedReport) : ""),
    [selectedReport, resolveStudentName],
  );

  const handleApprove = async (reportId: string) => {
    const result = await dispatch(approveParentLeaveReport({ reportId, notes: APPROVAL_NOTE }));
    if (approveParentLeaveReport.rejected.match(result)) {
      alert(result.payload ?? "Failed to approve request, please try again.");
      return false;
    }

    return true;
  };

  const handleReject = async (reportId: string, reason?: string) => {
    const result = await dispatch(
      rejectParentLeaveReport({ reportId, reason: reason?.trim() || REJECTION_REASON }),
    );
    if (rejectParentLeaveReport.rejected.match(result)) {
      alert(result.payload ?? "Failed to reject request, please try again.");
      return false;
    }

    return true;
  };

  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FAD23C]" />
        </div>
      );
    }

    if (error) {
      return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
    }

    return (
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FaExclamationTriangle className="mb-4 h-10 w-10 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No leave reports found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed divide-y divide-gray-100 text-sm">
              <colgroup>
                <col className={TABLE_COLUMN_CLASSES.student} />
                <col className={TABLE_COLUMN_CLASSES.parent} />
                <col className={TABLE_COLUMN_CLASSES.reason} />
                <col className={TABLE_COLUMN_CLASSES.dateRange} />
                <col className={TABLE_COLUMN_CLASSES.status} />
                <col className={TABLE_COLUMN_CLASSES.actions} />
              </colgroup>
              <thead className="bg-[#FEFCE8] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <tr>
                  <th className={`${TABLE_COLUMN_CLASSES.student} px-6 py-4`}>Student</th>
                  <th className={`${TABLE_COLUMN_CLASSES.parent} px-6 py-4`}>Parent</th>
                  <th className={`${TABLE_COLUMN_CLASSES.reason} px-6 py-4`}>Parent reason</th>
                  <th className={`${TABLE_COLUMN_CLASSES.dateRange} px-6 py-4`}>Date range</th>
                  <th className={`${TABLE_COLUMN_CLASSES.status} px-6 py-4`}>Status</th>
                  <th className={`${TABLE_COLUMN_CLASSES.actions} px-6 py-4 text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-[#463B3B]">
                {reports.map((report) => {
                  const totalDays = calculateTotalDays(report.startDate, report.endDate);
                  const studentDisplayName = resolveStudentName(report);
                  const parentContactChips = buildParentContactChips(report);
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className={`${TABLE_COLUMN_CLASSES.student} px-6 py-4 align-top`}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAD23C] text-[#463B3B]">
                            <FaUser />
                          </div>
                          <div>
                            <p className="font-semibold">{studentDisplayName}</p>
                            <p className="text-xs text-gray-500">Requested {formatDate(report.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`${TABLE_COLUMN_CLASSES.parent} px-6 py-4 align-top`}>
                        {parentContactChips.length > 0 ? (
                          <div className="flex flex-col gap-1 text-[12px] text-gray-600">
                            {parentContactChips.map((chip) => (
                              <span
                                key={`${report.id}-${chip.type}`}
                                className="inline-flex items-center gap-2 text-xs text-gray-600"
                              >
                                {chip.icon}
                                {chip.href ? (
                                  <a
                                    href={chip.href}
                                    className="block truncate text-xs text-[#463B3B] underline-offset-2 hover:underline"
                                  >
                                    {chip.label}
                                  </a>
                                ) : (
                                  <span className="block truncate">{chip.label}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400">No parent information</p>
                        )}
                      </td>
                      <td className={`${TABLE_COLUMN_CLASSES.reason} px-6 py-4 align-top`}>
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-700">
                          {report.reason?.trim() || "No specific reason provided."}
                        </p>
                      </td>
                      <td className={`${TABLE_COLUMN_CLASSES.dateRange} px-6 py-4 align-top`}>
                        <p className="font-medium">
                          {formatDate(report.startDate)} - {formatDate(report.endDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {totalDays} day{totalDays > 1 ? "s" : ""}
                        </p>
                      </td>

                      <td className={`${TABLE_COLUMN_CLASSES.status} px-6 py-4 align-top`}>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[report.status]}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className={`${TABLE_COLUMN_CLASSES.actions} px-6 py-4 text-right align-top`}>
                        <button
                          onClick={() => handleOpenDetails(report)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-[#463B3B] transition hover:border-[#463B3B] hover:bg-[#FDF4FF]"
                        >
                          <FaSearch />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={filters.searchText}
                onChange={(e) => {
                  dispatch(setSearchText(e.target.value));
                }}
                className="w-full rounded-2xl border border-gray-200 px-10 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-[#FAD23C]"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FAD23C] px-4 py-2.5 text-sm font-medium text-[#463B3B] transition hover:bg-[#FFE580]"
          >
            <FaFilter className="text-xs" />
            Advanced filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor={statusFilterId} className="mb-1 block text-xs font-medium text-gray-600">
                Status
              </label>
              <select
                id={statusFilterId}
                value={filters.statusFilter}
                onChange={(e) => {
                  dispatch(setStatusFilter(e.target.value as ParentLeaveStatus | ""));
                }}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#FAD23C]"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <fieldset
              className="md:col-span-2 border-0 p-0"
              aria-labelledby={dateRangeLabelId}
              data-fieldset="date-range"
            >
              <legend id={dateRangeLabelId} className="mb-1 block text-xs font-medium text-gray-600">
                Date range
              </legend>
              <div className="flex flex-wrap gap-2">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      dispatch(setDateRange(option.value));
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ${filters.dateRange === option.value
                      ? "bg-[#463B3B] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      {renderTableContent()}

      {totalItems > PAGE_SIZE && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={PAGE_SIZE}
          onPageChange={handlePageChange}
          className="rounded-2xl border border-gray-100 bg-white px-4 py-4"
        />
      )}

      {selectedReport && (
        <LeaveReportDetailModal
          report={selectedReport}
          studentDisplayName={selectedStudentDisplayName}
          onClose={closeModal}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
          detailLoading={detailLoading}
          detailError={detailError}
        />
      )}
    </div>
  );
}

function LeaveReportDetailModal({
  report,
  studentDisplayName,
  onClose,
  onApprove,
  onReject,
  loading,
  detailLoading,
  detailError,
}: Readonly<{
  report: ParentLeaveReportDetail;
  studentDisplayName: string;
  onClose: () => void;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string, reason?: string) => Promise<boolean>;
  loading: boolean;
  detailLoading: boolean;
  detailError: string | null;
}>) {
  const totalDays = calculateTotalDays(report.startDate, report.endDate);
  const parentContactSummary = buildParentContactSummary(report);
  const hasEmail = Boolean(report.parentEmail?.trim());
  const hasPhone = Boolean(report.parentPhoneNumber?.trim());
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const studentNameForAction = studentDisplayName || report.studentName || "Student";

  const closeActionDialog = () => {
    setPendingAction(null);
    setRejectReasonInput("");
  };

  const handleApproveConfirm = async () => {
    if (loading) return;
    const ok = await onApprove(report.id);
    if (ok) {
      closeActionDialog();
    }
  };

  const handleRejectConfirm = async () => {
    if (loading) return;
    const ok = await onReject(report.id, rejectReasonInput.trim() || undefined);
    if (ok) {
      closeActionDialog();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="relative overflow-hidden rounded-t-3xl bg-[#FAD23C] p-6 text-[#463B3B]">
          <p className="text-lg font-semibold">Leave request detail</p>
          <p className="text-sm text-[#6E4C1E]">Review all information below</p>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-[#D7B543] p-2 text-[#463B3B] hover:bg-white/20"
          >
            <FaTimes />
          </button>
        </div>

        <div className="relative">
          {detailLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-3xl bg-white/70">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#FAD23C]" />
            </div>
          )}

          <div className={`space-y-5 p-6 ${detailLoading ? "pointer-events-none blur-[1px]" : ""}`}>
            {detailError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{detailError}</div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-[#FFF7D1] p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#866516]">Leave period</p>
                  <p className="text-lg font-semibold text-[#463B3B]">
                    {formatDate(report.startDate)} - {formatDate(report.endDate)}
                  </p>
                  <p className="text-xs text-gray-600">{totalDays} day(s) requested</p>
                </div>
                <span className="rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#6E4C1E]">
                  {report.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-400">Student</p>
                <p className="text-lg font-semibold text-[#463B3B]">{studentDisplayName || report.studentName}</p>
                {parentContactSummary && (
                  <p className="mt-1 text-xs text-gray-500">{parentContactSummary}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">Created at {formatDateTime(report.createdAt)}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-gray-400">Timeline</p>
                <div className="mt-3 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <FaCheck />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#463B3B]">Submitted</p>
                      <p className="text-xs text-gray-500">{formatDateTime(report.createdAt)}</p>
                    </div>
                  </div>
                  {report.reviewedAt ? (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#463B3B]">Reviewed</p>
                        <p className="text-xs text-gray-500">{formatDateTime(report.reviewedAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#463B3B]">Awaiting review</p>
                        <p className="text-xs text-gray-500">Not handled yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAD23C]/30 text-[#463B3B]">
                  <FaIdBadge />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Parent contact</p>
                  <p className="text-sm font-semibold text-[#463B3B]">
                    {report.parentName?.trim() || "No parent name provided"}
                  </p>

                </div>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6FB] text-[#463B3B]">
                    <FaEnvelope className="text-base" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                    {hasEmail ? (
                      <a
                        href={`mailto:${report.parentEmail}`}
                        className="text-sm font-medium text-[#463B3B] underline-offset-2 hover:underline"
                      >
                        {report.parentEmail}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">No email provided</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6FB] text-[#463B3B]">
                    <FaPhone className="text-base" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                    {hasPhone ? (
                      <a
                        href={`tel:${report.parentPhoneNumber}`}
                        className="text-sm font-medium text-[#463B3B] underline-offset-2 hover:underline"
                      >
                        {report.parentPhoneNumber}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">No phone number provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase text-gray-400">Leave reason</p>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                {report.reason || "No specific reason provided."}
              </p>
            </div>

            {report.notes && (
              <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-5 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-400">
                  <FaStickyNote /> Admin notes
                </p>
                <p className="mt-2 text-sm text-gray-700">{report.notes}</p>
              </div>
            )}

            {report.status === "Pending" && (
              <div className="flex flex-col gap-3 rounded-3xl bg-[#FFFBEB] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#463B3B]">Approve or reject request</p>
                  <p className="text-xs text-gray-500">Ensure absence information is correct before approving.</p>
                </div>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setPendingAction("reject")}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading && <FaTimes className="animate-spin" />}
                    Reject
                  </button>
                  <button
                    onClick={() => setPendingAction("approve")}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading && <FaCheck className="animate-spin" />}
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {pendingAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-[#463B3B]">
                  {pendingAction === "approve" ? "Confirm approval" : "Reject leave request"}
                </p>
                <p className="text-xs text-gray-500">
                  {pendingAction === "approve"
                    ? "Approve this absence and notify the parent."
                    : "Optionally share a reason with the parent when rejecting."}
                </p>
              </div>
              <button
                onClick={closeActionDialog}
                className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Close confirmation"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-[#FFFBEB] p-4 text-sm text-[#463B3B]">
                <p className="font-semibold">{studentNameForAction}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(report.startDate)} - {formatDate(report.endDate)} • {totalDays} day
                  {totalDays > 1 ? "s" : ""}
                </p>
              </div>

              {pendingAction === "approve" && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <p className="font-semibold">Confirmation</p>
                  <p className="mt-1 text-xs text-emerald-900">
                    This request will move to <span className="font-semibold">Approved</span> and attendance
                    will be updated automatically.
                  </p>
                </div>
              )}

              {pendingAction === "reject" && (
                <div className="space-y-2">
                  <label htmlFor="reject-reason" className="text-xs font-semibold uppercase text-gray-500">
                    Reason (optional)
                  </label>
                  <textarea
                    id="reject-reason"
                    rows={3}
                    value={rejectReasonInput}
                    onChange={(event) => setRejectReasonInput(event.target.value)}
                    placeholder="E.g. Need additional documents"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-[#463B3B] placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#FAD23C]"
                  />
                  <p className="text-xs text-gray-500">Leaving this empty will use the default note.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={closeActionDialog}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={pendingAction === "approve" ? handleApproveConfirm : handleRejectConfirm}
                disabled={loading}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${pendingAction === "approve" ? "bg-[#22C55E] hover:bg-[#16A34A]" : "bg-red-500 hover:bg-red-600"
                  }`}
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />}
                {pendingAction === "approve" ? "Confirm approval" : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildParentContactSummary(report: {
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhoneNumber?: string | null;
}) {
  const segments = [report.parentName, report.parentEmail, report.parentPhoneNumber]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return segments.join(" • ");
}

function buildParentContactChips(report: {
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhoneNumber?: string | null;
}) {
  const chips: Array<{
    type: "name" | "email" | "phone";
    label: string;
    href?: string;
    icon: JSX.Element;
  }> = [];

  const name = report.parentName?.trim();
  if (name) {
    chips.push({
      type: "name",
      label: name,
      icon: <FaUser className="text-[10px]" />,
    });
  }

  const email = report.parentEmail?.trim();
  if (email) {
    chips.push({
      type: "email",
      label: email,
      href: `mailto:${email}`,
      icon: <FaEnvelope className="text-[10px]" />,
    });
  }

  const phone = report.parentPhoneNumber?.trim();
  if (phone) {
    chips.push({
      type: "phone",
      label: phone,
      href: `tel:${phone}`,
      icon: <FaPhone className="text-[10px]" />,
    });
  }

  return chips;
}

function calculateTotalDays(start?: string, end?: string) {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 1;
  }

  const diff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(diff / 86_400_000) + 1;
  return Math.max(days, 1);
}

