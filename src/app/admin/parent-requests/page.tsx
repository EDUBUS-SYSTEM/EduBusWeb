"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ParentRequestList from "./ParentRequestList";

export default function ParentRequestsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="lg:ml-64 px-4 md:px-6 lg:px-6 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#463B3B] mb-2">
              Parent Requests
            </h1>
            <p className="text-sm md:text-base text-[#6B7280]">
              Manage pickup point service requests from parents
            </p>
          </div>
          <ParentRequestList />
        </div>
      </main>
    </div>
  );
}
