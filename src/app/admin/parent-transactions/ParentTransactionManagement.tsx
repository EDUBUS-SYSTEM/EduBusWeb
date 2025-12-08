"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaEye, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaReceipt } from "react-icons/fa";
import { transactionService } from "@/services/transactionService";
import { TransactionSummary, TransactionStatus, TransactionListRequest } from "@/types/transaction";
import TransactionDetailModal from "./TransactionDetailModal";
import TransactionStatusModal from "./TransactionStatusModal";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

export default function ParentTransactionManagement() {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | null>(null);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const pageSize = 20;

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, [currentPage, refreshTrigger]);

  // Listen for transaction creation events
  useEffect(() => {
    const handleTransactionCreated = () => {
      console.log('Transaction created event received, refreshing list...');
      loadTransactions();
    };

    window.addEventListener('transactionCreated', handleTransactionCreated);

    return () => {
      window.removeEventListener('transactionCreated', handleTransactionCreated);
    };
  }, []);

  // Filter transactions
  useEffect(() => {
    if (!transactions || !Array.isArray(transactions)) {
      setFilteredTransactions([]);
      return;
    }

    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.parentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== null) {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Date filter
    if (dateFilter.from) {
      filtered = filtered.filter(transaction =>
        new Date(transaction.createdAt) >= new Date(dateFilter.from)
      );
    }
    if (dateFilter.to) {
      filtered = filtered.filter(transaction =>
        new Date(transaction.createdAt) <= new Date(dateFilter.to)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, dateFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const request: TransactionListRequest = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc"
      };

      const response = await transactionService.getTransactionList(request);
      setTransactions(response?.transactions || []);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (transaction: TransactionSummary) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleStatusChange = (transaction: TransactionSummary) => {
    setSelectedTransaction(transaction);
    setShowStatusModal(true);
  };

  const handleStatusUpdateSuccess = () => {
    setShowStatusModal(false);
    setSelectedTransaction(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        // await transactionService.deleteTransaction(id);
        console.log('Delete transaction:', id);
        alert('Delete functionality not implemented yet');
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Using centralized formatDate and formatDateTime from @/utils/dateUtils

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Paid:
        return "bg-green-100 text-green-800";
      case TransactionStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case TransactionStatus.Cancelled:
        return "bg-red-100 text-red-800";
      case TransactionStatus.Failed:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setDateFilter({ from: "", to: "" });
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-32">
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus || null)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
            >
              <option value="">All Status</option>
              <option value={TransactionStatus.Pending}>Pending</option>
              <option value={TransactionStatus.Paid}>Paid</option>
              <option value={TransactionStatus.Cancelled}>Cancelled</option>
              <option value={TransactionStatus.Failed}>Failed</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
              title="From Date"
            />
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
              title="To Date"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <FaReceipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-[#463B3B]">{transactions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <FaCalendarAlt className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-[#463B3B]">
                {transactions?.filter(t => t.status === TransactionStatus.Pending).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <FaUser className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Paid</p>
              <p className="text-lg font-bold text-[#463B3B]">
                {transactions?.filter(t => t.status === TransactionStatus.Paid).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-md">
              <FaReceipt className="w-4 h-4 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Amount</p>
              <p className="text-lg font-bold text-[#463B3B]">
                {formatCurrency(transactions?.reduce((sum, t) => sum + (t?.amount || 0), 0) || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent & Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions?.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{transaction.parentName}</div>
                      <div className="text-gray-500">{transaction.parentEmail}</div>
                      <div className="text-gray-500">Student: {transaction.studentName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">{transaction.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDateTime(transaction.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(transaction)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Change Status"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!filteredTransactions || filteredTransactions.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No transactions found</div>
            <div className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter || dateFilter.from || dateFilter.to
                ? "Try adjusting your search or filter criteria"
                : "No transactions available"}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transactionId={selectedTransaction.id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showStatusModal && selectedTransaction && (
        <TransactionStatusModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </div>
  );
}
