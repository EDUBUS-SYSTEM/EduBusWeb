"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DriverRequestsList from "./DriverRequestsList";

export default function DriverRequestsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Driver Requests
            </h1>
            <p className="text-[#6B7280]">
              Quản lý tất cả yêu cầu và đơn nghỉ của tài xế
            </p>
          </div>
          <DriverRequestsList />
        </div>
      </main>
    </div>
  );
}
