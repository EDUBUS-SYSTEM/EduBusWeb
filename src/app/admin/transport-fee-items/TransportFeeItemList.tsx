"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaExclamationTriangle, FaReceipt, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import { transportFeeItemService, TransportFeeItemStatus, TransportFeeItemType } from '@/services/transportFeeItemService';
import type { TransportFeeItem, TransportFeeItemListRequest, TransportFeeItemDetailResponse } from '@/services/transportFeeItemService';

const statusConfig = {
  [TransportFeeItemStatus.Unbilled]: { 
    color: 'text-gray-600 bg-gray-50', 
    icon: FaClock,
    label: 'Unbilled'
  },
  [TransportFeeItemStatus.Invoiced]: { 
    color: 'text-blue-600 bg-blue-50', 
    icon: FaReceipt,
    label: 'Invoiced'
  },
  [TransportFeeItemStatus.Paid]: { 
    color: 'text-green-600 bg-green-50', 
    icon: FaCheckCircle,
    label: 'Paid'
  },
  [TransportFeeItemStatus.Cancelled]: { 
    color: 'text-red-600 bg-red-50', 
    icon: FaTimesCircle,
    label: 'Cancelled'
  }
};

const typeConfig = {
  [TransportFeeItemType.Register]: { 
    color: 'text-blue-600 bg-blue-50', 
    label: 'Register'
  },
  [TransportFeeItemType.Extend]: { 
    color: 'text-purple-600 bg-purple-50', 
    label: 'Extend'
  }
};

