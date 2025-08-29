'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaSort, FaEdit, FaTrash, FaEye, FaFileExcel } from 'react-icons/fa';
import { AddStudentModal } from './index';
import { Student } from '@/types';

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'firstName' | 'createdAt'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        parentId: 'parent1',
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        isActive: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        isDeleted: false,
        parent: {
          id: 'parent1',
          email: 'parent1@example.com',
          firstName: 'Nguyễn',
          lastName: 'Bố A',
          phoneNumber: '0123456789',
          address: 'Hà Nội',
          dateOfBirth: '1980-01-01',
          gender: 'Male',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          isDeleted: false,
          role: 'parent'
        }
      },
      {
        id: '2',
        parentId: 'parent2',
        firstName: 'Trần',
        lastName: 'Thị B',
        isActive: true,
        createdAt: '2024-01-16',
        updatedAt: '2024-01-16',
        isDeleted: false,
        parent: {
          id: 'parent2',
          email: 'parent2@example.com',
          firstName: 'Trần',
          lastName: 'Mẹ B',
          phoneNumber: '0987654321',
          address: 'TP.HCM',
          dateOfBirth: '1985-05-15',
          gender: 'Female',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
          isDeleted: false,
          role: 'parent'
        }
      },
      {
        id: '3',
        parentId: 'parent3',
        firstName: 'Lê',
        lastName: 'Văn C',
        isActive: false,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-17',
        isDeleted: false,
        parent: {
          id: 'parent3',
          email: 'parent3@example.com',
          firstName: 'Lê',
          lastName: 'Bố C',
          phoneNumber: '0555666777',
          address: 'Đà Nẵng',
          dateOfBirth: '1975-12-20',
          gender: 'Male',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-03',
          isDeleted: false,
          role: 'parent'
        }
      }
    ];
    
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
    setLoading(false);
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = students.filter(student =>
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent.phoneNumber.includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Sort functionality
  const handleSort = (field: 'firstName' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    if (sortBy === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else {
      aValue = a[sortBy].toLowerCase();
      bValue = b[sortBy].toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleAddStudent = (newStudent: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => {
    const student: Student = {
      ...newStudent,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false
    };
    
    setStudents(prev => [...prev, student]);
    setIsAddModalOpen(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is Excel
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      alert('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    
    // Simulate file processing
    setTimeout(() => {
      // Mock data from Excel - in real app, you would parse the Excel file here
      const mockExcelStudents: Student[] = [
        {
          id: Date.now().toString(),
          parentId: `parent_${Date.now()}`,
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          parent: {
            id: `parent_${Date.now()}`,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Parent',
            phoneNumber: '0123456789',
            address: 'New York',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            role: 'parent'
          }
        },
        {
          id: (Date.now() + 1).toString(),
          parentId: `parent_${Date.now() + 1}`,
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          parent: {
            id: `parent_${Date.now() + 1}`,
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Parent',
            phoneNumber: '0987654321',
            address: 'Los Angeles',
            dateOfBirth: '1985-05-15',
            gender: 'Female',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            role: 'parent'
          }
        }
      ];

      setStudents(prev => [...prev, ...mockExcelStudents]);
      setUploading(false);
      alert(`Successfully imported ${mockExcelStudents.length} students from Excel file!`);
      
      // Reset file input
      event.target.value = '';
    }, 2000);
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
          <label className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <button
              className={`flex items-center justify-center ${
                uploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#FAD23C] hover:bg-[#fad23c]/80'
              } text-white w-10 h-10 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg`}
              disabled={uploading}
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
            onClick={() => handleSort('firstName')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 ${
              sortBy === 'firstName' 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaSort className="w-4 h-4" />
            Name {sortBy === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          
          <button
            onClick={() => handleSort('createdAt')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors duration-200 ${
              sortBy === 'createdAt' 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaSort className="w-4 h-4" />
            Created Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Full Name</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Parent Email</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Phone Number</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Address</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-3 font-semibold text-gray-700">Created Date</th>
              <th className="text-center py-3 px-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-900">
                    {student.lastName} {student.firstName}
                  </div>
                </td>
                <td className="py-3 px-3 text-gray-600">{student.parent.email}</td>
                <td className="py-3 px-3 text-gray-600">{student.parent.phoneNumber}</td>
                <td className="py-3 px-3 text-gray-600">{student.parent.address}</td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600">
                  {new Date(student.createdAt).toLocaleDateString('en-US')}
                </td>
                <td className="py-3 px-3">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
            <p className="text-sm mt-2">Try changing your search terms or add a new student</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
}
