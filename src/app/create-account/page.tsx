"use client";

import React, { useState } from "react";
import SidebarCreateAccount, {
  AccountType,
} from "@/components/layout/SidebarCreateAccount";
import DriverAccountForm from "@/components/forms/DriverAccountForm";
import ParentAccountForm from "@/components/forms/ParentAccountForm";
import UploadButton from "@/components/ui/UploadButton";
import {
  DriverAccountData,
  ParentAccountData,
  AccountFormErrors,
} from "@/types";
import { createDriver, uploadHealthCertificate } from "@/services/api/drivers";
import { createParent } from "@/services/api/parents";
import { uploadUserPhoto } from "@/services/api/userAccount";
import { createParentWithFullSetup } from "@/services/api/adminParentService";
import {
  createDriverLicense,
  uploadLicenseImage,
} from "@/services/api/driverLicense";
import { isAxiosError } from "axios";
import { useDriverImport } from "@/hooks/useDriverImport";
import { useParentImport } from "@/hooks/useParentImport";
import ImportResults from "@/components/layout/ImportResults";
import { validateDriver, validateParent } from "@/lib/validation";

const CreateAccountPage: React.FC = () => {
  const [activeAccountType, setActiveAccountType] =
    useState<AccountType>("driver");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [formKey, setFormKey] = useState(0); // Add key to force form reset
  const {
    importLoading: driverImportLoading,
    importResult: driverImportResult,
    handleUploadFiles: handleDriverUploadFiles,
    handleDownloadTemplate: handleDriverDownloadTemplate,
    clearImportResult: clearDriverImportResult,
  } = useDriverImport();

  const {
    importLoading: parentImportLoading,
    importResult: parentImportResult,
    handleUploadFiles: handleParentUploadFiles,
    handleDownloadTemplate: handleParentDownloadTemplate,
    clearImportResult: clearParentImportResult,
  } = useParentImport();

  const handleAccountTypeChange = (type: AccountType) => {
    setActiveAccountType(type);
    setErrors({}); // Clear errors when switching account types
    setFormKey(prev => prev + 1); // Reset form when switching account types
  };

  const handleBack = () => {
    // Navigate back to previous page
    window.history.back();
  };

  // Import handled via hook above

  const handleDriverSubmit = async (data: DriverAccountData) => {
    setLoading(true);
    setErrors({});

    try {
      const newErrors = validateDriver(data);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Map to backend payload
      const dDob = new Date(data.dateOfBirth!);
      const dobDateOnly = `${dDob.getFullYear()}-${String(dDob.getMonth() + 1).padStart(2, "0")}-${String(dDob.getDate()).padStart(2, "0")}`;

      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: Number(data.gender),
        dateOfBirth: dobDateOnly,
        address: data.address,
      };

      console.log("Sending payload to backend:", payload);
      let res;
      try {
        res = await createDriver(payload);
      } catch (e: unknown) {
        let status: number | undefined;
        let data: unknown;
        let msg = "";
        if (isAxiosError(e)) {
          status = e.response?.status;
          data = e.response?.data;
          msg = (data ?? e.message ?? "").toString();
        } else if (e instanceof Error) {
          msg = e.message;
        }
        if (status === 409) {
          const conflictErrors: AccountFormErrors = {};
          if (/email/i.test(msg))
            conflictErrors.email = "Email already exists in the system";
          if (/phone/i.test(msg))
            conflictErrors.phoneNumber =
              "Phone number already exists in the system";
          setErrors({
            ...conflictErrors,
            general:
              "Driver creation failed. Data was not saved to the database.",
          });
          return;
        }
        if (status === 400) {
          const fieldErrors: AccountFormErrors = {};
          if (typeof data === "object" && data) {
            // ModelState  { Field: ["err1","err2"] }
            const record = data as Record<string, unknown>;
            for (const k of Object.keys(record)) {
              const value = record[k];
              const first = Array.isArray(value)
                ? (value as unknown[])[0]
                : value;
              fieldErrors[k.charAt(0).toLowerCase() + k.slice(1)] =
                first?.toString() || "Invalid value";
            }
          }
          setErrors({
            ...fieldErrors,
            general:
              "Driver creation failed. Data was not saved to the database.",
          });
          return;
        }
        setErrors({
          general:
            "Driver creation failed. Data was not saved to the database.",
        });
        return;
      }
      console.log("Backend response:", res);

      // Show backend-generated password
      alert(`Driver created successfully. Temporary password: ${res.password}`);

      // Reset form after successful creation
      setFormKey(prev => prev + 1); // Force form re-render to reset

      // Optional uploads (if provided)
      const uploads: Promise<unknown>[] = [];
      if (data.driverPhoto && data.driverPhoto.length > 0) {
        uploads.push(uploadUserPhoto(res.id, data.driverPhoto[0]));
      }
      if (data.healthCertificate && data.healthCertificate.length > 0) {
        uploads.push(
          uploadHealthCertificate(res.id, data.healthCertificate[0])
        );
      }

      // Driver license creation if all 3 fields provided
      if (data.licenseNumber && data.dateOfIssue && data.issuedBy) {
        try {
          // Ensure min length and date-only format (yyyy-MM-dd)
          const licenseNumber = String(data.licenseNumber).trim();
          if (licenseNumber.length < 5) {
            throw new Error("License number must be at least 5 characters.");
          }
          const d = new Date(data.dateOfIssue);
          const dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
        } catch (e: unknown) {
          console.error("Create driver license failed:", e);
          let message: unknown = "Driver license creation failed";
          if (isAxiosError(e)) {
            message = e.response?.data ?? e.message ?? message;
          } else if (e instanceof Error) {
            message = e.message;
          }
          alert(
            (typeof message === "string" ? message : JSON.stringify(message)) +
              "\nDriver has already been saved to the database."
          );
        }
      }
      if (uploads.length > 0) await Promise.allSettled(uploads);
    } catch (error) {
      console.error("Error creating driver account:", error);
      setErrors({
        general:
          "Failed to create driver account. Please check data or try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParentSubmit = async (data: ParentAccountData & {
    selectedStudents?: any[];
    pickupPoint?: {
      addressText: string;
      latitude: number;
      longitude: number;
      distanceKm: number;
    };
    feeCalculation?: {
      perTripFee: number;
      semesterFee: number;
      totalSchoolDays: number;
      totalTrips: number;
    };
  }) => {
    setLoading(true);
    setErrors({});

    try {
      const newErrors = validateParent(data);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Validate new required fields
      if (!data.selectedStudents || data.selectedStudents.length === 0) {
        setErrors({
          general: "Please select at least one student for this parent.",
        });
        return;
      }

      if (!data.pickupPoint) {
        setErrors({
          general: "Please select a pickup point location on the map.",
        });
        return;
      }

      if (!data.feeCalculation) {
        setErrors({
          general: "Fee calculation is missing. Please select pickup point again.",
        });
        return;
      }

      // Map to backend payload
      const dDob = new Date(data.dateOfBirth!);
      const dobDateOnly = `${dDob.getFullYear()}-${String(dDob.getMonth() + 1).padStart(2, "0")}-${String(dDob.getDate()).padStart(2, "0")}`;

      // Convert gender string to number
      const genderMap: Record<string, number> = {
        "male": 1,
        "female": 2,
        "other": 3
      };

      const parentPayload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: genderMap[data.gender] || 1,
        dateOfBirth: dobDateOnly,
        address: data.address,
      };

      const setupPayload = {
        studentIds: data.selectedStudents.map((s: any) => s.id),
        pickupPoint: data.pickupPoint,
        feeCalculation: data.feeCalculation,
      };

      console.log("Creating parent with full setup...");
      console.log("Parent data:", parentPayload);
      console.log("Setup data:", setupPayload);

      let result;
      try {
        result = await createParentWithFullSetup(parentPayload, setupPayload);
      } catch (e: unknown) {
        let status: number | undefined;
        let responseData: unknown;
        let msg = "";
        if (isAxiosError(e)) {
          status = e.response?.status;
          responseData = e.response?.data;
          msg = (responseData ?? e.message ?? "").toString();
        } else if (e instanceof Error) {
          msg = e.message;
        }

        if (status === 409) {
          const conflictErrors: AccountFormErrors = {};
          if (/email/i.test(msg))
            conflictErrors.email = "Email already exists in the system";
          if (/phone/i.test(msg))
            conflictErrors.phoneNumber =
              "Phone number already exists in the system";
          setErrors({
            ...conflictErrors,
            general:
              "Parent creation failed. Please check the errors above.",
          });
          return;
        }

        if (status === 400) {
          const fieldErrors: AccountFormErrors = {};
          if (typeof responseData === "object" && responseData) {
            const record = responseData as Record<string, unknown>;
            for (const k of Object.keys(record)) {
              const value = record[k];
              const first = Array.isArray(value)
                ? (value as unknown[])[0]
                : value;
              fieldErrors[k.charAt(0).toLowerCase() + k.slice(1)] =
                first?.toString() || "Invalid value";
            }
          }
          setErrors({
            ...fieldErrors,
            general:
              "Parent creation failed. Please check the errors above.",
          });
          return;
        }

        // Generic error
        setErrors({
          general:
            msg || "Failed to create parent account with full setup. Please try again.",
        });
        return;
      }

      console.log("Parent created successfully:", result);

      // Show success message with password
      const studentCount = data.selectedStudents.length;
      const feeFormatted = data.feeCalculation.semesterFee.toLocaleString('vi-VN');

      alert(
        `✅ Parent Account Created Successfully!\n\n` +
        `Email: ${data.email}\n` +
        `Temporary Password: ${result.password}\n\n` +
        `📚 Students Assigned: ${studentCount}\n` +
        `📍 Pickup Point: ${data.pickupPoint.addressText}\n` +
        `💰 Semester Fee: ${feeFormatted}₫\n\n` +
        `A transaction has been created for the parent to pay.\n` +
        `Please provide the login credentials to the parent.`
      );

      // Reset form after successful creation
      setFormKey(prev => prev + 1);

    } catch (error) {
      console.error("Error creating parent account with full setup:", error);
      setErrors({
        general:
          "An unexpected error occurred. Please try again or contact support.",
      });
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
            {(activeAccountType === "driver" || activeAccountType === "parent") && (
              <div className="flex items-center gap-3">
                {(driverImportLoading || parentImportLoading) && (
                  <div className="text-sm text-blue-600">
                    <span className="animate-spin">⏳</span> Importing...
                  </div>
                )}
                <UploadButton
                  onFileSelect={(files) => {
                    if (activeAccountType === "driver") {
                      handleDriverUploadFiles(files);
                    } else if (activeAccountType === "parent") {
                      handleParentUploadFiles(files);
                    }
                  }}
                  onDownloadTemplate={
                    activeAccountType === "driver" 
                      ? handleDriverDownloadTemplate 
                      : handleParentDownloadTemplate
                  }
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
          {driverImportResult && activeAccountType === "driver" && (
            <ImportResults result={driverImportResult} onClose={clearDriverImportResult} />
          )}
          {parentImportResult && activeAccountType === "parent" && (
            <ImportResults result={parentImportResult} onClose={clearParentImportResult} />
          )}

          {/* Form Content */}
          <div className="bg-[#F9F7E3] rounded-2xl p-8 shadow-sm border border-gray-100">
            {activeAccountType === "driver" ? (
              <DriverAccountForm
                key={formKey}
                onSubmit={handleDriverSubmit}
                loading={loading}
                errors={errors}
              />
            ) : (
              <ParentAccountForm
                key={formKey}
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
