import { lazy, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { TableSkeleton } from "@/components/ui/Skeleton";

// Lazy load AccountManagement for code splitting
const AccountManagement = lazy(() => import("@/components/admin/AccountManagement"));

export default function UsersPage() {
  return (
    <div>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-6 bg-[#FEFCE8] min-h-screen">
        <div className="w-full">
          <Suspense fallback={
            <div className="space-y-8">
              <div className="bg-[#fdc600bd] rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#463B3B] mb-1">User Management</h1>
                    <p className="text-[#463B3B] text-sm opacity-80">Manage user accounts and permissions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <TableSkeleton rows={5} cols={5} />
              </div>
            </div>
          }>
            <AccountManagement />
          </Suspense>
        </div>
      </main>
    </div>
  );
}