"use client";
import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { unitPriceService } from "@/services/unitPriceService";
import { CreateUnitPriceDto, UnitPriceResponseDto } from "@/types/unitPrice";

interface CreateUnitPriceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUnitPriceModal({ onClose, onSuccess }: CreateUnitPriceModalProps) {
  const [formData, setFormData] = useState<CreateUnitPriceDto>({
    name: "",
    description: "",
    pricePerKm: 0,
    effectiveFrom: "",
    effectiveTo: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingUnitPrices, setExistingUnitPrices] = useState<UnitPriceResponseDto[]>([]);

  // Load existing unit prices on component mount
  useEffect(() => {
    const loadExistingPrices = async () => {
      try {
        const data = await unitPriceService.getAllUnitPrices();
        setExistingUnitPrices(data || []);
      } catch (error) {
        console.error("Error loading existing unit prices:", error);
        setExistingUnitPrices([]);
      }
    };
    loadExistingPrices();
  }, []);

  // Get the minimum allowed date for effectiveFrom (after the latest end date of existing active unit prices)
  const getMinEffectiveFromDate = () => {
    const activeUnitPrices = existingUnitPrices.filter(up => up.isActive);
    
    if (activeUnitPrices.length === 0) {
      return new Date().toISOString().split('T')[0]; // Today if no active unit prices
    }

    // Find the latest end date among active unit prices
    const latestEndDate = activeUnitPrices.reduce((latest, up) => {
      if (up.effectiveTo) {
        const endDate = new Date(up.effectiveTo);
        return endDate > latest ? endDate : latest;
      }
      // If unit price has no end date (ongoing), return a far future date
      return new Date('2099-12-31');
    }, new Date('1900-01-01'));

    // Return the day after the latest end date
    const minDate = new Date(latestEndDate);
    minDate.setDate(minDate.getDate() + 1);
    
    return minDate.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service package name is required";
    }

    if (!formData.pricePerKm || formData.pricePerKm < 1000 || formData.pricePerKm > 1000000) {
      newErrors.pricePerKm = "Price per KM must be between 1,000 and 1,000,000 VND";
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }

    if (formData.effectiveTo && formData.effectiveTo <= formData.effectiveFrom) {
      newErrors.effectiveTo = "Effective to date must be after effective from date";
    }

    // Check for overlapping date ranges with existing unit prices
    if (formData.effectiveFrom) {
      const hasOverlap = existingUnitPrices.some(existing => {
        const existingFrom = new Date(existing.effectiveFrom);
        const existingTo = existing.effectiveTo ? new Date(existing.effectiveTo) : null;
        const newFrom = new Date(formData.effectiveFrom);
        const newTo = formData.effectiveTo ? new Date(formData.effectiveTo) : null;

        // Check if new period overlaps with existing period
        if (newTo) {
          // New period has end date
          return (existingTo ? newFrom <= existingTo : true) && 
                 (newTo >= existingFrom) && 
                 existing.isActive;
        } else {
          // New period has no end date (ongoing)
          return (existingTo ? newFrom <= existingTo : true) && existing.isActive;
        }
      });

      if (hasOverlap) {
        newErrors.effectiveFrom = "This date range overlaps with an existing active unit price";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await unitPriceService.createUnitPrice(formData);
      onSuccess();
    } catch (error) {
      console.error("Error creating unit price:", error);
      alert("Failed to create unit price");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUnitPriceDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#463B3B]">Create Unit Price</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Package Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Package Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter service package name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter description (optional)"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Price per KM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per KM (VND) *
            </label>
            <input
              type="number"
              step="1000"
              min="1000"
              max="1000000"
              value={formData.pricePerKm}
              onChange={(e) => handleInputChange("pricePerKm", parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.pricePerKm ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter price per kilometer (1,000 - 1,000,000)"
            />
            {errors.pricePerKm && (
              <p className="mt-1 text-sm text-red-600">{errors.pricePerKm}</p>
            )}
          </div>

          {/* Effective From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective From *
            </label>
            <input
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => handleInputChange("effectiveFrom", e.target.value)}
              min={getMinEffectiveFromDate()}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.effectiveFrom ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.effectiveFrom && (
              <p className="mt-1 text-sm text-red-600">{errors.effectiveFrom}</p>
            )}
            {existingUnitPrices.filter(up => up.isActive).length > 0 && !errors.effectiveFrom && (
              <p className="mt-1 text-sm text-gray-500">
                Must be after the latest end date of existing active unit prices
              </p>
            )}
          </div>

          {/* Effective To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective To (Optional)
            </label>
            <input
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => handleInputChange("effectiveTo", e.target.value)}
              min={formData.effectiveFrom || new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.effectiveTo ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.effectiveTo && (
              <p className="mt-1 text-sm text-red-600">{errors.effectiveTo}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Unit Price"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
