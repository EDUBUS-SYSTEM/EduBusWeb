"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPlus,
  FaSearch,
  FaSort,
  FaEdit,
  FaTrash,
  FaEye,
  FaFileExcel,
  FaDownload,
} from "react-icons/fa";
import { AddStudentModal, EditStudentModal, ViewStudentModal } from "./index";
import { studentService } from "@/services/studentService/studentService.api";
import {
  StudentDto,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentStatus,
} from "@/services/studentService/studentService.types";

export default function StudentsList() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"firstName" | "createdAt">("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const getStatusInfo = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.Available:
        return { text: "Available", className: "bg-blue-100 text-blue-800" };
      case StudentStatus.Pending:
        return { text: "Pending", className: "bg-yellow-100 text-yellow-800" };
      case StudentStatus.Active:
        return { text: "Active", className: "bg-green-100 text-green-800" };
      case StudentStatus.Inactive:
        return { text: "Inactive", className: "bg-gray-100 text-gray-800" };
      case StudentStatus.Deleted:
        return { text: "Deleted", className: "bg-red-100 text-red-800" };
      default:
        return { text: "Unknown", className: "bg-gray-100 text-gray-800" };
    }
  };

  // Fetch students with optional status filter
  const fetchStudents = useCallback(async (status?: StudentStatus | "all") => {
    try {
      setLoading(true);
      setError(null);
      let studentsData: StudentDto[];

      if (typeof status === "number") {
        studentsData = await studentService.getByStatus(status);
      } else {
        studentsData = await studentService.getAll();
      }

      console.log(studentsData);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch students when status filter changes
  useEffect(() => {
    fetchStudents(statusFilter);
    setCurrentPage(1); // Reset to first page when filtering
  }, [statusFilter, fetchStudents]);
  
  // Search (only one useEffect, null-safe)
  useEffect(() => {
    const term = (searchTerm || "").toLowerCase().trim();

    const filtered = students.filter((s) => {
      const fn = (s.firstName || "").toLowerCase();
      const ln = (s.lastName || "").toLowerCase();
      const email = (s.parentEmail || "").toLowerCase();

      return (
        fn.includes(term) ||
        ln.includes(term) ||
        email.includes(term)
      );
    });

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, students]);

  // Sort functionality
  const handleSort = (field: "firstName" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "createdAt") {
      // Sort by date
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      
      if (sortOrder === "asc") {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    } else {
      // Sort by string fields
      const aValue = ((a[sortBy] as string) ?? "").toLowerCase();
      const bValue = ((b[sortBy] as string) ?? "").toLowerCase();

      if (sortOrder === "asc")
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAddStudent = async (newStudent: CreateStudentRequest) => {
    try {
      await studentService.create(newStudent);
      // Refresh the students list
      await fetchStudents();
      setIsAddModalOpen(false);
      setSuccessMessage("Student added successfully!");
    } catch (err) {
      console.error("Error creating student:", err);
      setError("Failed to create student");
    }
  };

  const handleUpdateStudent = async (
    id: string,
    updateData: UpdateStudentRequest
  ) => {
    try {
      await studentService.update(id, updateData);
      // Refresh the students list
      await fetchStudents();
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      setSuccessMessage("Student updated successfully!");
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Failed to update student");
    }
  };

  const handleEditStudent = (student: StudentDto) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleViewStudent = (student: StudentDto) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Status management handlers
  const handleActivateStudent = async (id: string) => {
    try {
      await studentService.activate(id);
      await fetchStudents(statusFilter);
      setSuccessMessage("Student activated successfully!");
    } catch (err) {
      console.error("Error activating student:", err);
      setError("Failed to activate student");
    }
  };

  const handleDeactivateStudent = async (id: string) => {
    const student = students.find((s) => s.id === id);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "this student";

    const reason = prompt(
      `Please provide a reason for deactivating ${studentName}:`
    );
    if (!reason) {
      alert("Deactivation reason is required");
      return;
    }

    try {
      await studentService.deactivate(id, reason);
      await fetchStudents(statusFilter);
      setSuccessMessage("Student deactivated successfully!");
    } catch (err) {
      console.error("Error deactivating student:", err);
      setError("Failed to deactivate student");
    }
  };

  const handleRestoreStudent = async (id: string) => {
    try {
      await studentService.restore(id);
      await fetchStudents(statusFilter);
      setSuccessMessage("Student restored successfully!");
    } catch (err) {
      console.error("Error restoring student:", err);
      setError("Failed to restore student");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const student = students.find((s) => s.id === id);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "this student";

    if (
      confirm(
        `Are you sure you want to delete ${studentName}? This action cannot be undone.`
      )
    ) {
      try {
        await studentService.delete(id);
        await fetchStudents(statusFilter);
        setSuccessMessage("Student deleted successfully!");
      } catch (err) {
        console.error("Error deleting student:", err);
        setError("Failed to delete student");
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is Excel
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      alert("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setUploading(true);

    try {
      const result = await studentService.importFromExcel(file);
      const successCount = result.successfulStudents?.length || 0;
      const failedCount = result.failedStudents?.length || 0;

      if (successCount > 0) {
        setSuccessMessage(
          `Import completed successfully! ${successCount} students imported.${failedCount > 0 ? ` ${failedCount} failed.` : ""}`
        );
      } else {
        setError("No students were imported successfully.");
      }

      if (failedCount > 0) {
        console.warn("Failed imports:", result.failedStudents);
      }

      // Refresh the students list
      await fetchStudents();
    } catch (err) {
      console.error("Error importing students:", err);
      setError("Failed to import students");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Function to trigger file input
  const handleImportClick = () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  };

  const handleExportStudents = async () => {
    try {
      setExporting(true);
      const blob = await studentService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Students.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage("Students exported successfully!");
    } catch (err) {
      console.error("Error exporting students:", err);
      setError("Failed to export students");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEFCE8] rounded-2xl shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Student Management</h1>
        <div className="flex gap-3">
          {/* Export Button */}
          <button
            onClick={handleExportStudents}
            disabled={exporting}
            className={`flex items-center justify-center ${
              exporting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white w-10 h-10 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg`}
            title="Export to Excel"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FaDownload className="w-5 h-5" />
            )}
          </button>

          <label className="relative">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />

            {/* Import Excel Button */}
            <button
              onClick={handleImportClick}
              disabled={uploading}
              className={`flex items-center justify-center ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#FAD23C] hover:bg-[#fad23c]/80"
              } text-white w-10 h-10 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg`}
              title="Import from Excel"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FaFileExcel className="w-5 h-5" />
              )}
            </button>
          </label>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center bg-[#FAD23C] hover:bg-[#fad23c]/80 text-white w-10 h-10 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <FaPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by first name, last name or parent email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "all"
                  ? "all"
                  : (Number(e.target.value) as StudentStatus)
              )
            }
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value={StudentStatus.Available}>Available</option>
            <option value={StudentStatus.Pending}>Pending</option>
            <option value={StudentStatus.Active}>Active</option>
            <option value={StudentStatus.Inactive}>Inactive</option>
            <option value={StudentStatus.Deleted}>Deleted</option>
          </select>

          <button
            onClick={() => handleSort("firstName")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 ${
              sortBy === "firstName"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaSort className="w-4 h-4" />
            Name {sortBy === "firstName" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>

          <button
            onClick={() => handleSort("createdAt")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 ${
              sortBy === "createdAt"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaSort className="w-4 h-4" />
            Created Date{" "}
            {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Full Name
              </th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Parent Status
              </th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Parent Email
              </th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Address
              </th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">
                Created Date
              </th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-900">
                    {student.lastName} {student.firstName}
                  </div>
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {student.parentId ? "Linked" : "Not linked"}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {student.parentEmail}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {student.parentId ? "Available" : "Not available"}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusInfo(student.status).className
                    }`}
                  >
                    {getStatusInfo(student.status).text}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {new Date(student.createdAt).toLocaleDateString('en-US')}
                </td>
                <td className="py-3 px-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Edit Student"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>

                    {/* Status-specific actions */}
                    {student.status === StudentStatus.Available && (
                      <button
                        onClick={() => handleActivateStudent(student.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Activate Student"
                      >
                        ✓
                      </button>
                    )}

                    {student.status === StudentStatus.Pending && (
                      <button
                        onClick={() => handleActivateStudent(student.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Activate Student"
                      >
                        ✓
                      </button>
                    )}

                    {student.status === StudentStatus.Active && (
                      <button
                        onClick={() => handleDeactivateStudent(student.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                        title="Deactivate Student"
                      >
                        ⏸
                      </button>
                    )}

                    {(student.status === StudentStatus.Inactive ||
                      student.status === StudentStatus.Deleted) && (
                      <button
                        onClick={() => handleRestoreStudent(student.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Restore Student"
                      >
                        ↻
                      </button>
                    )}

                    <button
                      onClick={() =>
                        student.status !== StudentStatus.Deleted &&
                        handleDeleteStudent(student.id)
                      }
                      disabled={student.status === StudentStatus.Deleted}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        student.status === StudentStatus.Deleted
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                      title={
                        student.status === StudentStatus.Deleted
                          ? "Already deleted"
                          : "Delete Student"
                      }
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No students found</p>
            <p className="text-sm mt-2">
              Try changing your search terms or add a new student
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {sortedStudents.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2 bg-[#FEFCE8] rounded-xl px-4 py-2 shadow-sm">
            {/* Previous Button */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || totalPages <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                currentPage === 1 || totalPages <= 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              &lt;
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                const shouldShow =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!shouldShow) {
                  // Show ellipsis for gaps
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                      currentPage === page
                        ? "bg-[#FAD23C] text-gray-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 ${
                currentPage === totalPages || totalPages <= 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleUpdateStudent}
        student={selectedStudent}
      />

      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
}
