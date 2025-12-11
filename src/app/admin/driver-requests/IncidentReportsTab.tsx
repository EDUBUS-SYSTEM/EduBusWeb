"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FaSearch, FaEye, FaFileAlt, FaClock, FaRoute, FaCar } from "react-icons/fa";
import IncidentReportDetailModal from "./IncidentReportDetailModal";
import {
  TripIncidentListItem,
  TripIncidentStatus,
  TripIncidentReason
} from "@/services/api/tripIncidents";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchIncidentReports } from "@/store/slices/driverRequestsSlice";
import { formatDateTime } from "@/utils/dateUtils";

export default function IncidentReportsTab() {
  const dispatch = useAppDispatch();
  const { allIncidents, incidentsLoading, incidentsError } = useAppSelector(
    state => state.driverRequests
  );

  const [activeStatusTab, setActiveStatusTab] = useState<TripIncidentStatus>(TripIncidentStatus.Open);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<TripIncidentListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchAllIncidents = useCallback(async () => {
    await Promise.all([
      dispatch(fetchIncidentReports({ status: TripIncidentStatus.Open, page: 1, perPage: 1000 })),
      dispatch(fetchIncidentReports({ status: TripIncidentStatus.Acknowledged, page: 1, perPage: 1000 })),
      dispatch(fetchIncidentReports({ status: TripIncidentStatus.Resolved, page: 1, perPage: 1000 }))
    ]);
  }, [dispatch]);

  useEffect(() => {
    fetchAllIncidents();
  }, [fetchAllIncidents]);

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

  const formatReasonText = (reason: TripIncidentReason | string | number): string => {
    const reasonStr = getReasonString(reason);
    return reasonStr.replace(/([A-Z])/g, ' $1').trim();
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

  const statusCounts = useMemo(() => {
    const counts = {
      [TripIncidentStatus.Open]: 0,
      [TripIncidentStatus.Acknowledged]: 0,
      [TripIncidentStatus.Resolved]: 0
    };

    allIncidents.forEach(incident => {
      const statusStr = getStatusString(incident.status);
      if (statusStr === TripIncidentStatus.Open) counts[TripIncidentStatus.Open]++;
      else if (statusStr === TripIncidentStatus.Acknowledged) counts[TripIncidentStatus.Acknowledged]++;
      else if (statusStr === TripIncidentStatus.Resolved) counts[TripIncidentStatus.Resolved]++;
    });

    return counts;
  }, [allIncidents]);

  const filteredIncidents = useMemo(() => {
    let filtered = allIncidents.filter(incident => {
      const statusStr = getStatusString(incident.status);
      return statusStr === activeStatusTab;
    });

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(incident => {
        const routeName = incident.routeName?.toLowerCase() || '';
        const vehiclePlate = incident.vehiclePlate?.toLowerCase() || '';
        const title = incident.title?.toLowerCase() || '';
        const description = incident.description?.toLowerCase() || '';
        const reasonStr = getReasonString(incident.reason).toLowerCase();
        return (
          routeName.includes(searchLower) ||
          vehiclePlate.includes(searchLower) ||
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          reasonStr.includes(searchLower)
        );
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allIncidents, activeStatusTab, searchTerm]);

  const getStatusColor = (status: TripIncidentStatus) => {
    switch (status) {
      case TripIncidentStatus.Open:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          badge: 'bg-blue-100',
          accent: 'bg-blue-500'
        };
      case TripIncidentStatus.Acknowledged:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100',
          accent: 'bg-yellow-500'
        };
      case TripIncidentStatus.Resolved:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100',
          accent: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100',
          accent: 'bg-gray-500'
        };
    }
  };

  const getReasonBadgeColor = (reason: TripIncidentReason | string | number) => {
    const reasonStr = getReasonString(reason);
    switch (reasonStr) {
      case "VehicleIssue":
        return "bg-red-100 text-red-700";
      case "StudentIssue":
        return "bg-purple-100 text-purple-700";
      case "RouteBlocked":
        return "bg-orange-100 text-orange-700";
      case "Weather":
        return "bg-cyan-100 text-cyan-700";
      case "SafetyConcern":
        return "bg-pink-100 text-pink-700";
      case "IoTDeviceIssue":
        return "bg-indigo-100 text-indigo-700";
      case "Other":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (incidentsLoading && allIncidents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fad23c]"></div>
        <span className="ml-3 text-gray-600">Loading incident reports...</span>
      </div>
    );
  }

  if (incidentsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{incidentsError}</p>
        <button
          onClick={() => fetchAllIncidents()}
          className="px-6 py-3 bg-[#fad23c] text-[#463B3B] rounded-xl hover:bg-[#FFF085] font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const colors = getStatusColor(activeStatusTab);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex gap-2 w-full lg:w-auto">
          {[TripIncidentStatus.Open, TripIncidentStatus.Acknowledged, TripIncidentStatus.Resolved].map((status) => {
            const statusColors = getStatusColor(status);
            const isActive = activeStatusTab === status;
            const count = statusCounts[status];
            
            return (
              <button
                key={status}
                onClick={() => setActiveStatusTab(status)}
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? `${statusColors.bg} ${statusColors.border} border-2 ${statusColors.text} shadow-md`
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{status}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? statusColors.badge : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="w-full lg:w-80 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all"
            autoComplete="off"
          />
        </div>
      </div>

      <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6 min-h-[400px]`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{activeStatusTab} Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'report' : 'reports'} found
            </p>
          </div>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="text-center py-16">
            <FaFileAlt className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No {activeStatusTab} Reports</h3>
            <p className="text-gray-400">No incident reports found matching the current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.map((incident) => {
              const statusStr = getStatusString(incident.status);
              const cardColors = getStatusColor(statusStr as TripIncidentStatus);
              
              return (
                <div
                  key={incident.id}
                  className={`bg-white ${cardColors.border} border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full`}
                  onClick={() => {
                    setSelectedIncident(incident);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-1 h-12 ${cardColors.accent} rounded-full flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(incident);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#fad23c] transition-colors flex-shrink-0"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonBadgeColor(incident.reason)} flex-shrink-0`}>
                          {formatReasonText(incident.reason)}
                        </span>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cardColors.badge} ${cardColors.text}`}>
                        {statusStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {incident.title}
                    </h4>

                    {incident.description ? (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-shrink-0">
                        {incident.description}
                      </p>
                    ) : (
                      <div className="mb-4 flex-shrink-0"></div>
                    )}

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaRoute className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{incident.routeName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCar className="h-3 w-3 flex-shrink-0" />
                        <span>{incident.vehiclePlate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaClock className="h-3 w-3 flex-shrink-0" />
                        <span>{formatDateTime(incident.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetailModal && selectedIncident && (
        <IncidentReportDetailModal
          incidentId={selectedIncident.id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedIncident(null);
          }}
          onUpdate={() => {
            fetchAllIncidents();
          }}
        />
      )}
    </div>
  );
}
