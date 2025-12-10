"use client";
import { useState } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { multiStudentPolicyService } from "@/services/multiStudentPolicyService";
import { MultiStudentPolicyResponseDto, UpdateMultiStudentPolicyDto, UpdatePolicyTierDto } from "@/types/multiStudentPolicy";
import { useAuth } from "@/hooks/useAuth";
import { getUserIdFromToken } from "@/lib/jwt";
import { jwtDecode } from "jwt-decode";

interface EditPolicyModalProps {
  policy: MultiStudentPolicyResponseDto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPolicyModal({ policy, onClose, onSuccess }: EditPolicyModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<UpdateMultiStudentPolicyDto>({
    id: policy.id,
    name: policy.name,
    description: policy.description,
    isActive: policy.isActive,
    effectiveFrom: policy.effectiveFrom.split('T')[0],
    effectiveTo: policy.effectiveTo ? policy.effectiveTo.split('T')[0] : "",
    tiers: policy.tiers.map(tier => ({
      id: tier.id,
      minStudentCount: tier.minStudentCount,
      maxStudentCount: tier.maxStudentCount,
      reductionPercentage: tier.reductionPercentage,
      description: tier.description,
      priority: tier.priority
    }))
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tierErrors, setTierErrors] = useState<Record<number, Record<string, string>>>({});
  const [apiError, setApiError] = useState<string>("");

  // Get admin info from token and auth context
  const getAdminInfo = () => {
    try {
      // Get user ID from JWT token
      const token = typeof globalThis.window !== "undefined" ? localStorage.getItem("token") : null;
      let adminId = "";
      
      if (token) {
        const userIdFromToken = getUserIdFromToken(token);
        if (userIdFromToken) {
          adminId = userIdFromToken;
        }
      }

      // Get admin name from auth context or token
      let adminName = "Admin";
      if (user?.name) {
        adminName = user.name;
      } else if (token) {
        try {
          // Try to decode email from token as fallback
          const decoded = jwtDecode<{ email?: string }>(token);
          if (decoded.email) {
            adminName = decoded.email;
          }
        } catch {
          // Ignore decode errors
        }
      }

      return {
        byAdminId: adminId || "00000000-0000-0000-0000-000000000000",
        byAdminName: adminName
      };
    } catch (error) {
      console.error("Error getting admin info:", error);
      return {
        byAdminId: "00000000-0000-0000-0000-000000000000",
        byAdminName: "Admin"
      };
    }
  };

  const addTier = () => {
    const newTier: UpdatePolicyTierDto = {
      minStudentCount: 2,
      maxStudentCount: undefined,
      reductionPercentage: 0,
      description: "",
      priority: formData.tiers.length + 1
    };
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index).map((tier, i) => ({
        ...tier,
        priority: i + 1
      }))
    }));
    const newTierErrors = { ...tierErrors };
    delete newTierErrors[index];
    setTierErrors(newTierErrors);
  };

  const updateTier = (index: number, field: keyof UpdatePolicyTierDto, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
    if (tierErrors[index]?.[field]) {
      const newTierErrors = { ...tierErrors };
      if (newTierErrors[index]) {
        delete newTierErrors[index][field];
      }
      setTierErrors(newTierErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newTierErrors: Record<number, Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Policy name is required";
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
    }

    if (formData.effectiveTo && formData.effectiveTo <= formData.effectiveFrom) {
      newErrors.effectiveTo = "Effective to date must be after effective from date";
    }

    if (formData.tiers.length === 0) {
      newErrors.tiers = "At least one tier is required";
    }

    formData.tiers.forEach((tier, index) => {
      const tierError: Record<string, string> = {};

      if (tier.minStudentCount < 2) {
        tierError.minStudentCount = "Minimum student count must be at least 2";
      }

      if (tier.maxStudentCount && tier.maxStudentCount < tier.minStudentCount) {
        tierError.maxStudentCount = "Maximum must be greater than or equal to minimum";
      }

      if (tier.reductionPercentage < 0 || tier.reductionPercentage > 100) {
        tierError.reductionPercentage = "Reduction percentage must be between 0 and 100";
      }

      if (!tier.description.trim()) {
        tierError.description = "Description is required";
      }

      if (tierError && Object.keys(tierError).length > 0) {
        newTierErrors[index] = tierError;
      }
    });

    const sortedTiers = [...formData.tiers].sort((a, b) => a.minStudentCount - b.minStudentCount);
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const current = sortedTiers[i];
      const next = sortedTiers[i + 1];
      const currentMax = current.maxStudentCount || Infinity;
      const nextMin = next.minStudentCount;

      if (currentMax >= nextMin) {
        newErrors.tiers = "Tier ranges cannot overlap";
        break;
      }
    }

    setErrors(newErrors);
    setTierErrors(newTierErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newTierErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      const adminInfo = getAdminInfo();
      await multiStudentPolicyService.updatePolicy({
        ...formData,
        ...adminInfo
      });
      onSuccess();
    } catch (error: unknown) {
      console.error("Error updating policy:", error);
      
      // Parse error response
      const errorResponse = (error as { response?: { data?: unknown } })?.response?.data;
      let errorMessage = "Failed to update policy";
      const newErrors: Record<string, string> = {};
      const newTierErrors: Record<number, Record<string, string>> = {};

      if (errorResponse && typeof errorResponse === 'object') {
        const errResp = errorResponse as Record<string, unknown>;
        // Check for error object with message
        if (errResp.error && typeof errResp.error === 'object') {
          const errorObj = errResp.error as { message?: string };
          if (errorObj.message) {
            errorMessage = errorObj.message;
            
            // Try to parse validation errors from message
            if (errorObj.message.includes("Tier") || errorObj.message.includes("tier")) {
              const tierRegex = /Tier\s*(\d+)/i;
              const tierMatch = tierRegex.exec(errorObj.message);
              if (tierMatch) {
                const tierIndex = Number.parseInt(tierMatch[1] || "0", 10) - 1;
                if (!newTierErrors[tierIndex]) {
                  newTierErrors[tierIndex] = {};
                }
                newTierErrors[tierIndex].general = errorObj.message;
              } else {
                newErrors.tiers = errorObj.message;
              }
            } else if (errorObj.message.includes("overlap") || errorObj.message.includes("Overlap")) {
              newErrors.effectiveFrom = errorObj.message;
            } else {
              setApiError(errorObj.message);
            }
          }
        }
        
        // Check for ModelState errors (ASP.NET Core validation)
        if (errResp.errors && typeof errResp.errors === 'object') {
          const errors = errResp.errors as Record<string, unknown>;
          Object.keys(errors).forEach((key) => {
            const fieldErrors = errors[key];
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              // Handle tier errors (e.g., "Tiers[0].MinStudentCount")
              const tierRegex = /Tiers\[(\d+)\]\.(\w+)/;
              const tierMatch = tierRegex.exec(key);
              if (tierMatch) {
                const tierIndex = Number.parseInt(tierMatch[1] || "0", 10);
                const tierField = (tierMatch[2] || "").charAt(0).toLowerCase() + (tierMatch[2] || "").slice(1);
                if (!newTierErrors[tierIndex]) {
                  newTierErrors[tierIndex] = {};
                }
                const errorMsg = typeof fieldErrors[0] === 'string' ? fieldErrors[0] : String(fieldErrors[0]);
                newTierErrors[tierIndex][tierField] = errorMsg;
              } else {
                // Regular field error
                const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                const errorMsg = typeof fieldErrors[0] === 'string' ? fieldErrors[0] : String(fieldErrors[0]);
                newErrors[fieldName] = errorMsg;
              }
            }
          });
        }
      }

      // Set errors
      if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
      if (Object.keys(newTierErrors).length > 0) {
        setTierErrors(prev => ({ ...prev, ...newTierErrors }));
      }
      if (errorMessage && Object.keys(newErrors).length === 0 && Object.keys(newTierErrors).length === 0) {
        setApiError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateMultiStudentPolicyDto, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#463B3B]">Edit Multi-Student Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-semibold">Error:</span>
                <p className="text-red-700 text-sm flex-1">{apiError}</p>
              </div>
            </div>
          )}

          {/* Policy Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter policy name"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all"
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="w-4 h-4 text-[#fad23c] border-gray-300 rounded focus:ring-[#fad23c]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Policy is Active
            </label>
          </div>

          {/* Effective Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective From *
              </label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => handleInputChange("effectiveFrom", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all ${
                  errors.effectiveFrom ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.effectiveFrom && (
                <p className="mt-1 text-sm text-red-600">{errors.effectiveFrom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective To (Optional)
              </label>
              <input
                type="date"
                value={formData.effectiveTo || ""}
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
          </div>

          {/* Tiers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Policy Tiers *
              </label>
              <button
                type="button"
                onClick={addTier}
                className="px-3 py-1.5 bg-[#fad23c] text-[#463B3B] rounded-lg text-sm font-medium hover:bg-[#FFF085] transition-colors flex items-center gap-2"
              >
                <FaPlus className="w-3 h-3" />
                Add Tier
              </button>
            </div>

            {errors.tiers && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-semibold">{errors.tiers}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.tiers.map((tier, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] border border-[#FDC700]/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#463B3B]">
                      Tier {index + 1} {tier.id && <span className="text-xs text-gray-500">(Existing)</span>}
                    </h4>
                    {formData.tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Tier General Error */}
                  {tierErrors[index]?.general && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-700">{tierErrors[index].general}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Students *
                      </label>
                      <input
                        type="number"
                        min="2"
                        value={tier.minStudentCount}
                        onChange={(e) => updateTier(index, "minStudentCount", parseInt(e.target.value) || 2)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all text-sm ${
                          tierErrors[index]?.minStudentCount ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {tierErrors[index]?.minStudentCount && (
                        <p className="mt-1 text-xs text-red-600">{tierErrors[index].minStudentCount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Students (Optional)
                      </label>
                      <input
                        type="number"
                        min={tier.minStudentCount}
                        value={tier.maxStudentCount || ""}
                        onChange={(e) => updateTier(index, "maxStudentCount", e.target.value ? parseInt(e.target.value) : undefined)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all text-sm ${
                          tierErrors[index]?.maxStudentCount ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="No limit"
                      />
                      {tierErrors[index]?.maxStudentCount && (
                        <p className="mt-1 text-xs text-red-600">{tierErrors[index].maxStudentCount}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reduction % *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={tier.reductionPercentage}
                        onChange={(e) => updateTier(index, "reductionPercentage", parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all text-sm ${
                          tierErrors[index]?.reductionPercentage ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {tierErrors[index]?.reductionPercentage && (
                        <p className="mt-1 text-xs text-red-600">{tierErrors[index].reductionPercentage}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => updateTier(index, "description", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all text-sm ${
                          tierErrors[index]?.description ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., 10% discount for 2 students"
                      />
                      {tierErrors[index]?.description && (
                        <p className="mt-1 text-xs text-red-600">{tierErrors[index].description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
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
              {loading ? "Updating..." : "Update Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

