// src/components/admin/EditRouteModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaBus, FaTrash } from 'react-icons/fa';
import { vehicleService } from '@/services/vehicleService';
import { routeService } from '@/services/routeService/routeService.api';
import { VehicleDto } from '@/types/vehicle';
import { UpdateRouteBasicRequest, RouteDto } from '@/services/routeService/routeService.types';
import { toast } from 'react-toastify';

interface EditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteDto | null;
  onRouteUpdated: (updatedRoute: RouteDto) => void;
  onRouteDeleted: (routeId: string) => void;
}

const EditRouteModal: React.FC<EditRouteModalProps> = ({
  isOpen,
  onClose,
  route,
  onRouteUpdated,
  onRouteDeleted
}) => {
  const [routeName, setRouteName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ routeName?: string; vehicleId?: string }>({});

  useEffect(() => {
    if (isOpen && route) {
      setRouteName(route.routeName);
      setSelectedVehicleId(route.vehicleId);
      fetchVehicles();
    }
  }, [isOpen, route]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getUnassignedVehicles(route?.id);
      setVehicles(response.vehicles || []);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!route || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateRouteBasicRequest = {
        routeName: routeName.trim(),
        vehicleId: selectedVehicleId
      };

      await routeService.updateBasic(route.id, updateData);
      const updatedRoute = {
        ...route,
        routeName: routeName.trim()
      }
      
      // Fetch vehicle capacity and update the route
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        updatedRoute.vehicleCapacity = vehicle.capacity;
        updatedRoute.vehicleNumberPlate = vehicle.licensePlate;
      }
      toast.success('Route updated successfully!');
      onRouteUpdated(updatedRoute);
      handleClose();
    } catch (error: unknown) {
      console.error('Failed to update route:', error);

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
            if ('errors' in errorData) {
              const backendErrors = errorData.errors as Record<string, string[]>;
              setErrors({
                routeName: backendErrors.RouteName?.[0] || '',
                vehicleId: backendErrors.VehicleId?.[0] || ''
              });
            } else if ('message' in errorData) {
              toast.error((errorData as { message: string }).message);
            }
          }
        } else {
          toast.error('Failed to update route. Please try again.');
        }
      } else {
        toast.error('Failed to update route. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!route) return;

    setDeleteLoading(true);
    try {
      await routeService.delete(route.id);
      toast.success('Route deleted successfully!');
      onRouteDeleted(route.id);
      handleClose();
    } catch (error: unknown) {
      console.error('Failed to delete route:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: unknown;
            status?: number;
          }
        };

        if (axiosError.response?.status === 404) {
          toast.error('Route not found.');
        } else if (axiosError.response?.status === 500) {
          toast.error('Internal server error. Please try again later.');
        } else {
          const errorData = axiosError.response?.data;
          const errorMessage = (errorData && typeof errorData === 'object' && 'message' in errorData)
            ? (errorData as { message: string }).message
            : (typeof errorData === 'string' ? errorData : 'Failed to delete route.');
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to delete route. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setRouteName('');
    setSelectedVehicleId('');
    setErrors({});
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaBus className="mr-2 text-blue-500" />
            Edit Route
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
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

          {/* Route Info Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Route Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Current Capacity:</strong> {route.pickupPoints.reduce((sum, point) => sum + point.studentCount, 0)}/{route.vehicleCapacity}</p>
              <p><strong>Pickup Points:</strong> {route.pickupPoints.length}</p>
              <p><strong>Status:</strong> {route.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleteLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FaTrash className="mr-2" />
              Delete Route
            </button>

            {/* Update and Cancel Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading || deleteLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || deleteLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Route'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
              <div className="flex items-center mb-4">
                <FaTrash className="text-red-500 mr-3 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Confirm Delete</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the route &quot;{route.routeName}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Route'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRouteModal;