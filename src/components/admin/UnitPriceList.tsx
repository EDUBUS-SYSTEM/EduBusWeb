"use client";
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from "react-icons/fa";
import { UnitPrice } from "@/types/unitPrice";
import { unitPriceService } from "@/services/unitPriceService";
import CreateUnitPriceModal from "@/components/admin/CreateUnitPriceModal";
import EditUnitPriceModal from "@/components/admin/EditUnitPriceModal";

export default function UnitPriceList() {
  const [unitPrices, setUnitPrices] = useState<UnitPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<UnitPrice | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUnitPrices();
  }, [showDeleted, refreshTrigger]);

  const loadUnitPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = showDeleted 
        ? await unitPriceService.getAllIncludingDeleted()
        : await unitPriceService.getAllUnitPrices();
      setUnitPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load unit prices");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (unitPrice: UnitPrice) => {
    setSelectedUnitPrice(unitPrice);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit price?")) return;
    
    try {
      await unitPriceService.deleteUnitPrice(id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete unit price");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await unitPriceService.deactivateUnitPrice(id);
      } else {
        await unitPriceService.activateUnitPrice(id);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle unit price status");
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedUnitPrice(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isCurrentlyEffective = (unitPrice: UnitPrice) => {
    const now = new Date();
    const effectiveFrom = new Date(unitPrice.effectiveFrom);
    const effectiveTo = unitPrice.effectiveTo ? new Date(unitPrice.effectiveTo) : null;
    
    return unitPrice.isActive && 
           !unitPrice.isDeleted && 
           effectiveFrom <= now && 
           (!effectiveTo || effectiveTo >= now);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#463B3B]">Unit Price Management</h1>
          <p className="text-[#6B7280]">Manage transportation pricing per kilometer</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showDeleted 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? <FaEyeSlash /> : <FaEye />}
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
          <button
            onClick={handleCreate}
            className="bg-[#fad23c] text-[#463B3B] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#e6c435] transition-colors"
          >
            <FaPlus /> Add Unit Price
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Unit Prices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Km
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unitPrices.map((unitPrice) => (
                <tr key={unitPrice.id} className={unitPrice.isDeleted ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{unitPrice.name}</div>
                      {unitPrice.description && (
                        <div className="text-sm text-gray-500">{unitPrice.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(unitPrice.pricePerKm)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>From: {formatDate(unitPrice.effectiveFrom)}</div>
                      {unitPrice.effectiveTo && (
                        <div>To: {formatDate(unitPrice.effectiveTo)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        unitPrice.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unitPrice.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {isCurrentlyEffective(unitPrice) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Currently Effective
                        </span>
                      )}
                      {unitPrice.isDeleted && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Deleted
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unitPrice.byAdminName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(unitPrice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      {!unitPrice.isDeleted && (
                        <>
                          <button
                            onClick={() => handleToggleActive(unitPrice.id, unitPrice.isActive)}
                            className={unitPrice.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                            title={unitPrice.isActive ? "Deactivate" : "Activate"}
                          >
                            {unitPrice.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button
                            onClick={() => handleDelete(unitPrice.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {unitPrices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No unit prices found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUnitPriceModal
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}

      {showEditModal && selectedUnitPrice && (
        <EditUnitPriceModal
          unitPrice={selectedUnitPrice}
          onClose={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
}
