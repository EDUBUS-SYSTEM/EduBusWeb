// components/admin/PickupPointManagement/DeadlinesTab.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaTimes,
  FaSave,
  FaCheck,
  FaTimesCircle
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { enrollmentSemesterSettingsService, EnrollmentSemesterSettingsDto, EnrollmentSemesterSettingsCreateDto, EnrollmentSemesterSettingsUpdateDto } from '@/services/api/enrollmentSemesterSettingsService';
import { academicCalendarService } from '@/services/api/academicCalendarService';
import { AcademicCalendar, AcademicSemester } from '@/types';
import Pagination from '@/components/ui/Pagination';
import { formatDate as formatDateCentral } from '@/utils/dateUtils';

const DeadlinesTab: React.FC = () => {
  const [deadlines, setDeadlines] = useState<EnrollmentSemesterSettingsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  // Filters
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<EnrollmentSemesterSettingsDto | null>(null);

  // Academic Calendar data
  const [academicCalendars, setAcademicCalendars] = useState<AcademicCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<AcademicCalendar | null>(null);
  const [availableSemesters, setAvailableSemesters] = useState<AcademicSemester[]>([]);

  // Create form
  const [createForm, setCreateForm] = useState<EnrollmentSemesterSettingsCreateDto>({
    semesterName: '',
    academicYear: '',
    semesterCode: '',
    semesterStartDate: '',
    semesterEndDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    isActive: true,
    description: '',
  });

  // Validation errors
  const [createFormErrors, setCreateFormErrors] = useState<{
    academicCalendar?: string;
    semester?: string;
    registrationStartDate?: string;
    registrationEndDate?: string;
    description?: string;
  }>({});

  // Update form (only 4 fields)
  const [updateForm, setUpdateForm] = useState<EnrollmentSemesterSettingsUpdateDto>({
    registrationStartDate: '',
    registrationEndDate: '',
    isActive: true,
    description: '',
  });

  // Load deadlines
  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page,
        perPage,
      };

      const trimmedSearch = searchTerm.trim();
      const academicYearQuery = trimmedSearch || filterAcademicYear;

      if (academicYearQuery) params.academicYear = academicYearQuery;
      if (filterStatus !== null) params.isActive = filterStatus;

      const result = await enrollmentSemesterSettingsService.getEnrollmentSemesterSettings(params);
      setDeadlines(result.items);
      setTotalCount(result.totalCount);
    } catch (error: unknown) {
      console.error('Failed to load deadlines:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load deadlines';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load academic calendars
  const loadAcademicCalendars = async () => {
    try {
      const calendars = await academicCalendarService.getActiveAcademicCalendars();
      setAcademicCalendars(calendars);
      if (calendars.length > 0) {
        const calendarWithSlots =
          calendars.find(cal => filterEligibleSemesters(cal, deadlines).length > 0) || calendars[0];
        setSelectedCalendar(calendarWithSlots);
        setAvailableSemesters(filterEligibleSemesters(calendarWithSlots, deadlines));
      }
    } catch (error) {
      console.error('Failed to load academic calendars:', error);
    }
  };

  useEffect(() => {
    loadDeadlines();
  }, [page, filterAcademicYear, filterStatus, searchTerm]);

  useEffect(() => {
    loadAcademicCalendars();
  }, []);

  useEffect(() => {
    if (!selectedCalendar) return;
    setAvailableSemesters(filterEligibleSemesters(selectedCalendar, deadlines));
  }, [selectedCalendar, deadlines]);

  // Check if form is valid (for button disable state)
  // This checks basic required fields, full validation happens on submit
  const isCreateFormValid = (): boolean => {
    const hasRequiredFields = !!(
      selectedCalendar &&
      createForm.semesterCode &&
      createForm.registrationStartDate &&
      createForm.registrationEndDate
    );

    // If required fields are filled, check if there are any errors
    if (hasRequiredFields) {
      // Quick validation check without setting errors
      const startDate = parseDateString(createForm.registrationStartDate);
      const endDate = parseDateString(createForm.registrationEndDate);
      const semesterStart = parseDateString(createForm.semesterStartDate);
      const today = parseDateString(getTodayInputDate());
      if (!startDate || !endDate || !today) return false;

      // Check date relationships
      // Both dates must be BEFORE semester start date
      if (startDate < today) return false;
      if (endDate <= startDate) return false;
      if (semesterStart && startDate >= semesterStart) return false;
      if (semesterStart && endDate >= semesterStart) return false;

      // Check description length
      if (createForm.description && createForm.description.length > 500) return false;

      return true;
    }

    return false;
  };

  // Validate create form
  const validateCreateForm = (): boolean => {
    const errors: typeof createFormErrors = {};

    // Validate Academic Calendar
    if (!selectedCalendar) {
      errors.academicCalendar = 'Please select an academic calendar';
    }

    // Validate Semester
    if (!createForm.semesterCode) {
      errors.semester = 'Please select a semester';
    }

    // Validate Registration Start Date
    // Must be BEFORE semester start date (this is deadline for registration BEFORE semester begins)
    if (!createForm.registrationStartDate) {
      errors.registrationStartDate = 'Registration start date is required';
    } else {
      const startDate = parseDateString(createForm.registrationStartDate);
      const today = parseDateString(getTodayInputDate());
      const semesterStart = parseDateString(createForm.semesterStartDate);
      if (!startDate || !today) {
        errors.registrationStartDate = 'Registration start date is invalid';
      } else {
        if (startDate < today) {
          errors.registrationStartDate = 'Registration start date cannot be in the past';
        }
        if (semesterStart && startDate >= semesterStart) {
          errors.registrationStartDate = 'Registration start date must be before semester start date';
        }
      }
    }

    // Validate Registration End Date
    // Must be BEFORE semester start date and AFTER registration start date
    if (!createForm.registrationEndDate) {
      errors.registrationEndDate = 'Registration end date is required';
    } else {
      const startDate = parseDateString(createForm.registrationStartDate);
      const endDate = parseDateString(createForm.registrationEndDate);
      const semesterStart = parseDateString(createForm.semesterStartDate);
      if (!endDate) {
        errors.registrationEndDate = 'Registration end date is invalid';
      } else {
        if (startDate && endDate <= startDate) {
          errors.registrationEndDate = 'End date must be after start date';
        }
        if (semesterStart && endDate >= semesterStart) {
          errors.registrationEndDate = 'Registration end date must be before semester start date';
        }
      }
    }

    // Validate Description (optional but check length if provided)
    if (createForm.description && createForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle semester selection in create form
  const handleSemesterSelect = (semesterCode: string) => {
    if (!selectedCalendar) return;

    const semester = selectedCalendar.semesters.find(s => s.code === semesterCode);
    if (semester) {
      setCreateForm(prev => ({
        ...prev,
        semesterCode: semester.code,
        semesterName: semester.name,
        academicYear: selectedCalendar.academicYear,
        semesterStartDate: formatDateForInput(semester.startDate),
        semesterEndDate: formatDateForInput(semester.endDate),
      }));
      // Clear semester error when selected
      setCreateFormErrors(prev => ({ ...prev, semester: undefined }));
    }
  };

  // Handle academic calendar selection
  const handleCalendarSelect = async (academicYear: string) => {
    try {
      const calendar = await academicCalendarService.getAcademicCalendarByYear(academicYear);
      setSelectedCalendar(calendar);
      setAvailableSemesters(filterEligibleSemesters(calendar, deadlines));
      // Clear academic calendar error when selected
      setCreateFormErrors(prev => ({ ...prev, academicCalendar: undefined }));
      // Reset semester selection when calendar changes
      setCreateForm(prev => ({
        ...prev,
        semesterCode: '',
        semesterName: '',
        semesterStartDate: '',
        semesterEndDate: '',
      }));
    } catch (error) {
      console.error('Failed to load calendar:', error);
    }
  };

  // Create deadline
  const handleCreate = async () => {
    // Validate form before submitting
    if (!validateCreateForm()) {
      toast.error('Please fix all validation errors before submitting');
      return;
    }

    try {
      await enrollmentSemesterSettingsService.createEnrollmentSemesterSetting(createForm);
      toast.success('Deadline created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      setCreateFormErrors({});
      loadDeadlines();
    } catch (error: unknown) {
      console.error('Failed to create deadline:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create deadline';
      toast.error(errorMessage);
    }
  };

  // Update deadline
  const handleUpdate = async () => {
    if (!selectedDeadline) return;
    const { registrationStartDate, registrationEndDate } = updateForm;

    if (!registrationStartDate || !registrationEndDate) {
      toast.error('Registration dates are required');
      return;
    }

    const startDate = parseDateString(registrationStartDate);
    const endDate = parseDateString(registrationEndDate);
    const semesterStart = parseDateString(selectedDeadline.semesterStartDate);
    const today = parseDateString(getTodayInputDate());

    if (!startDate || !endDate || !semesterStart || !today) {
      toast.error('One or more dates are invalid');
      return;
    }

    if (startDate < today) {
      toast.error('Registration start date cannot be in the past');
      return;
    }
    if (endDate <= startDate) {
      toast.error('Registration end date must be after the start date');
      return;
    }

    if (startDate >= semesterStart) {
      toast.error('Registration start date must be before the semester start date');
      return;
    }

    if (endDate >= semesterStart) {
      toast.error('Registration end date must be before the semester start date');
      return;
    }

    try {
      await enrollmentSemesterSettingsService.updateEnrollmentSemesterSetting(
        selectedDeadline.id,
        updateForm
      );
      toast.success('Deadline updated successfully!');
      setShowUpdateModal(false);
      setSelectedDeadline(null);
      loadDeadlines();
    } catch (error: unknown) {
      console.error('Failed to update deadline:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update deadline';
      toast.error(errorMessage);
    }
  };

  // Delete deadline
  const handleDelete = async () => {
    if (!selectedDeadline) return;

    try {
      await enrollmentSemesterSettingsService.deleteEnrollmentSemesterSetting(selectedDeadline.id);
      toast.success('Deadline deleted successfully!');
      setShowDeleteModal(false);
      setSelectedDeadline(null);
      loadDeadlines();
    } catch (error: unknown) {
      console.error('Failed to delete deadline:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete deadline';
      toast.error(errorMessage);
    }
  };

  // Open update modal
  const openUpdateModal = (deadline: EnrollmentSemesterSettingsDto) => {
    setSelectedDeadline(deadline);
    setUpdateForm({
      registrationStartDate: formatDateForInput(deadline.registrationStartDate),
      registrationEndDate: formatDateForInput(deadline.registrationEndDate),
      isActive: deadline.isActive,
      description: deadline.description || '',
    });
    setShowUpdateModal(true);
  };

  // Open delete modal
  const openDeleteModal = (deadline: EnrollmentSemesterSettingsDto) => {
    setSelectedDeadline(deadline);
    setShowDeleteModal(true);
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateForm({
      semesterName: '',
      academicYear: '',
      semesterCode: '',
      semesterStartDate: '',
      semesterEndDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      isActive: true,
      description: '',
    });
    setCreateFormErrors({});
  };

  // Date helpers to avoid timezone shifts when dealing with date-only values
  function parseDateString(dateString: string): Date | null {
    if (!dateString) return null;
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    }
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if ([year, month, day].some(num => Number.isNaN(num))) return null;
    return new Date(year, month - 1, day);
  }

  function filterUpcomingSemesters(semesters: AcademicSemester[]): AcademicSemester[] {
    const today = parseDateString(getTodayInputDate());
    if (!today) return [];
    today.setHours(0, 0, 0, 0);

    return semesters.filter(semester => {
      const startDate = parseDateString(semester.startDate);
      if (!startDate) return false;
      startDate.setHours(0, 0, 0, 0);
      return startDate > today;
    });
  }

  function filterEligibleSemesters(
    calendar: AcademicCalendar | null,
    existingDeadlines: EnrollmentSemesterSettingsDto[]
  ): AcademicSemester[] {
    if (!calendar) return [];

    const upcomingSemesters = filterUpcomingSemesters(calendar.semesters || []);
    const existingCodes = new Set(
      existingDeadlines
        .filter(deadline => deadline.academicYear === calendar.academicYear)
        .map(deadline => deadline.semesterCode)
    );

    return upcomingSemesters.filter(semester => !existingCodes.has(semester.code));
  }

  function formatDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format date for input
  function formatDateForInput(dateString: string): string {
    const date = parseDateString(dateString);
    if (!date) return '';
    return formatDateValue(date);
  }

  function getDayBefore(dateString: string): string {
    const date = parseDateString(dateString);
    if (!date) return '';
    date.setDate(date.getDate() - 1);
    return formatDateValue(date);
  }

  function getTodayInputDate(): string {
    return formatDateValue(new Date());
  }

  // Format date for display - using centralized formatDate
  const formatDateForDisplay = formatDateCentral;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#463B3B] mb-2">Manage Enrollment Deadlines</h2>
          <p className="text-gray-600">
            Manage enrollment registration deadlines for each semester
          </p>
        </div>
        <button
          onClick={() => {
            resetCreateForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] transition-colors font-semibold flex items-center gap-2"
        >
          <FaPlus />
          Create Deadline
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-[#fad23c]" />
          <h3 className="font-semibold text-[#463B3B]">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search by academic year */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by academic year..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
            />
          </div>

          {/* Academic Year Filter */}
          <select
            value={filterAcademicYear}
            onChange={(e) => {
              setFilterAcademicYear(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value="">All Academic Years</option>
            {academicCalendars.map(calendar => (
              <option key={calendar.id} value={calendar.academicYear}>
                {calendar.academicYear}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus === null ? '' : filterStatus.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilterStatus(value === '' ? null : value === 'true');
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Clear Filters */}
          {(filterAcademicYear || filterStatus !== null || searchTerm) && (
            <button
              onClick={() => {
                setFilterAcademicYear('');
                setFilterStatus(null);
                setSearchTerm('');
                setPage(1);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <FaTimes />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Deadlines List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fad23c]"></div>
            <p className="mt-2 text-gray-600">Loading deadlines...</p>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCalendarAlt className="mx-auto text-4xl mb-2 text-gray-300" />
            <p>No deadlines found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deadlines.map((deadline) => (
                    <tr key={deadline.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deadline.semesterName}</div>
                        <div className="text-sm text-gray-500">{deadline.semesterCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deadline.academicYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateForDisplay(deadline.registrationStartDate)} - {formatDateForDisplay(deadline.registrationEndDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${deadline.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {deadline.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {deadline.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUpdateModal(deadline)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(deadline)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > perPage && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(totalCount / perPage)}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  totalItems={totalCount}
                  itemsPerPage={perPage}
                  showInfo={true}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#463B3B]">Create Enrollment Deadline</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Academic Calendar Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Calendar *
                </label>
                <select
                  value={selectedCalendar?.academicYear || ''}
                  onChange={(e) => handleCalendarSelect(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${createFormErrors.academicCalendar
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Academic Calendar</option>
                  {academicCalendars.map(cal => (
                    <option key={cal.id} value={cal.academicYear}>
                      {cal.name} ({cal.academicYear})
                    </option>
                  ))}
                </select>
                {createFormErrors.academicCalendar && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="text-xs" />
                    {createFormErrors.academicCalendar}
                  </p>
                )}
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  value={createForm.semesterCode}
                  onChange={(e) => handleSemesterSelect(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${createFormErrors.semester
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                    }`}
                  disabled={!selectedCalendar}
                >
                  <option value="">Select Semester</option>
                  {availableSemesters.map(sem => (
                    <option key={sem.code} value={sem.code}>
                      {sem.name} ({sem.code})
                    </option>
                  ))}
                </select>
                {createFormErrors.semester ? (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="text-xs" />
                    {createFormErrors.semester}
                  </p>
                ) : createForm.semesterCode ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Semester dates: {formatDateForDisplay(createForm.semesterStartDate)} - {formatDateForDisplay(createForm.semesterEndDate)}
                  </p>
                ) : null}
              </div>

              {/* Registration Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Start Date *
                </label>
                <input
                  type="date"
                  value={createForm.registrationStartDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setCreateForm(prev => ({ ...prev, registrationStartDate: newStartDate }));
                    // Clear errors when user starts typing
                    setCreateFormErrors(prev => ({
                      ...prev,
                      registrationStartDate: undefined,
                      registrationEndDate: undefined // Also clear end date error as relationship may change
                    }));
                    const startDate = parseDateString(newStartDate);
                    const semesterStart = parseDateString(createForm.semesterStartDate);
                    const currentEndDate = parseDateString(createForm.registrationEndDate);
                    if (startDate && semesterStart && startDate >= semesterStart) {
                      setCreateFormErrors(prev => ({
                        ...prev,
                        registrationStartDate: 'Registration start date must be before semester start date'
                      }));
                    }
                    if (startDate && currentEndDate && currentEndDate <= startDate) {
                      setCreateFormErrors(prev => ({
                        ...prev,
                        registrationEndDate: 'End date must be after start date'
                      }));
                    }
                    if (currentEndDate && semesterStart && currentEndDate >= semesterStart) {
                      setCreateFormErrors(prev => ({
                        ...prev,
                        registrationEndDate: 'Registration end date must be before semester start date'
                      }));
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    if (createForm.registrationStartDate) {
                      validateCreateForm();
                    }
                  }}
                  min={getTodayInputDate()}
                  max={createForm.semesterStartDate ? getDayBefore(createForm.semesterStartDate) : undefined}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${createFormErrors.registrationStartDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                    }`}
                />
                {createFormErrors.registrationStartDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="text-xs" />
                    {createFormErrors.registrationStartDate}
                  </p>
                )}
                {createForm.semesterStartDate && !createFormErrors.registrationStartDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be before semester start date ({formatDateForDisplay(createForm.semesterStartDate)})
                  </p>
                )}
              </div>

              {/* Registration End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration End Date *
                </label>
                <input
                  type="date"
                  value={createForm.registrationEndDate}
                  onChange={(e) => {
                    const newEndDate = e.target.value;
                    setCreateForm(prev => ({ ...prev, registrationEndDate: newEndDate }));
                    // Clear error when user starts typing
                    setCreateFormErrors(prev => ({ ...prev, registrationEndDate: undefined }));
                    const startDate = parseDateString(createForm.registrationStartDate);
                    const endDate = parseDateString(newEndDate);
                    const semesterStart = parseDateString(createForm.semesterStartDate);
                    if (startDate && endDate && endDate <= startDate) {
                      setCreateFormErrors(prev => ({
                        ...prev,
                        registrationEndDate: 'End date must be after start date'
                      }));
                    }
                    if (endDate && semesterStart && endDate >= semesterStart) {
                      setCreateFormErrors(prev => ({
                        ...prev,
                        registrationEndDate: 'Registration end date must be before semester start date'
                      }));
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    if (createForm.registrationEndDate) {
                      validateCreateForm();
                    }
                  }}
                  min={createForm.registrationStartDate}
                  max={createForm.semesterStartDate ? getDayBefore(createForm.semesterStartDate) : undefined}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${createFormErrors.registrationEndDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                    }`}
                />
                {createFormErrors.registrationEndDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="text-xs" />
                    {createFormErrors.registrationEndDate}
                  </p>
                )}
                {createForm.registrationStartDate && createForm.semesterStartDate && !createFormErrors.registrationEndDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be after start date and before semester start date ({formatDateForDisplay(createForm.semesterStartDate)})
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={createForm.isActive.toString()}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <span className="text-gray-500 font-normal ml-1">(Optional, max 500 characters)</span>
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => {
                    setCreateForm(prev => ({ ...prev, description: e.target.value }));
                    // Clear error when user starts typing
                    if (e.target.value.length <= 500) {
                      setCreateFormErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  onBlur={() => {
                    // Validate on blur
                    if (createForm.description) {
                      validateCreateForm();
                    }
                  }}
                  rows={3}
                  maxLength={500}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent ${createFormErrors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300'
                    }`}
                  placeholder="Enter description..."
                />
                <div className="flex justify-between items-center mt-1">
                  {createFormErrors.description ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <FaTimesCircle className="text-xs" />
                      {createFormErrors.description}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-gray-500">
                    {createForm.description?.length || 0}/500 characters
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!isCreateFormValid()}
                className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fad23c]"
              >
                <FaSave />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#463B3B]">Update Enrollment Deadline</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Semester:</strong> {selectedDeadline.semesterName} ({selectedDeadline.semesterCode})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Academic Year:</strong> {selectedDeadline.academicYear}
              </p>
            </div>

            <div className="space-y-4">
              {/* Registration Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Start Date *
                </label>
                <input
                  type="date"
                  value={updateForm.registrationStartDate}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, registrationStartDate: e.target.value }))}
                  min={getTodayInputDate()}
                  max={getDayBefore(selectedDeadline.semesterStartDate) || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                />
              </div>

              {/* Registration End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration End Date *
                </label>
                <input
                  type="date"
                  value={updateForm.registrationEndDate}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, registrationEndDate: e.target.value }))}
                  min={updateForm.registrationStartDate || undefined}
                  max={getDayBefore(selectedDeadline.semesterStartDate) || undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={updateForm.isActive.toString()}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                  placeholder="Enter description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg hover:bg-[#FFF085] font-semibold flex items-center gap-2"
              >
                <FaSave />
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDeadline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#463B3B]">Delete Deadline</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the deadline for <strong>{selectedDeadline.semesterName}</strong> ({selectedDeadline.semesterCode})?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default DeadlinesTab;
