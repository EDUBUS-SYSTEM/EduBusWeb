// app/admin/students/page.tsx
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { StudentsList } from "@/components/admin";

export default function StudentsPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6">
        <div className="w-full">
          <StudentsList />
        </div>
      </main>
    </div>
  );
}
