"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaGraduationCap,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { academicCalendarService } from "@/services/api/academicCalendarService";
import { AcademicCalendar, AcademicCalendarQueryParams } from "@/types";

interface AcademicCalendarListProps {
  searchTerm: string;
  filterActive: boolean | null;
  refreshTrigger?: number;
}

export default function AcademicCalendarList({
  searchTerm,
  filterActive,
  refreshTrigger,
}: AcademicCalendarListProps) {
  const [academicCalendars, setAcademicCalendars] = useState<
    AcademicCalendar[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalendar, setSelectedCalendar] =
    useState<AcademicCalendar | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function to handle error responses
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        code?: string;
      };

      if (axiosError.response?.status === 404) {
        return "Academic calendar not found or backend server is not running. Please check:\n1. Backend server is running on port 7061\n2. You are logged in with admin account\n3. Academic calendar ID is correct";
      } else if (axiosError.response?.status === 401) {
        return "Authentication required. Please login again.";
      } else if (axiosError.response?.status === 403) {
        return "You don't have permission to perform this action. Admin role required.";
      } else if (axiosError.response?.status === 400) {
        return `Bad request: ${axiosError.response?.data?.message || "Invalid data format"}`;
      } else if (axiosError.response?.status === 500) {
        return `Server error: ${axiosError.response?.data?.message || "Internal server error"}`;
      } else if (
        axiosError.code === "ECONNREFUSED" ||
        axiosError.code === "ERR_NETWORK"
      ) {
        return "Cannot connect to backend server. Please ensure the backend is running on http://localhost:7061";
      } else if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }

    if (error && typeof error === "object" && "message" in error) {
      return (error as { message: string }).message;
    }

    return defaultMessage;
  };

  // Load academic calendars from API
  const loadAcademicCalendars = useCallback(async () => {
    try {
      setLoading(true);
      const params: AcademicCalendarQueryParams = {
        activeOnly: filterActive === null ? undefined : filterActive,
        page: 1,
        perPage: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const calendarsData =
        await academicCalendarService.getAcademicCalendars(params);
      setAcademicCalendars(calendarsData);
    } catch (error: unknown) {
      console.error("Error loading academic calendars:", error);

      // Debug information
      console.log(
        "API Base URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:7061/api"
      );

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number };
          code?: string;
        };
        console.log("Error status:", axiosError.response?.status);
        console.log("Error code:", axiosError.code);

        // Show user-friendly error message
        if (
          axiosError.response?.status === 404 ||
          axiosError.code === "ECONNREFUSED"
        ) {
          console.log(
            "Backend server might not be running or API endpoint not found"
          );
        }
      }

      // Fallback to empty array on error
      setAcademicCalendars([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive]);

  useEffect(() => {
    loadAcademicCalendars();
  }, [refreshTrigger, filterActive, loadAcademicCalendars]);

  const filteredCalendars = academicCalendars.filter((calendar) => {
    const matchesSearch =
      calendar.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calendar.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || calendar.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get semester color based on index (currently unused but kept for future use)
  // const getSemesterColor = (index: number) => {
  //   const colors = [
  //     'bg-yellow-500 hover:bg-yellow-600', // Semester 1 - Yellow
  //     'bg-orange-500 hover:bg-orange-600', // Semester 2 - Orange
  //     'bg-amber-500 hover:bg-amber-600',   // Semester 3 - Amber
  //     'bg-yellow-600 hover:bg-yellow-700', // Semester 4 - Dark Yellow
  //     'bg-orange-600 hover:bg-orange-700', // Semester 5 - Dark Orange
  //   ];
  //   return colors[index % colors.length];
  // };

  // Function to get semester legend color
  const getSemesterLegendColor = (index: number) => {
    const colors = [
      'bg-yellow-500', // Semester 1
      'bg-orange-500', // Semester 2
      'bg-amber-500',  // Semester 3
      'bg-yellow-600', // Semester 4
      'bg-orange-600', // Semester 5
    ];
    return colors[index % colors.length];
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this academic calendar? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await academicCalendarService.deleteAcademicCalendar(calendarId);
      // Refresh the list after deletion
      loadAcademicCalendars();
    } catch (error: unknown) {
      console.error("Error deleting academic calendar:", error);

      const errorMessage = getErrorMessage(
        error,
        "Failed to delete academic calendar. Please try again."
      );

      alert(errorMessage);
    }
  };

  const handleViewDetails = (calendar: AcademicCalendar) => {
    setSelectedCalendar(calendar);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading academic calendars...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {filteredCalendars.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Academic Calendars Found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterActive !== null
              ? "No academic calendars match your current filters."
              : "Get started by creating your first academic calendar."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalendars.map((calendar) => (
            <div
              key={calendar.id}
              className="bg-gradient-to-r from-white to-yellow-50 border border-gray-100 rounded-2xl p-6 hover:shadow-soft-lg transition-all duration-300 hover:border-yellow-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {calendar.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Academic Year: {calendar.academicYear}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        calendar.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calendar.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="text-sm font-medium">
                          {formatDate(calendar.startDate)} -{" "}
                          {formatDate(calendar.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaExclamationTriangle className="w-4 h-4 mr-2 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Semesters</p>
                        <p className="text-sm font-medium">
                          {calendar.semesters.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                      <FaClock className="w-4 h-4 mr-2 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Holidays</p>
                        <p className="text-sm font-medium">
                          {calendar.holidays.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {formatDate(calendar.createdAt)}
                    {calendar.updatedAt && (
                      <span className="ml-4">
                        Updated: {formatDate(calendar.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetails(calendar)}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    title="View Details"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCalendar(calendar.id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                    title="Delete Calendar"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Academic Calendar Details Modal */}
      {showDetails && selectedCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header with Yellow Gradient Background */}
            <div className="bg-gradient-to-r from-[#fad23c] via-[#FDC700] to-[#D08700] px-8 py-6 text-[#463B3B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaGraduationCap className="w-6 h-6 text-[#463B3B]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#463B3B]">{selectedCalendar.name}</h3>
                    <p className="text-[#463B3B] text-sm opacity-80">
                      Academic Year: {selectedCalendar.academicYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-10 h-10 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <FaTimes className="w-5 h-5 text-[#463B3B]" />
                </button>
              </div>
              </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Status and Quick Info */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedCalendar.isActive
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {selectedCalendar.isActive ? "🟢 Active" : "⚫ Inactive"}
                  </span>
                  <div className="text-sm text-gray-600">
                    Created: {formatDate(selectedCalendar.createdAt)}
                    </div>
                    </div>
                    </div>


              {/* Academic Year Calendar Visualization */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-yellow-600" />
                  Academic Year Calendar Overview
                </h4>
                
                {/* Calendar Grid */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {/* Calendar Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {(() => {
                      const startDate = new Date(selectedCalendar.startDate);
                      const endDate = new Date(selectedCalendar.endDate);
                      const startMonth = startDate.getMonth();
                      const startYear = startDate.getFullYear();
                      // const endMonth = endDate.getMonth();
                      // const endYear = endDate.getFullYear();
                      
                      const months = [];
                      let currentDate = new Date(startYear, startMonth, 1);
                      
                      // Generate months from start to end
                      while (currentDate <= endDate) {
                        months.push(new Date(currentDate));
                        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                      }
                      
                      return months.map((month, monthIndex) => {
                        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
                        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
                        const startDayOfWeek = firstDay.getDay();
                        const daysInMonth = lastDay.getDate();
                        
                        // Check if this month overlaps with academic year
                        // const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
                        // const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
                        // const isInAcademicYear = monthStart <= endDate && monthEnd >= startDate;
                        
                        return (
                          <div key={monthIndex} className="col-span-7 mb-6">
                            {/* Month Header */}
                            <div className="text-center mb-3">
                              <h5 className="text-lg font-semibold text-gray-800">
                                {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </h5>
                            </div>
                            
                            {/* Calendar Grid for this month */}
                            <div className="grid grid-cols-7 gap-1">
                              {/* Empty cells for days before month starts */}
                              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                                <div key={`empty-${index}`} className="h-8"></div>
                              ))}
                              
                              {/* Days of the month */}
                              {Array.from({ length: daysInMonth }, (_, index) => {
                                const day = index + 1;
                                const currentDay = new Date(month.getFullYear(), month.getMonth(), day);
                                const isInRange = currentDay >= startDate && currentDay <= endDate;
                                
                                // Check if this day is in any semester
                                const semesterForDay = selectedCalendar.semesters.find(semester => 
                                  currentDay >= new Date(semester.startDate) && currentDay <= new Date(semester.endDate)
                                );
                                
                                // Get semester index for color coding
                                const semesterIndex = selectedCalendar.semesters.findIndex(semester => 
                                  currentDay >= new Date(semester.startDate) && currentDay <= new Date(semester.endDate)
                                );
                                
                                // Check if this day is a holiday
                                const holidayForDay = selectedCalendar.holidays.find(holiday => 
                                  currentDay >= new Date(holiday.startDate) && currentDay <= new Date(holiday.endDate)
                                );
                                
                                // Check if this day is a special school day
                                const schoolDayForDay = selectedCalendar.schoolDays.find(schoolDay => 
                                  new Date(schoolDay.date).toDateString() === currentDay.toDateString()
                                );
                                
                                // Determine what types of days this day represents
                                const dayTypes = [];
                                if (semesterForDay) dayTypes.push({ type: 'semester', index: semesterIndex });
                                if (holidayForDay) dayTypes.push({ type: 'holiday' });
                                if (schoolDayForDay) dayTypes.push({ type: 'schoolDay', isSchoolDay: schoolDayForDay.isSchoolDay });
                                
                                let dayClass = "h-8 flex items-center justify-center text-sm rounded-md transition-all duration-200 relative overflow-hidden ";
                                // let dayStyle = {};
                                
                                if (!isInRange) {
                                  dayClass += "text-gray-300 bg-gray-50";
                                } else {
                                  dayClass += "text-gray-700 bg-white hover:bg-yellow-50 border border-gray-200 font-medium";
                                }
                                
                                // Create tooltip text
                                const tooltipParts = [];
                                if (semesterForDay) {
                                  tooltipParts.push(`Semester ${semesterIndex + 1}: ${semesterForDay.name} (${semesterForDay.code})`);
                                }
                                if (holidayForDay) {
                                  tooltipParts.push(`Holiday: ${holidayForDay.name}`);
                                }
                                if (schoolDayForDay) {
                                  tooltipParts.push(`Special: ${schoolDayForDay.isSchoolDay ? 'School Day' : 'No School'}`);
                                }
                                if (tooltipParts.length === 0) {
                                  tooltipParts.push(isInRange ? 'Academic Year' : 'Outside Academic Year');
                                }
                                
                                return (
                                  <div
                                    key={day}
                                    className={dayClass}
                                    title={tooltipParts.join(' | ')}
                                  >
                                    {/* Color lines for different day types */}
                                    {dayTypes.length > 0 && (
                                      <div className="absolute inset-0 flex flex-col">
                                        {/* Top line for semester */}
                                        {semesterForDay && (
                                          <div 
                                            className={`h-2 ${getSemesterLegendColor(semesterIndex).replace('bg-', 'bg-')}`}
                                            title={`Semester ${semesterIndex + 1}: ${semesterForDay.name}`}
                                          ></div>
                                        )}
                                        
                                        {/* Middle line for holiday */}
                                        {holidayForDay && (
                                          <div 
                                            className="h-2 bg-red-500"
                                            title={`Holiday: ${holidayForDay.name}`}
                                          ></div>
                                        )}
                                        
                                        {/* Bottom line for special school day */}
                                        {schoolDayForDay && (
                                          <div 
                                            className={`h-2 ${schoolDayForDay.isSchoolDay ? 'bg-green-500' : 'bg-gray-500'}`}
                                            title={`Special: ${schoolDayForDay.isSchoolDay ? 'School Day' : 'No School'}`}
                                          ></div>
                                        )}
                                        
                                        {/* Fill remaining space */}
                                        <div className="flex-1"></div>
                                      </div>
                                    )}
                                    
                                    {/* Day number */}
                                    <span className="relative z-10">{day}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h6 className="text-sm font-medium text-gray-700 mb-3">Legend:</h6>
                    <div className="space-y-4">
                      {/* Color Lines Explanation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs font-medium text-blue-800 mb-2">📅 Color Lines System:</div>
                        <div className="text-xs text-blue-700">
                          Each day shows colored lines at the top of the cell. Multiple lines indicate overlapping events:
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex items-center">
                            <div className="w-8 h-2 bg-yellow-500 rounded mr-2"></div>
                            <span className="text-blue-700">Top line = Semester</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-2 bg-red-500 rounded mr-2"></div>
                            <span className="text-blue-700">Middle line = Holiday</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-2 bg-green-500 rounded mr-2"></div>
                            <span className="text-blue-700">Bottom line = Special School Day</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Semesters */}
                      {selectedCalendar.semesters.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-2">Semester Colors:</div>
                          <div className="flex flex-wrap gap-3 text-xs">
                            {selectedCalendar.semesters.map((semester, index) => (
                              <div key={index} className="flex items-center">
                                <div className={`w-4 h-2 ${getSemesterLegendColor(index)} rounded mr-2`}></div>
                                <span className="text-gray-600">
                                  {semester.name} ({semester.code})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Other Legend Items */}
                      <div>
                        <div className="text-xs font-medium text-gray-600 mb-2">Other Day Types:</div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center">
                            <div className="w-4 h-2 bg-red-500 rounded mr-2"></div>
                            <span className="text-gray-600">Holiday</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-2 bg-green-500 rounded mr-2"></div>
                            <span className="text-gray-600">Special School Day</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-2 bg-gray-500 rounded mr-2"></div>
                            <span className="text-gray-600">No School Day</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-2 bg-white border border-gray-200 rounded mr-2"></div>
                            <span className="text-gray-600">Regular School Day</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Semesters Section */}
              {selectedCalendar.semesters.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FaExclamationTriangle className="w-6 h-6 mr-3 text-yellow-600" />
                    Semesters ({selectedCalendar.semesters.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedCalendar.semesters.map((semester, index) => (
                      <div key={index} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="text-lg font-semibold text-[#463B3B] mb-1">
                          {semester.name}
                            </h5>
                            <p className="text-yellow-700 text-sm font-medium">
                              Code: {semester.code}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                            semester.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {semester.isActive ? "Active" : "Inactive"}
                        </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                            <span className="text-gray-600">Start:</span>
                            <span className="ml-2 font-medium text-gray-800">{formatDate(semester.startDate)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                            <span className="text-gray-600">End:</span>
                            <span className="ml-2 font-medium text-gray-800">{formatDate(semester.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Holidays Section */}
              {selectedCalendar.holidays.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FaClock className="w-6 h-6 mr-3 text-yellow-600" />
                    Holidays ({selectedCalendar.holidays.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedCalendar.holidays.map((holiday, index) => (
                      <div key={index} className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-[#463B3B] mb-2">
                          {holiday.name}
                            </h5>
                            {holiday.description && (
                              <p className="text-yellow-700 text-sm mb-3">
                                {holiday.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="text-gray-600">From:</span>
                                <span className="ml-1 font-medium text-gray-800">{formatDate(holiday.startDate)}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="text-gray-600">To:</span>
                                <span className="ml-1 font-medium text-gray-800">{formatDate(holiday.endDate)}</span>
                              </div>
                            </div>
                          </div>
                          {holiday.isRecurring && (
                            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium border border-yellow-300">
                              🔄 Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* School Days Section */}
              {selectedCalendar.schoolDays.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <FaGraduationCap className="w-6 h-6 mr-3 text-yellow-600" />
                    Special School Days ({selectedCalendar.schoolDays.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCalendar.schoolDays.map((schoolDay, index) => (
                      <div key={index} className={`rounded-xl p-4 border ${
                        schoolDay.isSchoolDay 
                          ? "bg-yellow-50 border-yellow-200" 
                          : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">
                              {formatDate(schoolDay.date)}
                        </div>
                            {schoolDay.description && (
                          <div className="text-sm text-gray-600 mt-1">
                                {schoolDay.description}
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            schoolDay.isSchoolDay
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {schoolDay.isSchoolDay ? "School Day" : "No School"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
