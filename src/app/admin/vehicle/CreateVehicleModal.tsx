"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import vehicleService from "@/services/vehicleService";
import {
  CreateVehicleRequest,
  VehicleFormErrors,
} from "@/types/vehicle";

interface CreateVehicleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateVehicleModal({
  onClose,
  onSuccess,
}: CreateVehicleModalProps) {
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    licensePlate: "",
    capacity: 16,
    status: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<VehicleFormErrors>>({});
  const [apiError, setApiError] = useState<string>("");

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" },
    { value: "3", label: "Maintenance" },
  ];

  const capacityOptions = [
    { value: "16", label: "16 seats" },
    { value: "24", label: "24 seats" },
    { value: "32", label: "32 seats" },
  ];

  const handleInputChange = (
    field: keyof CreateVehicleRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleFormErrors> = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = "License plate is required";
    } else {
      const licensePlateRegex =
        /^[0-9]{2}[A-Z]-[0-9]{4,5}(\.[0-9]{2})?$/;

      if (!licensePlateRegex.test(formData.licensePlate.trim())) {
        newErrors.licensePlate =
          "Invalid Vietnam license plate format (e.g., 43A-12345 or 30F-123.45)";
      }
    }

    if (formData.capacity < 1) {
      newErrors.capacity = "Capacity must be greater than 0";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setApiError("");
      await vehicleService.createVehicle(formData);
      onSuccess();
    } catch (err: unknown) {
      const error = err as Error;
      // Try to parse validation errors from message JSON
      try {
        const validationErrors = JSON.parse(error.message) as VehicleFormErrors;
        setErrors(validationErrors);
      } catch {
        setApiError(error.message || "Failed to create vehicle");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-2xl bg-[#fefce8] shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create New Vehicle
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close create vehicle modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          <div>
            <Input
              label="License Plate Number"
              placeholder="e.g., 30H-99999"
              value={formData.licensePlate}
              onChange={(e) =>
                handleInputChange("licensePlate", e.target.value)
              }
              error={errors.licensePlate}
              required
            />
          </div>

          <div>
            <Select
              label="Vehicle Capacity"
              value={formData.capacity.toString()}
              options={capacityOptions}
              onChange={(value) =>
                handleInputChange("capacity", parseInt(value, 10))
              }
              error={errors.capacity}
              required
            />
          </div>

          <div>
            <Select
              label="Vehicle Status"
              value={formData.status.toString()}
              options={statusOptions}
              onChange={(value) =>
                handleInputChange("status", parseInt(value, 10))
              }
              error={errors.status}
              required
            />
          </div>

          {apiError && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-[#fad23c] px-6 py-2 text-sm font-semibold text-gray-800 shadow-md transition hover:bg-[#ffe472] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


