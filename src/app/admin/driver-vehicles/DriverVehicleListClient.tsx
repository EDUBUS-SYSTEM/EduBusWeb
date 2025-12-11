"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, User, Users, Calendar, CheckCircle, Edit2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Pagination from "@/components/ui/Pagination";
import vehicleService from "@/services/vehicleService";
import driverVehicleService from "@/services/driverVehicleService";
import { apiService } from "@/lib/api";
import { VehicleDto } from "@/types/vehicle";
import EditAssignmentModal from "./EditAssignmentModal";
import { enrollmentSemesterSettingsService } from "@/services/api/enrollmentSemesterSettingsService";

const PER_PAGE = 6;

// Types
type DriverAssignmentApiItem = {
  id?: string;
  Id?: string;
  driverId?: string;
  DriverId?: string;
  driver?: {
    email?: string;
  };
  startTimeUtc?: string;
  StartTimeUtc?: string;
  endTimeUtc?: string;
  EndTimeUtc?: string;
  status?: number;
  isPrimaryDriver?: boolean;
  IsPrimaryDriver?: boolean;
};

type DriverAssignment = {
  id: string;
  driverId: string;
  driverName: string;
  driverEmail?: string;
  isPrimaryDriver: boolean;
  startTime: string;
  endTime?: string;
  status: string;
  isUpcoming?: boolean; // Flag to indicate if assignment hasn't started yet or spans to next semester
  isInCurrentSemester?: boolean; // Flag to indicate if assignment is in current semester
  isInNextSemester?: boolean; // Flag to indicate if assignment spans to next semester
};

type SupervisorAssignment = {
  id: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail?: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  isUpcoming?: boolean; // Flag to indicate if assignment hasn't started yet or spans to next semester
  isPrimarySupervisor?: boolean; // Flag to indicate if this is the primary supervisor
  isInCurrentSemester?: boolean; // Flag to indicate if assignment is in current semester
  isInNextSemester?: boolean; // Flag to indicate if assignment spans to next semester
};

type VehicleWithAssignments = {
  id: string;
  licensePlate: string;
  capacity: number;
  status: "Active" | "Inactive" | "Maintenance";
  drivers: DriverAssignment[];
  supervisors: SupervisorAssignment[];
};

