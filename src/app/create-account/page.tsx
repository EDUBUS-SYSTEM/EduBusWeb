"use client";

import React, { useState } from "react";
import SidebarCreateAccount, {
  AccountType,
} from "@/components/layout/SidebarCreateAccount";
import DriverAccountForm from "@/components/forms/DriverAccountForm";
import ParentAccountForm from "@/components/forms/ParentAccountForm";
import SupervisorAccountForm from "@/components/forms/SupervisorAccountForm";
import UploadButton from "@/components/ui/UploadButton";
import {
  DriverAccountData,
  ParentAccountData,
  SupervisorAccountData,
  AccountFormErrors,
} from "@/types";
import { createDriver, uploadHealthCertificate } from "@/services/api/drivers";
import { createParent } from "@/services/api/parents";
import { createSupervisor } from "@/services/api/supervisors";
import { uploadUserPhoto } from "@/services/api/userAccount";
import { createParentWithFullSetup } from "@/services/api/adminParentService";
import {
  createDriverLicense,
  uploadLicenseImage,
} from "@/services/api/driverLicense";
import { isAxiosError } from "axios";
import { useDriverImport } from "@/hooks/useDriverImport";
import { useParentImport } from "@/hooks/useParentImport";
import { useSupervisorImport } from "@/hooks/useSupervisorImport";
import ImportResults from "@/components/layout/ImportResults";
import { validateDriver, validateParent, validateSupervisor } from "@/lib/validation";
import Modal from "@/components/ui/Modal";

