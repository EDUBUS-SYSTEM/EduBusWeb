"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RelocationRequestList from "./RelocationRequestList";

export default function RelocationRequestsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 px-6 pt-16 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#463B3B]">Relocation Requests</h1>
            <p className="text-[#6B7280] mt-2">
              Manage parent requests to change student pickup locations
            </p>
          </div>
          <RelocationRequestList />
        </div>
      </main>
    </div>
  );
}
