"use client";

import React from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaCheck,
  FaTimes as FaTimesIcon,
} from "react-icons/fa";
import { StudentDto } from "@/services/studentService/studentService.types";
import { StudentAvatar } from "./StudentAvatar";

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
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Full Name
            </label>
            <div className="flex items-center space-x-3">
              <StudentAvatar
                studentId={student.id}
                studentName={`${student.lastName} ${student.firstName}`}
              />
              <p className="text-lg font-semibold text-gray-900">
                {student.lastName} {student.firstName}
              </p>
            </div>
          </div>

          {/* Parent Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Parent Email
            </label>
            <div className="flex items-center space-x-2">
              <FaEnvelope className="text-gray-400 w-4 h-4" />
              <p className="text-gray-900">{student.parentEmail}</p>
            </div>
          </div>

          {/* Parent Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Parent Status
            </label>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                student.parentId ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {student.parentId ? "Linked" : "Not Linked"}
              </span>
            </div>
          </div>

          {/* Student Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Student Status
            </label>
            <div className="flex items-center space-x-2">
              {student.status === 2 ? ( // StudentStatus.Active = 2
                <>
                  <FaCheck className="text-green-500 w-4 h-4" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </>
              ) : student.status === 0 ? ( // StudentStatus.Available = 0
                <>
                  <FaCheck className="text-blue-500 w-4 h-4" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Available
                  </span>
                </>
              ) : student.status === 1 ? ( // StudentStatus.Pending = 1
                <>
                  <FaCheck className="text-yellow-500 w-4 h-4" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
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

          {/* Registration Date */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaCalendarAlt className="text-blue-500 w-4 h-4" />
              <span className="text-sm font-medium text-blue-800">
                Registration Date
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
            </p>
          </div>

          {/* Last Updated */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaCalendarAlt className="text-gray-500 w-4 h-4" />
              <span className="text-sm font-medium text-gray-800">
                Last Updated
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : ''}
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