const CreateAccountPage: React.FC = () => {
  const [activeAccountType, setActiveAccountType] =
    useState<AccountType>("driver");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [formKey, setFormKey] = useState(0); // Add key to force form reset
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null);
  const [successAccountType, setSuccessAccountType] = useState<AccountType | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const {
    importLoading: driverImportLoading,
    importResult: driverImportResult,
    handleUploadFiles: handleDriverUploadFiles,
    handleDownloadTemplate: handleDriverDownloadTemplate,
    handleExportDrivers,
    clearImportResult: clearDriverImportResult,
  } = useDriverImport();

  const {
    importLoading: parentImportLoading,
    importResult: parentImportResult,
    handleUploadFiles: handleParentUploadFiles,
    handleDownloadTemplate: handleParentDownloadTemplate,
    handleExportParents,
    clearImportResult: clearParentImportResult,
  } = useParentImport();

  const {
    importLoading: supervisorImportLoading,
    importResult: supervisorImportResult,
    handleUploadFiles: handleSupervisorUploadFiles,
    handleDownloadTemplate: handleSupervisorDownloadTemplate,
    handleExportSupervisors,
    clearImportResult: clearSupervisorImportResult,
  } = useSupervisorImport();

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

      // Show success modal for driver
      setSuccessData({
        email: data.email,
        password: res.password,
      });
      setSuccessAccountType("driver");
      setShowSuccessModal(true);

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

  interface StudentWithId {
    id: string;
  }

  const handleParentSubmit = async (data: ParentAccountData & {
    selectedStudents?: StudentWithId[];
    pickupPoint?: {
      addressText: string;
      latitude: number;
      longitude: number;
      distanceKm: number;
    } | null;
    feeCalculation?: {
      perTripFee: number;
      semesterFee: number;
      totalSchoolDays: number;
      totalTrips: number;
    } | null;
  }) => {
    setLoading(true);
    setErrors({});

    try {
      const newErrors = validateParent(data);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
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
        studentIds: (data.selectedStudents || []).map((s) => s.id),
        pickupPoint: data.pickupPoint || null,
        feeCalculation: data.feeCalculation || null,
      };

      console.log("Creating parent...");
      console.log("Parent data:", parentPayload);
      console.log("Setup data:", setupPayload);

      // Check if we have setup data (students and pickup point)
      const hasSetupData = setupPayload.studentIds.length > 0 && 
                          setupPayload.pickupPoint !== null && 
                          setupPayload.feeCalculation !== null;

      let result;
      try {
        if (hasSetupData) {
          // Use full setup if we have students and pickup point
          console.log("Creating parent with full setup...");
          // Type assertion: we know pickupPoint and feeCalculation are not null here
          result = await createParentWithFullSetup(parentPayload, {
            studentIds: setupPayload.studentIds,
            pickupPoint: setupPayload.pickupPoint!,
            feeCalculation: setupPayload.feeCalculation!,
          });
        } else {
          // Otherwise, just create parent account without setup
          console.log("Creating simple parent account...");
          const parentResponse = await createParent(parentPayload);
          result = {
            success: true,
            parentId: parentResponse.id,
            password: parentResponse.password,
          };
        }
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

      // Show success modal
      setSuccessData({
        email: data.email,
        password: result.password,
      });
      setSuccessAccountType("parent");
      setShowSuccessModal(true);

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

  const handleSupervisorSubmit = async (data: SupervisorAccountData) => {
    setLoading(true);
    setErrors({});
    setPhotoUploadError(null);

    try {
      const newErrors = validateSupervisor(data);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const dDob = new Date(data.dateOfBirth!);
      const dobDateOnly = `${dDob.getFullYear()}-${String(dDob.getMonth() + 1).padStart(2, "0")}-${String(
        dDob.getDate()
      ).padStart(2, "0")}`;

      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: Number(data.gender),
        dateOfBirth: dobDateOnly,
        address: data.address,
      };

      let res;
      try {
        res = await createSupervisor(payload);
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
              "Supervisor creation failed. Data was not saved to the database.",
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
              "Supervisor creation failed. Data was not saved to the database.",
          });
          return;
        }

        setErrors({
          general:
            msg ||
            "Supervisor creation failed. Data was not saved to the database.",
        });
        return;
      }

      setSuccessData({
        email: data.email,
        password: res.password,
      });
      setSuccessAccountType("supervisor");
      setShowSuccessModal(true);

      setFormKey((prev) => prev + 1);

      if (data.supervisorPhoto && data.supervisorPhoto.length > 0) {
        try {
          await uploadUserPhoto(res.id, data.supervisorPhoto[0]);
        } catch (e: unknown) {
          console.error("Supervisor photo upload failed", e);
          setPhotoUploadError(
            "Supervisor created successfully but photo upload failed. Please try uploading again later."
          );
        }
      }
    } catch (error) {
      console.error("Error creating supervisor account:", error);
      setErrors({
        general:
          "Failed to create supervisor account. Please check data or try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDriverActive = activeAccountType === "driver";
  const isParentActive = activeAccountType === "parent";
  const isSupervisorActive = activeAccountType === "supervisor";
  const showImportControls = isDriverActive || isParentActive || isSupervisorActive;
  const currentImportLoading =
    (isDriverActive && driverImportLoading) ||
    (isParentActive && parentImportLoading) ||
    (isSupervisorActive && supervisorImportLoading);
  const successTypeForModal = successAccountType ?? activeAccountType;
  const successTitleMap: Record<AccountType, string> = {
    driver: "Driver Account Created Successfully!",
    parent: "Parent Account Created Successfully!",
    supervisor: "Supervisor Account Created Successfully!",
  };
  const successRecipientMap: Record<AccountType, string> = {
    driver: "driver",
    parent: "parent",
    supervisor: "supervisor",
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
            {showImportControls && (
              <div className="flex items-center gap-3">
                {currentImportLoading && (
                  <div className="text-sm text-blue-600">
                    <span className="animate-spin">⏳</span> Importing...
                  </div>
                )}
                <UploadButton
                  onFileSelect={(files) => {
                    if (isDriverActive) {
                      handleDriverUploadFiles(files);
                    } else if (isParentActive) {
                      handleParentUploadFiles(files);
                    } else if (isSupervisorActive) {
                      handleSupervisorUploadFiles(files);
                    }
                  }}
                  onDownloadTemplate={
                    isDriverActive
                      ? handleDriverDownloadTemplate
                      : isParentActive
                      ? handleParentDownloadTemplate
                      : handleSupervisorDownloadTemplate
                  }
                  showDownloadTemplate={true}
                  accept=".xlsx"
                  multiple={false}
                />
                {isSupervisorActive && (
                  <button
                    onClick={handleExportSupervisors}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg
                               bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                               transition-all duration-300 border border-emerald-200
                               hover:border-emerald-300 text-sm font-medium"
                  >
                    <span>Export supervisors</span>
                  </button>
                )}
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
            <ImportResults
              result={driverImportResult}
              type="driver"
              onExport={handleExportDrivers}
              onClose={clearDriverImportResult}
            />
          )}
          {parentImportResult && activeAccountType === "parent" && (
            <ImportResults
              result={parentImportResult}
              type="parent"
              onExport={handleExportParents}
              onClose={clearParentImportResult}
            />
          )}
          {supervisorImportResult && activeAccountType === "supervisor" && (
            <ImportResults
              result={supervisorImportResult}
              type="supervisor"
              onExport={handleExportSupervisors}
              onClose={clearSupervisorImportResult}
            />
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
            ) : activeAccountType === "parent" ? (
              <ParentAccountForm
                key={formKey}
                onSubmit={handleParentSubmit}
                loading={loading}
                errors={errors}
              />
            ) : (
              <SupervisorAccountForm
                key={formKey}
                onSubmit={handleSupervisorSubmit}
                loading={loading}
                errors={errors}
              />
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessData(null);
          setSuccessAccountType(null);
          setCopiedField(null);
          setPhotoUploadError(null);
        }}
        title=""
        size="md"
      >
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {successTitleMap[successTypeForModal]}
          </h3>
          <p className="text-gray-600 mb-6">
            Please provide the login credentials to the {successRecipientMap[successTypeForModal]}
          </p>

          {/* Photo upload warning (for supervisor only) */}
          {successTypeForModal === "supervisor" && photoUploadError && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-300 text-sm text-yellow-800 text-left">
              {photoUploadError}
            </div>
          )}

          {/* Credentials Box */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
            <div className="space-y-4">
              {/* Email */}
              <div className="text-left">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-gray-800 font-mono text-sm break-all">
                      {successData?.email}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (successData?.email) {
                        await navigator.clipboard.writeText(successData.email);
                        setCopiedField("email");
                        setTimeout(() => setCopiedField(null), 2000);
                      }
                    }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm min-w-[80px] ${
                      copiedField === "email"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                    }`}
                    title="Copy email"
                  >
                    {copiedField === "email" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="text-left">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-gray-800 font-mono text-sm">
                      {successData?.password}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (successData?.password) {
                        await navigator.clipboard.writeText(successData.password);
                        setCopiedField("password");
                        setTimeout(() => setCopiedField(null), 2000);
                      }
                    }}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 font-semibold text-sm min-w-[80px] ${
                      copiedField === "password"
                        ? "bg-green-500 text-white"
                        : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                    }`}
                    title="Copy password"
                  >
                    {copiedField === "password" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setShowSuccessModal(false);
              setSuccessData(null);
              setSuccessAccountType(null);
              setCopiedField(null);
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateAccountPage;
