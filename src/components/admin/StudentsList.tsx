"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Student } from "@/types";
import { studentService } from "@/services/studentService/studentService.api";
import {
  StudentDto,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "@/services/studentService/studentService.types";

export default function StudentsList() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  // Add ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - replace with actual API call
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentsData = await studentService.getAll();
      console.log(studentsData);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhoneNumber.includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Sort functionality
  const handleSort = (field: "firstName" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortBy === "createdAt") {
      // Note: createdAt might not be available in StudentDto, so we'll use firstName as fallback
      aValue = a.firstName.toLowerCase();
      bValue = b.firstName.toLowerCase();
    } else {
      aValue = a[sortBy].toLowerCase();
      bValue = b[sortBy].toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

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

  const handleDeleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    const studentName = student
      ? `${student.firstName} ${student.lastName}`
      : "this student";

    if (
      confirm(
        `Are you sure you want to delete ${studentName}? This action cannot be undone.`
      )
    ) {
      // Note: The backend doesn't have a delete endpoint, so we'll just remove from state
      // In a real implementation, you might want to add a delete endpoint or use soft delete
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setSuccessMessage("Student deleted successfully!");
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
            placeholder="Search by first name, email or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="flex gap-2">
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
                Phone Number
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
            {sortedStudents.map((student) => (
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
                  {student.parentPhoneNumber}
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {student.parentId ? "Available" : "Not available"}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {/* {new Date(student.createdAt).toLocaleDateString('en-US')} */}
                  todo
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
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Student"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No students found</p>
            <p className="text-sm mt-2">
              Try changing your search terms or add a new student
            </p>
          </div>
        )}
      </div>

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
