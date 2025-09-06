
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

import { CreateVehicleRequest, VehicleFormErrors } from '@/types/vehicle';
import vehicleService from '@/services/vehicleService';



export default function CreateVehicleForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    licensePlate: '',
    capacity: 16,
    status: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<VehicleFormErrors>>({});
  const [apiError, setApiError] = useState<string>('');

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '2', label: 'Inactive' },
    { value: '3', label: 'Maintenance' }
  ];

  const capacityOptions = [
    { value: '16', label: '16 seats' },
    { value: '24', label: '24 seats' },
    { value: '32', label: '32 seats' }
  ];

  const handleInputChange = (field: keyof CreateVehicleRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleFormErrors> = {};


    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }else {
      const licensePlateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}(\.[0-9]{2})?$/;
      
      if (!licensePlateRegex.test(formData.licensePlate.trim())) {
        newErrors.licensePlate = 'Invalid Vietnam license plate format (e.g., 43A-12345 or 30F-123.45)';
      }
    }
    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
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
      const response = await vehicleService.createVehicle(formData);
      console.log('create vehicle response: ', response)

      if (response.success) {
        router.push('/admin/vehicle');
        console.log('Vehicle created successfully');
      } else {
        setApiError('Failed to create vehicle');
      }
    } catch {
      setApiError('Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/vehicle');
  };

  return (
    <Card title="Create New Vehicle" className="bg-[#fefce8]">
      <div className="p-6 bg-[#fefce8]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* License Plate */}
          <div>
            <Input
              label="License Plate Number"
              placeholder="e.g., 30H-99999"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value)}
              error={errors.licensePlate}
              required
            />
          </div>

          {/* Capacity */}
          <div>
            <Select
              label="Vehicle Capacity"
              value={formData.capacity.toString()}
              options={capacityOptions}
              onChange={(value) => handleInputChange('capacity', parseInt(value))}
              error={errors.capacity}
              required
            />
          </div>

          {/* Status */}
          <div>
            <Select
              label="Vehicle Status"
              value={formData.status.toString()}
              options={statusOptions}
              onChange={(value) => handleInputChange('status', parseInt(value))}
              error={errors.status}
              required
            />
          </div>

          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 text-sm">{apiError}</p>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#fad23c] text-gray-700 font-semibold rounded-full shadow-lg hover:bg-[#fad23c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Create Vehicle
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}