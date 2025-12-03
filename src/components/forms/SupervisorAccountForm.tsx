'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FileUpload from '@/components/ui/FileUpload';
import { SupervisorAccountData, AccountFormErrors } from '@/types';

interface SupervisorAccountFormProps {
  onSubmit: (data: SupervisorAccountData) => void;
  loading?: boolean;
  errors?: AccountFormErrors;
  key?: string | number;
}

const SupervisorAccountForm: React.FC<SupervisorAccountFormProps> = ({
  onSubmit,
  loading = false,
  errors = {},
}) => {
  const [formData, setFormData] = useState<SupervisorAccountData>({
    email: '',
    supervisorPhoto: [],
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
  });

  const genderOptions = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'Other' },
  ];

  const handleInputChange = (field: keyof SupervisorAccountData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: keyof SupervisorAccountData, files: File[]) => {
    if (field === 'supervisorPhoto' && files.length > 0) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('File size must not exceed 2MB');
        return;
      }
    }
    setFormData((prev) => ({
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
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Supervisor Information
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

          <FileUpload
            label="Supervisor Photo"
            accept="image/*"
            selectedFiles={formData.supervisorPhoto}
            onFileSelect={(files) => handleFileChange('supervisorPhoto', files)}
            error={errors.supervisorPhoto}
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
            label="Address*"
            placeholder="Enter Address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={errors.address}
            required
          />

          <Input
            label="Phone Number*"
            placeholder="Enter Phone Number"
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

          <Input
            label="Date of Birth*"
            type="date"
            placeholder="Select date of birth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            required
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold 
                     py-3 px-8 rounded-2xl transition-all duration-300 
                     transform hover:scale-105 shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Creating...' : 'Create Supervisor Account'}
        </button>
      </div>
    </form>
  );
};

export default SupervisorAccountForm;


