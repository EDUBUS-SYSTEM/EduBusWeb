// app/admin/change-password/page.tsx
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ChangePassword from "@/components/admin/ChangePassword";

export default function ChangePasswordPage() {
    return (
        <div>
            <Sidebar />
            <Header />
            <main className="flex justify-center px-6">
                <div className="w-full max-w-3xl">
                    <ChangePassword />
                </div>
            </main>
        </div>
    );
}