// Utility functions
const formatUTCToLocalDate = (utcString: string): string => {
  if (!utcString) return "";
  let dateStr = utcString.trim();
  if (!dateStr.endsWith("Z") && (dateStr.includes("T") || dateStr.includes(" "))) {
    dateStr = dateStr.replace(" ", "T") + "Z";
  }
  const date = new Date(dateStr);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Status Badge Component
function StatusBadge({ status }: { readonly status: "Active" | "Inactive" | "Maintenance" }) {
  const styles = {
    Active: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-300 shadow-md",
    Inactive: "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300",
    Maintenance: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300 shadow-md",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${styles[status]} shadow-sm`}>
      {status}
    </span>
  );
}

// Vehicle Card Component
function VehicleCard({
  vehicle,
  onEditDriver,
  onEditSupervisor
}: {
  readonly vehicle: VehicleWithAssignments;
  readonly onEditDriver: (driver: DriverAssignment) => void;
  readonly onEditSupervisor: (supervisor: SupervisorAssignment) => void;
}) {
  const [expanded, setExpanded] = useState({ drivers: false, supervisors: false });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#FDC700]/30 transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FEFCE8] via-[#FFF6D8] to-[#FEF3C7] p-6 border-b border-[#FDC700]/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDC700]/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FDC700]/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FDC700] to-[#D08700] rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#463B3B] mb-1">
                  {vehicle.licensePlate}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-lg backdrop-blur-sm">
                    <Users className="w-3.5 h-3.5 text-[#D08700]" />
                    <span className="font-medium">Capacity: {vehicle.capacity}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
        {/* Drivers Section */}
        <div>
          <button
            onClick={() => setExpanded(prev => ({ ...prev, drivers: !prev.drivers }))}
            className="w-full flex items-center justify-between mb-4 text-left group hover:bg-gray-50 rounded-xl p-3 -m-3 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#463B3B] text-base">
                  Drivers
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vehicle.drivers.length} {vehicle.drivers.length === 1 ? 'driver' : 'drivers'} assigned
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {vehicle.drivers.length > 0 && (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {vehicle.drivers.length}
                </span>
              )}
              <span className="text-gray-400 group-hover:text-[#FDC700] transition-colors">
                {expanded.drivers ? "▼" : "▶"}
              </span>
            </div>
          </button>

          {expanded.drivers && (
            <div className="space-y-3">
              {vehicle.drivers.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No drivers assigned</p>
                </div>
              ) : (
                vehicle.drivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-[#FDC700]/50 hover:shadow-md transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {driver.driverName}
                          </span>
                          {(() => {
                            if (driver.isPrimaryDriver) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-sm flex-shrink-0">
                                  <CheckCircle className="w-3 h-3" />
                                  Primary
                                </span>
                              );
                            }
                            if (driver.isUpcoming) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-semibold rounded-full shadow-sm flex-shrink-0">
                                  <Calendar className="w-3 h-3" />
                                  Upcoming
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {driver.driverEmail && (
                          <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {driver.driverEmail}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-[#D08700]" />
                          <span className="font-medium">
                            {formatUTCToLocalDate(driver.startTime)} -{" "}
                            {driver.endTime ? formatUTCToLocalDate(driver.endTime) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onEditDriver(driver)}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-[#FDC700] hover:to-[#D08700] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                        title="Edit assignment dates"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Supervisors Section */}
        <div>
          <button
            onClick={() => setExpanded(prev => ({ ...prev, supervisors: !prev.supervisors }))}
            className="w-full flex items-center justify-between mb-4 text-left group hover:bg-gray-50 rounded-xl p-3 -m-3 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-[#463B3B] text-base">
                  Supervisors
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vehicle.supervisors.length} {vehicle.supervisors.length === 1 ? 'supervisor' : 'supervisors'} assigned
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {vehicle.supervisors.length > 0 && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {vehicle.supervisors.length}
                </span>
              )}
              <span className="text-gray-400 group-hover:text-[#FDC700] transition-colors">
                {expanded.supervisors ? "▼" : "▶"}
              </span>
            </div>
          </button>

          {expanded.supervisors && (
            <div className="space-y-3">
              {vehicle.supervisors.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No supervisors assigned</p>
                </div>
              ) : (
                vehicle.supervisors.map((supervisor, index) => (
                  <div
                    key={supervisor.id}
                    className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-[#FDC700]/50 hover:shadow-md transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {supervisor.supervisorName}
                          </span>
                          {(() => {
                            if (supervisor.isPrimarySupervisor) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-sm flex-shrink-0">
                                  <CheckCircle className="w-3 h-3" />
                                  Primary
                                </span>
                              );
                            }
                            if (supervisor.isUpcoming) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-semibold rounded-full shadow-sm flex-shrink-0">
                                  <Calendar className="w-3 h-3" />
                                  Upcoming
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        {supervisor.supervisorEmail && (
                          <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {supervisor.supervisorEmail}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-[#D08700]" />
                          <span className="font-medium">
                            {formatUTCToLocalDate(supervisor.startTime)} -{" "}
                            {supervisor.endTime ? formatUTCToLocalDate(supervisor.endTime) : "Ongoing"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onEditSupervisor(supervisor)}
                        className="p-2.5 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-[#FDC700] hover:to-[#D08700] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                        title="Edit assignment dates"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Removed semester filtering helper - no longer needed

// Main Component
export default function DriverVehicleListClient() {
  const [mounted, setMounted] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: "driver" | "supervisor";
    data: { id: string; name: string; startTime: string; endTime?: string } | null;
  }>({ isOpen: false, type: "driver", data: null });

  // Fetch all semesters to check if assignment spans multiple semesters
  const { data: semestersData } = useQuery({
    queryKey: ["allSemesters"],
    queryFn: () => enrollmentSemesterSettingsService.getEnrollmentSemesterSettings({
      perPage: 100,
      sortBy: "semesterStartDate",
      sortOrder: "asc",
    }),
  });

  // Helper function to check if assignment spans multiple semesters
  const checkAssignmentSemesters = useCallback((startTime: string, endTime: string | undefined) => {
    if (!semestersData?.items || semestersData.items.length === 0) {
      return { isInCurrentSemester: false, isInNextSemester: false };
    }

    const assignmentStart = new Date(startTime);
    const assignmentEnd = endTime ? new Date(endTime) : new Date('9999-12-31');
    const now = new Date();

    // Find current semester (active or the one containing today)
    const currentSemester = semestersData.items.find(s => {
      const semStart = new Date(s.semesterStartDate);
      const semEnd = new Date(s.semesterEndDate);
      return s.isActive || (semStart <= now && semEnd >= now);
    });

    // Find next semester (after current one)
    const nextSemester = currentSemester 
      ? semestersData.items.find(s => {
          const semStart = new Date(s.semesterStartDate);
          const currentEnd = new Date(currentSemester.semesterEndDate);
          return semStart > currentEnd && semStart <= assignmentEnd;
        })
      : null;

    // Check if assignment is in current semester
    const isInCurrentSemester = currentSemester 
      ? assignmentStart <= new Date(currentSemester.semesterEndDate) && 
        assignmentEnd >= new Date(currentSemester.semesterStartDate)
      : false;

    // Check if assignment spans to next semester
    const isInNextSemester = nextSemester 
      ? assignmentEnd >= new Date(nextSemester.semesterStartDate)
      : false;

    return { isInCurrentSemester, isInNextSemester };
  }, [semestersData]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Fetch vehicles with assignments
  const fetchVehiclesWithAssignments = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all vehicles
      const vehiclesResponse = await vehicleService.getVehicles({
        page: 1,
        perPage: 1000,
        sortBy: "licensePlate",
        sortOrder: "asc",
      });

       const vehicleList = vehiclesResponse.vehicles || vehiclesResponse.data || [];

       // Fetch assignments for each vehicle
       // We get ALL assignments regardless of date - including upcoming ones
       const vehiclesWithAssignments = await Promise.all(
         vehicleList.map(async (vehicle: VehicleDto) => {
           try {
             // Fetch ALL driver assignments - no date filter, no isActive filter
             // This shows all assignments including future ones
             const driversResponse = await driverVehicleService.getAssignments({
               vehicleId: vehicle.id,
               // Don't filter by isActive - we want ALL assignments (active, upcoming, past)
               isActive: undefined,
               isUpcoming: undefined,
               page: 1,
               perPage: 1000,
             });

            console.log('Driver response for vehicle', vehicle.licensePlate, ':', driversResponse);

            // Fetch driver details for each assignment to get actual names
            const allDrivers: DriverAssignment[] = await Promise.all(
              (driversResponse.data || []).map(async (item: DriverAssignmentApiItem) => {
                let driverName = "Unknown Driver";
                let driverEmail = item.driver?.email || "";

                try {
                  // Fetch actual driver details from Driver API
                  const driverDetailsResponse = await apiService.get<{
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    phoneNumber: string;
                    gender: number;
                    dateOfBirth: string;
                    address: string;
                  }>(`/Driver/${item.driverId}`);

                  if (driverDetailsResponse) {
                    const firstName = driverDetailsResponse.firstName || "";
                    const lastName = driverDetailsResponse.lastName || "";
                    driverName = `${firstName} ${lastName}`.trim() || driverDetailsResponse.email?.split('@')[0] || "Unknown Driver";
                    driverEmail = driverDetailsResponse.email || driverEmail;
                  }
                } catch (error) {
                  console.error(`Error fetching driver details for ${item.driverId}:`, error);
                  // Fallback to email username if API call fails
                  if (driverEmail) {
                    driverName = driverEmail.split('@')[0];
                  }
                }

                 const startTime = item.startTimeUtc || item.StartTimeUtc || "";
                 const endTime = item.endTimeUtc || item.EndTimeUtc;
                 const now = new Date();
                 const assignmentStart = startTime ? new Date(startTime) : new Date();
                 
                 // Check if assignment hasn't started yet
                 const isNotStarted = startTime ? assignmentStart > now : false;
                 
                 // Check semester spans
                 const { isInCurrentSemester, isInNextSemester } = checkAssignmentSemesters(startTime, endTime);
                 
                 // Logic: NEVER show both Primary and Upcoming at the same time
                 // If assignment touches next semester (even just 1 day) → only show Primary, not Upcoming
                 // Upcoming only shows if: not started AND not touching next semester AND not primary
                 const touchesNextSemester = isInNextSemester;
                 const isUpcoming = isNotStarted && !touchesNextSemester; // Don't show upcoming if touches next semester

                 return {
                   id: item.id || item.Id || "",
                   driverId: item.driverId || item.DriverId || "",
                   driverName: driverName,
                   driverEmail: driverEmail,
                   isPrimaryDriver: item.isPrimaryDriver || item.IsPrimaryDriver || false,
                   startTime: startTime || "",
                   endTime: endTime,
                   status: item.status === 1 ? "Assigned" : "Unassigned",
                   isUpcoming: isUpcoming,
                   isInCurrentSemester: isInCurrentSemester,
                   isInNextSemester: isInNextSemester,
                 };
              })
            );

             // Show ALL drivers - no filtering by semester or date
             const drivers: DriverAssignment[] = allDrivers;

            // Fetch supervisor assignments
            let allSupervisors: SupervisorAssignment[] = [];
            try {
              // Fetch ALL supervisor assignments (not just active ones)
              const supervisorsResponse = await apiService.get<{
                data?: Array<{
                  id?: string;
                  supervisorId?: string;
                  supervisorName?: string;
                  supervisorEmail?: string;
                  vehicleId?: string;
                  startTimeUtc?: string;
                  endTimeUtc?: string;
                  isActive?: boolean;
                }>;
              }>(`/VehicleAssignment/vehicle/${vehicle.id}/supervisors`);

              console.log('Supervisor response for vehicle', vehicle.licensePlate, ':', supervisorsResponse);

               // First, map all supervisors with basic info
               const supervisorsWithStatus = (supervisorsResponse.data || []).map((item) => {
                 const supervisorName = item.supervisorName ||
                   item.supervisorEmail?.split('@')[0] ||
                   "Unknown Supervisor";
                 
                 const startTime = item.startTimeUtc || "";
                 const endTime = item.endTimeUtc;
                 const now = new Date();
                 const assignmentStart = startTime ? new Date(startTime) : new Date();
                 
                 // Check if assignment hasn't started yet
                 const isNotStarted = startTime ? assignmentStart > now : false;
                 
                 // Check semester spans
                 const { isInCurrentSemester, isInNextSemester } = checkAssignmentSemesters(startTime, endTime);
                 
                 // Logic: NEVER show both Primary and Upcoming at the same time
                 // If assignment touches next semester (even just 1 day) → only show Primary, not Upcoming
                 // Upcoming only shows if: not started AND not touching next semester AND not primary
                 const endTimeDate = endTime ? new Date(endTime) : null;
                 const isCurrentlyActive = !isNotStarted && (endTimeDate === null || endTimeDate > now);
                 const touchesNextSemester = isInNextSemester;
                 const isUpcoming = isNotStarted && !touchesNextSemester; // Don't show upcoming if touches next semester

                 return {
                   id: item.id || "",
                   supervisorId: item.supervisorId || "",
                   supervisorName: supervisorName,
                   supervisorEmail: item.supervisorEmail,
                   startTime: startTime,
                   endTime: item.endTimeUtc,
                   isActive: item.isActive ?? true,
                   isUpcoming: isUpcoming,
                   isPrimarySupervisor: false, // Will be set below
                   isCurrentlyActive: isCurrentlyActive, // For sorting
                   isInCurrentSemester: isInCurrentSemester,
                   isInNextSemester: isInNextSemester,
                 };
               });
               
               // Determine primary supervisor: first active one, or first one if none are active
               if (supervisorsWithStatus.length > 0) {
                 // Sort: active ones first, then by start time
                 const sorted = [...supervisorsWithStatus].sort((a, b) => {
                   if (a.isCurrentlyActive !== b.isCurrentlyActive) {
                     return a.isCurrentlyActive ? -1 : 1;
                   }
                   return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                 });
                 
                 // Mark the first one as primary
                 const primaryId = sorted[0].id;
                 allSupervisors = supervisorsWithStatus.map(s => ({
                   id: s.id,
                   supervisorId: s.supervisorId,
                   supervisorName: s.supervisorName,
                   supervisorEmail: s.supervisorEmail,
                   startTime: s.startTime,
                   endTime: s.endTime,
                   isActive: s.isActive,
                   isUpcoming: s.isUpcoming,
                   isPrimarySupervisor: s.id === primaryId,
                   isInCurrentSemester: s.isInCurrentSemester,
                   isInNextSemester: s.isInNextSemester,
                 }));
               } else {
                 allSupervisors = [];
               }

               // Show ALL supervisors - no filtering by semester or date
               const supervisors: SupervisorAssignment[] = allSupervisors;

              return {
                id: vehicle.id,
                licensePlate: vehicle.licensePlate,
                capacity: vehicle.capacity,
                status: vehicle.status,
                drivers,
                supervisors,
              };
            } catch (err) {
              console.error(`Error fetching supervisors for vehicle ${vehicle.id}:`, err);
              return {
                id: vehicle.id,
                licensePlate: vehicle.licensePlate,
                capacity: vehicle.capacity,
                status: vehicle.status,
                drivers,
                supervisors: [],
              };
            }
          } catch (err) {
            console.error(`Error fetching assignments for vehicle ${vehicle.id}:`, err);
            return {
              id: vehicle.id,
              licensePlate: vehicle.licensePlate,
              capacity: vehicle.capacity,
              status: vehicle.status,
              drivers: [],
              supervisors: [],
            };
          }
        })
      );

      setVehicles(vehiclesWithAssignments);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
   }, [checkAssignmentSemesters]); // Include checkAssignmentSemesters dependency

  // Initial fetch
  useEffect(() => {
    fetchVehiclesWithAssignments();
  }, [fetchVehiclesWithAssignments]);

  // Edit assignment handlers
  const handleEditDriver = (driver: DriverAssignment) => {
    setEditModal({
      isOpen: true,
      type: "driver",
      data: {
        id: driver.id,
        name: driver.driverName,
        startTime: driver.startTime,
        endTime: driver.endTime,
      },
    });
  };

  const handleEditSupervisor = (supervisor: SupervisorAssignment) => {
    setEditModal({
      isOpen: true,
      type: "supervisor",
      data: {
        id: supervisor.id,
        name: supervisor.supervisorName,
        startTime: supervisor.startTime,
        endTime: supervisor.endTime,
      },
    });
  };

  const handleSaveAssignment = async (id: string, startTimeUtc: string, endTimeUtc?: string) => {
    try {
      if (editModal.type === "driver") {
        // Update driver assignment
        await driverVehicleService.updateAssignment(id, {
          startTimeUtc,
          endTimeUtc,
        });
      } else {
        // Update supervisor assignment
        await vehicleService.updateSupervisorAssignment(id, {
          startTimeUtc,
          endTimeUtc,
        });
      }

      // Refresh data
      await fetchVehiclesWithAssignments();
      setEditModal({ isOpen: false, type: "driver", data: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update assignment";
      throw new Error(errorMessage);
    }
  };

  // Filter vehicles by search
  const filteredVehicles = useMemo(() => {
    if (!debouncedSearch) return vehicles;
    const searchLower = debouncedSearch.toLowerCase();
    return vehicles.filter((v) =>
      v.licensePlate.toLowerCase().includes(searchLower)
    );
  }, [vehicles, debouncedSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PER_PAGE));
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredVehicles.slice(start, start + PER_PAGE);
  }, [filteredVehicles, page]);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#fad23c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FDC700] to-[#D08700] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#463B3B] mb-1">
                  Vehicle Assignments
                </h1>
                <p className="text-[#6B7280] text-sm">
                  View drivers and supervisors assigned to each vehicle
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FEFCE8] to-[#FFF6D8] rounded-xl border border-[#FDC700]/20">
              <Calendar className="w-4 h-4 text-[#D08700]" />
              <p className="text-sm text-[#D08700] font-semibold">
                Showing all assignments (including upcoming ones)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-16 z-40 bg-white rounded-2xl shadow-lg p-5 border border-gray-100 mb-6 backdrop-blur-sm bg-white/95">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by vehicle license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 text-sm border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FDC700] focus:border-[#FDC700] transition-all duration-200 bg-gray-50/50 hover:bg-white"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Loading State */}
      {(() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#fad23c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading vehicles...</p>
              </div>
            </div>
          );
        }
        if (paginatedVehicles.length === 0) {
          return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? `No vehicles found matching "${searchTerm}"` : "No vehicles found"}
              </p>
            </div>
          );
        }
        return (
          <>
            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {paginatedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEditDriver={handleEditDriver}
                  onEditSupervisor={handleEditSupervisor}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          {/* Results Info */}
          <div className="mt-4 text-center text-sm text-[#6B7280]">
            Showing {((page - 1) * PER_PAGE) + 1} to{" "}
            {Math.min(page * PER_PAGE, filteredVehicles.length)} of {filteredVehicles.length} vehicles
          </div>
          </>
        );
      })()}

      {/* Edit Assignment Modal */}
      <EditAssignmentModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, type: "driver", data: null })}
        assignmentType={editModal.type}
        assignmentData={editModal.data}
        onSave={handleSaveAssignment}
      />
    </div>
  );
}
