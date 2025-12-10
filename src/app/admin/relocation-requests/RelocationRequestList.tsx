"use client";
import { useState, useEffect, useCallback } from "react";
import { FaFilter, FaEye, FaCheck, FaTimes, FaMapMarkedAlt, FaUser, FaChild, FaExchangeAlt } from "react-icons/fa";
import RequestDetailModal from "./RequestDetailModal";
import { relocationRequestService, RelocationRequestDto } from "@/services/relocationRequestService";
import { pickupPointService, AvailableSemesterDto } from "@/services/pickupPointService";

export default function RelocationRequestList() {
  const [requests, setRequests] = useState<RelocationRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Semester options
  const [availableSemesters, setAvailableSemesters] = useState<AvailableSemesterDto[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<RelocationRequestDto | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query: Record<string, unknown> = {
        page: currentPage,
        perPage: itemsPerPage
      };

      // Add filters
      if (statusFilter) {
        query.status = statusFilter;
      }
      if (semesterFilter) {
        query.semesterCode = semesterFilter;
      }
      if (fromDateFilter) {
        query.fromDate = fromDateFilter;
      }
      if (toDateFilter) {
        query.toDate = toDateFilter;
      }

      // Fetch data from API
      const response = await relocationRequestService.listRequests(query);

      setRequests(response.data);
      setTotalItems(response.totalCount);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ||
        (err as { message?: string }).message ||
        "Failed to load requests. Please try again.";
      setError(errorMessage);
      console.error("Error loading requests:", err);
      setRequests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, semesterFilter, fromDateFilter, toDateFilter, itemsPerPage]);

  // Fetch available semesters on mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await pickupPointService.getAvailableSemesters();
        setAvailableSemesters(response.semesters);
      } catch (err) {
        console.error('Failed to fetch semesters:', err);
        // Silently fail - semesters are optional
      }
    };
    fetchSemesters();
  }, []);

  // Fetch requests when filters change
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId: string, adminNotes?: string, effectiveDate?: string) => {
    setActionLoading(true);

    try {
      await relocationRequestService.approveRequest(requestId, { adminNotes, effectiveDate });

      // Refresh the requests list
      await fetchRequests();

      setShowApproveModal(false);
      setSelectedRequest(null);

      alert("Request approved successfully!");
    } catch (err: unknown) {
      console.error("Error approving request:", err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ||
        (err as { message?: string }).message ||
        "Failed to approve request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string, rejectionReason: string, adminNotes?: string) => {
    setActionLoading(true);

    try {
      await relocationRequestService.rejectRequest(requestId, { rejectionReason, adminNotes });

      // Refresh the requests list
      await fetchRequests();

      setShowRejectModal(false);
      setSelectedRequest(null);

      alert("Request rejected successfully!");
    } catch (err: unknown) {
      console.error("Error rejecting request:", err);
      const errorMessage = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ||
        (err as { message?: string }).message ||
        "Failed to reject request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg - yellow - 100 text - yellow - 800`;
      case "Approved":
        return `${baseClasses} bg - green - 100 text - green - 800`;
      case "Rejected":
        return `${baseClasses} bg - red - 100 text - red - 800`;
      default:
        return `${baseClasses} bg - gray - 100 text - gray - 800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (priority) {
      case "Urgent":
        return `${baseClasses} bg - red - 100 text - red - 800`;
      case "High":
        return `${baseClasses} bg - orange - 100 text - orange - 800`;
      case "Normal":
        return `${baseClasses} bg - blue - 100 text - blue - 800`;
      default:
        return `${baseClasses} bg - gray - 100 text - gray - 800`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Filter Section */}
      <div className="sticky top-16 z-40 bg-white rounded-3xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm bg-[#fad23c] text-[#463B3B] rounded-2xl hover:bg-[#FFF085] transition-colors duration-200 font-medium"
          >
            <FaFilter className="text-xs" />
            Filters {(statusFilter || semesterFilter || fromDateFilter || toDateFilter) && `(${[statusFilter, semesterFilter, fromDateFilter, toDateFilter].filter(Boolean).length})`}
          </button>

          {/* Clear All Filters */}
          {(statusFilter || semesterFilter || fromDateFilter || toDateFilter) && (
            <button
              onClick={() => {
                setStatusFilter("");
                setSemesterFilter("");
                setFromDateFilter("");
                setToDateFilter("");
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <FaTimes className="text-xs" />
              Clear All
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Semester
                </label>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">All Semesters</option>
                  {availableSemesters.map((semester) => (
                    <option key={semester.semesterCode} value={semester.semesterCode}>
                      {semester.displayLabel || `${semester.semesterName} (${semester.academicYear})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                />
              </div>

              {/* To Date Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">No relocation requests match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEFCE8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Parent & Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Location Change</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Financial Impact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#fad23c] flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-[#463B3B]" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.parentEmail}</div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaChild className="h-3 w-3" />
                            <span>{request.studentName}</span>
                          </div>
                          {request.urgentRequest && (
                            <span className={getPriorityBadge("Urgent")}>URGENT</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <FaMapMarkedAlt className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500 line-through">{request.oldDistanceKm.toFixed(2)} km</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <FaExchangeAlt className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">{request.newDistanceKm.toFixed(2)} km</span>
                        </div>
                        <div className="text-xs text-gray-400 max-w-xs truncate">
                          {request.newPickupPointAddress}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {request.refundAmount > 0 ? (
                          <div className="text-sm text-green-600 font-medium">
                            Refund: {formatCurrency(request.refundAmount)}
                          </div>
                        ) : request.additionalPaymentRequired > 0 ? (
                          <div className="text-sm text-orange-600 font-medium">
                            Additional: {formatCurrency(request.additionalPaymentRequired)}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No change</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {request.daysRemaining} days remaining
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={getStatusBadge(request.requestStatus)}>
                          {request.requestStatus}
                        </span>
                        {request.aiRecommendation && (
                          <div className="text-xs text-gray-500">
                            AI: {request.aiRecommendation.recommendation}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#fad23c] transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>

                        {request.requestStatus === "Pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                              title="Approve"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                              title="Reject"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </>
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
      {totalItems > itemsPerPage && (
        <div className="flex justify-center items-center space-x-2 py-6 bg-white rounded-xl border border-gray-200">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
          </span>

          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          onApprove={handleApprove}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onReject={handleReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
          loading={actionLoading}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}

// Approve Modal Component
function ApproveModal({
  request,
  onApprove,
  onClose,
  loading
}: {
  request: RelocationRequestDto;
  onApprove: (id: string, notes?: string, effectiveDate?: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    request.requestedEffectiveDate ? new Date(request.requestedEffectiveDate).toISOString().split('T')[0] : ""
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Relocation Request</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Approve relocation request for <strong>{request.studentName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            New location: {request.newPickupPointAddress}
          </p>
          {request.refundAmount > 0 && (
            <p className="text-sm text-green-600 font-medium">
              Refund: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.refundAmount)}
            </p>
          )}
          {request.additionalPaymentRequired > 0 && (
            <p className="text-sm text-orange-600 font-medium">
              Additional payment: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.additionalPaymentRequired)}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective Date
          </label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes (Optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes for the parent..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onApprove(request.id, adminNotes, effectiveDate)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Reject Modal Component
function RejectModal({
  request,
  onReject,
  onClose,
  loading
}: {
  request: RelocationRequestDto;
  onReject: (id: string, reason: string, notes?: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Relocation Request</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Reject relocation request for <strong>{request.studentName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            New location: {request.newPickupPointAddress}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent resize-none"
            rows={3}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes (Optional)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onReject(request.id, rejectionReason, adminNotes)}
            disabled={loading || !rejectionReason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
}
