// src/app/admin/vehicle/VehicleListClient.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { VehicleDto, VehicleFilters } from "@/types/vehicle";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import Link from "next/link";
import vehicleService from "@/services/vehicleService";
import driverService, { Driver } from "@/services/driverService";

const PER_PAGE = 20;

function StatusBadge({ status }: { status: "Active" | "Inactive" | "Maintenance" }) {
  const map = {
    Active: {
      dot: "bg-emerald-500",
      text: "text-emerald-600"
    },
    Inactive: {
      dot: "bg-red-500",
      text: "text-red-600"
    },
    Maintenance: {
      dot: "bg-amber-500",
      text: "text-amber-600"
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

export default function VehicleListClient() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filters, setFilters] = useState<VehicleFilters>({
    page: 1,
    perPage: PER_PAGE,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Delete states
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Driver assignment states
  const [showAssignDriverModal, setShowAssignDriverModal] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');

  const searchFilters = useMemo(() => ({
    ...filters,
    search: searchTerm.trim() || undefined,
    status: selectedStatus === 'all' ? undefined : selectedStatus
  }), [filters, searchTerm, selectedStatus]);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleService.getVehicles(searchFilters);
      if (response.success) {
        setVehicles(response.data);
      } else {
        setError(response.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [searchFilters]);

  const fetchDrivers = useCallback(async () => {
    try {
      setDriversLoading(true);
      const response = await driverService.getDrivers();
      if (response.success) {
        setDrivers(response.data);
      } else {
        console.error('Failed to fetch drivers:', response.message);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setDriversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => {
      if (prev.page === page) return prev;
      return { ...prev, page };
    });
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(status);
    setFilters(prev => {
      if (prev.page === 1) return prev;
      return { ...prev, page: 1 };
    });
  }, []);

  const handleSearch = useCallback((searchValue: string) => {
    setSearchTerm(searchValue);
    setFilters(prev => {
      if (prev.page === 1) return prev;
      return { ...prev, page: 1 };
    });
  }, []);

  const handleRefresh = useCallback(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Delete functions
  const handleDelete = useCallback(async (vehicleId: string) => {
    try {
      setDeleteLoading(vehicleId);
      await vehicleService.deleteVehicle(vehicleId);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
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
    setSelectedDriverId('');
    await fetchDrivers(); // Fetch fresh driver data
  }, [fetchDrivers]);

  const closeAssignDriverModal = useCallback(() => {
    setShowAssignDriverModal(null);
    setSelectedDriverId('');
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
        endTimeUtc: undefined // No end time - permanent assignment
      });
      
      closeAssignDriverModal();
      // Optionally refresh the vehicle list or show success message
    } catch (error) {
      console.error('Error assigning driver:', error);
      // TODO: Show error message to user
    } finally {
      setAssignLoading(false);
    }
  }, [selectedDriverId, showAssignDriverModal, closeAssignDriverModal]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] p-4 md:p-6">
        <Card title="Vehicle List" className="bg-[#FEFCE8] border-yellow-100 rounded-xl">
          <div className="flex items-center justify-center py-6 md:py-8">
            <div className="text-sm md:text-base text-gray-500">Loading vehicles...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FEFCE8] p-4 md:p-6">
        <Card title="Vehicle List" className="bg-[#FEFCE8] border-yellow-100 rounded-xl">
          <div className="flex flex-col items-center justify-center py-6 md:py-8 gap-4">
            <div className="text-sm md:text-base text-red-500">Error: {error}</div>
            <button
              onClick={handleRefresh}
              className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFCE8] p-4 md:p-6">
      <Card title="Vehicle List" className="bg-[#FEFCE8] border-yellow-100 rounded-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex-1 w-full">
            <Input
              placeholder="Find by license plate number"
              value={searchTerm}
              leftIcon={<Search className="w-4 h-4 md:w-5 md:h-5" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
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
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition"
            aria-label="Add vehicle"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left font-semibold px-3 md:px-6 py-3 md:py-4 w-12 md:w-16">
                    <span className="hidden sm:inline">STT</span>
                    <span className="sm:hidden">#</span>
                  </th>
                  <th className="text-left font-semibold px-3 md:px-6 py-3 md:py-4">
                    <span className="hidden sm:inline">License Plate Number</span>
                    <span className="sm:hidden">License</span>
                  </th>
                  <th className="text-left font-semibold px-3 md:px-6 py-3 md:py-4">
                    <span className="hidden sm:inline">Capacity</span>
                    <span className="sm:hidden">Cap</span>
                  </th>
                  <th className="text-left font-semibold px-3 md:px-6 py-3 md:py-4">Status</th>
                  <th className="text-left font-semibold px-3 md:px-6 py-3 md:py-4 w-24 md:w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 md:px-6 py-6 md:py-8 text-center text-gray-500 text-sm md:text-base">
                      No vehicles found
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle, i) => (
                    <tr key={vehicle.id} className="border-t border-gray-100">
                      <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm">
                        {(filters.page! - 1) * PER_PAGE + i + 1}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-xs md:text-sm">{vehicle.licensePlate}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-gray-700 text-xs md:text-sm">{vehicle.capacity}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-1 md:gap-2">
                          <button
                            onClick={() => openAssignDriverModal(vehicle.id)}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
                            aria-label="Assign driver"
                          >
                            <User className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          <Link
                            href={`/admin/vehicle/update/${vehicle.id}`}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
                            aria-label="Edit vehicle"
                          >
                            <Edit className="w-3 h-3 md:w-4 md:h-4" />
                          </Link>
                          <button
                            onClick={() => confirmDelete(vehicle.id)}
                            disabled={deleteLoading === vehicle.id}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete vehicle"
                          >
                            {deleteLoading === vehicle.id ? (
                              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
        {vehicles.length > 0 && (
          <div className="mt-4 md:mt-6 flex justify-center">
            <Pagination
              currentPage={filters.page || 1}
              totalPages={Math.ceil(vehicles.length / PER_PAGE)}
              onPageChange={handlePageChange}
              className=""
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Delete Vehicle</h3>
                <p className="text-xs md:text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
              Are you sure you want to delete this vehicle? This will permanently remove it from the system.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteLoading === showDeleteConfirm}
                className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {deleteLoading === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Assign Driver to Vehicle</h3>
                <p className="text-xs md:text-sm text-gray-500">Select a driver to assign to this vehicle</p>
              </div>
            </div>

            {driversLoading ? (
              <div className="flex items-center justify-center py-6 md:py-8">
                <div className="text-sm md:text-base text-gray-500">Loading drivers...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDriverId === driver.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectDriver(driver.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm md:text-base">{driver.firstName} {driver.lastName}</p>
                          <p className="text-xs md:text-sm text-gray-500">{driver.email}</p>
                          <p className="text-xs md:text-sm text-gray-500">Phone: {driver.phoneNumber}</p>
                          {driver.licenseNumber && (
                            <p className="text-xs md:text-sm text-gray-500">License: {driver.licenseNumber}</p>
                          )}
                          <p className="text-xs md:text-sm text-gray-500">Status: {driver.status}</p>
                        </div>
                      </div>
                      {selectedDriverId === driver.id && (
                        <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
              <button
                onClick={closeAssignDriverModal}
                className="px-3 md:px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriverId || assignLoading}
                className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm md:text-base"
              >
                {assignLoading ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
