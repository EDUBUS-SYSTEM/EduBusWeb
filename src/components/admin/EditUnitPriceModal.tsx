"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { UnitPrice, UpdateUnitPriceRequest } from "@/types/unitPrice";
import { unitPriceService } from "@/services/unitPriceService";

interface EditUnitPriceModalProps {
  unitPrice: UnitPrice;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUnitPriceModal({ unitPrice, onClose, onSuccess }: EditUnitPriceModalProps) {
  const [formData, setFormData] = useState<UpdateUnitPriceRequest>({
    id: unitPrice.id,
    name: unitPrice.name,
    description: unitPrice.description,
    pricePerKm: unitPrice.pricePerKm,
    effectiveFrom: unitPrice.effectiveFrom.split('T')[0],
    effectiveTo: unitPrice.effectiveTo ? unitPrice.effectiveTo.split('T')[0] : undefined,
    isActive: unitPrice.isActive,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'pricePerKm' ? parseFloat(value) || 0 : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length > 200) {
      errors.name = "Name cannot exceed 200 characters";
    }

    if (formData.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    if (formData.pricePerKm <= 0) {
      errors.pricePerKm = "Price per km must be greater than 0";
    } else if (formData.pricePerKm < 1000) {
      errors.pricePerKm = "Price per km must be at least 1,000 VND";
    } else if (formData.pricePerKm > 1000000) {
      errors.pricePerKm = "Price per km cannot exceed 1,000,000 VND";
    }

    if (!formData.effectiveFrom) {
      errors.effectiveFrom = "Effective from date is required";
    }

    if (formData.effectiveTo && formData.effectiveTo <= formData.effectiveFrom) {
      errors.effectiveTo = "Effective end date must be after effective start date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        effectiveTo: formData.effectiveTo || undefined,
      };
      
      await unitPriceService.updateUnitPrice(submitData);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message);
          if (typeof errorData === 'object') {
            setValidationErrors(errorData);
          } else {
            setError(err.message);
          }
        } catch {
          setError(err.message);
        }
      } else {
        setError("Failed to update unit price");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#463B3B]">Edit Unit Price</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Unit Price Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">{formatDate(unitPrice.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created By:</span>
              <span className="ml-2 text-gray-600">{unitPrice.byAdminName}</span>
            </div>
            {unitPrice.updatedAt && (
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">{formatDate(unitPrice.updatedAt)}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                unitPrice.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {unitPrice.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter unit price name"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                validationErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter description (optional)"
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="pricePerKm" className="block text-sm font-medium text-gray-700 mb-1">
              Price per Kilometer (VND) *
            </label>
            <input
              type="number"
              id="pricePerKm"
              name="pricePerKm"
              value={formData.pricePerKm}
              onChange={handleInputChange}
              min="1000"
              max="1000000"
              step="1000"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                validationErrors.pricePerKm ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter price per kilometer"
            />
            {formData.pricePerKm > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(formData.pricePerKm)}
              </p>
            )}
            {validationErrors.pricePerKm && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.pricePerKm}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="effectiveFrom" className="block text-sm font-medium text-gray-700 mb-1">
                Effective From *
              </label>
              <input
                type="date"
                id="effectiveFrom"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                  validationErrors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.effectiveFrom && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.effectiveFrom}</p>
              )}
            </div>

            <div>
              <label htmlFor="effectiveTo" className="block text-sm font-medium text-gray-700 mb-1">
                Effective To (Optional)
              </label>
              <input
                type="date"
                id="effectiveTo"
                name="effectiveTo"
                value={formData.effectiveTo || ""}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                  validationErrors.effectiveTo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.effectiveTo && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.effectiveTo}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#fad23c] focus:ring-[#fad23c] border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#e6c435] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#463B3B]"></div>
              ) : (
                <FaSave />
              )}
              {loading ? 'Updating...' : 'Update Unit Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
