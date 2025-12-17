"use client";

import React, { useState, useEffect } from 'react';
import { FaSyncAlt, FaSearch, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { pickupPointService, GetPickupPointsBySemesterRequest, ResetPickupPointBySemesterRequest, AvailableSemesterDto, GetPickupPointsBySemesterResponse, ResetPickupPointBySemesterResponse, PickupPointWithStudentsDto, StudentUpdateFailure } from '@/services/pickupPointService';
import { ToastContainer, toast } from 'react-toastify';
import Pagination from '@/components/ui/Pagination';

const ResetSemesterTab: React.FC = () => {
  const [availableSemesters, setAvailableSemesters] = useState<AvailableSemesterDto[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
  const [formData, setFormData] = useState<GetPickupPointsBySemesterRequest>({
    semesterCode: '',
    academicYear: '',
    semesterStartDate: '',
    semesterEndDate: '',
    semesterName: '',
  });
  const [previewData, setPreviewData] = useState<GetPickupPointsBySemesterResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<ResetPickupPointBySemesterResponse | null>(null);
  
  const [previewPage, setPreviewPage] = useState(1);
  const [previewItemsPerPage] = useState(10);

  useEffect(() => {
    loadAvailableSemesters();
  }, []);

  const loadAvailableSemesters = async () => {
    try {
      setIsLoadingSemesters(true);
      const response = await pickupPointService.getAvailableSemesters();
      setAvailableSemesters(response.semesters);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load available semesters';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const handleSemesterSelect = (semester: AvailableSemesterDto | null) => {
    if (!semester) {
      setSelectedSemesterId('');
      setFormData({
        semesterCode: '',
        academicYear: '',
        semesterStartDate: '',
        semesterEndDate: '',
        semesterName: '',
      });
      setPreviewData(null);
      setResetResult(null);
      return;
    }

    setSelectedSemesterId(`${semester.semesterCode}-${semester.academicYear}-${semester.semesterStartDate}`);
    const formatDateForInput = (dateStr: string): string => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      return dateStr.split('T')[0];
    };
    
    setFormData({
      semesterCode: semester.semesterCode,
      academicYear: semester.academicYear,
      semesterStartDate: formatDateForInput(semester.semesterStartDate),
      semesterEndDate: formatDateForInput(semester.semesterEndDate),
      semesterName: semester.semesterName || '',
    });
    setPreviewData(null);
    setResetResult(null);
    setPreviewPage(1);
  };

  const handlePreview = async () => {
    try {
      if (!selectedSemesterId || !formData.semesterCode || !formData.academicYear || !formData.semesterStartDate || !formData.semesterEndDate) {
        toast.error('Please select a semester first');
        return;
      }

      setIsLoadingPreview(true);
      const data = await pickupPointService.getPickupPointsBySemester(formData);
      setPreviewData(data);
      setPreviewPage(1); 
      toast.success(`Found ${data.totalPickupPoints} pickup points with ${data.totalStudents} students`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preview data';
      toast.error(errorMessage);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleReset = async () => {
    if (!previewData) {
      toast.error('Please preview the data first');
      return;
    }

    if (!confirm(`Are you sure you want to reset pickup points for ${formData.semesterCode} ${formData.academicYear}?\n\nThis will update ${previewData.totalStudents} students.`)) {
      return;
    }

    try {
      setIsResetting(true);
      const resetRequest: ResetPickupPointBySemesterRequest = {
        semesterCode: formData.semesterCode,
        academicYear: formData.academicYear,
        semesterStartDate: formData.semesterStartDate,
        semesterEndDate: formData.semesterEndDate,
        semesterName: formData.semesterName,
      };
      
      const result = await pickupPointService.resetPickupPointBySemester(resetRequest);
      setResetResult(result);
      toast.success(result.message);
      
      setPreviewData(null);
      setPreviewPage(1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset pickup points';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Semester <span className="text-red-500">*</span>
            </label>
            {isLoadingSemesters ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-sm">
                <FaSpinner className="animate-spin" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : (
              <select
                value={selectedSemesterId}
                onChange={(e) => {
                  const semester = availableSemesters.find(s => 
                    `${s.semesterCode}-${s.academicYear}-${s.semesterStartDate}` === e.target.value
                  );
                  handleSemesterSelect(semester || null);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
              >
                <option value="">-- Select a semester --</option>
                {availableSemesters.map((semester) => (
                  <option 
                    key={`${semester.semesterCode}-${semester.academicYear}-${semester.semesterStartDate}`}
                    value={`${semester.semesterCode}-${semester.academicYear}-${semester.semesterStartDate}`}
                  >
                    {semester.displayLabel} ({semester.studentCount} students)
                  </option>
                ))}
              </select>
            )}
            {availableSemesters.length === 0 && !isLoadingSemesters && (
              <p className="text-xs text-gray-500 mt-1">No semesters found.</p>
            )}
          </div>
          <button
            onClick={handlePreview}
            disabled={isLoadingPreview || !selectedSemesterId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoadingPreview ? (
              <>
                <FaSpinner className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FaSearch />
                Preview
              </>
            )}
          </button>
        </div>
      </div>

      {previewData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-[#463B3B] flex items-center gap-2">
              <FaCheckCircle className="text-blue-600" />
              Preview: {previewData.semesterCode} {previewData.academicYear}
            </h3>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <FaSyncAlt />
                  Reset
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Pickup Points</p>
              <p className="text-xl font-bold text-[#463B3B]">{previewData.totalPickupPoints}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Students</p>
              <p className="text-xl font-bold text-[#463B3B]">{previewData.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">List Items</p>
              <p className="text-xl font-bold text-[#463B3B]">{previewData.pickupPoints.length}</p>
            </div>
          </div>

          {previewData.pickupPoints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Pickup Points ({previewData.pickupPoints.length}):
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 mb-3">
                {previewData.pickupPoints
                  .slice((previewPage - 1) * previewItemsPerPage, previewPage * previewItemsPerPage)
                  .map((pp: PickupPointWithStudentsDto) => (
                  <div key={pp.pickupPointId} className="bg-white rounded p-2 text-xs border border-gray-200">
                    <p className="font-medium text-[#463B3B]">{pp.description || 'No description'}</p>
                    <p className="text-gray-500 text-xs truncate">{pp.location}</p>
                    <p className="text-gray-600 mt-0.5">{pp.studentCount} student(s)</p>
                  </div>
                ))}
              </div>
              {previewData.pickupPoints.length > previewItemsPerPage && (
                <div className="bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  <Pagination
                    currentPage={previewPage}
                    totalPages={Math.ceil(previewData.pickupPoints.length / previewItemsPerPage)}
                    onPageChange={(newPage) => {
                      setPreviewPage(newPage);
                      const previewContainer = document.querySelector('.max-h-48');
                      if (previewContainer) {
                        previewContainer.scrollTop = 0;
                      }
                    }}
                    totalItems={previewData.pickupPoints.length}
                    itemsPerPage={previewItemsPerPage}
                    showInfo={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {resetResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-[#463B3B] mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Reset Completed
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Found</p>
              <p className="text-xl font-bold text-[#463B3B]">{resetResult.totalRecordsFound}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Updated</p>
              <p className="text-xl font-bold text-green-600">{resetResult.studentsUpdated}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Failed</p>
              <p className="text-xl font-bold text-red-600">{resetResult.studentsFailed}</p>
            </div>
          </div>

          {resetResult.failedStudentIds && resetResult.failedStudentIds.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="font-medium text-yellow-800 mb-2 text-sm flex items-center gap-2">
                <FaExclamationTriangle />
                Failed ({resetResult.failedStudentIds.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {resetResult.failedStudentIds.map((failure: StudentUpdateFailure, index: number) => (
                  <div key={index} className="text-xs text-yellow-800">
                    <span className="font-mono">{failure.studentId.substring(0, 8)}...</span>: {failure.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-700">{resetResult.message}</p>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ResetSemesterTab;

