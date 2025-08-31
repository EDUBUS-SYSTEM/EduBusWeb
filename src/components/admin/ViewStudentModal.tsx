"use client";

import React from "react";
import {
  FaTimes,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheck,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import { StudentDto } from "@/services/studentService/studentService.types";

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDto | null;
}

export default function ViewStudentModal({
  isOpen,
  onClose,
  student,
}: ViewStudentModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFCE8] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Student Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Student ID
            </label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">
              {student.id}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Full Name
            </label>
            <div className="flex items-center space-x-2">
              <FaUser className="text-gray-400 w-4 h-4" />
              <p className="text-lg font-semibold text-gray-900">
                {student.lastName} {student.firstName}
              </p>
            </div>
          </div>

          {/* Parent Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Parent Phone Number
            </label>
            <div className="flex items-center space-x-2">
              <FaPhone className="text-gray-400 w-4 h-4" />
              <p className="text-gray-900">{student.parentPhoneNumber}</p>
            </div>
          </div>

          {/* Parent ID */}
          {student.parentId && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Parent ID
              </label>
              <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                {student.parentId}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <div className="flex items-center space-x-2">
              {student.isActive ? (
                <>
                  <FaCheck className="text-green-500 w-4 h-4" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </>
              ) : (
                <>
                  <FaTimesIcon className="text-red-500 w-4 h-4" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Additional Info Placeholder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaMapMarkerAlt className="text-blue-500 w-4 h-4" />
              <span className="text-sm font-medium text-blue-800">
                Address Information
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Address information will be displayed here when available from the
              parent data.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaCalendarAlt className="text-blue-500 w-4 h-4" />
              <span className="text-sm font-medium text-blue-800">
                Registration Date
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Registration date will be displayed here when available.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium border border-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
