'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FileUpload from '@/components/ui/FileUpload';
import { DriverAccountData, AccountFormErrors } from '@/types';

interface DriverAccountFormProps {
  onSubmit: (data: DriverAccountData) => void;
  loading?: boolean;
  errors?: AccountFormErrors;
  key?: string | number; // Add key prop to force re-render and reset form
}

const DriverAccountForm: React.FC<DriverAccountFormProps> = ({
  onSubmit,
  loading = false,
  errors = {},
}) => {
  const [formData, setFormData] = useState<DriverAccountData>({
    email: 'driver_1@gmail.com',
    driverPhoto: [],
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    healthCertificate: [],
    licenseNumber: '',
    dateOfIssue: '',
    issuedBy: '',
    licenseImages: [],
  });

  const genderOptions = [
    { value: '1', label: 'Male' },
    { value: '2', label: 'Female' },
    { value: '3', label: 'Other' },
  ];

  const handleInputChange = (field: keyof DriverAccountData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: keyof DriverAccountData, files: File[]) => {
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
          Driver Information
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
            label="Driver Photo"
            accept="image/*"
            selectedFiles={formData.driverPhoto}
            onFileSelect={(files) => handleFileChange('driverPhoto', files)}
            error={errors.driverPhoto}
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

          <Input
            label="Date of Birth*"
            type="date"
            placeholder="Select date of birth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            required
          />
          
          <FileUpload
            label="Health Certificate"
            accept="image/*"
            selectedFiles={formData.healthCertificate}
            onFileSelect={(files) => handleFileChange('healthCertificate', files)}
            error={errors.healthCertificate}
          />
        </div>
      </div>

      {/* Driver's License Information Section */}
      <div className="bg-[#F9F7E3] rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Driver&apos;s License Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Driver's License Number"
            placeholder="Enter driver's license number"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            error={errors.licenseNumber}
          />
          
          <Input
            label="Date of Issue"
            type="date"
            placeholder="Enter date of issue"
            value={formData.dateOfIssue}
            onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
            error={errors.dateOfIssue}
          />
          
          <Input
            label="Issued By"
            placeholder="Enter issued by"
            value={formData.issuedBy}
            onChange={(e) => handleInputChange('issuedBy', e.target.value)}
            error={errors.issuedBy}
          />
          
          <FileUpload
            label="License Images"
            accept="image/*"
            selectedFiles={formData.licenseImages}
            onFileSelect={(files) => handleFileChange('licenseImages', files)}
            error={errors.licenseImages}
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

export default DriverAccountForm;
