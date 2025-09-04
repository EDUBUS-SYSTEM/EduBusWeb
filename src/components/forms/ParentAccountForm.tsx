'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ParentAccountData, AccountFormErrors, StudentInfo } from '@/types';
import { User, GraduationCap, Calendar, Users, X, Plus } from 'lucide-react';

interface ParentAccountFormProps {
  onSubmit: (data: ParentAccountData) => void;
  loading?: boolean;
  errors?: AccountFormErrors;
}

const ParentAccountForm: React.FC<ParentAccountFormProps> = ({
  onSubmit,
  loading = false,
  errors = {},
}) => {
  const [formData, setFormData] = useState<ParentAccountData>({
    email: 'parent_1@gmail.com',
    password: '12345678@',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    studentIds: [],
    students: [],
  });

  const [currentStudentId, setCurrentStudentId] = useState('');
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [searchError, setSearchError] = useState('');

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];



  const handleInputChange = (field: keyof ParentAccountData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleSearchStudent = async () => {
    if (!currentStudentId.trim()) return;
    
    setSearchingStudent(true);
    setSearchError('');
    
    try {
      // Fetch data from db.json
      const response = await fetch('/db.json');
      const data = await response.json();
      
      const student = data.students.find((s: StudentInfo) => s.id === currentStudentId);
      
      if (!student) {
        setSearchError('Student not found. Please check the ID and try again.');
        return;
      }
      
      // Check if student is already registered
      if (student.parentId) {
        setSearchError('This student is already registered by another parent.');
        return;
      }
      
      // Check if student is already in current parent's list
      if (formData.studentIds.includes(student.id)) {
        setSearchError('This student is already added to this account.');
        return;
      }
      
      // Add student to parent's list
      setFormData(prev => ({
        ...prev,
        studentIds: [...prev.studentIds, student.id],
        students: [...prev.students, student]
      }));
      
      setCurrentStudentId('');
      
    } catch (error) {
      console.error('Error searching student:', error);
      setSearchError('Error searching student. Please try again.');
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.filter(id => id !== studentId),
      students: prev.students.filter(student => student.id !== studentId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.students.length > 0) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Parent Information Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Parent Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email*"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
          
          <Input
            label="Password*"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            required
          />
          
          <Input
            label="First Name*"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          
          <Input
            label="Last Name*"
            placeholder="Enter Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
          
          <Input
            label="PhoneNumber*"
            placeholder="Enter PhoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={errors.phoneNumber}
            required
          />
          
          <Select
            label="Gender*"
            options={genderOptions}
            placeholder="Select Gender"
            value={formData.gender}
            onChange={(value) => handleInputChange('gender', value)}
            error={errors.gender}
            required
          />
        </div>
      </div>

      {/* Student Information Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Student Information
        </h3>
        
        <div className="space-y-6">
          {/* Search Student by ID */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-800">Add New Student</h4>
            </div>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  label="Student ID"
                  placeholder="Enter Student ID to search"
                  value={currentStudentId}
                  onChange={(e) => setCurrentStudentId(e.target.value)}
                  error={errors.studentId}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSearchStudent}
                  disabled={searchingStudent || !currentStudentId.trim()}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold 
                             py-3 px-8 rounded-2xl transition-all duration-300 
                             transform hover:scale-105 shadow-lg hover:shadow-xl
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {searchingStudent ? 'Searching...' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600">{searchError}</p>
            </div>
          )}

          {/* Display Added Students */}
          {formData.students.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800 text-lg">
                  Added Students ({formData.students.length})
                </h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {formData.students.map((student) => (
                  <div 
                    key={student.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)`,
                    }}
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(student.id)}
                      className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Student Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-lg">{student.fullName}</h5>
                        <p className="text-blue-600 font-medium text-sm">{student.id}</p>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <GraduationCap className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Grade</p>
                          <p className="text-gray-900 font-semibold capitalize">
                            {student.grade.replace('grade', 'Grade ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Gender</p>
                          <p className="text-gray-900 font-semibold capitalize">
                            {student.gender === 'male' ? 'Male' : 'Female'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                          <p className="text-gray-900 font-semibold">
                            {new Date(student.dateOfBirth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Students Message */}
          {formData.students.length === 0 && !searchingStudent && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-gray-800 font-semibold mb-2">No Students Added Yet</h4>
              <p className="text-gray-600">Search and add students by their ID to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold 
                     py-3 px-8 rounded-2xl transition-all duration-300 
                     transform hover:scale-105 shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Creating...' : 'Create New Account'}
        </button>
      </div>
    </form>
  );
};

export default ParentAccountForm;
