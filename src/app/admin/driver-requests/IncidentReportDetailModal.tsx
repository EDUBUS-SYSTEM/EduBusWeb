"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaRoute, FaCar, FaUser, FaCalendarAlt, FaFileAlt, FaCheck } from "react-icons/fa";
import {
  tripIncidentService,
  TripIncident,
  TripIncidentStatus,
  TripIncidentReason,
  UpdateTripIncidentStatusRequest
} from "@/services/api/tripIncidents";
import { useAppDispatch } from "@/store/hooks";
import { updateIncidentInList } from "@/store/slices/driverRequestsSlice";
import { formatDateTime } from "@/utils/dateUtils";

interface IncidentReportDetailModalProps {
  incidentId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function IncidentReportDetailModal({
  incidentId,
  onClose,
  onUpdate
}: IncidentReportDetailModalProps) {
  const dispatch = useAppDispatch();
  const [incident, setIncident] = useState<TripIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TripIncidentStatus>(TripIncidentStatus.Open);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tripIncidentService.getById(incidentId);
        setIncident(data);
        setAdminNote(data.adminNote || "");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load incident details";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  const handleUpdateStatus = async () => {
    if (!incident) return;

    try {
      setUpdating(true);
      setError(null);

      const request: UpdateTripIncidentStatusRequest = {
        status: selectedStatus,
        adminNote: adminNote.trim() || undefined
      };

      const updated = await tripIncidentService.updateStatus(incidentId, request);
      setIncident(updated);
      dispatch(updateIncidentInList({
        id: updated.id,
        tripId: updated.tripId,
        reason: updated.reason,
        title: updated.title,
        description: updated.description,
        status: updated.status,
        createdAt: updated.createdAt,
        routeName: updated.routeName,
        vehiclePlate: updated.vehiclePlate,
        serviceDate: updated.serviceDate
      }));

      setShowStatusModal(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to update incident status";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]>; title?: string; traceId?: string } } }).response;
        if (response?.data) {
          if (response.data.message) {
            errorMessage = response.data.message;
          } else if (response.data.errors) {
            const errorMessages = Object.entries(response.data.errors)
              .flatMap(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return messages.map(msg => `${field}: ${msg}`);
                }
                return [`${field}: ${String(messages)}`];
              })
              .join('\n');
            errorMessage = errorMessages || errorMessage;
          } else if (response.data.title) {
            errorMessage = response.data.title;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusString = (status: TripIncidentStatus | string | number): string => {
    if (typeof status === 'string') {
      return status;
    }
    if (typeof status === 'number') {
      const statusMap: Record<number, string> = {
        0: 'Open',
        1: 'Acknowledged',
        2: 'Resolved'
      };
      return statusMap[status] || String(status);
    }
    return String(status);
  };

  const getStatusBadge = (status: TripIncidentStatus | string | number) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    const statusStr = getStatusString(status);
    switch (statusStr) {
      case TripIncidentStatus.Open:
        return `${baseClasses} bg-red-100 text-red-800`;
      case TripIncidentStatus.Acknowledged:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case TripIncidentStatus.Resolved:
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getReasonString = (reason: TripIncidentReason | string | number): string => {
    if (typeof reason === 'string') {
      return reason;
    }
    if (typeof reason === 'number') {
      const reasonMap: Record<number, string> = {
        0: 'VehicleIssue',
        1: 'StudentIssue',
        2: 'RouteBlocked',
        3: 'Weather',
        4: 'SafetyConcern',
        5: 'IoTDeviceIssue',
        6: 'Other'
      };
      return reasonMap[reason] || String(reason);
    }
    return String(reason);
  };

  const getReasonBadge = (reason: TripIncidentReason | string | number) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    const reasonStr = getReasonString(reason);
    switch (reasonStr) {
      case "VehicleIssue":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "StudentIssue":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "RouteBlocked":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Weather":
        return `${baseClasses} bg-cyan-100 text-cyan-800`;
      case "SafetyConcern":
        return `${baseClasses} bg-pink-100 text-pink-800`;
      case "IoTDeviceIssue":
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case "Other":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatReasonText = (reason: TripIncidentReason | string | number): string => {
    const reasonStr = getReasonString(reason);
    return reasonStr.replace(/([A-Z])/g, ' $1').trim();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fad23c]"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  const statusStr = getStatusString(incident.status);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-[#463B3B] flex items-center gap-2">
              <FaExclamationTriangle className="text-[#fad23c]" />
              Incident Report Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-semibold mb-2">Error</div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{error}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaRoute className="h-4 w-4" />
                  <span className="text-sm font-medium">Route</span>
                </div>
                <p className="text-base font-semibold text-gray-900">{incident.routeName}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaCar className="h-4 w-4" />
                  <span className="text-sm font-medium">Vehicle</span>
                </div>
                <p className="text-base font-semibold text-gray-900">{incident.vehiclePlate}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaUser className="h-4 w-4" />
                  <span className="text-sm font-medium">Supervisor</span>
                </div>
                <p className="text-base font-semibold text-gray-900 break-words">{incident.supervisorName}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FaCalendarAlt className="h-4 w-4" />
                  <span className="text-sm font-medium">Service Date</span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDateTime(incident.serviceDate)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Reason:</span>
                  <span className={getReasonBadge(incident.reason)}>
                    {formatReasonText(incident.reason)}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={getStatusBadge(incident.status)}>
                    {statusStr}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{incident.title}</h3>
                {incident.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
                  </div>
                )}
              </div>

              {incident.adminNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileAlt className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Admin Note</span>
                  </div>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">{incident.adminNote}</p>
                  {incident.handledAt && (
                    <p className="text-xs text-blue-600 mt-2">
                      Handled at: {formatDateTime(incident.handledAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                <p>Reported at: {formatDateTime(incident.createdAt)}</p>
                {incident.updatedAt && incident.updatedAt !== incident.createdAt && (
                  <p>Last updated: {formatDateTime(incident.updatedAt)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const getStatusEnum = (status: string | number): TripIncidentStatus => {
                    if (typeof status === 'string') {
                      switch (status) {
                        case 'Open':
                          return TripIncidentStatus.Open;
                        case 'Acknowledged':
                          return TripIncidentStatus.Acknowledged;
                        case 'Resolved':
                          return TripIncidentStatus.Resolved;
                        default:
                          return TripIncidentStatus.Open;
                      }
                    }
                    const statusMap: Record<number, TripIncidentStatus> = {
                      0: TripIncidentStatus.Open,
                      1: TripIncidentStatus.Acknowledged,
                      2: TripIncidentStatus.Resolved
                    };
                    return statusMap[status] || TripIncidentStatus.Open;
                  };
                  setSelectedStatus(getStatusEnum(incident.status));
                  setShowStatusModal(true);
                }}
                className="flex-1 px-5 py-2.5 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <FaCheck />
                Handle Report
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <h3 className="text-lg font-bold text-[#463B3B] mb-4">Handle Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TripIncidentStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                >
                  <option value={TripIncidentStatus.Open}>Open</option>
                  <option value={TripIncidentStatus.Acknowledged}>Acknowledged</option>
                  <option value={TripIncidentStatus.Resolved}>Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent text-sm"
                  placeholder="Add a note about how this incident was handled..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="flex-1 px-5 py-2.5 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {updating ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setAdminNote(incident.adminNote || "");
                  setError(null);
                }}
                disabled={updating}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
