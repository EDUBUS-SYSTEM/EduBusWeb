// src/app/admin/pickup-point-management/page.tsx
"use client";

import React from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PickupPointManagement from "@/components/admin/PickupPointManagement/PickupPointManagement";

const PickupPointManagementPage: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        <div className="w-full">
          <PickupPointManagement />
        </div>
      </main>
    </div>
  );
};

export default PickupPointManagementPage;

