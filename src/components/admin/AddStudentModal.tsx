"use client";

import React, { useState } from "react";
import { FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { CreateStudentRequest } from "@/services/studentService/studentService.types";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: CreateStudentRequest) => void;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    parentPhoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.parentPhoneNumber.trim()) {
      newErrors.parentPhoneNumber = "Parent phone number is required";
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
      const newStudent: CreateStudentRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        parentPhoneNumber: formData.parentPhoneNumber,
      };

      await onSubmit(newStudent);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        parentPhoneNumber: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFCE8] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Add New Student</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Parent Phone Number */}
          <div>
            <label
              htmlFor="parentPhoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Parent Phone Number *
            </label>
            <input
              type="tel"
              id="parentPhoneNumber"
              name="parentPhoneNumber"
              value={formData.parentPhoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.parentPhoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter parent phone number"
            />
            {errors.parentPhoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.parentPhoneNumber}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#FAD23C] hover:bg-[#fad23c]/80 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
