// src/app/admin/routes/page.tsx
"use client";

import React from 'react';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RouteManagement from "@/components/admin/RouteManagement";

const RoutesPage: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        <div className="w-full">
          <RouteManagement />
        </div>
      </main>
    </div>
  );
};

export default RoutesPage;