"use client";
import { useState, useEffect, useCallback } from "react";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaFileAlt, FaUser, FaClock, FaExclamationTriangle } from "react-icons/fa";
import GeneralRequestDetailModal from "./GeneralRequestDetailModal";
import { mockGeneralRequests, simulateApiDelay } from "./demo-data";

// General Driver Request Type
export interface GeneralDriverRequest {
  id: string;
  driverId: string;
  driverInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    licenseNumber: string;
    vehicleId?: string;
    vehicleInfo?: {
      plateNumber: string;
      model: string;
    };
  };
  requestType: "Route Change" | "Vehicle Issue" | "Schedule Adjustment" | "Training Request" | "Other";
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Resolved" | "Rejected";
  submittedAt: string;
  resolvedAt?: string;
  resolvedByAdminId?: string;
  adminNotes?: string;
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

export default function GeneralRequestsTab() {
  const [requests, setRequests] = useState<GeneralDriverRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchDriverName, setSearchDriverName] = useState("");
  const [searchDriverEmail, setSearchDriverEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<GeneralDriverRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await simulateApiDelay(500);
      
      // Simulate API call with filters
      let filteredData = [...mockGeneralRequests];
      
      // Apply filters
      if (statusFilter) {
        filteredData = filteredData.filter(request => request.status === statusFilter);
      }
      
      if (requestTypeFilter) {
        filteredData = filteredData.filter(request => request.requestType === requestTypeFilter);
      }
      
      if (priorityFilter) {
        filteredData = filteredData.filter(request => request.priority === priorityFilter);
      }
      
      if (searchDriverName.trim()) {
        filteredData = filteredData.filter(request => {
          const fullName = `${request.driverInfo.firstName} ${request.driverInfo.lastName}`.toLowerCase();
          return fullName.includes(searchDriverName.toLowerCase());
        });
      }
      
      if (searchDriverEmail.trim()) {
        filteredData = filteredData.filter(request => 
          request.driverInfo.email.toLowerCase().includes(searchDriverEmail.toLowerCase())
        );
      }
      
      // Apply pagination
      const skip = (currentPage - 1) * itemsPerPage;
      const paginatedData = filteredData.slice(skip, skip + itemsPerPage);
      
      setRequests(paginatedData);
      setTotalItems(filteredData.length);
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string }).message || 
                          "Failed to load general requests. Please try again.";
      setError(errorMessage);
      console.error("Error loading general requests:", err);
      setRequests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, requestTypeFilter, priorityFilter, searchDriverName, searchDriverEmail, itemsPerPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Debounce search inputs
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchDriverName, searchDriverEmail, fetchRequests]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRequestTypeBadge = (requestType: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (requestType) {
      case "Route Change":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Vehicle Issue":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Schedule Adjustment":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Training Request":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Other":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (priority) {
      case "Urgent":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "High":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Medium":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Low":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search by Driver Name */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tài xế..."
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
              placeholder="Tìm kiếm theo email..."
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
              Xóa
            </button>
          )}
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] transition-colors duration-200 font-medium"
          >
            <FaFilter />
            Bộ lọc
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending">Chờ xử lý</option>
                  <option value="In Progress">Đang xử lý</option>
                  <option value="Resolved">Đã giải quyết</option>
                  <option value="Rejected">Đã từ chối</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại yêu cầu
                </label>
                <select
                  value={requestTypeFilter}
                  onChange={(e) => setRequestTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">Tất cả loại</option>
                  <option value="Route Change">Thay đổi tuyến</option>
                  <option value="Vehicle Issue">Vấn đề phương tiện</option>
                  <option value="Schedule Adjustment">Điều chỉnh lịch</option>
                  <option value="Training Request">Yêu cầu đào tạo</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="">Tất cả mức độ</option>
                  <option value="Urgent">Khẩn cấp</option>
                  <option value="High">Cao</option>
                  <option value="Medium">Trung bình</option>
                  <option value="Low">Thấp</option>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có yêu cầu nào</h3>
            <p className="text-gray-500">Không tìm thấy yêu cầu nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FEFCE8] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Tài xế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Loại yêu cầu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Tiêu đề</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Mức độ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Ngày gửi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#463B3B]">Thao tác</th>
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
                            {request.driverInfo.firstName} {request.driverInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{request.driverInfo.email}</div>
                          <div className="text-xs text-gray-400">
                            {request.driverInfo.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={getRequestTypeBadge(request.requestType)}>
                        {request.requestType === "Route Change" && "Thay đổi tuyến"}
                        {request.requestType === "Vehicle Issue" && "Vấn đề phương tiện"}
                        {request.requestType === "Schedule Adjustment" && "Điều chỉnh lịch"}
                        {request.requestType === "Training Request" && "Yêu cầu đào tạo"}
                        {request.requestType === "Other" && "Khác"}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {request.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={getPriorityBadge(request.priority)}>
                        {request.priority === "Urgent" && "Khẩn cấp"}
                        {request.priority === "High" && "Cao"}
                        {request.priority === "Medium" && "Trung bình"}
                        {request.priority === "Low" && "Thấp"}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(request.status)}>
                        {request.status === "Pending" && "Chờ xử lý"}
                        {request.status === "In Progress" && "Đang xử lý"}
                        {request.status === "Resolved" && "Đã giải quyết"}
                        {request.status === "Rejected" && "Đã từ chối"}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaClock className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          {formatDateTime(request.submittedAt)}
                        </div>
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
                          title="Xem chi tiết"
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
            Trước
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-700">
            Trang {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
          >
            Sau
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <GeneralRequestDetailModal
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
