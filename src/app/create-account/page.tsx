'use client';

import React, { useState } from 'react';
import SidebarCreateAccount, { AccountType } from '@/components/layout/SidebarCreateAccount';
import DriverAccountForm from '@/components/forms/DriverAccountForm';
import ParentAccountForm from '@/components/forms/ParentAccountForm';
import UploadButton from '@/components/ui/UploadButton';
import { DriverAccountData, ParentAccountData, AccountFormErrors } from '@/types';

const CreateAccountPage: React.FC = () => {
  const [activeAccountType, setActiveAccountType] = useState<AccountType>('driver');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AccountFormErrors>({});

  const handleAccountTypeChange = (type: AccountType) => {
    setActiveAccountType(type);
    setErrors({}); // Clear errors when switching account types
  };

  const handleBack = () => {
    // Navigate back to previous page
    window.history.back();
  };

  const handleUploadFiles = () => {
    // Handle general file upload functionality
    console.log('Upload files clicked');
  };

  const handleDriverSubmit = async (data: DriverAccountData) => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validate required fields
      const newErrors: AccountFormErrors = {};
      
      if (!data.email) newErrors.email = 'Email is required';
      if (!data.password) newErrors.password = 'Password is required';
      if (!data.firstName) newErrors.firstName = 'First name is required';
      if (!data.lastName) newErrors.lastName = 'Last name is required';
      if (!data.address) newErrors.address = 'Address is required';
      if (!data.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!data.gender) newErrors.gender = 'Gender is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // TODO: Send data to API
      console.log('Driver account data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect or show success message
      alert('Driver account created successfully!');
      
    } catch (error) {
      console.error('Error creating driver account:', error);
      setErrors({ general: 'Failed to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleParentSubmit = async (data: ParentAccountData) => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validate required fields
      const newErrors: AccountFormErrors = {};
      
      if (!data.email) newErrors.email = 'Email is required';
      if (!data.password) newErrors.password = 'Password is required';
      if (!data.firstName) newErrors.firstName = 'First name is required';
      if (!data.lastName) newErrors.lastName = 'Last name is required';
      if (!data.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!data.gender) newErrors.gender = 'Gender is required';
      if (data.students.length === 0) newErrors.students = 'At least one student is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // TODO: Send data to API
      console.log('Parent account data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success - redirect or show success message
      alert('Parent account created successfully!');
      
    } catch (error) {
      console.error('Error creating parent account:', error);
      setErrors({ general: 'Failed to create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarCreateAccount
        activeAccountType={activeAccountType}
        onAccountTypeChange={handleAccountTypeChange}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Create User Account
            </h1>
            <UploadButton onFileSelect={handleUploadFiles} />
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-[#F9F7E3] rounded-2xl p-8 shadow-sm border border-gray-100">
            {activeAccountType === 'driver' ? (
              <DriverAccountForm
                onSubmit={handleDriverSubmit}
                loading={loading}
                errors={errors}
              />
            ) : (
              <ParentAccountForm
                onSubmit={handleParentSubmit}
                loading={loading}
                errors={errors}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
