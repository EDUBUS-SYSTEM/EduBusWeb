'use client';

import React, { useState } from 'react';
import SidebarCreateAccount, { AccountType } from '@/components/layout/SidebarCreateAccount';
import DriverAccountForm from '@/components/forms/DriverAccountForm';
import ParentAccountForm from '@/components/forms/ParentAccountForm';
import UploadButton from '@/components/ui/UploadButton';
import { DriverAccountData, ParentAccountData, AccountFormErrors } from '@/types';
import { createDriver, uploadHealthCertificate, importDriversFromExcel, exportDriversToExcel, ImportDriversResponse } from '@/services/api/drivers';
import { uploadUserPhoto } from '@/services/api/userAccount';
import { createDriverLicense, uploadLicenseImage } from '@/services/api/driverLicense';

const CreateAccountPage: React.FC = () => {
  const [activeAccountType, setActiveAccountType] = useState<AccountType>('driver');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [importResult, setImportResult] = useState<ImportDriversResponse | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const handleAccountTypeChange = (type: AccountType) => {
    setActiveAccountType(type);
    setErrors({}); // Clear errors when switching account types
  };

  const handleBack = () => {
    // Navigate back to previous page
    window.history.back();
  };

  const handleUploadFiles = async (files: File[]) => {
    console.log('handleUploadFiles called with:', files);
    console.log('activeAccountType:', activeAccountType);
    
    // Check if files parameter is valid
    if (!files || !Array.isArray(files)) {
      console.error('Files parameter is invalid:', files);
      return;
    }
    
    if (activeAccountType === 'driver' && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        alert('Please select an .xlsx file for driver import');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setImportLoading(true);
      setImportResult(null); // Clear previous results
      
      try {
        console.log('Starting import for file:', file.name);
        const result = await importDriversFromExcel(file);
        console.log('Import result from API:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result || {}));
        
        setImportResult(result);
        
        // Debug logging
        console.log('Setting import result:', result);
        console.log('Successful users:', result?.successfulUsers);
        console.log('Failed users:', result?.failedUsers);
        
        // Show detailed result
        const successCount = result?.successfulUsers?.length || 0;
        const failedCount = result?.failedUsers?.length || 0;
        
        if (successCount > 0 && failedCount === 0) {
          alert(`✅ Import successful! ${successCount} drivers created.\n\nDebug: ${JSON.stringify(result)}`);
        } else if (successCount > 0 && failedCount > 0) {
          alert(`⚠️ Partial success: ${successCount} created, ${failedCount} failed.\n\nDebug: ${JSON.stringify(result)}`);
        } else {
          alert(`❌ Import failed: ${failedCount} errors.\n\nDebug: ${JSON.stringify(result)}`);
        }
      } catch (err: any) {
        console.error('Import error:', err);
        const errorMessage = err?.response?.data?.message || err?.message || 'Import failed';
        alert(`❌ Import failed: ${errorMessage}`);
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Email', 'FirstName', 'LastName', 'PhoneNumber', 'Gender', 'DateOfBirth', 'Address'],
      ['driver1@gmail.com', 'Nguyen', 'Van A', '0912345678', '1', '1990-05-15', '123 Le Loi, Q1, Ho Chi Minh City'],
      ['driver2@gmail.com', 'Tran', 'Thi B', '0987654321', '2', '1988-12-20', '45 Nguyen Trai, Q5, Ho Chi Minh City'],
      ['driver3@gmail.com', 'Le', 'Van C', '0123456789', '1', '1992-08-10', '78 Tran Phu, Q3, Ho Chi Minh City']
    ];

    // Add instructions as comments
    const instructions = [
      'DRIVER IMPORT TEMPLATE - IMPORTANT NOTES:',
      '- Gender: 1=Male, 2=Female, 3=Other',
      '- DateOfBirth: Use YYYY-MM-DD format (e.g., 1990-05-15)',
      '- Email must be valid and unique',
      '- Phone number must be unique',
      '- All fields are required',
      '- Save as .xlsx format before importing'
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'driver_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show instructions
    setTimeout(() => {
      alert('Template downloaded! Please note:\n\n' + instructions.join('\n'));
    }, 100);
  };

  const handleDriverSubmit = async (data: DriverAccountData) => {
    setLoading(true);
    setErrors({});
    
    try {
      // Validate required fields
      const newErrors: AccountFormErrors = {};
      
      if (!data.email) newErrors.email = 'Email is required';
      if (!data.firstName) newErrors.firstName = 'First name is required';
      if (!data.lastName) newErrors.lastName = 'Last name is required';
      if (!data.address) newErrors.address = 'Address is required';
      if (!data.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      if (!data.gender) newErrors.gender = 'Gender is required';
      if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Map to backend payload
      const dDob = new Date(data.dateOfBirth!);
      const dobDateOnly = `${dDob.getFullYear()}-${String(dDob.getMonth()+1).padStart(2,'0')}-${String(dDob.getDate()).padStart(2,'0')}`;

      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: Number(data.gender),
        dateOfBirth: dobDateOnly,
        address: data.address,
      };

      console.log('Sending payload to backend:', payload);
      let res;
      try {
        res = await createDriver(payload);
      } catch (e: any) {
        const status = e?.response?.status;
        const data = e?.response?.data;
        const msg = (data ?? e?.message ?? '').toString();
        if (status === 409) {
          const conflictErrors: AccountFormErrors = {};
          if (/email/i.test(msg)) conflictErrors.email = 'Email already exists in the system';
          if (/phone/i.test(msg)) conflictErrors.phoneNumber = 'Phone number already exists in the system';
          setErrors({
            ...conflictErrors,
            general: 'Driver creation failed. Data was not saved to the database.',
          });
          return;
        }
        if (status === 400) {
          const fieldErrors: AccountFormErrors = {};
          if (typeof data === 'object' && data) {
            // ModelState dạng { Field: ["err1","err2"] }
            for (const k of Object.keys(data)) {
              const first = Array.isArray(data[k]) ? data[k][0] : data[k];
              fieldErrors[k.charAt(0).toLowerCase() + k.slice(1)] = first?.toString() || 'Invalid value';
            }
          }
          setErrors({
            ...fieldErrors,
            general: 'Driver creation failed. Data was not saved to the database.',
          });
          return;
        }
        setErrors({ general: 'Driver creation failed. Data was not saved to the database.' });
        return;
      }
      console.log('Backend response:', res);

      // Show backend-generated password
      alert(`Driver created successfully. Temporary password: ${res.password}`);

      // Optional uploads (if provided)
      const uploads: Promise<any>[] = [];
      if (data.driverPhoto && data.driverPhoto.length > 0) {
        uploads.push(uploadUserPhoto(res.id, data.driverPhoto[0]));
      }
      if (data.healthCertificate && data.healthCertificate.length > 0) {
        uploads.push(uploadHealthCertificate(res.id, data.healthCertificate[0]));
      }

      // Driver license creation if all 3 fields provided
      if (data.licenseNumber && data.dateOfIssue && data.issuedBy) {
        try {
          // Ensure min length and date-only format (yyyy-MM-dd)
          const licenseNumber = String(data.licenseNumber).trim();
          if (licenseNumber.length < 5) {
            throw new Error('License number must be at least 5 characters.');
          }
          const d = new Date(data.dateOfIssue);
          const dateOnly = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

          const license = await createDriverLicense({
            licenseNumber,
            dateOfIssue: dateOnly,
            issuedBy: data.issuedBy.trim(),
            driverId: res.id,
          });
          if (data.licenseImages && data.licenseImages.length > 0) {
            for (const f of data.licenseImages) {
              uploads.push(uploadLicenseImage(license.id, f));
            }
          }
        } catch (e: any) {
          console.error('Create driver license failed:', e);
          const message = e?.response?.data || e?.message || 'Driver license creation failed';
          alert((typeof message === 'string' ? message : JSON.stringify(message)) + '\nDriver has already been saved to the database.');
        }
      }
      if (uploads.length > 0) await Promise.allSettled(uploads);
      
    } catch (error) {
      console.error('Error creating driver account:', error);
      setErrors({ general: 'Failed to create driver account. Please check data or try again.' });
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
            {activeAccountType === 'driver' && (
              <div className="flex items-center gap-3">
                {importLoading && (
                  <div className="text-sm text-blue-600">
                    <span className="animate-spin">⏳</span> Importing...
                  </div>
                )}
                <UploadButton 
                  onFileSelect={handleUploadFiles}
                  onDownloadTemplate={handleDownloadTemplate}
                  showDownloadTemplate={true}
                  accept=".xlsx"
                  multiple={false}
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Import Results */}
          {importResult && activeAccountType === 'driver' && (
            <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Import Results</h3>
                <button
                  onClick={() => setImportResult(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ✕ Close
                </button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Processed:</span>
                    <span className="ml-2 text-blue-600">{importResult?.totalProcessed || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium">Successful:</span>
                    <span className="ml-2 text-green-600">{importResult?.successfulUsers?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium">Failed:</span>
                    <span className="ml-2 text-red-600">{importResult?.failedUsers?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Successful Imports */}
              {importResult?.successfulUsers && importResult.successfulUsers.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700 mb-2">Successfully Imported ({importResult?.successfulUsers?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="text-left p-2">Row</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Phone</th>
                          <th className="text-left p-2">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.successfulUsers.map((user, index) => (
                          <tr key={index} className="border-b border-green-100">
                            <td className="p-2">{user.rowNumber}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.firstName} {user.lastName}</td>
                            <td className="p-2">{user.phoneNumber}</td>
                            <td className="p-2">
                              <div className="font-mono text-xs bg-green-50 px-2 py-1 rounded border">
                                {user.password || 'No password'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Failed Imports */}
              {importResult?.failedUsers && importResult.failedUsers.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Failed Imports ({importResult?.failedUsers?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="text-left p-2">Row</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.failedUsers.map((error, index) => (
                          <tr key={index} className="border-b border-red-100">
                            <td className="p-2">{error.rowNumber}</td>
                            <td className="p-2">{error.email}</td>
                            <td className="p-2">{error.firstName} {error.lastName}</td>
                            <td className="p-2 text-red-600 text-xs">{error.errorMessage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
