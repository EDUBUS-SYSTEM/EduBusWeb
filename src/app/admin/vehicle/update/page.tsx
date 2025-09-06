
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import UpdateVehicleForm from "./UpdateVehicleForm";

export default function UpdateVehiclePage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="flex justify-center px-4 pl-72 pt-20">
        <div className="w-full max-w-2xl py-6">
          <UpdateVehicleForm />
        </div>
      </main>
    </div>
  );
}
