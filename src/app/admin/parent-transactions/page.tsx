"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ParentTransactionManagement from "./ParentTransactionManagement";

export default function ParentTransactionPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Parent Transactions
            </h1>
            <p className="text-gray-600">
              Manage parent transactions and payment status
            </p>
          </div>
          <ParentTransactionManagement />
        </div>
      </main>
    </div>
  );
}

