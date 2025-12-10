"use client";
import { FaTimes } from "react-icons/fa";
import { UnitPriceResponseDto } from "@/types/unitPrice";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

interface UnitPriceDetailModalProps {
  unitPrice: UnitPriceResponseDto;
  onClose: () => void;
}

export default function UnitPriceDetailModal({ unitPrice, onClose }: UnitPriceDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Using centralized formatDate and formatDateTime from @/utils/dateUtils

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#463B3B]">Unit Price Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Service Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Name:</span>
                <span className="font-medium text-[#463B3B]">
                  {unitPrice.name}
                </span>
              </div>
              {unitPrice.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-[#463B3B] max-w-xs text-right">
                    {unitPrice.description}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Price per KM:</span>
                <span className="font-medium text-[#463B3B]">
                  {formatCurrency(unitPrice.pricePerKm)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unitPrice.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }`}>
                  {unitPrice.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Effective Period */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Effective Period</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Effective From:</span>
                <span className="font-medium text-[#463B3B]">
                  {formatDate(unitPrice.effectiveFrom)}
                </span>
              </div>
              {unitPrice.effectiveTo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Effective To:</span>
                  <span className="font-medium text-[#463B3B]">
                    {formatDate(unitPrice.effectiveTo)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4">Metadata</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created By:</span>
                <span className="font-medium text-[#463B3B]">
                  {unitPrice.byAdminName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created At:</span>
                <span className="font-medium text-[#463B3B]">
                  {formatDateTime(unitPrice.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated At:</span>
                <span className="font-medium text-[#463B3B]">
                  {formatDateTime(unitPrice.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deleted:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${unitPrice.isDeleted
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                  }`}>
                  {unitPrice.isDeleted ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
