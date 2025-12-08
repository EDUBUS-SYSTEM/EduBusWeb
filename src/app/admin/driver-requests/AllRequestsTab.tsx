"use client";
import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaFilter, FaEye, FaCalendarAlt, FaFileAlt, FaUser, FaClock, FaTimes } from "react-icons/fa";
import LeaveRequestDetailModal from "./LeaveRequestDetailModal";
import GeneralRequestDetailModal from "./GeneralRequestDetailModal";
// TODO: Implement real API service for combined requests
// This will combine both leave requests and general requests from the backend
import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";
import { GeneralDriverRequest } from "./GeneralRequestsTab";
import { formatDateTime } from "@/utils/dateUtils";

// Combined request type
type CombinedRequest =
  | { type: 'leave'; data: DriverLeaveRequest }
  | { type: 'general'; data: GeneralDriverRequest };

export default function AllRequestsTab() {
  const [requests, setRequests] = useState<CombinedRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchDriverName, setSearchDriverName] = useState("");
  const [searchDriverEmail, setSearchDriverEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with real API calls
      // Example: 
      // const [leaveRequestsResponse, generalRequestsResponse] = await Promise.all([
      //   driverLeaveRequestService.getLeaveRequests({...leaveFilters}),
      //   generalDriverRequestService.getRequests({...generalFilters})
      // ]);

      // For now, show empty state until APIs are implemented
      setRequests([]);
      setTotalItems(0);

      // Remove this comment when APIs are ready:
      // const leaveRequests: CombinedRequest[] = leaveRequestsResponse.data.map(leave => ({
      //   type: 'leave' as const,
      //   data: leave
      // }));
      // 
      // const generalRequests: CombinedRequest[] = generalRequestsResponse.data.map(request => ({
      //   type: 'general' as const,
      //   data: request
      // }));
      // 
      // let combinedData = [...leaveRequests, ...generalRequests];
      // 
      // // Apply filters and pagination as needed
      // setRequests(combinedData);
      // setTotalItems(combinedData.length);

    } catch (err: unknown) {
      const errorMessage = (err as { message?: string }).message ||
        "Failed to load requests. Please try again.";
      setError(errorMessage);
      console.error("Error loading requests:", err);
      setRequests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, searchDriverName, searchDriverEmail, itemsPerPage]);

  // Debounce search inputs and fetch requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, (searchDriverName || searchDriverEmail) ? 300 : 0); // No delay if search is empty

    return () => clearTimeout(timeoutId);
  }, [searchDriverName, searchDriverEmail, fetchRequests]);

  const getStatusBadge = (status: string | number) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

    // Handle number status (DriverLeaveRequest)
    if (typeof status === 'number') {
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
    }

    // Handle string status (GeneralDriverRequest)
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Approved":
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'leave' ? <FaCalendarAlt className="h-4 w-4" /> : <FaFileAlt className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    return type === 'leave'
      ? `${baseClasses} bg-blue-100 text-blue-800`
      : `${baseClasses} bg-purple-100 text-purple-800`;
  };

  // Using centralized formatDateTime from @/utils/dateUtils

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Search and Filter Section */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search by Driver Name */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name..."
              value={searchDriverName}
              onChange={(e) => setSearchDriverName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Search by Driver Email */}
          <div className="flex-1 relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchDriverEmail}
              onChange={(e) => setSearchDriverEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-200"
              autoComplete="off"
            />
          </div>

          {/* Clear Search */}
          {(searchDriverName || searchDriverEmail) && (
            <button
              onClick={() => {
                setSearchDriverName("");
                setSearchDriverEmail("");
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
                  <option value="In Progress">In Progress</option>
                  <option value="Approved">Approved</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="leave">Leave Requests</option>
                  <option value="general">General Requests</option>
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-500">No requests found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEFCE8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Driver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Content</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Submit Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((item) => (
                  <tr key={`${item.type}-${item.data.id}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.type)}
                        <span className={getTypeBadge(item.type)}>
                          {item.type === 'leave' ? 'Leave Request' : 'General Request'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#fad23c] flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-[#463B3B]" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.type === 'leave' ? item.data.driverName : `${item.data.driverInfo.firstName} ${item.data.driverInfo.lastName}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.type === 'leave' ? item.data.driverEmail : item.data.driverInfo.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.type === 'leave' ? item.data.driverPhoneNumber : item.data.driverInfo.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {item.type === 'leave' ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {item.data.leaveType === 2 && "Sick Leave"}
                              {item.data.leaveType === 3 && "Personal Leave"}
                              {item.data.leaveType === 4 && "Emergency Leave"}
                              {item.data.leaveType === 1 && "Annual Leave"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.data.reason}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.data.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.data.description}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={getStatusBadge(item.data.status)}>
                        {item.type === 'leave' ? (
                          <>
                            {item.data.status === 1 && "Pending"}
                            {item.data.status === 2 && "Approved"}
                            {item.data.status === 3 && "Rejected"}
                            {item.data.status === 4 && "Cancelled"}
                            {item.data.status === 5 && "Completed"}
                          </>
                        ) : (
                          <>
                            {item.data.status === "Pending" && "Pending"}
                            {item.data.status === "Resolved" && "Resolved"}
                            {item.data.status === "Rejected" && "Rejected"}
                            {item.data.status === "In Progress" && "In Progress"}
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaClock className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {formatDateTime(item.type === 'leave' ? item.data.requestedAt : item.data.submittedAt)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(item);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#fad23c] transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
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
            Page {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <>
          {selectedRequest.type === 'leave' ? (
            <LeaveRequestDetailModal
              leave={selectedRequest.data}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedRequest(null);
              }}
            />
          ) : (
            <GeneralRequestDetailModal
              request={selectedRequest.data}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedRequest(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
