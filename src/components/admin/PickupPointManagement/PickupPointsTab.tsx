"use client";

import React, { useState, useEffect } from 'react';
import { pickupPointService, PickupPointWithStudentStatusDto } from '@/services/pickupPointService';
import { FaMapMarkerAlt, FaUsers, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner, FaEye, FaRedo } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/utils/dateUtils';

const PickupPointsTab: React.FC = () => {
  const [pickupPoints, setPickupPoints] = useState<PickupPointWithStudentStatusDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPointWithStudentStatusDto | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchPickupPoints();
  }, [currentPage, itemsPerPage]);

  const fetchPickupPoints = async () => {
    try {
      setIsLoading(true);
      const data = await pickupPointService.getPickupPointsWithStudentStatus();
      setTotalItems(data.length);

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      setPickupPoints(paginatedData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pickup points';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  if (isLoading && pickupPoints.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-[#fad23c]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#463B3B]">All Pickup Points</h2>
          <p className="text-sm text-gray-600 mt-1">Total: {totalItems} pickup points</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={fetchPickupPoints}
            className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-medium flex items-center gap-2"
          >
            <FaRedo />
            Refresh
          </button>
        </div>
      </div>

      {pickupPoints.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
          <FaMapMarkerAlt className="text-5xl mx-auto mb-4 opacity-50" />
          <p>No pickup points found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Students
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Breakdown
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pickupPoints.map((pp) => (
                    <tr key={pp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#fad23c] text-lg flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-[#463B3B]">
                              {pp.description || 'No description'}
                            </div>
                            {pp.latitude && pp.longitude && (
                              <div className="text-xs text-gray-500 mt-1">
                                {pp.latitude.toFixed(4)}, {pp.longitude.toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={pp.location}>
                          {pp.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-[#463B3B]">
                          <FaUsers className="text-gray-400" />
                          {pp.totalStudents}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-green-600" title="Active">
                            <FaCheckCircle />
                            <span className="font-medium">{pp.activeStudents}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600" title="Pending">
                            <FaClock />
                            <span className="font-medium">{pp.pendingStudents}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600" title="Inactive">
                            <FaTimesCircle />
                            <span className="font-medium">{pp.inactiveStudents}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedPickupPoint(pp)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#463B3B] bg-[#fad23c] rounded-lg hover:bg-[#FFF085] transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-[#FFFEF0] px-6 py-4 border-t border-gray-200 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  showInfo={true}
                />
              </div>
            )}
          </div>
        </>
      )}

      {selectedPickupPoint && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPickupPoint(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-[#fad23c] text-2xl" />
                <h3 className="text-2xl font-bold text-[#463B3B]">
                  {selectedPickupPoint.description || 'Pickup Point Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPickupPoint(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Location Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
                    <p className="text-[#463B3B] font-medium">{selectedPickupPoint.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Latitude</label>
                      <p className="text-[#463B3B] font-mono text-sm">
                        {selectedPickupPoint.latitude != null ? selectedPickupPoint.latitude.toFixed(6) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Longitude</label>
                      <p className="text-[#463B3B] font-mono text-sm">
                        {selectedPickupPoint.longitude != null ? selectedPickupPoint.longitude.toFixed(6) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPickupPoint.assignedStudents && selectedPickupPoint.assignedStudents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Assigned Students ({selectedPickupPoint.assignedStudents.length})
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedPickupPoint.assignedStudents.map((student) => (
                      <div key={student.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#463B3B]">
                              {student.firstName} {student.lastName}
                            </p>
                            {student.pickupPointAssignedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Assigned: {formatDate(student.pickupPointAssignedAt)}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.status === 1
                              ? 'bg-green-100 text-green-800'
                              : student.status === 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {student.status === 1 ? 'Active' : student.status === 2 ? 'Pending' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedPickupPoint(null)}
                className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default PickupPointsTab;
