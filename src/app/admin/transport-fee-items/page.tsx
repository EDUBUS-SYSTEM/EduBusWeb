"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TransportFeeItemList from "./TransportFeeItemList";

export default function TransportFeeItemsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Transport Fee Items
            </h1>
            <p className="text-[#6B7280]">
              Manage transport fee items and billing
            </p>
          </div>
          <TransportFeeItemList />
        </div>
      </main>
    </div>
  );
}
