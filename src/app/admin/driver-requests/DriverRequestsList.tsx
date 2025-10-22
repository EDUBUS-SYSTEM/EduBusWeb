"use client";
import { useState } from "react";
import { FaCalendarAlt, FaFileAlt, FaList } from "react-icons/fa";
import LeaveRequestsTab from "./LeaveRequestsTab";
import GeneralRequestsTab from "./GeneralRequestsTab";
import AllRequestsTab from "./AllRequestsTab";

export default function DriverRequestsList() {
  const [activeTab, setActiveTab] = useState("leave");

  const tabs = [
    {
      id: "leave",
      label: "Leave Requests",
      icon: <FaCalendarAlt />,
      count: 0, // TODO: Calculate from actual data
      component: <LeaveRequestsTab />
    },
    {
      id: "general",
      label: "General Requests",
      icon: <FaFileAlt />,
      count: 0, // TODO: Calculate from actual data
      component: <GeneralRequestsTab />
    },
    {
      id: "all",
      label: "All Requests",
      icon: <FaList />,
      count: 0, // TODO: Calculate from actual data
      component: <AllRequestsTab />
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-[#fad23c] text-[#463B3B]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? "bg-[#fad23c] text-[#463B3B]"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 pb-8">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}
