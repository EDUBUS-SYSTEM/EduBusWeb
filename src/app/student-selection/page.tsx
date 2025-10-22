'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';

interface StudentBriefDto {
  id: string;
  firstName: string;
  lastName: string;
}

function StudentSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<StudentBriefDto[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [parentEmail, setParentEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get data from URL params
    const studentsParam = searchParams.get('students');
    const emailParam = searchParams.get('email');
    
    if (studentsParam && emailParam) {
      try {
        const studentsData = JSON.parse(decodeURIComponent(studentsParam));
        setStudents(studentsData);
        setParentEmail(emailParam);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing students data:', error);
        setError('Error loading student data. Please try again.');
        setLoading(false);
      }
    } else {
      // Redirect back to OTP if no data
      router.push('/verify-otp');
    }
  }, [searchParams, router]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
    // Clear error when user makes selection
    if (error) setError('');
  };

  const handleContinue = () => {
    // Strict validation
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to continue.');
      return;
    }

    console.log('🎯 Student selection - handleContinue called');
    console.log('📧 Parent email:', parentEmail);
    console.log('👥 Selected students:', selectedStudents);

    // Store selected students in localStorage
    localStorage.setItem('selectedStudents', JSON.stringify(selectedStudents));
    localStorage.setItem('parentEmail', parentEmail);

    console.log('💾 Data saved to localStorage:');
    console.log('  - parentEmail:', localStorage.getItem('parentEmail'));
    console.log('  - selectedStudents:', localStorage.getItem('selectedStudents'));

    console.log('🔄 Redirecting to map page...');
    // Redirect to map page
    router.push('/map');
  };

  const handleGoBack = () => {
    router.push('/verify-otp');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
      >
        <div className="flex items-center space-x-3">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src="/edubus_logo.png"
            alt="EduBus Logo"
            width={60}
            height={60}
            className="drop-shadow-lg"
          />
          <span className="text-2xl font-bold text-[#D08700]">EduBus</span>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#FEFCE8] rounded-3xl p-10 shadow-soft-lg min-h-[480px]"
          >
            <div className="flex flex-col gap-6 h-full justify-start max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Students for Registration</h1>
                <p className="text-gray-700">
                  Email: <span className="font-semibold text-[#D08700]">{parentEmail}</span>
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Please select the students you want to register for transportation service
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-100 border border-red-300 rounded-2xl p-4 text-red-600 flex items-center space-x-2"
                >
                  <FaExclamationTriangle className="text-red-500" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}

              {/* Students List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 text-center">
                  Student List ({students.length})
                </h3>
                
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students found for this email</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`
                          p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer
                          ${selectedStudents.includes(student.id)
                            ? 'border-[#FDC700] bg-[#FEFCE8] shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }
                        `}
                        onClick={() => handleStudentToggle(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`
                              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                              ${selectedStudents.includes(student.id)
                                ? 'bg-[#FDC700] border-[#FDC700]'
                                : 'border-gray-300 bg-white'
                              }
                            `}>
                              {selectedStudents.includes(student.id) && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {student.firstName} {student.lastName}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                ID: {student.id}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`
                            px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
                            ${selectedStudents.includes(student.id)
                              ? 'bg-[#FDC700] text-white'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}>
                            {selectedStudents.includes(student.id) ? 'Selected' : 'Not Selected'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              {selectedStudents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-[#FEFCE8] rounded-2xl border border-[#FDC700]"
                >
                  <h4 className="font-semibold text-gray-800 mb-2 text-center">
                    Selection Summary
                  </h4>
                  <p className="text-gray-700 text-center">
                    You have selected <span className="font-bold text-[#D08700]">{selectedStudents.length}</span> student(s)
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinue}
                  disabled={selectedStudents.length === 0}
                  className={`
                    w-full px-8 py-4 rounded-3xl font-semibold text-lg transition-all duration-300
                    ${selectedStudents.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FDC700] text-black shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {selectedStudents.length === 0 ? 'Select at least 1 student' : `Continue with ${selectedStudents.length} student(s)`}
                </motion.button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    ← Back to OTP Verification
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-4 bg-blue-50 rounded-2xl border border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-2 text-center">
                  💡 Instructions
                </h4>
                <ul className="text-blue-700 text-sm space-y-1 text-center">
                  <li>• Click on each student to select/deselect</li>
                  <li>• You can select one or multiple students</li>
                  <li>• Must select at least 1 student to continue</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function StudentSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC700]"></div>
      </div>
    }>
      <StudentSelectionContent />
    </Suspense>
  );
}
