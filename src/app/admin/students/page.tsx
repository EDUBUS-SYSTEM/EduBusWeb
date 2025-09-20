// app/admin/students/page.tsx
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { StudentsList } from "@/components/admin";

export default function StudentsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="lg:ml-64 pt-16 p-4 md:p-6 lg:p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          <StudentsList />
        </div>
      </main>
    </div>
  );
}
