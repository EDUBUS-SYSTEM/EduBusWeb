
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import VehicleListClient from "./VehicleListClient";

export default async function VehicleListPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="flex justify-center px-6 pl-72 pt-16">
        <div className="w-full max-w-6xl py-6">
          <VehicleListClient />
        </div>
      </main>
    </div>
  );
}