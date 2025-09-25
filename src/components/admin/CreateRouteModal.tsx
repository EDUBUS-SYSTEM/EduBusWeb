// src/components/admin/CreateRouteModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBus } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import { routeService } from '@/services/routeService/routeService.api';
import { VehicleDto } from '@/types/vehicle';
import { CreateRouteRequest, RouteDto } from '@/services/routeService/routeService.types';
import { toast } from 'react-toastify';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCreated: (newRoute: RouteDto) => void; // Updated to pass the created route
}

const CreateRouteModal: React.FC<CreateRouteModalProps> = ({ isOpen, onClose, onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ routeName?: string; vehicleId?: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getVehicles({});
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles');
    }
  };

  const validateForm = () => {
    const newErrors: { routeName?: string; vehicleId?: string } = {};

    if (!routeName.trim()) {
      newErrors.routeName = 'Route name is required';
    } else if (routeName.length > 200) {
      newErrors.routeName = 'Route name cannot exceed 200 characters';
    }

    if (!selectedVehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const createRequest: CreateRouteRequest = {
        routeName: routeName.trim(),
        vehicleId: selectedVehicleId,
        pickupPoints: [] // Start with empty pickup points
      };

      const newRoute = await routeService.create(createRequest);
      // Fetch vehicle capacity and update the route
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        newRoute.vehicleCapacity = vehicle.capacity;
        newRoute.vehicleNumberPlate = vehicle.licensePlate;
      }
      toast.success('Route created successfully!');
      onRouteCreated(newRoute); // Pass the created route to the parent
      handleClose();
    } catch (error: unknown) {
      console.error('Failed to create route:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
          }
        };

        if (axiosError.response?.status === 400) {
          const errorData = axiosError.response.data;

          if (errorData && typeof errorData === 'object') {
            // Check if it's ModelState validation errors
            if ('RouteName' in errorData || 'VehicleId' in errorData) {
              const validationErrors = errorData as Record<string, string[]>;
              setErrors({
                routeName: Array.isArray(validationErrors.RouteName) ? validationErrors.RouteName[0] : validationErrors.RouteName,
                vehicleId: Array.isArray(validationErrors.VehicleId) ? validationErrors.VehicleId[0] : validationErrors.VehicleId
              });
            } else if (typeof errorData === 'string') {
              toast.error(errorData);
            } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
              const errorWithMessage = errorData as { message: string };
              toast.error(errorWithMessage.message);
            } else {
              toast.error('Validation failed. Please check your input.');
            }
          } else {
            toast.error('Validation failed. Please check your input.');
          }
        } else if (axiosError.response?.status === 500) {
          toast.error('Internal server error. Please try again later.');
        } else {
          toast.error('Failed to create route. Please try again.');
        }
      } else {
        toast.error('Failed to create route. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRouteName('');
    setSelectedVehicleId('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaBus className="mr-2 text-blue-500" />
            Create New Route
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
              Route Name *
            </label>
            <input
              type="text"
              id="routeName"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.routeName ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter route name"
              maxLength={200}
            />
            {errors.routeName && (
              <p className="text-red-500 text-sm mt-1">{errors.routeName}</p>
            )}
          </div>

          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle *
            </label>
            <select
              id="vehicle"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleId ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} (Capacity: {vehicle.capacity})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Route'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRouteModal;