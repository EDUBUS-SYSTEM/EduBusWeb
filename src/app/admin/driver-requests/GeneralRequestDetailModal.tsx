"use client";
import { FaUser, FaCar, FaFileAlt, FaPhone, FaEnvelope, FaIdCard, FaTimes, FaDownload, FaClock, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { GeneralDriverRequest } from "./GeneralRequestsTab";
import { formatDateTime } from "@/utils/dateUtils";

interface GeneralRequestDetailModalProps {
  request: GeneralDriverRequest;
  onClose: () => void;
}

export default function GeneralRequestDetailModal({ request, onClose }: GeneralRequestDetailModalProps) {
  // Using centralized formatDateTime from @/utils/dateUtils

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "In Progress":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Resolved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRequestTypeBadge = (requestType: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (requestType) {
      case "Route Change":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Vehicle Issue":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Schedule Adjustment":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Training Request":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Other":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (priority) {
      case "Urgent":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "High":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Medium":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Low":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRequestTypeText = (requestType: string) => {
    switch (requestType) {
      case "Route Change": return "Route Change";
      case "Vehicle Issue": return "Vehicle Issue";
      case "Schedule Adjustment": return "Schedule Adjustment";
      case "Training Request": return "Training Request";
      case "Other": return "Other";
      default: return requestType;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending": return "Pending";
      case "In Progress": return "In Progress";
      case "Resolved": return "Resolved";
      case "Rejected": return "Rejected";
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "Urgent": return "Urgent";
      case "High": return "High";
      case "Medium": return "Medium";
      case "Low": return "Low";
      default: return priority;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <FaExclamationTriangle className="h-4 w-4 text-red-600" />;
      case "High":
        return <FaExclamationTriangle className="h-4 w-4 text-orange-600" />;
      case "Medium":
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-600" />;
      case "Low":
        return <FaCheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <FaExclamationTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={getStatusBadge(request.status)}>
                {getStatusText(request.status)}
              </span>
              <span className={getRequestTypeBadge(request.requestType)}>
                {getRequestTypeText(request.requestType)}
              </span>
              <div className="flex items-center space-x-2">
                {getPriorityIcon(request.priority)}
                <span className={getPriorityBadge(request.priority)}>
                  {getPriorityText(request.priority)}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                ID: {request.id}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Submit Date: {formatDateTime(request.submittedAt)}
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-[#FEFCE8] rounded-xl p-6 border border-[#fad23c]/20">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4 flex items-center">
              <FaUser className="mr-2" />
              Driver Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">
                    {request.driverInfo.firstName} {request.driverInfo.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <FaEnvelope className="mr-2 h-4 w-4" />
                    {request.driverInfo.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="text-gray-900 flex items-center">
                    <FaPhone className="mr-2 h-4 w-4" />
                    {request.driverInfo.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">License Number</label>
                  <p className="text-gray-900 flex items-center">
                    <FaIdCard className="mr-2 h-4 w-4" />
                    {request.driverInfo.licenseNumber}
                  </p>
                </div>

                {request.driverInfo.vehicleInfo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vehicle</label>
                    <p className="text-gray-900 flex items-center">
                      <FaCar className="mr-2 h-4 w-4" />
                      {request.driverInfo.vehicleInfo.plateNumber} - {request.driverInfo.vehicleInfo.model}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FaFileAlt className="mr-2" />
              Request Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {request.title}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1 bg-white p-4 rounded-lg border">
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Attachments ({request.attachments.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.attachments.map((attachment) => (
                  <div key={attachment.id} className="bg-white rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FaFileAlt className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {attachment.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {attachment.fileType}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                        className="p-2 text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Download"
                      >
                        <FaDownload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Review Information */}
          {(request.status === "Resolved" || request.status === "Rejected") && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Processing Date</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <FaClock className="mr-2 h-4 w-4" />
                    {request.resolvedAt ? formatDateTime(request.resolvedAt) : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Processing Admin</label>
                  <p className="text-gray-900 mt-1">
                    {request.resolvedByAdminId || 'N/A'}
                  </p>
                </div>
              </div>

              {request.adminNotes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                  <p className="text-gray-900 mt-1 bg-white p-3 rounded-lg border">
                    {request.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
