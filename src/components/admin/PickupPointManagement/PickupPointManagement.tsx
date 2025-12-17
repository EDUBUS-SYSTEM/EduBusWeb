"use client";

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaSyncAlt } from 'react-icons/fa';
import PickupPointsTab from './PickupPointsTab';
import DeadlinesTab from './DeadlinesTab';
import ResetSemesterTab from './ResetSemesterTab';

type TabType = 'pickup-points' | 'deadlines' | 'reset-semester';

const PickupPointManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pickup-points');

  const tabs = [
    { id: 'pickup-points' as TabType, label: 'Pickup Points', icon: <FaMapMarkerAlt /> },
    { id: 'deadlines' as TabType, label: 'Deadlines', icon: <FaClock /> },
    { id: 'reset-semester' as TabType, label: 'Reset Semester', icon: <FaSyncAlt /> },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#463B3B] mb-2">Pickup Point Management</h1>
        <p className="text-gray-600">Manage pickup points, enrollment deadlines, and semester resets</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-[#fad23c] text-[#463B3B] bg-[#FFF085]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pickup-points' && <PickupPointsTab />}
          {activeTab === 'deadlines' && <DeadlinesTab />}
          {activeTab === 'reset-semester' && <ResetSemesterTab />}
        </div>
      </div>
    </div>
  );
};

export default PickupPointManagement;

