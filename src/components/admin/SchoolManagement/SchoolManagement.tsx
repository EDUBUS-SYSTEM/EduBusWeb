"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { FaEdit, FaMapMarkerAlt, FaSave, FaTimes, FaSpinner, FaSchool, FaEnvelope, FaPhone, FaGlobe, FaCheckCircle, FaTimesCircle, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import { schoolService } from "@/services/schoolService/schoolService.api";
import { SchoolDto, UpdateSchoolRequest, SchoolLocationRequest } from "@/services/schoolService/schoolService.types";
import { fileService, SchoolImageInfo, SchoolImageType } from "@/services/fileService/fileService.api";
import LandingView from "@/components/landing/LandingView";
import SchoolMapPicker from "./SchoolMapPicker";
import SchoolImageUpload from "./SchoolImageUpload";
import FormField, { CharacterCounter, ValidationSummary } from "@/components/ui/FormField";
import { 
  validateSchoolForm, 
  validateLocationForm, 
  validateFieldOnChange, 
  ValidationError,
  getFieldError,
  hasFieldError
} from "@/utils/schoolValidation";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export default function SchoolManagement() {
  const [school, setSchool] = useState<SchoolDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [schoolImages, setSchoolImages] = useState<SchoolImageInfo[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [formData, setFormData] = useState<UpdateSchoolRequest>({
    schoolName: "",
    slogan: "",
    shortDescription: "",
    fullDescription: "",
    email: "",
    phoneNumber: "",
    website: "",
    fullAddress: "",
    displayAddress: "",
    latitude: undefined,
    longitude: undefined,
    footerText: "",
    isPublished: false,
    internalNotes: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const schoolId = school?.id && school.id !== EMPTY_GUID ? school.id : null;
  const isNewSchool = !schoolId;

  const mapDtoToForm = (data: SchoolDto): UpdateSchoolRequest => ({
    schoolName: data.schoolName || "",
    slogan: data.slogan || "",
    shortDescription: data.shortDescription || "",
    fullDescription: data.fullDescription || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    website: data.website || "",
    fullAddress: data.fullAddress || "",
    displayAddress: data.displayAddress || "",
    latitude: data.latitude,
    longitude: data.longitude,
    footerText: data.footerText || "",
    isPublished: data.isPublished || false,
    internalNotes: data.internalNotes || "",
  });

  useEffect(() => {
    loadSchool();
  }, []);

  const loadSchoolImages = useCallback(async () => {
    if (!schoolId) {
      setSchoolImages([]);
      return;
    }

    try {
      setLoadingImages(true);
      const images = await fileService.getSchoolImages();
      setSchoolImages(images);
    } catch (error) {
      console.error("Error loading school images:", error);
    } finally {
      setLoadingImages(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadSchoolImages();
  }, [loadSchoolImages]);

  const refreshVisualAssets = (silent = true) => {
    loadSchoolImages();
    loadSchool({ silent });
  };

  const getImageInfo = (type: SchoolImageType) => schoolImages.find((img) => img.fileType === type);

  const getImageUrl = (info?: SchoolImageInfo) => (info ? fileService.getFileUrl(info.fileId) : undefined);

  const loadSchool = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) {
        setLoading(true);
      }
      const data = await schoolService.getForAdmin();
      setSchool(data);
      setFormData(mapDtoToForm(data));
    } catch (error) {
      console.error("Error loading school:", error);
      
      // Debug information
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");
      
      const errorWithResponse = error as { response?: { status?: number; data?: { message?: string } }; message?: string; code?: string };
      
      if (errorWithResponse?.response) {
        const status = errorWithResponse.response.status;
        const message = errorWithResponse.response.data?.message || errorWithResponse.message;
        
        if (status === 404) {
          // School not found - might need to create one
          alert("School information not found. You may need to create school information first.");
        } else if (status === 401) {
          alert("Authentication required. Please login again.");
        } else if (status === 403) {
          alert("You don't have permission. Admin role required.");
        } else {
          alert(`Failed to load school information: ${message || "Unknown error"}`);
        }
      } else if (errorWithResponse?.code === "ECONNREFUSED" || errorWithResponse?.code === "ERR_NETWORK") {
        alert("Cannot connect to backend server. Please ensure the backend is running.");
      } else {
        alert("Failed to load school information. Please check your connection and try again.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation
    const error = validateFieldOnChange(name, newValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(err => err.field !== name));
    }
  };

  const handleSave = async () => {
    // Validate form
    const validation = validateSchoolForm(formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Set individual field errors for UI
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      setValidationErrors([]);
      setFieldErrors({});
      
      let updated: SchoolDto;
      if (isNewSchool) {
        updated = await schoolService.create(formData);
      } else {
        if (!schoolId) {
          throw new Error("Missing school id for update.");
        }
        updated = await schoolService.update(schoolId, formData);
      }

      setSchool(updated);
      setFormData(mapDtoToForm(updated));
      setIsEditing(false);
      alert(isNewSchool ? "School information created successfully!" : "School information updated successfully!");

      if (isNewSchool) {
        loadSchoolImages();
      }
    } catch (error) {
      console.error("Error updating school:", error);
      const errorWithResponse = error as { response?: { data?: { message?: string; errors?: Record<string, unknown> } } };
      
      // Handle validation errors from backend
      if (errorWithResponse?.response?.data?.errors) {
        const backendErrors: ValidationError[] = [];
        const errors = errorWithResponse.response.data.errors;
        
        Object.keys(errors).forEach(field => {
          const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
          messages.forEach((message: string) => {
            backendErrors.push({ field: field.toLowerCase(), message });
          });
        });
        
        setValidationErrors(backendErrors);
        const fieldErrorsMap: Record<string, string> = {};
        backendErrors.forEach(err => {
          fieldErrorsMap[err.field] = err.message;
        });
        setFieldErrors(fieldErrorsMap);
      } else {
        const errorMessage = errorWithResponse?.response?.data?.message || "Failed to update school information";
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLocationUpdate = async (location: SchoolLocationRequest) => {
    if (!schoolId) {
      alert("Please save school information before setting location.");
      return;
    }

    // Validate location data
    const validation = validateLocationForm(location);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(err => err.message).join('\n');
      alert(`Please fix the following errors:\n${errorMessages}`);
      return;
    }

    try {
      setSaving(true);
      const updated = await schoolService.updateLocation(schoolId, location);
      setSchool(updated);
      setFormData(mapDtoToForm(updated));
      setShowMapPicker(false);
      alert("School location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      const errorWithResponse = error as { response?: { data?: { message?: string; errors?: Record<string, unknown> } } };
      
      // Handle validation errors from backend
      if (errorWithResponse?.response?.data?.errors) {
        const errors = errorWithResponse.response.data.errors;
        const errorMessages = Object.keys(errors).map(field => {
          const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
          return messages.join(', ');
        }).join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        const errorMessage = errorWithResponse?.response?.data?.message || "Failed to update school location";
        alert(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (school) {
      setFormData(mapDtoToForm(school));
    }
    setValidationErrors([]);
    setFieldErrors({});
    setIsEditing(false);
  };

  const previewSchool = useMemo<SchoolDto | null>(() => {
    if (!school) return null;
    return {
      ...school,
      ...(formData as Partial<SchoolDto>),
    } as SchoolDto;
  }, [school, formData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c]"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No school information found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Homepage Preview */}
      {previewSchool && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-[#463B3B]">Homepage Preview</h2>
              <p className="text-gray-600">Preview the landing page interface while editing content.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Auto-updates as you enter data</span>
              <button
                onClick={() => loadSchool()}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FaSpinner className={`w-4 h-4 ${loadingImages ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <div className="max-h-[85vh] overflow-y-auto bg-[#FEFCE8]">
              <LandingView
                school={previewSchool}
                isLoadingSchool={false}
                loadError={null}
                previewMode
                embedded
              />
            </div>
          </div>
        </div>
      )}

      {/* School Information Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#fad23c] to-[#FFF085] px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <FaSchool className="w-6 h-6 text-[#463B3B]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#463B3B]">School Information</h2>
                <p className="text-sm text-[#463B3B]/80">Manage school information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-white text-[#463B3B] rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <FaEdit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Validation Summary */}
          {validationErrors.length > 0 && (
            <ValidationSummary errors={validationErrors} className="mb-6" />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Name */}
            <div className="md:col-span-2">
              {isEditing ? (
                <FormField
                  label="School Name"
                  icon={<FaSchool className="w-4 h-4" />}
                  required
                  error={getFieldError(validationErrors, 'schoolName') || fieldErrors.schoolName}
                >
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter school name"
                  />
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaSchool className="w-4 h-4 text-[#fad23c]" />
                    School Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                    <p className="text-gray-900 font-semibold text-lg">{school.schoolName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Slogan */}
            <div className="md:col-span-2">
              {isEditing ? (
                <FormField
                  label="Slogan"
                  icon={<FaInfoCircle className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'slogan') || fieldErrors.slogan}
                  description="Maximum 300 characters"
                >
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="slogan"
                      value={formData.slogan}
                      onChange={handleInputChange}
                      placeholder="Enter school slogan"
                    />
                    <CharacterCounter current={formData.slogan?.length || 0} max={300} />
                  </div>
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaInfoCircle className="w-4 h-4 text-[#fad23c]" />
                    Slogan
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                    {school.slogan ? (
                      <p className="text-gray-900 italic">{school.slogan}</p>
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              {isEditing ? (
                <FormField
                  label="Email"
                  icon={<FaEnvelope className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'email') || fieldErrors.email}
                  description="Maximum 320 characters"
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="school@example.com"
                  />
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaEnvelope className="w-4 h-4 text-[#fad23c]" />
                    Email
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                    <p className="text-gray-900 flex items-center gap-2">
                      {school.email ? (
                        <>
                          <FaEnvelope className="w-4 h-4 text-gray-400" />
                          {school.email}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              {isEditing ? (
                <FormField
                  label="Phone Number"
                  icon={<FaPhone className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'phoneNumber') || fieldErrors.phoneNumber}
                  description="International format supported (max 20 characters)"
                >
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+84 XXX XXX XXX"
                  />
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaPhone className="w-4 h-4 text-[#fad23c]" />
                    Phone Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                    <p className="text-gray-900 flex items-center gap-2">
                      {school.phoneNumber ? (
                        <>
                          <FaPhone className="w-4 h-4 text-gray-400" />
                          {school.phoneNumber}
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Website */}
            <div>
              {isEditing ? (
                <FormField
                  label="Website"
                  icon={<FaGlobe className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'website') || fieldErrors.website}
                  description="Must start with http:// or https:// (max 500 characters)"
                >
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaGlobe className="w-4 h-4 text-[#fad23c]" />
                    Website
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                    {school.website ? (
                      <a 
                        href={school.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 transition-colors"
                      >
                        <FaGlobe className="w-4 h-4" />
                        {school.website}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Published Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FaCheckCircle className="w-4 h-4 text-[#fad23c]" />
                Published Status
              </label>
              {isEditing ? (
                <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#fad23c] border-gray-300 rounded focus:ring-[#fad23c] cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">Published to public</span>
                </label>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full ${
                    school.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {school.isPublished ? (
                      <>
                        <FaCheckCircle className="w-4 h-4" />
                        Published
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="w-4 h-4" />
                        Not Published
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="md:col-span-2">
              {isEditing ? (
                <FormField
                  label="Short Description"
                  icon={<FaFileAlt className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'shortDescription') || fieldErrors.shortDescription}
                  description="Maximum 500 characters"
                >
                  <div className="space-y-2">
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter a brief description..."
                    />
                    <CharacterCounter current={formData.shortDescription?.length || 0} max={500} />
                  </div>
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaFileAlt className="w-4 h-4 text-[#fad23c]" />
                    Short Description
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent min-h-[80px]">
                    {school.shortDescription ? (
                      <p className="text-gray-900">{school.shortDescription}</p>
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Full Description */}
            <div className="md:col-span-2">
              {isEditing ? (
                <FormField
                  label="Full Description"
                  icon={<FaFileAlt className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'fullDescription') || fieldErrors.fullDescription}
                  description="Maximum 5000 characters"
                >
                  <div className="space-y-2">
                    <textarea
                      name="fullDescription"
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Enter detailed description..."
                    />
                    <CharacterCounter current={formData.fullDescription?.length || 0} max={5000} />
                  </div>
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaFileAlt className="w-4 h-4 text-[#fad23c]" />
                    Full Description
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent min-h-[120px]">
                    {school.fullDescription ? (
                      <p className="text-gray-900 whitespace-pre-wrap">{school.fullDescription}</p>
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Text */}
            <div className="md:col-span-2">
              {isEditing ? (
                <FormField
                  label="Footer Text"
                  icon={<FaInfoCircle className="w-4 h-4" />}
                  error={getFieldError(validationErrors, 'footerText') || fieldErrors.footerText}
                  description="Maximum 500 characters"
                >
                  <div className="space-y-2">
                    <textarea
                      name="footerText"
                      value={formData.footerText}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Enter footer text..."
                    />
                    <CharacterCounter current={formData.footerText?.length || 0} max={500} />
                  </div>
                </FormField>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FaInfoCircle className="w-4 h-4 text-[#fad23c]" />
                    Footer Text
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg border-2 border-transparent min-h-[60px]">
                    {school.footerText ? (
                      <p className="text-gray-900">{school.footerText}</p>
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaTimes className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.schoolName}
              className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Location Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#463B3B]">School Location</h2>
          <button
            onClick={() => {
              if (!schoolId) {
                alert("Please save school information before setting the location.");
                return;
              }
              setShowMapPicker(true);
            }}
            disabled={!schoolId}
            className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors flex items-center gap-2"
          >
            <FaMapMarkerAlt className="w-4 h-4" />
            {school.latitude && school.longitude ? "Update Location" : "Set Location"}
          </button>
        </div>

        {school.latitude && school.longitude ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <p className="text-gray-900">{school.latitude}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <p className="text-gray-900">{school.longitude}</p>
              </div>
            </div>
            {school.fullAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <p className="text-gray-900">{school.fullAddress}</p>
              </div>
            )}
            {school.displayAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Address
                </label>
                <p className="text-gray-900">{school.displayAddress}</p>
              </div>
            )}
            <div className="mt-4">
              <a
                href={`https://www.google.com/maps?q=${school.latitude},${school.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                View on Google Maps
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaMapMarkerAlt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No location set. Click &quot;Set Location&quot; to add school location on map.</p>
          </div>
        )}
      </div>

      {/* Images Card - Only show if school exists */}
      {schoolId ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FEFCE8] to-[#FEF9C3] px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#463B3B] mb-1">Homepage Media</h2>
                <p className="text-gray-600 text-sm">Manage logo and images for homepage sections</p>
              </div>
              {loadingImages && <FaSpinner className="w-5 h-5 text-[#fad23c] animate-spin" />}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Logo & Banner Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#fad23c] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Logo & Banner</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <SchoolImageUpload
                    schoolId={schoolId}
                    fileType="Logo"
                    label="Logo"
                    currentImageUrl={getImageUrl(getImageInfo("Logo"))}
                    currentFileId={getImageInfo("Logo")?.fileId}
                    onUploadSuccess={() => refreshVisualAssets()}
                    onDeleteSuccess={() => refreshVisualAssets()}
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <SchoolImageUpload
                    schoolId={schoolId}
                    fileType="Banner"
                    label="Hero banner"
                    currentImageUrl={getImageUrl(getImageInfo("Banner"))}
                    currentFileId={getImageInfo("Banner")?.fileId}
                    onUploadSuccess={() => refreshVisualAssets()}
                    onDeleteSuccess={() => refreshVisualAssets()}
                  />
                </div>
              </div>
            </div>

            {/* Section Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#fad23c] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Section Images</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <SchoolImageUpload
                    schoolId={schoolId}
                    fileType="StayConnected"
                    label="Stay Connected section"
                    currentImageUrl={getImageUrl(getImageInfo("StayConnected"))}
                    currentFileId={getImageInfo("StayConnected")?.fileId}
                    onUploadSuccess={() => refreshVisualAssets()}
                    onDeleteSuccess={() => refreshVisualAssets()}
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <SchoolImageUpload
                    schoolId={schoolId}
                    fileType="FeatureHighlight"
                    label="Feature section"
                    currentImageUrl={getImageUrl(getImageInfo("FeatureHighlight"))}
                    currentFileId={getImageInfo("FeatureHighlight")?.fileId}
                    onUploadSuccess={() => refreshVisualAssets()}
                    onDeleteSuccess={() => refreshVisualAssets()}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-[#fad23c] rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Gallery</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <SchoolImageUpload
                  schoolId={schoolId}
                  fileType="Gallery"
                  label="Gallery"
                  multiple
                  maxImages={10}
                  galleryImages={schoolImages
                    .filter((img) => img.fileType === "Gallery")
                    .map((img) => ({
                      fileId: img.fileId,
                      imageUrl: fileService.getFileUrl(img.fileId),
                      originalFileName: img.originalFileName,
                    }))}
                  onUploadSuccess={() => refreshVisualAssets()}
                  onDeleteSuccess={() => refreshVisualAssets()}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="bg-gradient-to-r from-[#FEFCE8] to-[#FEF9C3] -m-6 mb-6 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#463B3B] mb-2">Homepage Media</h2>
          </div>
          <p className="text-gray-600">
            Save the school information first to enable uploading logo, banner, and gallery images.
          </p>
        </div>
      )}

      {/* Map Picker Modal */}
      {showMapPicker && (
        <SchoolMapPicker
          isOpen={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          currentLocation={
            school.latitude && school.longitude
              ? { lat: school.latitude, lng: school.longitude }
              : undefined
          }
          onLocationSelect={handleLocationUpdate}
        />
      )}
    </div>
  );
}

