"use client";
import { useState, useEffect, useCallback, startTransition, useMemo } from "react";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaUser, FaClock, FaFileAlt } from "react-icons/fa";
import LeaveRequestDetailModal from "./LeaveRequestDetailModal";
import ApproveStep1Modal from "@/components/admin/modals/ApproveStep1Modal";
import ApproveStep2Modal from "@/components/admin/modals/ApproveStep2Modal";
import { RejectLeaveModal } from "@/components/admin";
import Pagination from "@/components/ui/Pagination";
import {
  driverLeaveRequestService,
  DriverLeaveRequest,
  DriverLeaveRequestFilters
} from "@/services/api/driverLeaveRequests";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLeaveRequests, setCurrentPage, updateLeaveInList } from "@/store/slices/driverRequestsSlice";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

export default function LeaveRequestsTab() {
  const dispatch = useAppDispatch();
  const { leaves, loading, error, pagination } = useAppSelector(state => state.driverRequests);


  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedLeave, setSelectedLeave] = useState<DriverLeaveRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveStep1Modal, setShowApproveStep1Modal] = useState(false);
  const [showApproveStep2Modal, setShowApproveStep2Modal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Step 2 modal state
  const [approveNotes, setApproveNotes] = useState("");
  const itemsPerPage = 5;
  // Single fetch function that handles all cases
  const fetchLeaves = useCallback(async () => {
    dispatch(fetchLeaveRequests({
      status: statusFilter || undefined,
      leaveType: leaveTypeFilter || undefined,
      searchTerm: searchTerm || undefined,
      sortBy: sortBy || "desc",
      page: pagination.currentPage,
      perPage: itemsPerPage
    }));
  }, [dispatch, statusFilter, leaveTypeFilter, searchTerm, sortBy, pagination.currentPage]);

  // Combined effect for all changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLeaves();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, leaveTypeFilter, sortBy, pagination.currentPage, searchTerm, fetchLeaves]);

  // Handle page change with Redux
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  // Batch state updates to avoid multiple re-renders
  const handleApproveStep1 = (notes: string, needsReplacement: boolean) => {
    startTransition(() => {
      setApproveNotes(notes);
      if (needsReplacement) {
        setShowApproveStep1Modal(false);
        setShowApproveStep2Modal(true);
      } else {
        // Direct approval without replacement driver
        handleApproveDirect(notes);
      }
    });
  };

  // Add direct approval function
  const handleApproveDirect = async (notes: string) => {
    if (!selectedLeave) return;

    setActionLoading(true);

    try {
      const updatedLeave = await driverLeaveRequestService.approveLeaveRequest(selectedLeave.id, {
        notes: notes
      });

      // Update local state instead of refetching
      dispatch(updateLeaveInList(updatedLeave));

      setShowApproveStep1Modal(false);

      // Only clear selectedLeave if not in detail modal
      if (!showDetailModal) {
        setSelectedLeave(null);
      }

      alert("Leave request approved successfully!");
    } catch (err: unknown) {
      console.error("Error approving leave request:", err);
      const errorMessage = (err as { message?: string }).message ||
        "Failed to approve leave request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveStep2 = async (replacementDriverId?: string) => {
    if (!selectedLeave) return;

    setActionLoading(true);

    try {
      const updatedLeave = await driverLeaveRequestService.approveLeaveRequest(selectedLeave.id, {
        notes: approveNotes,
        replacementDriverId: replacementDriverId // Can be undefined if no replacement needed
      });

      // Update local state instead of refetching
      dispatch(updateLeaveInList(updatedLeave));

      setShowApproveStep2Modal(false);

      // Only clear selectedLeave if not in detail modal
      if (!showDetailModal) {
        setSelectedLeave(null);
      }

      alert("Leave request approved and replacement driver assigned successfully!");
    } catch (err: unknown) {
      console.error("Error approving leave request:", err);
      const errorMessage = (err as { message?: string }).message ||
        "Failed to approve leave request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (leaveId: string, reason: string) => {
    setActionLoading(true);

    try {
      console.log("Rejecting leave request:", { leaveId, reason });
      const updatedLeave = await driverLeaveRequestService.rejectLeaveRequest(leaveId, { reason: reason });
      console.log("Updated leave after reject:", updatedLeave);

      // Update local state instead of refetching
      dispatch(updateLeaveInList(updatedLeave));

      setShowRejectModal(false);

      // Only clear selectedLeave if not in detail modal
      if (!showDetailModal) {
        setSelectedLeave(null);
      }

      alert("Leave request rejected!");
    } catch (err: unknown) {
      console.error("Error rejecting leave request:", err);
      const errorMessage = (err as { message?: string }).message ||
        "Failed to reject leave request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const baseClasses = "px-1.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 1: // Pending
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 2: // Approved
        return `${baseClasses} bg-green-100 text-green-800`;
      case 3: // Rejected
        return `${baseClasses} bg-red-100 text-red-800`;
      case 4: // Cancelled
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 5: // Completed
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getLeaveTypeBadge = (leaveType: number) => {
    const baseClasses = "px-1.5 py-0.5 rounded-full text-xs font-medium";
    switch (leaveType) {
      case 1: // Annual
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 2: // Sick
        return `${baseClasses} bg-red-100 text-red-800`;
      case 3: // Personal
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 4: // Emergency
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 5: // Training
        return `${baseClasses} bg-green-100 text-green-800`;
      case 6: // Other
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return "Pending";
      case 2: return "Approved";
      case 3: return "Rejected";
      case 4: return "Cancelled";
      case 5: return "Completed";
      default: return "Unknown";
    }
  };

  const getLeaveTypeText = (leaveType: number) => {
    switch (leaveType) {
      case 1: return "Annual Leave";
      case 2: return "Sick Leave";
      case 3: return "Personal Leave";
      case 4: return "Emergency Leave";
      case 5: return "Training Leave";
      case 6: return "Other";
      default: return "Unknown";
    }
  };

  // Using centralized formatDateTime from @/utils/dateUtils

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set time to start of day to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  // Kiểm tra xem ngày nghỉ đã hết hạn chưa
  const isLeaveExpired = (startDate: string, endDate: string) => {
    const today = new Date();
    const leaveEndDate = new Date(endDate);

    // Set time to start of day to avoid timezone issues
    today.setHours(0, 0, 0, 0);
    leaveEndDate.setHours(0, 0, 0, 0);

    // Leave đã hết hạn nếu endDate < today
    return leaveEndDate < today;
  };

  // Reset pagination when filters change
  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [statusFilter, leaveTypeFilter, searchTerm, sortBy, dispatch]);

  // Memoize ApproveStep2Modal to avoid unnecessary re-render 
  const memoizedApproveStep2Modal = useMemo(() => {
    if (!showApproveStep2Modal || !selectedLeave) return null;

    return (
      <ApproveStep2Modal
        leave={selectedLeave}
        notes={approveNotes}
        onApprove={handleApproveStep2}
        onBack={() => {
          setShowApproveStep2Modal(false);
          setShowApproveStep1Modal(true);
        }}
        onClose={() => {
          setShowApproveStep2Modal(false);
          setSelectedLeave(null);
        }}
        loading={actionLoading}
      />
    );
  }, [showApproveStep2Modal, selectedLeave?.id, approveNotes, actionLoading]);

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchLeaves()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Search and Filter Section */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="w-[70%] relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Clear Search */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <FaTimes />
              Clear
            </button>
          )}

          {/* Filter Toggle - Right aligned */}
          <div className="ml-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] transition-colors duration-200 font-medium"
            >
              <FaFilter />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="1">Pending Approval</option>
                  <option value="2">Approved</option>
                  <option value="3">Rejected</option>
                  <option value="4">Cancelled</option>
                  <option value="5">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={leaveTypeFilter}
                  onChange={(e) => setLeaveTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">All Leave Types</option>
                  <option value="1">Annual Leave</option>
                  <option value="2">Sick Leave</option>
                  <option value="3">Personal Leave</option>
                  <option value="4">Emergency Leave</option>
                  <option value="5">Training Leave</option>
                  <option value="6">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
            <p className="text-gray-500">No leave requests found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEFCE8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Driver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Leave Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Days</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Request Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#fad23c] flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-[#463B3B]" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.driverName}
                          </div>
                          <div className="text-sm text-gray-500">{leave.driverEmail}</div>
                          <div className="text-xs text-gray-400">
                            {leave.driverPhoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getLeaveTypeBadge(leave.leaveType)}>
                        {getLeaveTypeText(leave.leaveType)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="text-sm text-gray-900">
                          <span className="font-normal">to </span>
                          <span className="font-medium">{formatDate(leave.endDate)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {calculateLeaveDays(leave.startDate, leave.endDate)} days
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={getStatusBadge(leave.status)}>
                        {getStatusText(leave.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaClock className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {formatDateTime(leave.requestedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#fad23c] transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>

                        {leave.status === 1 && !isLeaveExpired(leave.startDate, leave.endDate) && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setShowApproveStep1Modal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                              title="Approve"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setShowRejectModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Reject"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {/* Hiển thị icon disabled cho trường hợp đã hết hạn */}
                        {leave.status === 1 && isLeaveExpired(leave.startDate, leave.endDate) && (
                          <div className="p-2 text-gray-300 cursor-not-allowed" title="Đã quá hạn duyệt">
                            <FaClock className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-6 border-t border-gray-200 bg-white">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedLeave && (
        <LeaveRequestDetailModal
          leave={selectedLeave}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedLeave(null);
          }}
          onApprove={async (leaveId: string, replacementDriverId?: string, notes?: string) => {
            setActionLoading(true);

            try {
              const updatedLeave = await driverLeaveRequestService.approveLeaveRequest(leaveId, {
                notes: notes || "",
                replacementDriverId: replacementDriverId
              });

              // Update local state
              dispatch(updateLeaveInList(updatedLeave));

              // Close modals
              setShowApproveStep1Modal(false);
              setShowApproveStep2Modal(false);

              // Only clear selectedLeave if not in detail modal
              if (!showDetailModal) {
                setSelectedLeave(null);
              }

              alert("Leave request approved successfully!");
            } catch (err: unknown) {
              console.error("Error approving leave request:", err);
              const errorMessage = (err as { message?: string }).message ||
                "Failed to approve leave request. Please try again.";
              alert(errorMessage);
            } finally {
              setActionLoading(false);
            }
          }}
          onReject={handleReject}
        />
      )}

      {showApproveStep1Modal && selectedLeave && (
        <ApproveStep1Modal
          leave={selectedLeave}
          onNext={handleApproveStep1}
          onClose={() => {
            setShowApproveStep1Modal(false);
            setSelectedLeave(null);
          }}
        />
      )}

      {/* Sử dụng memoized modal */}
      {memoizedApproveStep2Modal}

      {showRejectModal && selectedLeave && (
        <RejectLeaveModal
          leave={selectedLeave}
          onReject={handleReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedLeave(null);
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}