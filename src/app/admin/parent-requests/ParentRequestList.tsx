"use client";
import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaMapMarkerAlt, FaUser, FaChild } from "react-icons/fa";
import RequestDetailModal from "./RequestDetailModal";
import { pickupPointService, PickupPointRequestDetailDto } from "@/services/pickupPointService";

// Use the API types directly
type PickupPointRequest = PickupPointRequestDetailDto;


export default function ParentRequestList() {
  const [requests, setRequests] = useState<PickupPointRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchEmail, setSearchEmail] = useState("");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<PickupPointRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calculate pagination
      const skip = (currentPage - 1) * itemsPerPage;
      
      // Build query parameters
      const query: Record<string, unknown> = {
        skip,
        take: itemsPerPage
      };
      
      // Add filters
      if (statusFilter) {
        query.status = statusFilter;
      }
      
      if (searchEmail.trim()) {
        query.parentEmail = searchEmail.trim();
      }
      
      // Fetch data from API
      const data = await pickupPointService.listRequests(query);
      
      // Apply client-side name filtering if needed (since API doesn't support name search)
      let filteredData = data;
      if (searchName.trim()) {
        filteredData = data.filter(req => {
          if (!req.parentInfo) return false;
          const fullName = `${req.parentInfo.firstName} ${req.parentInfo.lastName}`.toLowerCase();
          return fullName.includes(searchName.toLowerCase());
        });
      }
      
      setRequests(filteredData);
      // Note: API doesn't return total count, so we'll estimate based on current page
      setTotalItems(filteredData.length === itemsPerPage ? (currentPage * itemsPerPage) + 1 : currentPage * itemsPerPage);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail || 
                          (err as { message?: string }).message || 
                          "Failed to load requests. Please try again.";
      setError(errorMessage);
      console.error("Error loading requests:", err);
      setRequests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchEmail, searchName, itemsPerPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Debounce search inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchEmail, searchName, fetchRequests]);

  const handleApprove = async (requestId: string, notes?: string) => {
    setActionLoading(true);
    
    try {
      await pickupPointService.approveRequest(requestId, { notes });
      
      // Refresh the requests list
      await fetchRequests();
      
      setShowApproveModal(false);
      setSelectedRequest(null);
      
      alert("Request approved successfully!");
    } catch (err: unknown) {
      console.error("Error approving request:", err);
      const errorMessage = (err as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail || 
                          (err as { message?: string }).message || 
                          "Failed to approve request. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    setActionLoading(true);
    
    try {
      await pickupPointService.rejectRequest(requestId, { reason });
      
      // Refresh the requests list
      await fetchRequests();
      
      setShowRejectModal(false);
      setSelectedRequest(null);
      
      alert("Request rejected successfully!");
    } catch (err: unknown) {
      console.error("Error rejecting request:", err);
      const errorMessage = (err as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail || 
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
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search by Email */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              key="search-email"
              type="text"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>
          
          {/* Search by Name */}
          <div className="flex-1 relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              key="search-name"
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>
          
          {/* Clear Search */}
          {(searchEmail || searchName) && (
            <button
              onClick={() => {
                setSearchEmail("");
                setSearchName("");
              }}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <FaTimes />
              Clear
            </button>
          )}
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] transition-colors duration-200 font-medium"
          >
            <FaFilter />
            Filters
          </button>
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
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
            <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">No parent requests match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEFCE8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Parent Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Pickup Location</th>
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
                          <div className="text-sm font-medium text-gray-900">
                            {request.parentInfo ? 
                              `${request.parentInfo.firstName} ${request.parentInfo.lastName}` : 
                              'N/A'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{request.parentEmail}</div>
                          {request.parentInfo && (
                            <div className="text-xs text-gray-400">{request.parentInfo.phoneNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaChild className="h-4 w-4 text-gray-400" />
                        <div>
                          {request.students.length > 0 ? (
                            <div className="text-sm text-gray-900">
                              {request.students.map(student => 
                                `${student.firstName} ${student.lastName}`
                              ).join(', ')}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No students</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {request.addressText}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.distanceKm.toFixed(2)} km • {formatCurrency(request.estimatedPriceVnd)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
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
                        
                        {request.status === "Pending" && (
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
        <div className="flex justify-center items-center space-x-2">
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
  request: PickupPointRequest; 
  onApprove: (id: string, notes?: string) => void; 
  onClose: () => void; 
  loading: boolean;
}) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Request</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Approve pickup point request for <strong>{request.parentInfo?.firstName} {request.parentInfo?.lastName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Location: {request.addressText}
          </p>
          <p className="text-sm text-gray-500">
            Price: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.estimatedPriceVnd)}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            onClick={() => onApprove(request.id, notes)}
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
  request: PickupPointRequest; 
  onReject: (id: string, reason: string) => void; 
  onClose: () => void; 
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Reject pickup point request for <strong>{request.parentInfo?.firstName} {request.parentInfo?.lastName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Location: {request.addressText}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent resize-none"
            rows={3}
            required
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
            onClick={() => onReject(request.id, reason)}
            disabled={loading || !reason.trim()}
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
