"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ParentAccountData, AccountFormErrors } from "@/types";

interface ParentAccountFormProps {
  onSubmit: (data: ParentAccountData) => void;
  loading?: boolean;
  errors?: AccountFormErrors;
  key?: string | number; // Add key prop to force re-render and reset form
}

const ParentAccountForm: React.FC<ParentAccountFormProps> = ({
  onSubmit,
  loading = false,
  errors = {},
}) => {
  const [formData, setFormData] = useState<ParentAccountData>({
    email: "parent_1@gmail.com",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    studentIds: [],
    students: [],
  });

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];



  const handleInputChange = (field: keyof ParentAccountData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field: keyof ParentAccountData, files: File[]) => {
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
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="First Name*"
            placeholder="Enter First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name*"
            placeholder="Enter Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            error={errors.lastName}
            required
          />

                     <Input
             label="PhoneNumber*"
             placeholder="Enter PhoneNumber"
             value={formData.phoneNumber}
             onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
             error={errors.phoneNumber}
             required
           />

           <Input
             label="Address*"
             placeholder="Enter Address"
             value={formData.address}
             onChange={(e) => handleInputChange("address", e.target.value)}
             error={errors.address}
             required
           />

           <Select
             label="Gender*"
             options={genderOptions}
             placeholder="Select Gender"
             value={formData.gender}
             onChange={(value) => handleInputChange("gender", value)}
             error={errors.gender}
             required
           />

           <Input
             label="Date of Birth*"
             type="date"
             placeholder="Select date of birth"
             value={formData.dateOfBirth}
             onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
             error={errors.dateOfBirth}
             required
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
          {loading ? "Creating..." : "Create New Account"}
        </button>
      </div>
    </form>
  );
};

export default ParentAccountForm;
