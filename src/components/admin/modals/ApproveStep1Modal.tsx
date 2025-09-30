"use client";
import { useState } from "react";
import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";

interface ApproveStep1ModalProps {
  leave: DriverLeaveRequest;
  onNext: (notes: string, needsReplacement: boolean) => void;
  onClose: () => void;
}

export default function ApproveStep1Modal({ 
  leave, 
  onNext, 
  onClose 
}: ApproveStep1ModalProps) {
  const [notes, setNotes] = useState("");
  const [needsReplacement, setNeedsReplacement] = useState(false);

  const getLeaveTypeText = (leaveType: number) => {
    switch (leaveType) {
      case 1: return "Nghỉ phép năm";
      case 2: return "Nghỉ ốm";
      case 3: return "Nghỉ cá nhân";
      case 4: return "Nghỉ khẩn cấp";
      case 5: return "Nghỉ học tập";
      case 6: return "Khác";
      default: return "Không xác định";
    }
  };

  const handleNext = () => {
    onNext(notes, needsReplacement);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              ✅ Bước 1/2: Xác nhận phê duyệt
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Leave Request Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📋 Thông tin đơn nghỉ
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Tài xế:</span>
                  <span className="text-gray-900">{leave.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Loại nghỉ:</span>
                  <span className="text-gray-900">{getLeaveTypeText(leave.leaveType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Từ ngày:</span>
                  <span className="text-gray-900">{new Date(leave.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Đến ngày:</span>
                  <span className="text-gray-900">{new Date(leave.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Lý do:</span>
                  <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border">
                    {leave.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Ghi chú phê duyệt
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú phê duyệt..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Replacement Driver Option */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="needsReplacement"
                checked={needsReplacement}
                onChange={(e) => setNeedsReplacement(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="needsReplacement" className="text-sm font-medium text-gray-700">
                Cần phân công tài xế thay thế
              </label>
            </div>

            {needsReplacement && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      ⚠️ Bạn sẽ được chuyển đến bước chọn tài xế thay thế
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Hệ thống sẽ yêu cầu bạn chọn tài xế thay thế trước khi hoàn thành phê duyệt.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!needsReplacement && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      ℹ️ Đơn sẽ được phê duyệt ngay
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Đơn nghỉ sẽ được phê duyệt và chuyển sang trạng thái &quot;Chờ phân công&quot;. Bạn có thể phân công tài xế thay thế sau.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors duration-200 flex items-center space-x-2 font-medium"
            >
              <span>
                {needsReplacement ? "Tiếp tục" : "Phê duyệt"}
              </span>
              {needsReplacement ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
