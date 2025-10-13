"use client";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { transactionService } from "@/services/transactionService";
import { TransactionSummary, TransactionStatus } from "@/types/transaction";

interface TransactionStatusModalProps {
  transaction: TransactionSummary;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionStatusModal({ transaction, onClose, onSuccess }: TransactionStatusModalProps) {
  const [newStatus, setNewStatus] = useState<TransactionStatus>(transaction.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStatus === transaction.status) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      // await transactionService.updateTransactionStatus(transaction.id, newStatus);
      console.log('Update transaction status:', transaction.id, newStatus);
      alert('Update status functionality not implemented yet');
      onSuccess();
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Failed to update transaction status");
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#463B3B]">Update Transaction Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-3">Transaction Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Parent:</span>
                <span className="font-medium text-[#463B3B]">{transaction.parentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium text-[#463B3B]">{transaction.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-[#463B3B]">{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all"
              >
                <option value={TransactionStatus.Pending}>Pending</option>
                <option value={TransactionStatus.Paid}>Paid</option>
                <option value={TransactionStatus.Cancelled}>Cancelled</option>
                <option value={TransactionStatus.Failed}>Failed</option>
              </select>
            </div>

            {/* Status Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newStatus)}`}>
                  {newStatus}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || newStatus === transaction.status}
                className="flex-1 px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

