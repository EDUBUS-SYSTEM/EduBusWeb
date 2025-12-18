"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaReceipt, FaUser, FaChild, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaInfoCircle } from "react-icons/fa";
import { transactionService } from "@/services/transactionService";
import { TransactionDetailResponseDto, TransportFeeItemSummary } from "@/types/transaction";
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

  const formatStatus = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return "Unknown";
    const str = status.toString();
    switch (str) {
      case "0":
      case "Pending":
        return "Pending";
      case "1":
      case "Paid":
        return "Paid";
      case "2":
      case "Cancelled":
        return "Cancelled";
      case "3":
      case "Failed":
        return "Failed";
      default:
        return str;
    }
  };

  const getStatusColor = (status: string | number | null | undefined) => {
    switch (formatStatus(status)) {
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

  const formatItemStatus = (status: string | number | null | undefined) => {
    if (status === null || status === undefined) return "Unknown";
    const str = status.toString();
    switch (str) {
      case "0":
      case "Unbilled":
        return "Unbilled";
      case "1":
      case "Invoiced":
        return "Invoiced";
      case "2":
      case "Paid":
        return "Paid";
      case "3":
      case "Cancelled":
        return "Cancelled";
      default:
        return str;
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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4b106]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-lg">Transaction not found</div>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-[#f6e58d] text-[#463B3B] rounded-lg font-medium hover:bg-[#f9eec4] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaReceipt className="w-6 h-6 text-[#444]" />
              <h2 className="text-2xl font-bold text-[#333]">Transaction Details</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#555] hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-gray-50">
          {/* Transaction Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FaCreditCard className="w-5 h-5 text-[#8c6a00]" />
                <h3 className="text-lg font-semibold text-[#333]">Transaction Information</h3>
              </div>
              <div className="space-y-4">
                {transaction.transactionCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#555] font-medium">Transaction Code:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-[#333]">
                      {transaction.transactionCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#555] font-medium">Amount:</span>
                  <span className="text-xl font-bold text-[#8c6a00]">
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#555] font-medium">Currency:</span>
                  <span className="font-medium text-[#333]">
                    {transaction.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#555] font-medium">Status:</span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(transaction.status)}`}>
                    {formatStatus(transaction.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#555] font-medium">Created At:</span>
                  <span className="font-medium text-[#333]">
                    {formatDateTime(transaction.createdAt)}
                  </span>
                </div>
                {transaction.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#555] font-medium">Paid At:</span>
                    <span className="font-medium text-[#8c6a00]">
                      {formatDateTime(transaction.paidAt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#555] font-medium">Updated At:</span>
                  <span className="font-medium text-[#333]">
                    {formatDateTime(transaction.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Parent & Student Information */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FaUser className="w-5 h-5 text-[#8c6a00]" />
                <h3 className="text-lg font-semibold text-[#333]">Parent & Student Information</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-[#333] mb-2">Parent</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#555] font-medium">Name:</span>
                      <span className="font-medium text-[#333]">
                        {transaction.parentName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#555] font-medium">Email:</span>
                      <span className="font-medium text-[#333]">
                        {transaction.parentEmail || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-[#333] mb-2">Student</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#555] font-medium">Name:</span>
                      <span className="font-medium text-[#333]">
                        {transaction.studentName || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FaInfoCircle className="w-5 h-5 text-[#8c6a00]" />
                <h3 className="text-lg font-semibold text-[#333]">Description</h3>
              </div>
              <p className="text-[#444] leading-relaxed">{transaction.description}</p>
            </div>
          )}

          {/* Transport Fee Items */}
          {transaction.transportFeeItems && transaction.transportFeeItems.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <FaMapMarkerAlt className="w-5 h-5 text-[#8c6a00]" />
                <h3 className="text-lg font-semibold text-[#333]">Transport Fee Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#555] rounded-tl-lg">Student</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555]">Semester</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555]">Academic Year</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555]">Unit Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555]">Distance</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555]">Total Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#555] rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transaction.transportFeeItems.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <FaChild className="w-4 h-4 text-[#8c6a00]" />
                            <span className="font-medium text-[#333]">{item.studentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#444]">{item.semesterName || 'N/A'}</td>
                        <td className="px-4 py-3 text-[#444]">{item.academicYear || 'N/A'}</td>
                        <td className="px-4 py-3 text-[#444]">
                          {(() => {
                            // Try both unitPrice and unitPricePerKm in case of field name mismatch
                            const price = (item as TransportFeeItemSummary & { unitPricePerKm?: number }).unitPricePerKm ?? item.unitPrice;
                            return price !== null && price !== undefined ? formatCurrency(price) : 'N/A';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-[#444]">{item.distanceKm || 0} km</td>
                        <td className="px-4 py-3 font-semibold text-[#8c6a00]">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const formattedStatus = formatItemStatus(item.status);
                            return (
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${formattedStatus === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                formattedStatus === 'Invoiced' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  formattedStatus === 'Unbilled' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    formattedStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {formattedStatus}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-[#333] rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}