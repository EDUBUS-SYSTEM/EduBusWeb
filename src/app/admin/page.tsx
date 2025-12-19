import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-20 px-8 pb-8">
                <div className="max-w-[1600px] mx-auto">
                    <AdminDashboard />
                </div>
            </main>
        </div>
    );
}
