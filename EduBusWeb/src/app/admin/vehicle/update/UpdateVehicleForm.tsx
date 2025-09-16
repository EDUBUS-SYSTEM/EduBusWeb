'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Search, User, Phone } from 'lucide-react';
import { UpdateVehicleRequest, VehicleResponse, VehicleFormErrors, VehicleDto } from '@/types/vehicle';
import vehicleService from '@/services/vehicleService';

interface Driver {
  id: string;
  name: string;
  phone: string;
}

export default function UpdateVehicleForm() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  
  const [formData, setFormData] = useState<UpdateVehicleRequest>({
    licensePlate: '',
    capacity: 16,
    status: 1
  });
  
  const [vehicleInfo, setVehicleInfo] = useState<VehicleDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Partial<VehicleFormErrors>>({});
  const [apiError, setApiError] = useState<string>('');

  // Driver search state
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<string>('');

  const statusOptions = [
    { value: '1', label: 'Active' },
    { value: '2', label: 'Inactive' },
    { value: '3', label: 'Maintenance' }
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

  // Fetch vehicle data on component mount
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setFetching(true);
        const response = await vehicleService.getVehicleById(vehicleId);
        if (response.success && response.data) {
          setVehicleInfo(response.data);
          setFormData({
            licensePlate: response.data.licensePlate,
            capacity: response.data.capacity,
            status: getStatusNumber(response.data.status)
          });
        } else {
          setApiError('Failed to fetch vehicle data');
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setApiError('Failed to fetch vehicle data');
      } finally {
        setFetching(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  const getStatusNumber = (status: string): number => {
    switch (status) {
      case 'Active': return 1;
      case 'Inactive': return 2;
      case 'Maintenance': return 3;
      default: return 1;
    }
  };

  const getStatusString = (status: number): string => {
    switch (status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Maintenance';
      default: return 'Active';
    }
  };

  const handleInputChange = (field: keyof UpdateVehicleRequest, value: string | number) => {
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
    setCurrentDriver(driver.name);
    setDriverSearchTerm('');
    setSearchResults([]);
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
      setApiError('');
      
      const response = await vehicleService.updateVehicle(vehicleId, formData);
      
      if (response.success) {
        router.push('/admin/vehicle');
      } else {
        setApiError('Failed to update vehicle');
      }
    } catch (error: any) {
      console.error('Error updating vehicle:', error);
      if (error.message) {
        try {
          const validationErrors = JSON.parse(error.message);
          setErrors(validationErrors);
        } catch {
          setApiError(error.message || 'Failed to update vehicle');
        }
      } else {
        setApiError('Failed to update vehicle');
      }
    } finally {
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

  if (fetching) {
    return (
      <Card title="Vehicle Information" className="bg-[#fefce8]">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading vehicle data...</div>
        </div>
      </Card>
    );
  }

  if (!vehicleInfo) {
    return (
      <Card title="Vehicle Information" className="bg-[#fefce8]">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="text-red-500">Vehicle not found</div>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Vehicle List
          </button>
        </div>
      </Card>
    );
  }

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
                value={formData.status.toString()}
                options={statusOptions}
                onChange={(value) => handleInputChange('status', parseInt(value))}
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
              {currentDriver && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Current Driver: {currentDriver}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentDriver('')}
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
              <p className="text-sm text-gray-600">{formatDate(vehicleInfo.createdAt)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Updated
              </label>
              <p className="text-sm text-gray-600">{formatDate(vehicleInfo.updatedAt)}</p>
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
