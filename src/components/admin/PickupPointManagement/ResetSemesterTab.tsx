// components/admin/PickupPointManagement/ResetSemesterTab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { FaSyncAlt, FaSearch, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { pickupPointService, GetPickupPointsBySemesterRequest, ResetPickupPointBySemesterRequest, AvailableSemesterDto, GetPickupPointsBySemesterResponse, ResetPickupPointBySemesterResponse, PickupPointWithStudentsDto, StudentUpdateFailure } from '@/services/pickupPointService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  // Load available semesters on component mount
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
    // Convert ISO date string to YYYY-MM-DD format for date inputs
    const formatDateForInput = (dateStr: string): string => {
      if (!dateStr) return '';
      // If already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Otherwise, extract date part from ISO string
      return dateStr.split('T')[0];
    };
    
    setFormData({
      semesterCode: semester.semesterCode,
      academicYear: semester.academicYear,
      semesterStartDate: formatDateForInput(semester.semesterStartDate),
      semesterEndDate: formatDateForInput(semester.semesterEndDate),
      semesterName: semester.semesterName || '',
    });
    // Clear preview and result when semester changes
    setPreviewData(null);
    setResetResult(null);
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
      
      // Clear preview after successful reset
      setPreviewData(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset pickup points';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#463B3B] mb-2">Reset Pickup Points by Semester</h2>
        <p className="text-gray-600">
          Reset student pickup points based on semester records. Preview the data before resetting.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Semester <span className="text-red-500">*</span>
            </label>
            {isLoadingSemesters ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                <span className="text-gray-500">Loading semesters...</span>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
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
              <p className="text-sm text-gray-500 mt-1">No semesters found. Please ensure there are pickup point assignments in the database.</p>
            )}
          </div>

          {/* Display selected semester details (read-only) */}
          {selectedSemesterId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Code
                </label>
                <input
                  type="text"
                  value={formData.semesterCode}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester Start Date
                </label>
                <input
                  type="date"
                  value={formData.semesterStartDate}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester End Date
                </label>
                <input
                  type="date"
                  value={formData.semesterEndDate}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {formData.semesterName && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester Name
                  </label>
                  <input
                    type="text"
                    value={formData.semesterName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={handlePreview}
          disabled={isLoadingPreview}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingPreview ? (
            <>
              <FaSpinner className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <FaSearch />
              Preview Data
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#463B3B] mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-blue-600" />
            Preview Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Pickup Points</p>
              <p className="text-2xl font-bold text-[#463B3B]">{previewData.totalPickupPoints}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-[#463B3B]">{previewData.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Semester</p>
              <p className="text-lg font-semibold text-[#463B3B]">
                {previewData.semesterCode} {previewData.academicYear}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Pickup Points Summary:</p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {previewData.pickupPoints.map((pp: PickupPointWithStudentsDto) => (
                <div key={pp.pickupPointId} className="bg-white rounded p-3 text-sm">
                  <p className="font-semibold">{pp.description || 'No description'}</p>
                  <p className="text-gray-600 text-xs">{pp.location}</p>
                  <p className="text-gray-600 mt-1">{pp.studentCount} student(s)</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="mt-4 px-6 py-3 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <>
                <FaSpinner className="animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <FaSyncAlt />
                Reset Pickup Points
              </>
            )}
          </button>
        </div>
      )}

      {/* Reset Result */}
      {resetResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#463B3B] mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Reset Completed
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Records Found</p>
              <p className="text-2xl font-bold text-[#463B3B]">{resetResult.totalRecordsFound}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Students Updated</p>
              <p className="text-2xl font-bold text-green-600">{resetResult.studentsUpdated}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Students Failed</p>
              <p className="text-2xl font-bold text-red-600">{resetResult.studentsFailed}</p>
            </div>
          </div>

          {resetResult.failedStudentIds && resetResult.failedStudentIds.length > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <FaExclamationTriangle />
                Failed Updates ({resetResult.failedStudentIds.length})
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {resetResult.failedStudentIds.map((failure: StudentUpdateFailure, index: number) => (
                  <div key={index} className="text-sm text-yellow-800">
                    <span className="font-mono">{failure.studentId.substring(0, 8)}...</span>: {failure.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-700">{resetResult.message}</p>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default ResetSemesterTab;

