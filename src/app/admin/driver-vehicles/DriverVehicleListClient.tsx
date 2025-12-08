"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Edit, Trash2, CheckCircle, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import driverVehicleService from "@/services/driverVehicleService";
import {
  driverLeaveRequestService,
  ReplacementInfoResponse,
  ReplacementMatchDto
} from "@/services/api/driverLeaveRequests";
import { AssignmentTableRow, DriverVehicleStatus } from "@/types/driverVehicle";
import { getAllSupervisors, SupervisorResponse } from "@/services/api/supervisors";
import { apiService } from "@/lib/api";
import { formatDate, formatDateForInput } from "@/utils/dateUtils";

const PER_PAGE = 5;

// Success Toast Component
function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-slideDown">
      <div className="bg-white rounded-lg shadow-2xl border border-green-200 p-4 flex items-center gap-3 min-w-[320px]">
        <div className="flex-shrink-0">
          <CheckCircle className="w-12 h-12 text-green-500 animate-scaleIn" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Local date helpers removed in favor of dateUtils

// Convert local date string (YYYY-MM-DD) to UTC start of day (00:00:00)
const localDateToUTCStart = (localDate: string): string => {
  const [year, month, day] = localDate.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return utcDate.toISOString();
};

// Convert local date string (YYYY-MM-DD) to UTC end of day (23:59:59)
const localDateToUTCEnd = (localDate: string): string => {
  const [year, month, day] = localDate.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return utcDate.toISOString();
};


