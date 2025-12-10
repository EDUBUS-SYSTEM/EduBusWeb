"use client";
import { useState } from "react";
import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";
import { formatDate } from "@/utils/dateUtils";

interface ApproveLeaveModalProps {
  leave: DriverLeaveRequest;
  onApprove: (leaveId: string, notes?: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export default function ApproveLeaveModal({
  leave,
  onApprove,
  onClose,
  loading
}: ApproveLeaveModalProps) {
  const [notes, setNotes] = useState("");

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phê duyệt đơn nghỉ</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Phê duyệt đơn nghỉ cho tài xế <strong>{leave.driverName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Loại nghỉ: {getLeaveTypeText(leave.leaveType)}
          </p>
          <p className="text-sm text-gray-500">
            Thời gian: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú của admin (Tùy chọn)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thêm ghi chú cho tài xế..."
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
            Hủy
          </button>
          <button
            onClick={() => {
              onApprove(leave.id, notes)
            }
            }
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Phê duyệt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
