"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaReceipt, FaUser, FaChild, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaInfoCircle } from "react-icons/fa";
import { transactionService } from "@/services/transactionService";
import { TransactionDetailResponseDto } from "@/types/transaction";
import { formatDateTime } from "@/utils/dateUtils";

interface TransactionDetailModalProps {
  transactionId: string;
  onClose: () => void;
}

export default function TransactionDetailModal({ transactionId, onClose }: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<TransactionDetailResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactionDetail();
  }, [transactionId]);

  const loadTransactionDetail = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionDetail(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error("Error loading transaction detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Using centralized formatDateTime from @/utils/dateUtils

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return "bg-green-100 text-green-800 border-green-200";
      case 'Pending':
        return "bg-[#FFF085] text-[#463B3B] border-[#fad23c]";
      case 'Cancelled':
        return "bg-red-100 text-red-800 border-red-200";
      case 'Failed':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'Notyet':
        return "bg-[#fad23c] text-[#463B3B] border-[#D08700]";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'PayOS':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'VNPay':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'Momo':
        return "bg-pink-100 text-pink-800 border-pink-200";
      default:
        return "bg-[#FFF085] text-[#463B3B] border-[#fad23c]";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fad23c]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="text-red-500 text-lg">Transaction not found</div>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fad23c] to-[#FFF085] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaReceipt className="w-6 h-6 text-[#463B3B]" />
              <h2 className="text-2xl font-bold text-[#463B3B]">Transaction Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#463B3B] hover:text-red-600 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Information */}
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-xl p-6 border border-[#fad23c] shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FaCreditCard className="w-5 h-5 text-[#D08700]" />
                <h3 className="text-lg font-semibold text-[#463B3B]">Transaction Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Transaction ID:</span>
                  <span className="font-mono text-sm bg-[#fad23c] px-2 py-1 rounded text-[#463B3B]">
                    {transaction.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Transaction Code:</span>
                  <span className="font-mono text-sm bg-[#fad23c] px-2 py-1 rounded text-[#463B3B]">
                    {transaction.transactionCode || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Amount:</span>
                  <span className="text-xl font-bold text-[#D08700]">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Currency:</span>
                  <span className="font-medium text-[#463B3B]">
                    {transaction.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Status:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Provider:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getProviderColor(transaction.provider || 'Unknown')}`}>
                    {transaction.provider || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Created At:</span>
                  <span className="font-medium text-[#463B3B]">
                    {formatDateTime(transaction.createdAt)}
                  </span>
                </div>
                {transaction.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#463B3B] font-medium">Paid At:</span>
                    <span className="font-medium text-[#D08700]">
                      {formatDateTime(transaction.paidAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Updated At:</span>
                  <span className="font-medium text-[#463B3B]">
                    {formatDateTime(transaction.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent & Student Information */}
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-xl p-6 border border-[#fad23c] shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FaUser className="w-5 h-5 text-[#D08700]" />
                <h3 className="text-lg font-semibold text-[#463B3B]">Parent & Student Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Parent Name:</span>
                  <span className="font-medium text-[#463B3B]">
                    {transaction.parentName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Parent Email:</span>
                  <span className="font-medium text-[#463B3B]">
                    {transaction.parentEmail || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Student Name:</span>
                  <span className="font-medium text-[#463B3B]">
                    {transaction.studentName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#463B3B] font-medium">Student ID:</span>
                  <span className="font-mono text-sm bg-[#fad23c] px-2 py-1 rounded text-[#463B3B]">
                    {transaction.studentId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-xl p-6 border border-[#fad23c] shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FaInfoCircle className="w-5 h-5 text-[#D08700]" />
                <h3 className="text-lg font-semibold text-[#463B3B]">Description</h3>
              </div>
              <p className="text-[#463B3B] leading-relaxed">{transaction.description}</p>
            </div>
          )}

          {/* Transport Fee Items */}
          {transaction.transportFeeItems && transaction.transportFeeItems.length > 0 && (
            <div className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF085] rounded-xl p-6 border border-[#fad23c] shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FaMapMarkerAlt className="w-5 h-5 text-[#D08700]" />
                <h3 className="text-lg font-semibold text-[#463B3B]">Transport Fee Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#fad23c] rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B] rounded-tl-lg">Student</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B]">Semester</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B]">Academic Year</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B]">Unit Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B]">Distance</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B]">Total Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#463B3B] rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#fad23c]">
                    {transaction.transportFeeItems.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-[#FEFCE8]' : 'bg-white'} hover:bg-[#FFF085] transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <FaChild className="w-4 h-4 text-[#D08700]" />
                            <span className="font-medium text-[#463B3B]">{item.studentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#463B3B]">{item.semesterName || 'N/A'}</td>
                        <td className="px-4 py-3 text-[#463B3B]">{item.academicYear || 'N/A'}</td>
                        <td className="px-4 py-3 text-[#463B3B]">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-[#463B3B]">{item.distanceKm || 0} km</td>
                        <td className="px-4 py-3 font-semibold text-[#D08700]">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${item.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                              item.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-6 border-t border-[#fad23c]">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#fad23c] to-[#FFF085] text-[#463B3B] rounded-xl font-semibold hover:from-[#FFF085] hover:to-[#fad23c] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}