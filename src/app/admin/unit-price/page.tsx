"use client";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import UnitPriceManagement from "./UnitPriceManagement";

export default function UnitPricePage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#463B3B] mb-2">
              Unit Price Management
            </h1>
            <p className="text-gray-600">
              Manage transportation unit prices and pricing policies
            </p>
          </div>
          <UnitPriceManagement />
        </div>
      </main>
    </div>
  );
}

