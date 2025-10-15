"use client";
import { FaUser, FaChild, FaMapMarkerAlt, FaDollarSign, FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaTimes, FaRoute } from "react-icons/fa";
import { PickupPointRequestDetailDto } from "@/services/pickupPointService";

type PickupPointRequest = PickupPointRequestDetailDto;

interface RequestDetailModalProps {
  request: PickupPointRequest;
  onClose: () => void;
}

export default function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1: return "Male";
      case 2: return "Female";
      case 3: return "Other";
      default: return "Unknown";
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
                {request.status}
              </span>
              <div className="text-sm text-gray-500">
                Request ID: {request.id}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Created: {formatDate(request.createdAt)}
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-[#FEFCE8] rounded-xl p-6 border border-[#fad23c]/20">
            <h3 className="text-lg font-semibold text-[#463B3B] mb-4 flex items-center">
              <FaUser className="mr-2" />
              Parent Information
            </h3>
            
            {request.parentInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">
                      {request.parentInfo.firstName} {request.parentInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 h-4 w-4" />
                      {request.parentEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="text-gray-900 flex items-center">
                      <FaPhone className="mr-2 h-4 w-4" />
                      {request.parentInfo.phoneNumber}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-gray-900 flex items-center">
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      {formatDate(request.parentInfo.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{getGenderText(request.parentInfo.gender)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900 flex items-start">
                      <FaHome className="mr-2 h-4 w-4 mt-0.5" />
                      {request.parentInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No parent information available</p>
            )}
          </div>

          {/* Students Information */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FaChild className="mr-2" />
              Students ({request.students.length})
            </h3>
            
            {request.students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {request.students.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaChild className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">Student ID: {student.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No students assigned to this request</p>
            )}
          </div>

          {/* Pickup Point Information */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Pickup Point Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 mt-1">{request.addressText}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Coordinates</label>
                  <p className="text-gray-900 mt-1">
                    {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Distance</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <FaRoute className="mr-2 h-4 w-4" />
                    {request.distanceKm.toFixed(2)} km
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {request.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{request.description}</p>
                  </div>
                )}
                
                {request.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reason for Request</label>
                    <p className="text-gray-900 mt-1">{request.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
              <FaDollarSign className="mr-2" />
              Pricing Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Unit Price per Kilometer</label>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {formatCurrency(request.unitPricePerKm)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estimated Total Price</label>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {formatCurrency(request.totalFee)}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Review Information */}
          {(request.status === "Approved" || request.status === "Rejected") && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Reviewed At</label>
                  <p className="text-gray-900 mt-1">
                    {request.reviewedAt ? formatDate(request.reviewedAt) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Reviewed By Admin ID</label>
                  <p className="text-gray-900 mt-1">
                    {request.reviewedByAdminId || 'N/A'}
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
