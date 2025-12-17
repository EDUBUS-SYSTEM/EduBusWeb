"use client";
import { useState } from "react";
import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";

interface RejectLeaveModalProps {
  leave: DriverLeaveRequest;
  onReject: (leaveId: string, reason: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export default function RejectLeaveModal({ 
  leave, 
  onReject, 
  onClose, 
  loading 
}: RejectLeaveModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const getLeaveTypeText = (leaveType: number) => {
    switch (leaveType) {
      case 1: return "Annual Leave";
      case 2: return "Sick Leave";
      case 3: return "Personal Leave";
      case 4: return "Emergency Leave";
      case 5: return "Training Leave";
      case 6: return "Other";
      default: return "Unknown";
    }
  };

  const handleReject = async () => {

    if (!reason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }

    setError(""); 
    await onReject(leave.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Reject leave request from driver <strong>{leave.driverName}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            Leave Type: {getLeaveTypeText(leave.leaveType)}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(""); 
            }}
            placeholder="Enter rejection reason (required, minimum 10 characters)..."
            className={`w-full px-3 py-2 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent resize-none`}
            rows={3}
            required
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
}