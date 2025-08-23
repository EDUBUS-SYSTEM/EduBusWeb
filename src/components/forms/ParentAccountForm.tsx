'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DateInput from '@/components/ui/DateInput';
import FileUpload from '@/components/ui/FileUpload';
import { ParentAccountData, AccountFormErrors } from '@/types';

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
    fullName: '',
    phoneNumber: '',
    gender: '',
    studentFullName: 'Jane Smith',
    studentIdNumber: '1B_1501',
    studentGrade: '',
    studentGender: '',
    studentDateOfBirth: '2021-02-20',
    studentImages: [],
  });

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const gradeOptions = [
    { value: 'grade1', label: 'Grade 1' },
    { value: 'grade2', label: 'Grade 2' },
    { value: 'grade3', label: 'Grade 3' },
    { value: 'grade4', label: 'Grade 4' },
    { value: 'grade5', label: 'Grade 5' },
    { value: 'grade6', label: 'Grade 6' },
    { value: 'grade7', label: 'Grade 7' },
    { value: 'grade8', label: 'Grade 8' },
    { value: 'grade9', label: 'Grade 9' },
    { value: 'grade10', label: 'Grade 10' },
    { value: 'grade11', label: 'Grade 11' },
    { value: 'grade12', label: 'Grade 12' },
  ];

  const handleInputChange = (field: keyof ParentAccountData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: keyof ParentAccountData, files: File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: files,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            label="FullName*"
            placeholder="Enter FullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={errors.fullName}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={formData.studentFullName}
            onChange={(e) => handleInputChange('studentFullName', e.target.value)}
            error={errors.studentFullName}
          />
          
          <Input
            label="ID Number*"
            value={formData.studentIdNumber}
            onChange={(e) => handleInputChange('studentIdNumber', e.target.value)}
            error={errors.studentIdNumber}
            required
          />
          
          <Select
            label="Grade"
            options={gradeOptions}
            placeholder="Select Grade"
            value={formData.studentGrade}
            onChange={(value) => handleInputChange('studentGrade', value)}
            error={errors.studentGrade}
          />
          
          <Select
            label="Gender*"
            options={genderOptions}
            placeholder="Select Gender"
            value={formData.studentGender}
            onChange={(value) => handleInputChange('studentGender', value)}
            error={errors.studentGender}
            required
          />
          
          <DateInput
            label="Date of Birth*"
            value={formData.studentDateOfBirth}
            onChange={(value) => handleInputChange('studentDateOfBirth', value)}
            error={errors.studentDateOfBirth}
            required
          />
          
          <FileUpload
            label="Student Images*"
            accept="image/*"
            selectedFiles={formData.studentImages}
            onFileSelect={(files) => handleFileChange('studentImages', files)}
            error={errors.studentImages}
          />
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
