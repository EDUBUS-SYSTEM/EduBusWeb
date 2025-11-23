// components/admin/PickupPointManagement/PickupPointsTab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { pickupPointService, PickupPointWithStudentStatusDto } from '@/services/pickupPointService';
import { FaMapMarkerAlt, FaUsers, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PickupPointsTab: React.FC = () => {
  const [pickupPoints, setPickupPoints] = useState<PickupPointWithStudentStatusDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPointWithStudentStatusDto | null>(null);

  useEffect(() => {
    fetchPickupPoints();
  }, []);

  const fetchPickupPoints = async () => {
    try {
      setIsLoading(true);
      const data = await pickupPointService.getPickupPointsWithStudentStatus();
      setPickupPoints(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch pickup points');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-[#fad23c]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#463B3B]">All Pickup Points</h2>
        <button
          onClick={fetchPickupPoints}
          className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {pickupPoints.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaMapMarkerAlt className="text-5xl mx-auto mb-4 opacity-50" />
          <p>No pickup points found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pickupPoints.map((pp) => (
            <div
              key={pp.id}
              onClick={() => setSelectedPickupPoint(pp)}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#fad23c] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-[#fad23c] text-xl" />
                  <h3 className="font-semibold text-[#463B3B]">{pp.description || 'No description'}</h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{pp.location}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Students:</span>
                  <span className="font-semibold text-[#463B3B]">{pp.totalStudents}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-green-600">
                    <FaCheckCircle />
                    <span>{pp.activeStudents} Active</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <FaClock />
                    <span>{pp.pendingStudents} Pending</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-600">
                    <FaTimesCircle />
                    <span>{pp.inactiveStudents} Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPickupPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#463B3B]">{selectedPickupPoint.description || 'Pickup Point Details'}</h3>
                <button
                  onClick={() => setSelectedPickupPoint(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-[#463B3B]">{selectedPickupPoint.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Latitude</label>
                    <p className="text-[#463B3B]">
                      {selectedPickupPoint.latitude != null ? selectedPickupPoint.latitude.toFixed(6) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Longitude</label>
                    <p className="text-[#463B3B]">
                      {selectedPickupPoint.longitude != null ? selectedPickupPoint.longitude.toFixed(6) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Students</label>
                    <p className="text-[#463B3B] font-semibold text-lg">{selectedPickupPoint.totalStudents}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Active Students</label>
                    <p className="text-green-600 font-semibold text-lg">{selectedPickupPoint.activeStudents}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pending Students</label>
                    <p className="text-yellow-600 font-semibold text-lg">{selectedPickupPoint.pendingStudents}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Inactive Students</label>
                    <p className="text-red-600 font-semibold text-lg">{selectedPickupPoint.inactiveStudents}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-[#463B3B]">
                    {new Date(selectedPickupPoint.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default PickupPointsTab;

