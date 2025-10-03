"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import UnitPriceList from "@/components/admin/UnitPriceList";

export default function UnitPriceManagementPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <UnitPriceList />
        </div>
      </main>
    </div>
  );
}
