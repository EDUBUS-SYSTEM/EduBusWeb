"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ParentRequestList from "./ParentRequestList";
import ParentLeaveReportsView from "./ParentLeaveReportsView";

export default function ParentRequestsPage() {
  const [viewMode, setViewMode] = useState<"requests" | "reports">("requests");

  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 px-6 pt-16 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#463B3B]">Parent Requests</h1>
              <p className="text-[#6B7280]">
                Monitor pickup location requests and parent leave reports in one place.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode("requests")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "requests"
                    ? "bg-[#463B3B] text-white"
                    : "text-[#463B3B] hover:bg-gray-100"
                }`}
              >
                Pickup Requests
              </button>
              <button
                onClick={() => setViewMode("reports")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "reports"
                    ? "bg-[#463B3B] text-white"
                    : "text-[#463B3B] hover:bg-gray-100"
                }`}
              >
                Leave Reports
              </button>
            </div>
          </div>
          <div className="pb-8">
            {viewMode === "requests" ? <ParentRequestList /> : <ParentLeaveReportsView />}
          </div>
        </div>
      </main>
    </div>
  );
}
