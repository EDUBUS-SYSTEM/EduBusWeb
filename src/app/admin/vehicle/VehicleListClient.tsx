// src/app/admin/vehicle/VehicleListClient.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { VehicleDto, VehicleFilters } from "@/types/vehicle";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import Link from "next/link";
import vehicleService from "@/services/vehicleService";
import type { Driver } from "@/services/driverService";

const PER_PAGE = 5;

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

  const searchFilters = useMemo(() => {
    const result = {
      ...filters,
      search: debouncedSearch || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
    };
    return result;
  }, [filters, debouncedSearch, selectedStatus]);

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
    setSelectedDriverId("");
    await fetchAvailableDrivers(vehicleId /*, startDate, endDate*/);
  }, [fetchAvailableDrivers]);

  const closeAssignDriverModal = useCallback(() => {
    setShowAssignDriverModal(null);
    setSelectedDriverId("");
  }, []);

  const handleSelectDriver = useCallback((driverId: string) => {
    setSelectedDriverId(driverId);
  }, []);

  const handleAssignDriver = useCallback(async () => {
    if (!selectedDriverId || !showAssignDriverModal) return;

    try {
      setAssignLoading(true);
      await vehicleService.assignDriver(showAssignDriverModal, {
        driverId: selectedDriverId,
        isPrimaryDriver: true,
        startTimeUtc: new Date().toISOString(),
        endTimeUtc: undefined, // No end time - permanent assignment
      });

      closeAssignDriverModal();
      // Optionally refresh the vehicle list or show success message
    } catch (error) {
      console.error("Error assigning driver:", error);
      // TODO: Show error message to user
    } finally {
      setAssignLoading(false);
    }
  }, [selectedDriverId, showAssignDriverModal, closeAssignDriverModal]);

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
    if (useClientSearch) {
      fetchAllVehicles();
    }
  }, [useClientSearch, selectedStatus, debouncedSearch, fetchAllVehicles]);

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
          <Link
            href="/admin/vehicle/create"
            className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition"
            aria-label="Add vehicle"
          >
            <Plus className="w-5 h-5" />
          </Link>
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
                          <Link
                            href={`/admin/vehicle/update/${vehicle.id}`}
                            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                            aria-label="Edit vehicle"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Assign Driver to Vehicle
                </h3>
                <p className="text-sm text-gray-500">
                  Select a driver to assign to this vehicle
                </p>
              </div>
            </div>

            {driversLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading drivers...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriverId === driver.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectDriver(driver.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {driver.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {driver.phoneNumber}
                          </p>
                          {driver.licenseNumber && (
                            <p className="text-sm text-gray-500">
                              License: {driver.licenseNumber}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Status: {driver.status}
                          </p>
                        </div>
                      </div>
                      {selectedDriverId === driver.id && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={closeAssignDriverModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriverId || assignLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {assignLoading ? "Assigning..." : "Assign Driver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
