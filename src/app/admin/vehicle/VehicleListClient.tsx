// src/app/admin/vehicle/VehicleListClient.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { VehicleDto, VehicleFilters } from "@/types/vehicle";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import CreateVehicleModal from "./CreateVehicleModal";
import UpdateVehicleModal from "./UpdateVehicleModal";
import vehicleService from "@/services/vehicleService";
import type { Driver } from "@/services/driverService";
import { getAllSupervisors, SupervisorResponse } from "@/services/api/supervisors";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import { formatDate } from "@/utils/dateUtils";
const PER_PAGE = 5;

type SemesterOption = {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
};

// Date utilities
const toDateOnly = (value?: string | null): string => {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return value.split("T")[0] || value;
};

const formatDisplayDate = (date?: string): string => {
  if (!date) return "N/A";
  return formatDate(date);
};

const localDateToUTCStart = (localDate: string): string => {
  if (!localDate) return "";
  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return date.toISOString();
};

const localDateToUTCEnd = (localDate: string): string => {
  if (!localDate) return "";
  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  return date.toISOString();
};

function StatusBadge({
  status,
}: {
  status: "Active" | "Inactive" | "Maintenance";
}) {
  const map = {
    Active: {
      dot: "bg-emerald-500",
      text: "text-emerald-600",
    },
    Inactive: {
      dot: "bg-red-500",
      text: "text-red-600",
    },
    Maintenance: {
      dot: "bg-amber-500",
      text: "text-amber-600",
    },
  } as const;

  const c = map[status];
  return (
    <span className={`inline-flex items-center gap-2 ${c.text}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
const normalizePlate = (s: string) =>
  (s || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
export default function VehicleListClient() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    perPage: PER_PAGE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [totalPages, setTotalPages] = useState(1);
  const [allVehicles, setAllVehicles] = useState<VehicleDto[]>([]);
  const [useClientSearch, setUseClientSearch] = useState(false);
  // Delete states
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Driver assignment states
  const [showAssignDriverModal, setShowAssignDriverModal] = useState<
    string | null
  >(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [assignError, setAssignError] = useState<string>("");
  const [assignTab, setAssignTab] = useState<"driver" | "supervisor">("driver");
  const [supervisors, setSupervisors] = useState<SupervisorResponse[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDto | null>(null);

  const searchFilters = useMemo(() => {
    const result = {
      ...filters,
      search: debouncedSearch || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
    };
    return result;
  }, [filters, debouncedSearch, selectedStatus]);
  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester.id === selectedSemesterId),
    [semesters, selectedSemesterId]
  );

  const fetchVehicles = useCallback(async (filters: VehicleFilters) => {
    try {
      setTableLoading(true);
      setError(null);
      const res = await vehicleService.getVehicles(filters);
      setVehicles(res.vehicles);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
    } finally {
      setTableLoading(false);
    }
  }, []);

  const fetchAllVehicles = useCallback(async () => {
    try {
      setError(null);
      const per = 100;
      let page = 1;
      let acc: VehicleDto[] = [];

      const baseFilters: VehicleFilters = {
        status: selectedStatus === "all" ? undefined : selectedStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      while (true) {
        const res = await vehicleService.getVehicles({
          ...baseFilters,
          page,
          perPage: per,
        });
        acc = acc.concat(res.vehicles);
        if (page >= res.totalPages) break;
        page++;
      }
      setAllVehicles(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vehicles");
    }
  }, [selectedStatus]);

  const fetchAvailableDrivers = useCallback(
    async (vehicleId: string, start?: Date, end?: Date) => {
      try {
        setDriversLoading(true);

        const startIso = (start ?? new Date()).toISOString();
        const endIso = end ? end.toISOString() : undefined;

        const res = await vehicleService.getVehicleAvailableDrivers(
          vehicleId,
          startIso,
          endIso
        );
        if (res.success) {
          const mapped: Driver[] = res.data.map(d => {
            const [firstName, ...rest] = d.fullName.split(" ");
            return {
              id: d.id,
              firstName,
              lastName: rest.join(" "),
              phoneNumber: d.phoneNumber,
              email: d.email ?? "",
              status: typeof d.status === 'number' ? 'Active' : (d.status ?? 'Active'),
              licenseNumber: d.licenseNumber ?? undefined,
            };
          });
          setDrivers(mapped);
        } else {
          console.error("Failed to fetch available drivers:", res.error);
          setDrivers([]);
        }
      } catch (err) {
        console.error("Error fetching available drivers:", err);
        setDrivers([]);
      } finally {
        setDriversLoading(false);
      }
    },
    []
  );
  const loadSemesters = useCallback(async () => {
    try {
      setSemestersLoading(true);
      const calendars = await academicCalendarService.getActiveAcademicCalendars();
      const options: SemesterOption[] = calendars.flatMap((calendar) =>
        (calendar.semesters || [])
          .filter((semester) => semester.isActive)
          .map((semester) => ({
            id: `${calendar.id}-${semester.code}`,
            label: `${semester.name} (${calendar.academicYear})`,
            startDate: toDateOnly(semester.startDate || calendar.startDate),
            endDate: semester.endDate
              ? toDateOnly(semester.endDate)
              : calendar.endDate
                ? toDateOnly(calendar.endDate)
                : undefined,
          }))
      );

      setSemesters(options);
      if (options.length > 0) {
        setSelectedSemesterId(options[0].id);
        setAssignError("");
      } else {
        setSelectedSemesterId("");
      }
    } catch (error) {
      console.error("Failed to load semesters:", error);
      setSemesters([]);
      setSelectedSemesterId("");
      setAssignError("Unable to load semesters. Please configure an academic calendar.");
    } finally {
      setSemestersLoading(false);
    }
  }, [setAssignError]);
  const fetchSupervisors = useCallback(async (vehicleId: string, start?: Date, end?: Date) => {
    try {
      setSupervisorsLoading(true);

      const startIso = (start ?? new Date()).toISOString();
      const endIso = end ? end.toISOString() : undefined;

      const res = await vehicleService.getVehicleAvailableSupervisors(
        vehicleId,
        startIso,
        endIso
      );
      if (res.success && res.data) {
        // Map assignment data to SupervisorResponse format
        const supervisorMap = new Map<string, SupervisorResponse>();
        res.data.forEach((assignment) => {
          if (!supervisorMap.has(assignment.supervisorId)) {
            supervisorMap.set(assignment.supervisorId, {
              id: assignment.supervisorId,
              email: '',
              firstName: '',
              lastName: assignment.supervisorName.split(' ').slice(-1)[0] || '',
              phoneNumber: '',
              gender: 0,
              status: assignment.isActive ? 'Active' : 'Inactive',
            });
          }
        });
        setSupervisors(Array.from(supervisorMap.values()));
      } else {
        console.error("Failed to fetch available supervisors:", res.error);
        setSupervisors([]);
      }
    } catch (error) {
      console.error("Failed to fetch supervisors:", error);
      setSupervisors([]);
    } finally {
      setSupervisorsLoading(false);
    }
  }, []);
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => {
      if (prev.page === page) return prev;
      return { ...prev, page };
    });
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSearch = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    if (useClientSearch) {
      fetchAllVehicles();
    } else {
      fetchVehicles(searchFilters);
    }
  }, [useClientSearch, fetchAllVehicles, fetchVehicles, searchFilters]);

  const handleCreateSuccess = useCallback(() => {
    setShowCreateModal(false);
    handleRefresh();
  }, [handleRefresh]);

  const handleUpdateSuccess = useCallback(() => {
    setEditingVehicle(null);
    handleRefresh();
  }, [handleRefresh]);

  // Delete functions
  const handleDelete = useCallback(async (vehicleId: string) => {
    try {
      setDeleteLoading(vehicleId);
      await vehicleService.deleteVehicle(vehicleId);

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      setAllVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    } finally {
      setDeleteLoading(null);
    }
  }, []);

  const confirmDelete = useCallback((vehicleId: string) => {
    setShowDeleteConfirm(vehicleId);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(null);
  }, []);

  // Driver assignment functions
  const openAssignDriverModal = useCallback(async (vehicleId: string) => {
    setShowAssignDriverModal(vehicleId);
    setAssignTab("driver");
    setSelectedDriverId("");
    setSelectedSupervisorId("");
    setAssignError("");
    // Don't load drivers immediately - wait for user to select dates
  }, []);

  const closeAssignDriverModal = useCallback(() => {
    setShowAssignDriverModal(null);
    setSelectedDriverId("");
    setSelectedSupervisorId("");
    setDrivers([]);
    setSupervisors([]);
    setAssignError("");
    setSelectedSemesterId("");
  }, []);

  const handleSelectDriver = useCallback((driverId: string) => {
    setSelectedDriverId(driverId);
    setAssignError(""); // Clear error when user selects a different driver
  }, []);

  const handleSelectSupervisor = useCallback((supervisorId: string) => {
    setSelectedSupervisorId(supervisorId);
    setAssignError("");
  }, []);

  const handleAssignTabChange = useCallback((tab: "driver" | "supervisor") => {
    setAssignTab(tab);
    setAssignError("");
    if (tab === "driver") {
      setSelectedDriverId("");
    } else {
      setSelectedSupervisorId("");
    }
  }, []);

  const handleAssignDriver = useCallback(async () => {
    if (!selectedDriverId || !showAssignDriverModal) return;
    if (!selectedSemester) {
      setAssignError("Please select a semester before assigning.");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError(""); // Clear previous errors

      const startTime = localDateToUTCStart(selectedSemester.startDate);
      const endTime = selectedSemester.endDate
        ? localDateToUTCEnd(selectedSemester.endDate)
        : undefined;
      const isPrimaryInput = document.getElementById('assign-primary') as HTMLInputElement;
      const isPrimary = isPrimaryInput?.checked ?? true;

      await vehicleService.assignDriver(showAssignDriverModal, {
        driverId: selectedDriverId,
        isPrimaryDriver: isPrimary,
        startTimeUtc: startTime,
        endTimeUtc: endTime,
      });

      closeAssignDriverModal();
      handleRefresh();
    } catch (error) {
      console.error("Error assigning driver:", error);
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setAssignError(errorMessage);
    } finally {
      setAssignLoading(false);
    }
  }, [selectedDriverId, showAssignDriverModal, closeAssignDriverModal, handleRefresh, selectedSemester]);

  const handleAssignSupervisor = useCallback(async () => {
    if (!selectedSupervisorId || !showAssignDriverModal) return;
    if (!selectedSemester) {
      setAssignError("Please select a semester before assigning.");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError("");

      const startTime = localDateToUTCStart(selectedSemester.startDate);
      const endTime = selectedSemester.endDate
        ? localDateToUTCEnd(selectedSemester.endDate)
        : undefined;

      await vehicleService.assignSupervisor(showAssignDriverModal, {
        supervisorId: selectedSupervisorId,
        startTimeUtc: startTime,
        endTimeUtc: endTime,
      });

      closeAssignDriverModal();
      handleRefresh();
    } catch (error) {
      console.error("Error assigning supervisor:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setAssignError(errorMessage);
    } finally {
      setAssignLoading(false);
    }
  }, [selectedSupervisorId, showAssignDriverModal, closeAssignDriverModal, handleRefresh, selectedSemester]);

  const filteredAll = useMemo(() => {
    if (!useClientSearch) return [];
    const key = normalizePlate(debouncedSearch);
    return allVehicles.filter((v) => {
      const matchPlate = normalizePlate(v.licensePlate).includes(key);
      const matchStatus =
        selectedStatus === "all" || v.status === selectedStatus;
      return matchPlate && matchStatus;
    });
  }, [useClientSearch, allVehicles, debouncedSearch, selectedStatus]);

  const clientTotalPages = useMemo(() => {
    if (!useClientSearch) return 1;
    const per = filters.perPage ?? PER_PAGE;
    return Math.max(1, Math.ceil(filteredAll.length / per));
  }, [useClientSearch, filteredAll.length, filters.perPage]);

  const pagedFiltered = useMemo(() => {
    if (!useClientSearch) return [];
    const per = filters.perPage ?? PER_PAGE;
    const start = ((filters.page ?? 1) - 1) * per;
    return filteredAll.slice(start, start + per);
  }, [useClientSearch, filteredAll, filters.page, filters.perPage]);

  const rows = useClientSearch ? pagedFiltered : vehicles;
  const pages = useClientSearch ? clientTotalPages : totalPages;

  const assignTitle =
    assignTab === "driver"
      ? "Assign Driver to Vehicle"
      : "Assign Supervisor to Vehicle";

  const assignSubtitle = "Pick a semester to auto-fill start/end dates";

  const tabButtonClass = (tab: "driver" | "supervisor") =>
    `px-4 py-1 text-sm font-medium rounded-full transition ${assignTab === tab ? "bg-[#463B3B] text-white shadow" : "text-gray-600"
    }`;

  const assignButtonDisabled =
    semestersLoading ||
    !selectedSemester ||
    (assignTab === "driver" ? !selectedDriverId : !selectedSupervisorId) ||
    assignLoading;

  const assignButtonText = assignLoading
    ? "Assigning..."
    : assignTab === "driver"
      ? "Assign Driver"
      : "Assign Supervisor";

  useEffect(() => {
    const isSearching = debouncedSearch.length > 0;
    setUseClientSearch(isSearching);
    // Reset page to 1 when search changes
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (!useClientSearch) {
      fetchVehicles(searchFilters);
    }
  }, [
    useClientSearch,
    selectedStatus,
    filters.page,
    filters.perPage,
    filters.sortBy,
    filters.sortOrder,
    fetchVehicles,
    searchFilters,
  ]);

  useEffect(() => {
    if (
      showAssignDriverModal &&
      assignTab === "supervisor" &&
      selectedSemester &&
      !semestersLoading
    ) {
      const startDate = new Date(localDateToUTCStart(selectedSemester.startDate));
      const endDate = selectedSemester.endDate
        ? new Date(localDateToUTCEnd(selectedSemester.endDate))
        : undefined;

      fetchSupervisors(showAssignDriverModal, startDate, endDate);
    } else if (assignTab === "supervisor" && !selectedSemester) {
      setSupervisors([]);
    }
  }, [
    showAssignDriverModal,
    assignTab,
    selectedSemester,
    semestersLoading,
    fetchSupervisors,
  ]);

  useEffect(() => {
    if (
      showAssignDriverModal &&
      assignTab === "driver" &&
      selectedSemester &&
      !semestersLoading
    ) {
      const startDate = new Date(localDateToUTCStart(selectedSemester.startDate));
      const endDate = selectedSemester.endDate
        ? new Date(localDateToUTCEnd(selectedSemester.endDate))
        : undefined;

      fetchAvailableDrivers(showAssignDriverModal, startDate, endDate);
    } else if (assignTab === "driver" && !selectedSemester) {
      setDrivers([]);
    }
  }, [
    showAssignDriverModal,
    assignTab,
    selectedSemester,
    semestersLoading,
    fetchAvailableDrivers,
  ]);

  useEffect(() => {
    if (useClientSearch) {
      fetchAllVehicles();
    }
  }, [useClientSearch, selectedStatus, debouncedSearch, fetchAllVehicles]);

  useEffect(() => {
    if (showAssignDriverModal) {
      loadSemesters();
    } else {
      setSelectedSemesterId("");
    }
  }, [showAssignDriverModal, loadSemesters]);

  // Debounce searchTerm -> debouncedSearch
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <Card
          title="Vehicle List"
          className="bg-yellow-50 border-yellow-100 rounded-xl"
        >
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="text-red-500">Error: {error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6 pt-8">
      <h1 className="text-xl font-bold text-gray-800">Vehicle Management</h1>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1">
          <Input
            placeholder="Find by license plate number"
            value={searchTerm}
            leftIcon={<Search className="w-5 h-5" />}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            value={selectedStatus}
            options={[
              { value: "all", label: "All status" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Maintenance", label: "Maintenance" },
            ]}
            onChange={handleStatusFilter}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition"
          aria-label="Add vehicle"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left font-semibold px-6 py-4 w-16">
                  STT
                </th>
                <th className="text-left font-semibold px-6 py-4">
                  License Plate Number
                </th>
                <th className="text-left font-semibold px-6 py-4">
                  Capacity
                </th>
                <th className="text-left font-semibold px-6 py-4">Status</th>
                <th className="text-left font-semibold px-6 py-4 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading vehicles...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No vehicles found
                  </td>
                </tr>
              ) : (
                rows.map((vehicle, i) => (
                  <tr key={vehicle.id} className="border-t border-gray-100">
                    <td className="px-6 py-4 text-gray-600">
                      {((filters.page ?? 1) - 1) *
                        (filters.perPage ?? PER_PAGE) +
                        i +
                        1}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.licensePlate}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {vehicle.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAssignDriverModal(vehicle.id)}
                          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
                          aria-label="Assign driver"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVehicle(vehicle)}
                          className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                          aria-label="Edit vehicle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(vehicle.id)}
                          disabled={deleteLoading === vehicle.id}
                          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete vehicle"
                        >
                          {deleteLoading === vehicle.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Fixed at bottom */}
      {rows.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={filters.page || 1}
            totalPages={pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {/* </Card> */}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Vehicle
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this vehicle? This will
              permanently remove it from the system.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteLoading === showDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading === showDeleteConfirm ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateVehicleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingVehicle && (
        <UpdateVehicleModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Assign Driver/Supervisor Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-yellow-400 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {assignTitle}
                    </h3>
                    <p className="text-sm text-yellow-50 mt-0.5">
                      {assignSubtitle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAssignDriverModal}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleAssignTabChange("driver")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${assignTab === "driver"
                    ? "bg-white text-yellow-700 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Driver
                </button>
                <button
                  onClick={() => handleAssignTabChange("supervisor")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${assignTab === "supervisor"
                    ? "bg-white text-yellow-700 shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Supervisor
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Semester Selection */}
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <label htmlFor="assign-semester" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Assignment Semester *
                </label>
                {semestersLoading ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading semesters...
                  </div>
                ) : semesters.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ No active semesters available. Please configure the academic calendar.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      id="assign-semester"
                      value={selectedSemesterId}
                      onChange={(e) => {
                        setAssignError("");
                        setSelectedSemesterId(e.target.value);
                      }}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-700"
                    >
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.label}
                        </option>
                      ))}
                    </select>
                    {selectedSemester && (
                      <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Active from {formatDisplayDate(selectedSemester.startDate)} to {selectedSemester.endDate ? formatDisplayDate(selectedSemester.endDate) : "N/A"}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Driver-specific options */}
              {assignTab === "driver" && (
                <div className="mb-6 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      id="assign-primary"
                      type="checkbox"
                      className="w-5 h-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500 focus:ring-2 cursor-pointer"
                      defaultChecked
                      onChange={() => setAssignError("")}
                    />
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-yellow-700 transition-colors">
                      Set as Primary Driver
                    </span>
                  </label>
                </div>
              )}



              {/* Error Message */}
              {assignError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-red-800 mb-1">
                        Assignment Failed
                      </h3>
                      <p className="text-sm text-red-700">{assignError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selection Grid */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Select {assignTab === "driver" ? "a Driver" : "a Supervisor"}
                </h4>

                {assignTab === "driver" ? (
                  driversLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <div className="w-10 h-10 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="font-medium">Loading available drivers...</p>
                    </div>
                  ) : drivers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-600 font-medium">No available drivers for this period</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {drivers.map((driver) => (
                        <button
                          type="button"
                          key={driver.id}
                          className={`text-left p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${selectedDriverId === driver.id
                            ? "border-yellow-500 bg-yellow-50 shadow-lg ring-2 ring-yellow-200"
                            : "border-gray-200 hover:border-yellow-300 hover:shadow-md bg-white"
                            }`}
                          onClick={() => handleSelectDriver(driver.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${selectedDriverId === driver.id ? "bg-yellow-100" : "bg-blue-100"
                                }`}>
                                <User className={`w-6 h-6 ${selectedDriverId === driver.id ? "text-yellow-600" : "text-blue-600"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {driver.firstName} {driver.lastName}
                                </p>
                                <p className="text-xs text-gray-600 truncate mt-0.5">{driver.email}</p>
                                <p className="text-xs text-gray-500 mt-1">📞 {driver.phoneNumber}</p>
                                {driver.licenseNumber && (
                                  <p className="text-xs text-gray-500">🪪 {driver.licenseNumber}</p>
                                )}
                              </div>
                            </div>
                            {selectedDriverId === driver.id && (
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : supervisorsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="font-medium">Loading available supervisors...</p>
                  </div>
                ) : supervisors.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 font-medium">No available supervisors</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {supervisors.map((supervisor) => {
                      const name = `${supervisor.firstName} ${supervisor.lastName}`.trim();
                      return (
                        <button
                          type="button"
                          key={supervisor.id}
                          className={`text-left p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] ${selectedSupervisorId === supervisor.id
                            ? "border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200"
                            : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
                            }`}
                          onClick={() => handleSelectSupervisor(supervisor.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${selectedSupervisorId === supervisor.id ? "bg-purple-100" : "bg-purple-100"
                                }`}>
                                <User className={`w-6 h-6 ${selectedSupervisorId === supervisor.id ? "text-purple-600" : "text-purple-600"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{name}</p>
                                <p className="text-xs text-gray-600 truncate mt-0.5">{supervisor.email}</p>
                                <p className="text-xs text-gray-500 mt-1">📞 {supervisor.phoneNumber}</p>
                              </div>
                            </div>
                            {selectedSupervisorId === supervisor.id && (
                              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeAssignDriverModal}
                  className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={assignTab === "driver" ? handleAssignDriver : handleAssignSupervisor}
                  disabled={assignButtonDisabled}
                  className="px-6 py-2.5 bg-yellow-400 text-white rounded-xl hover:bg-yellow-500 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
                >
                  {assignLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {assignButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
