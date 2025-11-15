"use client";
import { useState } from "react";
import { FaClock, FaRoute, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ScheduleList from "@/components/admin/ScheduleList";
import RouteScheduleList from "@/components/admin/RouteScheduleList";
import CreateScheduleModal from "@/components/admin/CreateScheduleModal";
import CreateRouteScheduleModal from "@/components/admin/CreateRouteScheduleModal";

export default function ScheduleManagementPage() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'route-schedules'>('schedules');
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCreateRouteSchedule, setShowCreateRouteSchedule] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tabs = [
    {
      id: 'schedules' as const,
      label: 'Schedules',
      icon: <FaClock className="w-4 h-4" />,
      description: 'Manage bus schedules and timetables'
    },
    {
      id: 'route-schedules' as const,
      label: 'Route Schedules',
      icon: <FaRoute className="w-4 h-4" />,
      description: 'Manage schedule assignments to routes'
    }
  ];

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Page Header with Create Button */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#463B3B] mb-1">
                Schedule Management
              </h1>
              <p className="text-gray-600 text-sm">
                Manage bus schedules and route assignments
              </p>
            </div>
            {activeTab === 'schedules' ? (
              <button
                onClick={() => setShowCreateSchedule(true)}
                className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] p-3 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5"
                title="Create New Schedule"
              >
                <FaPlus className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowCreateRouteSchedule(true)}
                className="bg-gradient-to-r from-[#fad23c] to-[#FDC700] text-[#463B3B] p-3 rounded-xl hover:from-[#FDC700] hover:to-[#D08700] transition-all duration-300 shadow-soft hover:shadow-soft-lg transform hover:-translate-y-0.5"
                title="Create New Route Schedule"
              >
                <FaPlus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs and Search in one row */}
          <div className="sticky top-16 z-40 bg-white rounded-2xl shadow-soft-lg p-4 mb-4 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-[#463B3B] shadow-soft'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'schedules' ? 'schedules' : 'route schedules'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterActive === null ? 'all' : filterActive.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilterActive(value === 'all' ? null : value === 'true');
                    }}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                  <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 flex items-center gap-1 text-sm">
                    <FaFilter className="w-3 h-3" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-soft-lg border border-gray-100 overflow-hidden">
            {activeTab === 'schedules' ? (
              <ScheduleList 
                searchTerm={searchTerm}
                filterActive={filterActive}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <RouteScheduleList 
                searchTerm={searchTerm}
                filterActive={filterActive}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>

          {/* Modals */}
          {showCreateSchedule && (
            <CreateScheduleModal
              onClose={() => setShowCreateSchedule(false)}
              onSuccess={() => {
                setShowCreateSchedule(false);
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          )}

          {showCreateRouteSchedule && (
            <CreateRouteScheduleModal
              onClose={() => setShowCreateRouteSchedule(false)}
              onSuccess={() => {
                setShowCreateRouteSchedule(false);
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
