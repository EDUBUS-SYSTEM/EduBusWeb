// app/admin/page.tsx
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Profile from "@/components/admin/Profile";

export default function AdminPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="flex justify-center px-6">
        <div className="w-full max-w-3xl">
          <Profile />
        </div>
      </main>
    </div>
  );
}
