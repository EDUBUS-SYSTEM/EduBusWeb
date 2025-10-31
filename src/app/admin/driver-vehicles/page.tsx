import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DriverVehicleListClient from "./DriverVehicleListClient";

export default async function DriverVehicleAssignmentsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="flex justify-center px-6 pl-72 pt-16">
        <div className="w-full max-w-6xl py-6">
          <DriverVehicleListClient />
        </div>
      </main>
    </div>
  );
}
