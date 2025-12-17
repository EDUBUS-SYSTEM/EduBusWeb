"use client";
import { useState } from "react";
import { FaUser, FaCar, FaCalendarAlt, FaPhone, FaEnvelope, FaIdCard, FaTimes, FaFileAlt, FaDownload, FaClock, FaCheck } from "react-icons/fa";
import { DriverLeaveRequest } from "@/services/api/driverLeaveRequests";
import ApproveStep1Modal from "@/components/admin/modals/ApproveStep1Modal";
import ApproveStep2Modal from "@/components/admin/modals/ApproveStep2Modal";
import { RejectLeaveModal } from "@/components/admin";
import { formatDate,} from "@/utils/dateUtils";

interface LeaveRequestDetailModalProps {
  leave: DriverLeaveRequest;
  onClose: () => void;
  onApprove?: (leaveId: string, replacementDriverId?: string, notes?: string) => Promise<void>;
  onReject?: (leaveId: string, reason: string) => Promise<void>;
}

export default function LeaveRequestDetailModal({ leave, onClose, onApprove, onReject }: LeaveRequestDetailModalProps) {
  const [showApproveStep1Modal, setShowApproveStep1Modal] = useState(false);
  const [showApproveStep2Modal, setShowApproveStep2Modal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");


  const isLeaveExpired = (startDate: string, endDate: string) => {
    const today = new Date();
    const leaveEndDate = new Date(endDate);

    today.setHours(0, 0, 0, 0);
    leaveEndDate.setHours(0, 0, 0, 0);

    return leaveEndDate < today;
  };

  const getStatusBadge = (status: number) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 1: // Pending
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 2: // Approved
        return `${baseClasses} bg-green-100 text-green-800`;
      case 3: // Rejected
        return `${baseClasses} bg-red-100 text-red-800`;
      case 4: // Cancelled
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 5: // Completed
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getLeaveTypeBadge = (leaveType: number) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
    switch (leaveType) {
      case 1: // Annual
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 2: // Sick
        return `${baseClasses} bg-red-100 text-red-800`;
      case 3: // Personal
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 4: // Emergency
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 5: // Training
        return `${baseClasses} bg-green-100 text-green-800`;
      case 6: // Other
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return "Pending";
      case 2: return "Approved";
      case 3: return "Rejected";
      case 4: return "Cancelled";
      case 5: return "Completed";
      default: return "Unknown";
    }
  };

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

  const calculateLeaveDays = () => {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  const handleApproveStep1 = (notes: string, needsReplacement: boolean) => {
    setApproveNotes(notes);
    if (needsReplacement) {
      setShowApproveStep1Modal(false);
      setShowApproveStep2Modal(true);
    } else {
      handleApproveDirect(notes);
    }
  };

  const handleApproveDirect = async (notes: string) => {
    if (!onApprove) return;

    setActionLoading(true);
    try {
      await onApprove(leave.id, undefined, notes); 
      setShowApproveStep1Modal(false);
    } catch (error) {
      console.error("Error approving leave request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveStep2 = async (replacementDriverId?: string) => {
    if (!onApprove) return;

    setActionLoading(true);
    try {
      await onApprove(leave.id, replacementDriverId, approveNotes); 
      setShowApproveStep2Modal(false);
    } catch (error) {
      console.error("Error approving leave request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (leaveId: string, reason: string) => {
    if (!onReject) return;

    setActionLoading(true);
    try {
      await onReject(leaveId, reason);
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Leave Request Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <span className={getStatusBadge(leave.status)}>
              {getStatusText(leave.status)}
            </span>
            <span className={getLeaveTypeBadge(leave.leaveType)}>
              {getLeaveTypeText(leave.leaveType)}
            </span>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FaUser className="mr-2 h-5 w-5" />
              Driver Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 flex items-center">
                    <FaUser className="mr-2 h-4 w-4" />
                    {leave.driverName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900 flex items-center">
                    <FaPhone className="mr-2 h-4 w-4" />
                    {leave.driverPhoneNumber}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <FaEnvelope className="mr-2 h-4 w-4" />
                    {leave.driverEmail}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">License Number</label>
                  <p className="text-gray-900 flex items-center">
                    <FaIdCard className="mr-2 h-4 w-4" />
                    {leave.driverLicenseNumber}
                  </p>
                </div>

                {leave.primaryVehicleLicensePlate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vehicle</label>
                    <p className="text-gray-900 flex items-center">
                      <FaCar className="mr-2 h-4 w-4" />
                      {leave.primaryVehicleLicensePlate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 h-5 w-5" />
              Leave Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">From Date</label>
                  <p className="text-gray-900">{formatDate(leave.startDate)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">To Date</label>
                  <p className="text-gray-900">{formatDate(leave.endDate)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Leave Days</label>
                  <p className="text-gray-900">{calculateLeaveDays()} days</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <p className="text-gray-900 flex items-center">
                    <FaClock className="mr-2 h-4 w-4" />
                    {formatDate(leave.requestedAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Leave Reason</label>
                  <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border">
                    {leave.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(leave.status === 2 || leave.status === 3) && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheck className="mr-2 h-5 w-5" />
                Processing Information
              </h3>

              {leave.status === 2 && leave.approvedAt && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Approval Date</label>
                    <p className="text-gray-900">{formatDate(leave.approvedAt)}</p>
                  </div>

                  {leave.approvedByAdminName && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Approved By</label>
                      <p className="text-gray-900">{leave.approvedByAdminName}</p>
                    </div>
                  )}

                  {leave.approvalNote && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                      <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border">
                        {leave.approvalNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {leave.status === 3 && leave.approvedAt && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rejection Date</label>
                    <p className="text-gray-900">{formatDate(leave.approvedAt)}</p>
                  </div>

                  {leave.approvedByAdminName && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rejected By</label>
                      <p className="text-gray-900">{leave.approvedByAdminName}</p>
                    </div>
                  )}

                  {leave.approvalNote && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                      <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border text-red-800">
                        {leave.approvalNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {leave.status === 1 && isLeaveExpired(leave.startDate, leave.endDate) && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <FaClock className="mr-2 h-5 w-5" />
                Expired Leave Request
              </h3>
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium">
                  This leave request has expired.
                </p>
                <p className="text-red-700 text-sm mt-2">
                  The end date of the leave has already passed. You can no longer approve or reject this request.
                </p>
              </div>
            </div>
          )}

          {leave.attachments && leave.attachments.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2 h-5 w-5" />
                Attachments
              </h3>
              <div className="space-y-2">
                {leave.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <FaFileAlt className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{attachment.fileName}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 flex items-center">
                      <FaDownload className="mr-1 h-3 w-3" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-center">
            <div className="flex space-x-3">
              {leave.status === 1 && onApprove && onReject && !isLeaveExpired(leave.startDate, leave.endDate) && (
                <>
                  <button
                    onClick={() => setShowApproveStep1Modal(true)}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2 font-medium"
                  >
                    <FaCheck className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2 font-medium"
                  >
                    <FaTimes className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showApproveStep1Modal && (
        <ApproveStep1Modal
          leave={leave}
          onNext={handleApproveStep1}
          onClose={() => setShowApproveStep1Modal(false)}
        />
      )}

      {showApproveStep2Modal && (
        <ApproveStep2Modal
          leave={leave}
          notes={approveNotes}
          onApprove={handleApproveStep2}
          onBack={() => {
            setShowApproveStep2Modal(false);
            setShowApproveStep1Modal(true);
          }}
          onClose={() => setShowApproveStep2Modal(false)}
          loading={actionLoading}
        />
      )}

      {showRejectModal && (
        <RejectLeaveModal
          leave={leave}
          onReject={handleReject}
          onClose={() => setShowRejectModal(false)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}