"use client";
import { FaTimes, FaUser, FaChild, FaMapMarkerAlt, FaMoneyBillWave, FaCalendar, FaExclamationTriangle, FaRobot, FaCheckCircle } from "react-icons/fa";
import { RelocationRequestDto } from "@/services/relocationRequestService";

interface RequestDetailModalProps {
  request: RelocationRequestDto;
  onClose: () => void;
}

export default function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#fad23c] px-6 py-4 flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#463B3B]">Relocation Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FFF085] rounded-lg transition-colors duration-200"
          >
            <FaTimes className="h-5 w-5 text-[#463B3B]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Parent & Student Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-[#fad23c]" />
              Parent & Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Parent Email</label>
                <p className="text-gray-900">{request.parentEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Student Name</label>
                <p className="text-gray-900 flex items-center">
                  <FaChild className="mr-2 text-gray-400" />
                  {request.studentName}
                </p>
              </div>
            </div>
          </div>

          {/* Semester Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendar className="mr-2 text-[#fad23c]" />
              Semester Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Semester</label>
                <p className="text-gray-900">{request.semesterName}</p>
                <p className="text-sm text-gray-500">{request.academicYear}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total School Days</label>
                <p className="text-gray-900">{request.totalSchoolDays} days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Progress</label>
                <p className="text-gray-900">
                  {request.daysServiced} serviced / {request.daysRemaining} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Location Change */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-[#fad23c]" />
              Location Change
            </h3>
            <div className="space-y-4">
              {/* Old Location */}
              <div className="border-l-4 border-red-300 pl-4">
                <label className="text-sm font-medium text-gray-500">Current Location</label>
                <p className="text-gray-900">{request.oldPickupPointAddress}</p>
                <p className="text-sm text-gray-500">Distance: {request.oldDistanceKm.toFixed(2)} km</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="text-2xl text-green-600">↓</div>
              </div>

              {/* New Location */}
              <div className="border-l-4 border-green-300 pl-4">
                <label className="text-sm font-medium text-gray-500">New Location</label>
                <p className="text-gray-900">{request.newPickupPointAddress}</p>
                <p className="text-sm text-gray-500">Distance: {request.newDistanceKm.toFixed(2)} km</p>
                <p className="text-sm text-gray-500">
                  Coordinates: {request.newLatitude.toFixed(6)}, {request.newLongitude.toFixed(6)}
                </p>
                {request.isOnExistingRoute && (
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <FaCheckCircle className="mr-1" />
                    On existing route
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-[#fad23c]" />
              Financial Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Original Payment</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.originalPaymentAmount)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Value Serviced</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.valueServiced)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Value Remaining</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.valueRemaining)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">New Location Cost</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.newLocationCost)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.processingFee)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Unit Price per km</span>
                <span className="font-medium text-gray-900">{formatCurrency(request.unitPricePerKm)}</span>
              </div>
              {request.refundAmount > 0 && (
                <div className="flex justify-between items-center pt-2 bg-green-50 p-3 rounded-lg">
                  <span className="text-green-700 font-semibold">Refund Amount</span>
                  <span className="font-bold text-green-700 text-lg">{formatCurrency(request.refundAmount)}</span>
                </div>
              )}
              {request.additionalPaymentRequired > 0 && (
                <div className="flex justify-between items-center pt-2 bg-orange-50 p-3 rounded-lg">
                  <span className="text-orange-700 font-semibold">Additional Payment Required</span>
                  <span className="font-bold text-orange-700 text-lg">{formatCurrency(request.additionalPaymentRequired)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="text-gray-900">{request.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{request.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Requested Effective Date</label>
                <p className="text-gray-900">{formatDate(request.requestedEffectiveDate)}</p>
              </div>
              {request.urgentRequest && (
                <div className="flex items-center text-red-600">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-semibold">URGENT REQUEST</span>
                </div>
              )}
              {request.evidenceUrls && request.evidenceUrls.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Evidence</label>
                  <div className="space-y-1">
                    {request.evidenceUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block text-sm"
                      >
                        Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          {request.aiRecommendation && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaRobot className="mr-2 text-purple-600" />
                AI Recommendation
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recommendation</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.aiRecommendation.recommendation === 'Approve' ? 'bg-green-100 text-green-800' :
                      request.aiRecommendation.recommendation === 'Reject' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {request.aiRecommendation.recommendation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-medium text-gray-900">{request.aiRecommendation.confidence} ({request.aiRecommendation.score}/100)</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Summary</label>
                  <p className="text-gray-900">{request.aiRecommendation.summary}</p>
                </div>
                {request.aiRecommendation.reasons.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reasons</label>
                    <ul className="list-disc list-inside text-gray-900 text-sm space-y-1">
                      {request.aiRecommendation.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {request.aiRecommendation.riskFactors.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Risk Factors</label>
                    <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                      {request.aiRecommendation.riskFactors.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {request.aiRecommendation.suggestedActions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Suggested Actions</label>
                    <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                      {request.aiRecommendation.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Calculated at: {formatDateTime(request.aiRecommendation.calculatedAt)}
                </div>
              </div>
            </div>
          )}

          {/* Admin Review */}
          {request.reviewedByAdminId && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Review</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviewed By</label>
                  <p className="text-gray-900">{request.reviewedByAdminName || 'Unknown Admin'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                  <p className="text-gray-900">{request.reviewedAt ? formatDateTime(request.reviewedAt) : 'N/A'}</p>
                </div>
                {request.adminNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                    <p className="text-gray-900">{request.adminNotes}</p>
                  </div>
                )}
                {request.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                    <p className="text-red-600">{request.rejectionReason}</p>
                  </div>
                )}
                {request.effectiveDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Effective Date</label>
                    <p className="text-gray-900">{formatDate(request.effectiveDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tracking Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-500">Submitted At</label>
                <p className="text-gray-900">{formatDateTime(request.submittedAt)}</p>
              </div>
              <div>
                <label className="text-gray-500">Last Status Update</label>
                <p className="text-gray-900">{formatDateTime(request.lastStatusUpdate)}</p>
              </div>
              <div>
                <label className="text-gray-500">Request Type</label>
                <p className="text-gray-900">{request.requestType}</p>
              </div>
              <div>
                <label className="text-gray-500">Priority</label>
                <p className="text-gray-900">{request.priority}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
