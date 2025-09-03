'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Search, User, Phone } from 'lucide-react';

interface UpdateVehicleFormData {
  licensePlate: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  driverName: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
}

export default function UpdateVehicleForm() {
  const router = useRouter();
  
  // Mock data - sẽ được thay thế bằng API call thực tế
  const [vehicleData] = useState<UpdateVehicleFormData>({
    licensePlate: "30H-12345",
    capacity: 24,
    status: "Active",
    createdAt: "2025-09-03T04:53:36.613Z",
    updatedAt: "2025-09-03T04:53:36.613Z",
    driverName: "Nguyễn Văn A"
  });

  const [formData, setFormData] = useState<UpdateVehicleFormData>(vehicleData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateVehicleFormData, string>>>({});
  const [apiError, setApiError] = useState<string>('');

  // Driver search state
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [searching, setSearching] = useState(false);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Maintenance', label: 'Maintenance' }
  ];

  const capacityOptions = [
    { value: '16', label: '16 seats' },
    { value: '24', label: '24 seats' },
    { value: '32', label: '32 seats' },
    { value: '45', label: '45 seats' }
  ];

  // Mock drivers data - sẽ được thay thế bằng API call thực tế
  const mockDrivers: Driver[] = [
    { id: '1', name: 'Nguyễn Văn A', phone: '0123456789' },
    { id: '2', name: 'Trần Thị B', phone: '0987654321' },
    { id: '3', name: 'Lê Văn C', phone: '0111222333' },
    { id: '4', name: 'Phạm Thị D', phone: '0444555666' },
  ];

  const handleInputChange = (field: keyof UpdateVehicleFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDriverSearch = async () => {
    if (!driverSearchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockDrivers.filter(driver => 
        driver.name.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
        driver.phone.includes(driverSearchTerm)
      );
      setSearchResults(filtered);
      setSearching(false);
    }, 500);
  };

  const selectDriver = (driver: Driver) => {
    setFormData(prev => ({ ...prev, driverName: driver.name }));
    setDriverSearchTerm('');
    setSearchResults([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateVehicleFormData, string>> = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else {
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
      // TODO: Implement actual update API call
      console.log('Updating vehicle with data:', formData);
      
      // Simulate API call delay
      setTimeout(() => {
        setLoading(false);
        router.push('/admin/vehicle');
      }, 1000);
    } catch (error) {
      setApiError('Failed to update vehicle');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/vehicle');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card title="Vehicle Information" className="bg-[#fefce8]">
      <div className="p-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={formData.status}
                options={statusOptions}
                onChange={(value) => handleInputChange('status', value)}
                error={errors.status}
                required
              />
            </div>
          </div>

          {/* Driver Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Driver
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Search driver by name or phone number"
                  value={driverSearchTerm}
                  onChange={(e) => setDriverSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleDriverSearch}
                  disabled={searching || !driverSearchTerm.trim()}
                  className="px-4 py-3 bg-[#fad23c] text-gray-700 font-semibold rounded-full shadow-lg hover:bg-[#fad23c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {/* Current Driver Display */}
              {formData.driverName && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Current Driver: {formData.driverName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, driverName: '' }))}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((driver) => (
                    <div
                      key={driver.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => selectDriver(driver)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{driver.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {driver.phone}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Read-only Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created At
              </label>
              <p className="text-sm text-gray-600">{formatDate(formData.createdAt)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-sm text-gray-600">{formatDate(formData.updatedAt)}</p>
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