"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { CreateUnitPriceRequest, UnitPrice } from "@/types/unitPrice";
import { unitPriceService } from "@/services/unitPriceService";

interface CreateUnitPriceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUnitPriceModal({ onClose, onSuccess }: CreateUnitPriceModalProps) {
  const [formData, setFormData] = useState<CreateUnitPriceRequest>({
    name: "",
    description: "",
    pricePerKm: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [existingUnitPrices, setExistingUnitPrices] = useState<UnitPrice[]>([]);
  const [minEffectiveFrom, setMinEffectiveFrom] = useState<string>("");

  // Load existing unit prices and calculate minimum effective from date
  useEffect(() => {
    const loadExistingUnitPrices = async () => {
      try {
        const unitPrices = await unitPriceService.getAllUnitPrices();
        setExistingUnitPrices(unitPrices);
        
        // Find the latest end date among existing unit prices
        let latestEndDate = "";
        unitPrices.forEach(price => {
          if (price.effectiveTo && price.effectiveTo > latestEndDate) {
            latestEndDate = price.effectiveTo;
          }
        });
        
        // If there are existing unit prices, set min date to the day after the latest end date
        if (latestEndDate) {
          const nextDay = new Date(latestEndDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setMinEffectiveFrom(nextDay.toISOString().split('T')[0]);
          
          // Update form data if current effectiveFrom is before the minimum
          if (formData.effectiveFrom < nextDay.toISOString().split('T')[0]) {
            setFormData(prev => ({
              ...prev,
              effectiveFrom: nextDay.toISOString().split('T')[0]
            }));
          }
        } else {
          // If no existing unit prices, allow any date from today
          setMinEffectiveFrom(new Date().toISOString().split('T')[0]);
        }
      } catch (error) {
        console.error('Failed to load existing unit prices:', error);
        // Fallback to today's date
        setMinEffectiveFrom(new Date().toISOString().split('T')[0]);
      }
    };

    loadExistingUnitPrices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pricePerKm' ? parseFloat(value) || 0 : value
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
    } else if (minEffectiveFrom && formData.effectiveFrom < minEffectiveFrom) {
      errors.effectiveFrom = `Effective from date must be after ${minEffectiveFrom} (end date of previous unit price)`;
    }

    if (formData.effectiveTo) {
      if (formData.effectiveTo <= formData.effectiveFrom) {
        errors.effectiveTo = "Effective end date must be after effective start date";
      } else if (minEffectiveFrom && formData.effectiveTo < minEffectiveFrom) {
        errors.effectiveTo = `Effective end date must be after ${minEffectiveFrom} (end date of previous unit price)`;
      }
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
      
      await unitPriceService.createUnitPrice(submitData);
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
        setError("Failed to create unit price");
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#463B3B]">Create New Unit Price</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
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
                min={minEffectiveFrom}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                  validationErrors.effectiveFrom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {minEffectiveFrom && (
                <p className="text-sm text-blue-600 mt-1">
                  ⚠️ Start date must be after the end date of previous unit price ({minEffectiveFrom})
                </p>
              )}
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
                min={minEffectiveFrom}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fad23c] ${
                  validationErrors.effectiveTo ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {minEffectiveFrom && (
                <p className="text-sm text-blue-600 mt-1">
                  ⚠️ End date must be after the end date of previous unit price ({minEffectiveFrom})
                </p>
              )}
              {validationErrors.effectiveTo && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.effectiveTo}</p>
              )}
            </div>
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
              {loading ? 'Creating...' : 'Create Unit Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