function StatusBadge({ status }: { status: DriverVehicleStatus }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${status === "Assigned"
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800"
        }`}
    >
      {status}
    </span>
  );
}

type SupervisorAssignmentRow = {
  id: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  vehicleId: string;
  licensePlate: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
};

export default function DriverVehicleListClient() {
  const [tab, setTab] = useState<"driver" | "supervisor">("driver");
  const [allAssignments, setAllAssignments] = useState<AssignmentTableRow[]>([]);
  const [supervisorAssignments, setSupervisorAssignments] = useState<SupervisorAssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("startTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Supervisor loading
  const [supervisorLoading, setSupervisorLoading] = useState(false);

  // Modals
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentTableRow | null>(null);
  const [updateError, setUpdateError] = useState("");

  // Replacement Info Modal
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [replacementInfo, setReplacementInfo] = useState<ReplacementInfoResponse | null>(null);
  const [loadingReplacement, setLoadingReplacement] = useState(false);

  // Active replacement matches
  const [replacementMatches, setReplacementMatches] = useState<ReplacementMatchDto[]>([]);

  // Success Toast
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch data from API - extracted as reusable function
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await driverVehicleService.getAssignments({
        page: 1,
        perPage: 1000, // Get all for client-side filtering
        sortBy: 'startTimeUtc',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        const mapped: AssignmentTableRow[] = response.data.map((item) => ({
          id: item.id,
          driverId: item.driverId,
          driverName: item.driver?.fullName || "Unknown Driver",
          vehicleId: item.vehicleId,
          licensePlate: item.vehicle?.licensePlate || "Unknown Vehicle",
          startTime: item.startTimeUtc,
          endTime: item.endTimeUtc,
          status: item.status === 1 ? "Assigned" : "Unassigned",
          isPrimaryDriver: item.isPrimaryDriver,
          driverEmail: item.driver?.email,
        }));
        setAllAssignments(mapped);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const fetchSupervisorAssignments = useCallback(async () => {
    try {
      setSupervisorLoading(true);
      const supervisors: SupervisorResponse[] = await getAllSupervisors();
      const rows: SupervisorAssignmentRow[] = [];

      await Promise.all(
        supervisors.map(async (s) => {
          try {
            const res = await apiService.get<{
              data?: {
                data?: Array<{ data?: Partial<SupervisorAssignmentRow> } & Partial<SupervisorAssignmentRow>>;
                Data?: Array<{ data?: Partial<SupervisorAssignmentRow> } & Partial<SupervisorAssignmentRow>>;
              };
              Data?: {
                Data?: Array<{ data?: Partial<SupervisorAssignmentRow> } & Partial<SupervisorAssignmentRow>>;
              };
            }>(
              `/SupervisorVehicle/supervisor/${s.id}/assignments`,
              {
                isActive: true,
                page: 1,
                perPage: 100,
              }
            );

            const list: Array<{ data?: Partial<SupervisorAssignmentRow> } & Partial<SupervisorAssignmentRow> & { id?: string; supervisorId?: string; supervisorName?: string; supervisorEmail?: string; supervisorPhone?: string; vehicleId?: string; vehiclePlate?: string; startTimeUtc?: string; endTimeUtc?: string; isActive?: boolean }> =
              res?.data?.data ??
              res?.data?.Data ??
              res?.Data?.Data ??
              [];

            list.forEach((item) => {
              const dto = (item.data ?? item) as { id?: string; supervisorId?: string; supervisorName?: string; supervisorEmail?: string; supervisorPhone?: string; vehicleId?: string; vehiclePlate?: string; startTimeUtc?: string; endTimeUtc?: string; isActive?: boolean };

              rows.push({
                id: dto.id ?? '',
                supervisorId: dto.supervisorId ?? '',
                supervisorName: dto.supervisorName ?? '',
                supervisorEmail: dto.supervisorEmail,
                supervisorPhone: dto.supervisorPhone,
                vehicleId: dto.vehicleId ?? '',
                licensePlate: dto.vehiclePlate ?? '',
                startTime: dto.startTimeUtc ?? '',
                endTime: dto.endTimeUtc,
                isActive: dto.isActive ?? true,
              });
            });
          } catch (err) {
            console.error("Error fetching supervisor assignments for", s.id, err);
          }
        })
      );

      setSupervisorAssignments(rows);
    } catch (error) {
      console.error("Error fetching supervisor assignments:", error);
      setSupervisorAssignments([]);
    } finally {
      setSupervisorLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "supervisor") {
      fetchSupervisorAssignments();
    }
  }, [tab, fetchSupervisorAssignments]);

  // Fetch replacement matches when component mounts
  useEffect(() => {
    const fetchReplacementMatches = async () => {
      try {
        const matches = await driverLeaveRequestService.getActiveReplacementMatches();
        setReplacementMatches(matches);
      } catch (error) {
        console.error("Error fetching replacement matches:", error);
      }
    };

    fetchReplacementMatches();
  }, []);

  // Helper function to check if assignment has active replacement
  const hasActiveReplacement = useCallback((assignment: AssignmentTableRow): boolean => {
    const assignmentStart = new Date(assignment.startTime);
    const assignmentEnd = assignment.endTime ? new Date(assignment.endTime) : new Date('2099-12-31');

    return replacementMatches.some(match => {
      const leaveStart = new Date(match.startDate);
      const leaveEnd = new Date(match.endDate);

      // Check:
      // 1. Driver match
      // 2. Leave period overlaps with assignment period
      const driverMatch = match.driverId === assignment.driverId;
      const dateOverlap = leaveStart <= assignmentEnd && leaveEnd >= assignmentStart;

      return driverMatch && dateOverlap;
    });
  }, [replacementMatches]);

  // Client-side filtering - driver
  const filteredAssignments = useMemo(() => {
    let filtered = allAssignments;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.driverName.toLowerCase().includes(searchLower) ||
          a.licensePlate.toLowerCase().includes(searchLower) ||
          a.driverEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "driverName":
          comparison = a.driverName.localeCompare(b.driverName);
          break;
        case "licensePlate":
          comparison = a.licensePlate.localeCompare(b.licensePlate);
          break;
        case "startTime":
          comparison =
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [allAssignments, statusFilter, debouncedSearch, sortBy, sortOrder]);

  // Client-side filtering - supervisor
  const filteredSupervisorAssignments = useMemo(() => {
    let filtered = supervisorAssignments;

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.supervisorName.toLowerCase().includes(searchLower) ||
          a.licensePlate.toLowerCase().includes(searchLower) ||
          a.supervisorEmail?.toLowerCase().includes(searchLower)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "driverName":
          comparison = a.supervisorName.localeCompare(b.supervisorName);
          break;
        case "licensePlate":
          comparison = a.licensePlate.localeCompare(b.licensePlate);
          break;
        case "startTime":
          comparison =
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [supervisorAssignments, debouncedSearch, sortBy, sortOrder]);

  // Pagination
  const baseItems = tab === "driver"
    ? (filteredAssignments as Array<AssignmentTableRow | SupervisorAssignmentRow>)
    : (filteredSupervisorAssignments as Array<AssignmentTableRow | SupervisorAssignmentRow>);
  const totalItems = baseItems.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const paginatedAssignments = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return baseItems.slice(start, start + PER_PAGE);
  }, [baseItems, page]);

  useEffect(() => {
    setTotalPages(totalPagesCount);
  }, [totalPagesCount]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }, [sortBy, sortOrder]);

  // Fetch replacement info
  const fetchReplacementInfo = async (driverId: string) => {
    setLoadingReplacement(true);
    setShowReplacementModal(true);
    setReplacementInfo(null);

    try {
      const data = await driverLeaveRequestService.getReplacementInfo(driverId);
      setReplacementInfo(data);
    } catch (error) {
      console.error("Error fetching replacement info:", error);
      setReplacementInfo(null);
    } finally {
      setLoadingReplacement(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
        Driver/Supervisor Assignments
      </h1>
      <p className="text-[#6B7280] mb-8">
        Manage driver and supervisor vehicle assignments in one place.
      </p>

      {/* Tabs */}
      <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm mb-6">
        <button
          type="button"
          onClick={() => setTab("driver")}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${tab === "driver"
            ? "bg-[#463B3B] text-white"
            : "text-[#463B3B] hover:bg-gray-100"
            }`}
        >
          Driver Assignments
        </button>
        <button
          type="button"
          onClick={() => setTab("supervisor")}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${tab === "supervisor"
            ? "bg-[#463B3B] text-white"
            : "text-[#463B3B] hover:bg-gray-100"
            }`}
        >
          Supervisor Assignments
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white rounded-2xl shadow-lg p-4 border border-gray-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs w-4 h-4" />
            <input
              type="text"
              placeholder="Search by driver name, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>
          <div className="w-36">
            <Select
              value={statusFilter}
              options={
                tab === "driver"
                  ? [
                    { value: "all", label: "All Status" },
                    { value: "Assigned", label: "Assigned" },
                    { value: "Unassigned", label: "Unassigned" },
                  ]
                  : [
                    { value: "all", label: "All Status" },
                    { value: "Assigned", label: "Active" },
                  ]
              }
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              className="py-2 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#FEFCE8] border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B] cursor-pointer hover:bg-[#FFF085] transition-colors"
                  onClick={() => handleSort("driverName")}
                >
                  <div className="flex items-center gap-2">
                    {tab === "driver" ? "Driver" : "Supervisor"}
                    {sortBy === "driverName" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B] cursor-pointer hover:bg-[#FFF085] transition-colors"
                  onClick={() => handleSort("licensePlate")}
                >
                  <div className="flex items-center gap-2">
                    Vehicle
                    {sortBy === "licensePlate" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B] cursor-pointer hover:bg-[#FFF085] transition-colors"
                  onClick={() => handleSort("startTime")}
                >
                  <div className="flex items-center gap-2">
                    Start Date
                    {sortBy === "startTime" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">
                  End Date
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B] cursor-pointer hover:bg-[#FFF085] transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortBy === "status" && (
                      <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                {tab === "driver" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">
                    Primary
                  </th>
                )}
                {tab === "driver" && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && tab === "driver" ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading assignments...
                  </td>
                </tr>
              ) : supervisorLoading && tab === "supervisor" ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading supervisor assignments...
                  </td>
                </tr>
              ) : paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={tab === "driver" ? 7 : 5} className="px-6 py-8 text-center text-gray-500">
                    No assignments found
                    {searchTerm && ` matching "${searchTerm}"`}
                  </td>
                </tr>
              ) : (
                tab === "driver"
                  ? paginatedAssignments.map((assignment) => {
                    const driverAssignment = assignment as AssignmentTableRow;
                    return (
                      <tr key={driverAssignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {driverAssignment.driverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {driverAssignment.licensePlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(driverAssignment.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {driverAssignment.endTime
                            ? formatDate(driverAssignment.endTime)
                            : "Ongoing"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={driverAssignment.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center justify-center">
                            {driverAssignment.isPrimaryDriver ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {/* Info button - always occupy space to prevent layout shift */}
                            {hasActiveReplacement(driverAssignment) ? (
                              <button
                                onClick={() =>
                                  fetchReplacementInfo(driverAssignment.driverId)
                                }
                                className="p-2 text-[#fad23c] hover:bg-[#FFF085] rounded transition-colors duration-200"
                                title="Replacement Info"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="w-8 h-8" /> // Empty space to maintain layout
                            )}
                            <button
                              onClick={() => {
                                setSelectedAssignment(driverAssignment);
                                setShowUpdateModal(driverAssignment.id);
                                setUpdateError("");
                              }}
                              className="p-2 text-[#463B3B] hover:text-[#fad23c] transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAssignment(driverAssignment);
                                setShowDeleteModal(driverAssignment.id);
                              }}
                              className="p-2 text-[#463B3B] hover:text-red-600 transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  : paginatedAssignments.map((assignment) => {
                    const supervisorAssignment = assignment as SupervisorAssignmentRow;
                    return (
                      <tr key={supervisorAssignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {supervisorAssignment.supervisorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {supervisorAssignment.licensePlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(supervisorAssignment.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {supervisorAssignment.endTime
                            ? formatDate(supervisorAssignment.endTime)
                            : "Ongoing"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="text-xs text-gray-400">
                            Managed in Vehicle page
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {paginatedAssignments.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Results Info */}
      {!loading && totalItems > 0 && (
        <div className="mt-4 text-center text-sm text-[#6B7280]">
          Showing {((page - 1) * PER_PAGE) + 1} to{" "}
          {Math.min(page * PER_PAGE, totalItems)} of {totalItems} assignments
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Update Assignment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Driver: <strong>{selectedAssignment.driverName}</strong> - Vehicle: <strong>{selectedAssignment.licensePlate}</strong>
            </p>

            {/* Error Message */}
            {updateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{updateError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  id="update-start-date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  defaultValue={selectedAssignment.startTime ? formatDateForInput(new Date(selectedAssignment.startTime)) : ''}
                  min={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return formatDateForInput(tomorrow);
                  })()}
                  onChange={() => setUpdateError("")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  id="update-end-date"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  defaultValue={selectedAssignment.endTime ? formatDateForInput(new Date(selectedAssignment.endTime)) : ''}
                  min={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return formatDateForInput(tomorrow);
                  })()}
                  onChange={() => setUpdateError("")}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing assignment</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUpdateModal(null);
                  setSelectedAssignment(null);
                  setUpdateError("");
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setUpdateError("");
                    const startDateInput = (document.getElementById('update-start-date') as HTMLInputElement)?.value;
                    const endDateInput = (document.getElementById('update-end-date') as HTMLInputElement)?.value;

                    if (!startDateInput) {
                      setUpdateError("Please select a start date");
                      return;
                    }

                    await driverVehicleService.updateAssignment(selectedAssignment.id, {
                      startTimeUtc: localDateToUTCStart(startDateInput),
                      endTimeUtc: endDateInput ? localDateToUTCEnd(endDateInput) : undefined
                    });

                    setShowUpdateModal(null);
                    setSelectedAssignment(null);
                    setUpdateError("");
                    setSuccessMessage("Assignment updated successfully!");
                    // Refresh data without reloading page
                    await fetchAssignments();
                  } catch (error) {
                    console.error("Error updating assignment:", error);
                    setUpdateError(error instanceof Error ? error.message : "Unknown error");
                  }
                }}
                className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors duration-200 font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Delete Assignment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this assignment for <strong>{selectedAssignment.driverName}</strong> on vehicle <strong>{selectedAssignment.licensePlate}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setSelectedAssignment(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await driverVehicleService.deleteAssignment(selectedAssignment.id);
                    setShowDeleteModal(null);
                    setSelectedAssignment(null);
                    setSuccessMessage("Assignment deleted successfully!");
                    // Refresh data without reloading page
                    await fetchAssignments();
                  } catch (error) {
                    console.error("Error deleting assignment:", error);
                    setSuccessMessage(null);
                    alert("Failed to delete assignment: " + (error instanceof Error ? error.message : "Unknown error"));
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Info Modal */}
      {showReplacementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#463B3B]">Replacement Information</h3>
              <button
                onClick={() => {
                  setShowReplacementModal(false);
                  setReplacementInfo(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingReplacement ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#fad23c] border-t-transparent"></div>
                <p className="mt-4 text-[#6B7280]">Loading replacement information...</p>
              </div>
            ) : replacementInfo ? (
              <div className="space-y-4">
                <div className="bg-[#FFF085] border border-[#fad23c] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#463B3B] mt-0.5" />
                    <div>
                      <p className="font-medium text-[#463B3B]">This driver is currently on leave with a replacement</p>
                      <p className="text-sm text-[#463B3B] mt-1 opacity-80">Someone is temporarily replacing this driver</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Driver On Leave</label>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{replacementInfo.driverName}</p>
                    <p className="text-xs text-gray-600 mt-1">{replacementInfo.driverEmail}</p>
                    {replacementInfo.driverPhoneNumber && (
                      <p className="text-xs text-gray-600">{replacementInfo.driverPhoneNumber}</p>
                    )}
                  </div>

                  <div className="bg-[#FFF085] rounded-xl p-4 border border-[#fad23c]">
                    <label className="text-xs font-medium text-[#463B3B] uppercase tracking-wide">Replacement Driver</label>
                    {replacementInfo.suggestedReplacementDriverName ? (
                      <p className="mt-1 text-sm font-semibold text-[#463B3B]">{replacementInfo.suggestedReplacementDriverName}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">Not assigned</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Leave Type</label>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {replacementInfo.leaveType === 0 ? 'Annual Leave' :
                        replacementInfo.leaveType === 1 ? 'Sick Leave' :
                          replacementInfo.leaveType === 2 ? 'Emergency' : 'Other'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Replacement Period</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className="font-medium">From:</span> {formatDate(replacementInfo.startDate)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">To:</span> {formatDate(replacementInfo.endDate)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    </p>
                    {replacementInfo.approvedByAdminName && (
                      <p className="text-xs text-gray-600 mt-1">By: {replacementInfo.approvedByAdminName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reason for Leave</label>
                    <p className="mt-1 text-sm text-gray-900">{replacementInfo.reason || 'No reason provided'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No Active Replacement</p>
                <p className="text-sm text-gray-500 mt-2">This driver is not currently on leave or has no replacement assigned.</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowReplacementModal(false);
                  setReplacementInfo(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <SuccessToast
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

