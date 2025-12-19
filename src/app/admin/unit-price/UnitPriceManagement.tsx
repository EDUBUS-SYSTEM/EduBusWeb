"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye } from "react-icons/fa";
import { unitPriceService } from "@/services/unitPriceService";
import { UnitPriceResponseDto, } from "@/types/unitPrice";
import CreateUnitPriceModal from "./CreateUnitPriceModal";
import EditUnitPriceModal from "./EditUnitPriceModal";
import UnitPriceDetailModal from "./UnitPriceDetailModal";
import { formatDate } from "@/utils/dateUtils";

export default function UnitPriceManagement() {
  const [unitPrices, setUnitPrices] = useState<UnitPriceResponseDto[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<UnitPriceResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<UnitPriceResponseDto | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUnitPrices();
  }, [refreshTrigger]);

  useEffect(() => {
    if (!unitPrices || !Array.isArray(unitPrices)) {
      setFilteredPrices([]);
      return;
    }

    let filtered = unitPrices;

    if (searchTerm) {
      filtered = filtered.filter(price =>
        price.byAdminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.pricePerKm?.toString().includes(searchTerm)
      );
    }

    if (filterActive !== null) {
      filtered = filtered.filter(price => price.isActive === filterActive);
    }

    setFilteredPrices(filtered);
  }, [unitPrices, searchTerm, filterActive]);

  const loadUnitPrices = async () => {
    try {
      setLoading(true);
      const data = await unitPriceService.getAllUnitPrices();
      setUnitPrices(data || []);
    } catch (error) {
      console.error("Error loading unit prices:", error);
      setUnitPrices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedUnitPrice(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (unitPrice: UnitPriceResponseDto) => {
    setSelectedUnitPrice(unitPrice);
    setShowEditModal(true);
  };

  const handleView = (unitPrice: UnitPriceResponseDto) => {
    setSelectedUnitPrice(unitPrice);
    setShowDetailModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this unit price?")) {
      try {
        await unitPriceService.deleteUnitPrice(id);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Error deleting unit price:", error);
        alert("Failed to delete unit price");
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await unitPriceService.deactivateUnitPrice(id);
      } else {
        await unitPriceService.activateUnitPrice(id);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error toggling unit price status:", error);
      alert("Failed to update unit price status");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <input
                type="text"
                placeholder="Search unit prices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterActive === null
                  ? "bg-[#fad23c] text-[#463B3B]"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              All ({unitPrices?.length || 0})
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterActive === true
                  ? "bg-[#fad23c] text-[#463B3B]"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              Active ({unitPrices?.filter(p => p.isActive).length || 0})
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterActive === false
                  ? "bg-[#fad23c] text-[#463B3B]"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              Inactive ({unitPrices?.filter(p => !p.isActive).length || 0})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus className="w-3 h-3" />
            Add Unit Price
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per KM
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices?.map((unitPrice) => (
                <tr key={unitPrice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {unitPrice.name}
                    </div>
                    {unitPrice.description && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {unitPrice.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(unitPrice.pricePerKm)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(unitPrice.effectiveFrom)}
                      {unitPrice.effectiveTo && (
                        <span className="text-gray-500"> - {formatDate(unitPrice.effectiveTo)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${unitPrice.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {unitPrice.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{unitPrice.byAdminName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(unitPrice)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(unitPrice)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(unitPrice.id, unitPrice.isActive)}
                        className={`transition-colors ${unitPrice.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                          }`}
                        title={unitPrice.isActive ? "Deactivate" : "Activate"}
                      >
                        {unitPrice.isActive ? (
                          <FaToggleOn className="w-4 h-4" />
                        ) : (
                          <FaToggleOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(unitPrice.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!filteredPrices || filteredPrices.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No unit prices found</div>
            <div className="text-gray-400 text-sm mt-2">
              {searchTerm || filterActive !== null
                ? "Try adjusting your search or filter criteria"
                : "Create your first unit price to get started"}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUnitPriceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedUnitPrice && (
        <EditUnitPriceModal
          unitPrice={selectedUnitPrice}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnitPrice(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDetailModal && selectedUnitPrice && (
        <UnitPriceDetailModal
          unitPrice={selectedUnitPrice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUnitPrice(null);
          }}
        />
      )}
    </div>
  );
}
