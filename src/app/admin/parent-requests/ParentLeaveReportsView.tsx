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
  parentLeaveReportService,
  ParentLeaveReportDetail,
  ParentLeaveReportSummary,
  ParentLeaveStatus,
} from "@/services/parentLeaveReportService";
import { studentService } from "@/services/studentService/studentService.api";

type DateRangeOption = "today" | "thisWeek" | "thisMonth" | "all";

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
  student: "w-[28%]",
  reason: "w-[28%]",
  dateRange: "w-[16%]",
  requested: "w-[16%]",
  status: "w-[8%]",
  actions: "w-[12%]",
};

const PAGE_SIZE = 6;
const APPROVAL_NOTE = "Attendance updated.";
const REJECTION_REASON = "Please attach additional verification.";

export default function ParentLeaveReportsView() {
  const [reports, setReports] = useState<ParentLeaveReportSummary[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ParentLeaveStatus | "">("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("thisWeek");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReport, setSelectedReport] = useState<ParentLeaveReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [studentNameLookup, setStudentNameLookup] = useState<Record<string, string>>({});

  const { startDateParam, endDateParam } = useMemo(() => getDateRangeBoundaries(dateRange), [dateRange]);
  const totalPages = Math.max(1, pagination.totalPages || 1);
  const totalItems = pagination.totalItems || 0;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await parentLeaveReportService.listReports({
        search: searchText.trim() || undefined,
        status: statusFilter || undefined,
        startDate: startDateParam,
        endDate: endDateParam,
        page: currentPage,
        perPage: PAGE_SIZE,
        sort: "Newest",
      });

      setReports(response.items);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to load leave reports", err);
      setError("Unable to load leave reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, startDateParam, endDateParam, currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReports();
    }, searchText ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchText, fetchReports]);

  const resolveStudentName = useCallback(
    (report: { studentId: string; studentName: string }) => {
      const normalized = report.studentName?.trim();
      if (normalized) {
        return normalized;
      }

      const cached = studentNameLookup[report.studentId];
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

    let cancelled = false;

    const fetchStudentNames = async () => {
      try {
        const results = await Promise.all(
          missingIds.map(async (id) => {
            try {
              const student = await studentService.getById(id);
              const fullName = buildFullName(student.firstName, student.lastName);
              return fullName ? { id, name: fullName } : null;
            } catch (error) {
              console.error(`Failed to fetch student ${id}`, error);
              return null;
            }
          }),
        );

        if (cancelled) {
          return;
        }

        setStudentNameLookup((prev) => {
          const next = { ...prev };
          results.forEach((result) => {
            if (result) {
              next[result.id] = result.name;
            }
          });
          return next;
        });
      } catch (error) {
        console.error("Failed to load student names", error);
      }
    };

    fetchStudentNames();

    return () => {
      cancelled = true;
    };
  }, [reports, studentNameLookup]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  };

  const handleOpenDetails = async (report: ParentLeaveReportSummary) => {
    setSelectedReport({
      ...report,
      studentName: resolveStudentName(report),
      parentId: "",
      notes: null,
      reviewedAt: report.updatedAt ?? null,
      reviewedBy: null,
    });

    setDetailLoading(true);
    setDetailError(null);

    try {
      const detail = await parentLeaveReportService.getReportById(report.id);
      setSelectedReport(detail);
    } catch (err) {
      console.error("Failed to load leave report detail", err);
      setDetailError("Unable to load request details. Please try again.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  const selectedStudentDisplayName = useMemo(
    () => (selectedReport ? resolveStudentName(selectedReport) : ""),
    [selectedReport, resolveStudentName],
  );

  const handleApprove = async (reportId: string) => {
    setActionLoading(true);
    try {
      const updated = await parentLeaveReportService.approveReport(reportId, { notes: APPROVAL_NOTE });
      setSelectedReport(updated);
      await fetchReports();
    } catch (err) {
      console.error("approveReport", err);
      alert("Failed to approve request, please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId: string) => {
    setActionLoading(true);
    try {
      const updated = await parentLeaveReportService.rejectReport(reportId, { reason: REJECTION_REASON });
      setSelectedReport(updated);
      await fetchReports();
    } catch (err) {
      console.error("rejectReport", err);
      alert("Failed to reject request, please try again.");
    } finally {
      setActionLoading(false);
    }
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
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
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
              <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ParentLeaveStatus | "");
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-[#FAD23C]"
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-600">Date range</label>
              <div className="flex flex-wrap gap-2">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      setCurrentPage(1);
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                      dateRange === option.value
                        ? "bg-[#463B3B] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#FAD23C]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
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
                <thead className="bg-[#FEFCE8] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                  <tr>
                    <th className={`${TABLE_COLUMN_CLASSES.student} px-6 py-4`}>Student</th>
                    <th className={`${TABLE_COLUMN_CLASSES.reason} px-6 py-4`}>Parent reason</th>
                    <th className={`${TABLE_COLUMN_CLASSES.dateRange} px-6 py-4`}>Date range</th>
                    <th className={`${TABLE_COLUMN_CLASSES.requested} px-6 py-4`}>Requested at</th>
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
                              <p className="text-xs text-gray-500">
                                Requested {formatDate(report.createdAt)}
                              </p>
                              {parentContactChips.length > 0 ? (
                                <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-500">
                                  {parentContactChips.map((chip) => (
                                    <span
                                      key={`${report.id}-${chip.type}`}
                                      className="inline-flex items-center gap-1 text-[11px]"
                                    >
                                      {chip.icon}
                                      {chip.href ? (
                                        <a
                                          href={chip.href}
                                          className="underline-offset-2 hover:text-[#463B3B] hover:underline"
                                        >
                                          {chip.label}
                                        </a>
                                      ) : (
                                        chip.label
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-gray-400">No parent information available</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`${TABLE_COLUMN_CLASSES.reason} px-6 py-4 align-top`}>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {report.reason || "No specific reason provided."}
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
                        <td className={`${TABLE_COLUMN_CLASSES.requested} px-6 py-4 align-top`}>
                          <p className="font-medium">{formatDateTime(report.createdAt)}</p>
                          {report.updatedAt && (
                            <p className="text-xs text-gray-500">Updated {formatDateTime(report.updatedAt)}</p>
                          )}
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
      )}

      {totalItems > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
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
}: {
  report: ParentLeaveReportDetail;
  studentDisplayName: string;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  loading: boolean;
  detailLoading: boolean;
  detailError: string | null;
}) {
  const totalDays = calculateTotalDays(report.startDate, report.endDate);
  const parentContactSummary = buildParentContactSummary(report);
  const hasEmail = Boolean(report.parentEmail?.trim());
  const hasPhone = Boolean(report.parentPhoneNumber?.trim());

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
                  {report.parentId && <p className="text-xs text-gray-400">ID: {report.parentId}</p>}
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
                    onClick={() => onReject(report.id)}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading && <FaTimes className="animate-spin" />}
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove(report.id)}
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
    </div>
  );
}

function buildFullName(first?: string, last?: string, fallback = "") {
  const normalizedFirst = first?.trim() ?? "";
  const normalizedLast = last?.trim() ?? "";

  if (normalizedFirst && normalizedLast) {
    return `${normalizedFirst} ${normalizedLast}`;
  }

  return normalizedFirst || normalizedLast || fallback;
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

function formatDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function getDateRangeBoundaries(range: DateRangeOption) {
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
}

