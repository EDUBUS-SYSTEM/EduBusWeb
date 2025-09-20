"use client";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaFilter,
  FaGraduationCap,
} from "react-icons/fa";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AcademicCalendarList from "@/components/admin/AcademicCalendarList";
import CreateAcademicCalendarModal from "@/components/admin/CreateAcademicCalendarModal";

export default function AcademicCalendarManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="lg:ml-64 pt-16 p-4 md:p-6 lg:p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#463B3B] mb-2">
              Academic Calendar Management
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage academic years, semesters, holidays, and school days
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total Calendars
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#463B3B]">3</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Active Calendars
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#463B3B]">2</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <FaGraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total Semesters
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#463B3B]">6</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    School Days
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-[#463B3B]">180</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-soft-lg p-4 md:p-6 mb-4 md:mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by academic year or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setFilterActive(null)}
                  className={`px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-xs md:text-sm ${
                    filterActive === null
                      ? "bg-[#fad23c] text-[#463B3B] shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaFilter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  All
                </button>
                <button
                  onClick={() => setFilterActive(true)}
                  className={`px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-xs md:text-sm ${
                    filterActive === true
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaCalendarAlt className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Active
                </button>
                <button
                  onClick={() => setFilterActive(false)}
                  className={`px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-xs md:text-sm ${
                    filterActive === false
                      ? "bg-gray-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Inactive
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center justify-center shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5 font-semibold text-sm md:text-base"
              >
                <FaPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Create Calendar</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Academic Calendar List */}
          <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
            <AcademicCalendarList
              searchTerm={searchTerm}
              filterActive={filterActive}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>

      {/* Create Academic Calendar Modal */}
      {showCreateModal && (
        <CreateAcademicCalendarModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
