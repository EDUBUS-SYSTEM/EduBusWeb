import React from 'react';
import { AcademicSemesterInfo } from '@/services/api/publicSemesterService';

interface SemesterInfoCardProps {
  semester: AcademicSemesterInfo | null;
  isLoading: boolean;
}

export const SemesterInfoCard: React.FC<SemesterInfoCardProps> = ({ semester, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="space-y-1">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            <div className="h-2 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!semester) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="text-xs">No semester information</div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const endFormatted = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md shadow-sm p-2 border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <h3 className="text-xs font-semibold text-blue-800">
            {semester.name}
          </h3>
        </div>
        <div className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
          {semester.code}
        </div>
      </div>

      {/* Academic Year */}
      <div className="mb-1">
        <div className="text-xs text-gray-600 mb-0.5">Academic Year</div>
        <div className="text-xs font-medium text-gray-800">
          {semester.academicYear}
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-1">
        <div className="text-xs text-gray-600 mb-0.5">Duration</div>
        <div className="text-xs text-gray-800">
          {formatDateRange(semester.startDate, semester.endDate)}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-1 mb-1">
        <div className="bg-white rounded-sm p-1.5 border border-gray-100">
          <div className="text-xs text-gray-500 mb-0.5">School Days</div>
          <div className="text-xs font-bold text-green-600">
            {semester.totalSchoolDays}
          </div>
        </div>
        <div className="bg-white rounded-sm p-1.5 border border-gray-100">
          <div className="text-xs text-gray-500 mb-0.5">Total Trips</div>
          <div className="text-xs font-bold text-orange-600">
            {semester.totalTrips}
          </div>
        </div>
      </div>

      {/* Holidays Info */}
      {semester.holidays && semester.holidays.length > 0 && (
        <div className="bg-yellow-50 rounded-sm p-1.5 border border-yellow-200">
          <div className="flex items-center space-x-1 mb-0.5">
            <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
            <div className="text-xs font-medium text-yellow-800">
              Holidays ({semester.holidays.length} days)
            </div>
          </div>
          <div className="text-xs text-yellow-700">
            Including holidays and breaks
          </div>
        </div>
      )}
    </div>
  );
};
