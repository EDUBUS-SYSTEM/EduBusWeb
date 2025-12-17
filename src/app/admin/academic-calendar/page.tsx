"use client";
import { useState } from "react";
import {
  FaPlus,
  FaSearch,
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
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Academic Calendar Management
            </h1>
            <p className="text-gray-600">
              Manage academic years, semesters, holidays, and school days
            </p>
          </div>


          
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search calendars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterActive === null
                    ? "bg-[#fad23c] text-[#463B3B]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterActive === true
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  filterActive === false
                    ? "bg-gray-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>

            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] px-4 py-2 rounded-lg hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 flex items-center font-medium text-sm"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-gray-100">
            <AcademicCalendarList
              searchTerm={searchTerm}
              filterActive={filterActive}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateAcademicCalendarModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
