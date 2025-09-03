// src/app/admin/vehicle/VehicleListClient.tsx
'use client';

import { useState, useEffect } from "react";

import { VehicleDto, VehicleFilters } from "@/types/vehicle";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { Plus, Search } from "lucide-react";

import Link from "next/link";
import vehicleService from "@/services/vehicleService";

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

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchFilters = {
        ...filters,
        search: searchTerm.trim() || undefined,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      };
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
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters, searchTerm, selectedStatus]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setFilters(prev => ({ ...prev, page: 1 })); // reset về trang 1 khi search
  };

  const handleRefresh = () => {
    fetchVehicles();
  };

  if (loading) {
    return (
      <Card title="Vehicle List" className="bg-yellow-50 border-yellow-100 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading vehicles...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Vehicle List" className="bg-yellow-50 border-yellow-100 rounded-xl">
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
    );
  }

  return (
    <Card
      title="Vehicle List"
      className="bg-yellow-50 border-yellow-100 rounded-xl transition-none hover:scale-100 hover:shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
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
        <div className="overflow-auto max-h-[360px]">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left font-semibold px-6 py-4 w-16">STT</th>
                <th className="text-left font-semibold px-6 py-4">License Plate Number</th>
                <th className="text-left font-semibold px-6 py-4">Capacity</th>
                <th className="text-left font-semibold px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, i) => (
                  <tr
                    key={vehicle.id}
                    className="border-t border-gray-100 hover:bg-[#facc15] hover:bg-opacity-20 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 text-gray-600">
                      {(filters.page! - 1) * PER_PAGE + i + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{vehicle.licensePlate}</td>
                    <td className="px-6 py-4 text-gray-700">{vehicle.capacity}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {vehicles.length > 0 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={Math.ceil(vehicles.length / PER_PAGE)}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}
    </Card>
  );
}
