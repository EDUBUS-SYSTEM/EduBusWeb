'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';
import { UpdateVehicleRequest, VehicleFormErrors } from '@/types/vehicle';
import vehicleService from '@/services/vehicleService';

export default function UpdateVehicleForm() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = (params as { id?: string })?.id as string;

  const [formData, setFormData] = useState<UpdateVehicleRequest>({
    licensePlate: '',
    capacity: 16,
    status: 1,
  });
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Partial<VehicleFormErrors>>({});
  const [apiError, setApiError] = useState<string>('');

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '2', label: 'Inactive' },
    { value: '3', label: 'Maintenance' },
  ];

  const capacityOptions = [
    { value: '16', label: '16 seats' },
    { value: '24', label: '24 seats' },
    { value: '32', label: '32 seats' },
  ];

  useEffect(() => {
    const loadVehicle = async () => {
      if (!vehicleId) return;
      try {
        setFetching(true);
        const res = await vehicleService.getVehicleById(vehicleId);
        if (res.success && res.data) {
          setFormData({
            licensePlate: res.data.licensePlate,
            capacity: res.data.capacity,
            status: mapStatusToNumber(res.data.status),
          });
          setCreatedAt(res.data.createdAt);
          setUpdatedAt(res.data.updatedAt);
        } else {
          setApiError('Failed to load vehicle');
        }
      } catch (e: unknown) {
        const error = e as Error;
        setApiError(error?.message || 'Failed to load vehicle');
      } finally {
        setFetching(false);
      }
    };

    loadVehicle();
  }, [vehicleId]);

  const mapStatusToNumber = (status: string): number => {
    if (status === 'Active') return 1;
    if (status === 'Inactive') return 2;
    if (status === 'Maintenance') return 3;
    return 1;
  };

  const handleInputChange = (field: keyof UpdateVehicleRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleFormErrors> = {};
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else {
      const licensePlateRegex = /^[0-9]{2}[A-Z]-[0-9]{4,5}(\.[0-9]{2})?$/;
      if (!licensePlateRegex.test(formData.licensePlate.trim())) {
        newErrors.licensePlate = 'Invalid Vietnam license plate format (e.g., 43A-12345 or 30F-123.45)';
      }
    }
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be greater than 0';
    if (!formData.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      setApiError('');
      const res = await vehicleService.updateVehicle(vehicleId, formData);
      if (res.success && res.data) {
        router.push('/admin/vehicle');
      } else {
        setApiError('Failed to update vehicle');
      }
    } catch (e: unknown) {
      try {
        const error = e as Error;
        const validationErrors = JSON.parse(error?.message);
        setErrors(validationErrors);
      } catch {
        const error = e as Error;
        setApiError(error?.message || 'Failed to update vehicle');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => router.push('/admin/vehicle');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (fetching) {
    return (
      <Card title="Vehicle Information" className="bg-[#fefce8]">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading vehicle data...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Vehicle Information" className="bg-[#fefce8]">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <p className="text-sm text-gray-600">{formatDate(createdAt)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-sm text-gray-600">{formatDate(updatedAt)}</p>
            </div>
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

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>Cancel</Button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#fad23c] text-gray-700 font-semibold rounded-full shadow-lg hover:bg-[#fad23c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Vehicle
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}