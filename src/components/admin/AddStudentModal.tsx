'use client';

import React, { useState } from 'react';
import { FaTimes, FaUser, FaCheck, FaSpinner } from 'react-icons/fa';
import { Student } from '@/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => void;
}

export default function AddStudentModal({ isOpen, onClose, onSubmit }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
             newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
             newErrors.lastName = 'Last name is required';
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
      // Create student object with mock parent data
      const newStudent: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'> = {
        parentId: `parent_${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        isActive: formData.isActive,
        parent: {
          id: `parent_${Date.now()}`,
          email: 'parent@example.com',
          firstName: 'Phụ huynh',
          lastName: 'Mặc định',
          phoneNumber: '0123456789',
          address: 'Chưa cập nhật',
          dateOfBirth: '1980-01-01',
          gender: 'Male',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          role: 'parent'
        }
      };

      onSubmit(newStudent);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        isActive: true,
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error adding student:', error);
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
                 <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-base font-semibold text-gray-700">
                 <FaUser className="w-4 h-4 text-[#FAD23C]" />
                 Student Information
               </div>
              
                             <div className="grid grid-cols-2 gap-3">
                <div>
                                     <label className="block text-xs font-medium text-gray-700 mb-1">
                     Last Name <span className="text-red-500">*</span>
                   </label>
                                     <input
                     type="text"
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleChange}
                     className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#FAD23C] focus:border-transparent transition-all duration-200 ${
                       errors.lastName ? 'border-red-300' : 'border-gray-300'
                     }`}
                     placeholder="Enter student's last name"
                   />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
                
                <div>
                                     <label className="block text-xs font-medium text-gray-700 mb-1">
                     First Name <span className="text-red-500">*</span>
                   </label>
                                     <input
                     type="text"
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleChange}
                     className={`w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#FAD23C] focus:border-transparent transition-all duration-200 ${
                       errors.firstName ? 'border-red-300' : 'border-gray-300'
                     }`}
                     placeholder="Enter student's first name"
                   />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
              </div>

              <div>
                                 <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                   <input
                     type="checkbox"
                     name="isActive"
                     checked={formData.isActive}
                     onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                     className="w-3 h-3 text-[#FAD23C] border-gray-300 rounded focus:ring-[#FAD23C]"
                   />
                   Active
                 </label>
              </div>
            </div>
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