function TransportFeeItemList() {
  const [items, setItems] = useState<TransportFeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransportFeeItemStatus | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Action states
  const [selectedItem, setSelectedItem] = useState<TransportFeeItemDetailResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unbilled: 0,
    invoiced: 0,
    paid: 0,
    cancelled: 0
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: TransportFeeItemListRequest = {
        page: currentPage,
        pageSize: itemsPerPage,
        parentEmail: searchEmail || undefined,
        status: statusFilter
      };
      
      const response = await transportFeeItemService.getList(filters);
      setItems(response.items);
      setTotalItems(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transport fee items');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchEmail, statusFilter]);

  const loadStats = async () => {
    try {
      const [unbilled, invoiced, paid, cancelled] = await Promise.all([
        transportFeeItemService.getCountByStatus(TransportFeeItemStatus.Unbilled),
        transportFeeItemService.getCountByStatus(TransportFeeItemStatus.Invoiced),
        transportFeeItemService.getCountByStatus(TransportFeeItemStatus.Paid),
        transportFeeItemService.getCountByStatus(TransportFeeItemStatus.Cancelled)
      ]);
      
      setStats({
        total: unbilled + invoiced + paid + cancelled,
        unbilled,
        invoiced,
        paid,
        cancelled
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    loadStats();
  }, [fetchItems]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems();
  };

  const handleStatusChange = (status: TransportFeeItemStatus) => {
    setStatusFilter(statusFilter === status ? undefined : status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = async (id: string) => {
    try {
      const detail = await transportFeeItemService.getDetail(id);
      setSelectedItem(detail);
      setShowDetailModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item details');
    }
  };

  const handleUpdateStatus = async (id: string, status: TransportFeeItemStatus) => {
    try {
      setActionLoading(true);
      await transportFeeItemService.updateStatus({ id, status });
      await fetchItems();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transport fee item?')) {
      try {
        setActionLoading(true);
        await transportFeeItemService.delete(id);
        await fetchItems();
        await loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-[#fad23c] rounded-lg">
              <FaReceipt className="h-5 w-5 text-[#463B3B]" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#6B7280]">Total</p>
              <p className="text-xl font-bold text-[#463B3B]">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FaClock className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#6B7280]">Unbilled</p>
              <p className="text-xl font-bold text-[#463B3B]">{stats.unbilled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaReceipt className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#6B7280]">Invoiced</p>
              <p className="text-xl font-bold text-[#463B3B]">{stats.invoiced}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#6B7280]">Paid</p>
              <p className="text-xl font-bold text-[#463B3B]">{stats.paid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaTimesCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#6B7280]">Cancelled</p>
              <p className="text-xl font-bold text-[#463B3B]">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search by parent email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-[#fad23c] text-[#463B3B]"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusChange(TransportFeeItemStatus.Unbilled)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === TransportFeeItemStatus.Unbilled
                  ? 'bg-[#fad23c] text-[#463B3B]'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Unbilled
            </button>
            <button
              onClick={() => handleStatusChange(TransportFeeItemStatus.Invoiced)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === TransportFeeItemStatus.Invoiced
                  ? 'bg-[#fad23c] text-[#463B3B]'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Invoiced
            </button>
            <button
              onClick={() => handleStatusChange(TransportFeeItemStatus.Paid)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === TransportFeeItemStatus.Paid
                  ? 'bg-[#fad23c] text-[#463B3B]'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => handleStatusChange(TransportFeeItemStatus.Cancelled)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === TransportFeeItemStatus.Cancelled
                  ? 'bg-[#fad23c] text-[#463B3B]'
                  : 'bg-gray-50 text-[#6B7280] hover:bg-gray-100'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#FEFCE8]">
          <h3 className="text-lg font-semibold text-[#463B3B]">Transport Fee Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Parent Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                    No transport fee items found
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const StatusIcon = statusConfig[item.status].icon;
                  return (
                    <tr key={item.id} className="hover:bg-[#FEFCE8]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-[#fad23c] rounded-lg">
                            <FaUser className="h-3 w-3 text-[#463B3B]" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-[#463B3B]">
                              {item.studentName || `Student ${item.studentId.substring(0, 4)}`}
                            </div>
                            <div className="text-sm text-[#6B7280]">
                              {item.studentId.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-[#463B3B] truncate max-w-24">{item.parentEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#463B3B] max-w-32 truncate" title={item.description}>
                          {item.description}
                        </div>
                        <div className="text-sm text-[#6B7280]">
                          {item.distanceKm}km × {formatCurrency(item.unitPriceVndPerKm)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#463B3B]">
                          {formatCurrency(item.subtotal)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium ${statusConfig[item.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[item.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-[#463B3B]">{item.semesterName}</div>
                        <div className="text-sm text-[#6B7280]">{item.academicYear}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <FaEye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, TransportFeeItemStatus.Invoiced)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Mark as Invoiced"
                            disabled={item.status === TransportFeeItemStatus.Invoiced || actionLoading}
                          >
                            <FaReceipt className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, TransportFeeItemStatus.Paid)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Mark as Paid"
                            disabled={item.status === TransportFeeItemStatus.Paid || actionLoading}
                          >
                            <FaCheckCircle className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                            disabled={actionLoading}
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Math.ceil(totalItems / itemsPerPage) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#6B7280]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
                {totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-[#6B7280] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                  className="px-3 py-2 text-sm font-medium text-[#6B7280] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#463B3B]">Transport Fee Item Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#6B7280] hover:text-[#463B3B]"
              >
                <FaTimesCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Student Name</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.studentName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Parent Email</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.parentEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Description</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.description || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Distance</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.distanceKm || 0} km</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Unit Price</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.unitPricePerKm ? formatCurrency(selectedItem.unitPricePerKm) : 'N/A'}/km</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Subtotal</label>
                  <p className="text-lg font-semibold text-[#463B3B]">{selectedItem?.subtotal ? formatCurrency(selectedItem.subtotal) : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Status</label>
                  {selectedItem?.status !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedItem.status].color}`}>
                      {React.createElement(statusConfig[selectedItem.status].icon, { className: "w-3 h-3 mr-1" })}
                      {statusConfig[selectedItem.status].label}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Semester</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.semesterName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Academic Year</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.academicYear || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#6B7280]">Created At</label>
                  <p className="text-sm text-[#463B3B]">{selectedItem?.createdAt ? formatDate(selectedItem.createdAt) : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              {selectedItem?.id && (
                <button
                  onClick={() => handleUpdateStatus(selectedItem.id, TransportFeeItemStatus.Invoiced)}
                  className="px-4 py-2 text-sm font-medium bg-[#fad23c] rounded-lg hover:bg-[#e6c735] text-[#463B3B]"
                  disabled={selectedItem.status === TransportFeeItemStatus.Invoiced}
                >
                  Mark as Invoiced
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransportFeeItemList;
