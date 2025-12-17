
"use client";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-end px-6 bg-white border-b shadow-sm z-50">
      <button
        onClick={logout}
        className="flex items-center gap-2 bg-[#D32F2F] text-white 
                   px-3 py-1 rounded-lg hover:bg-[#9a1c1c] transition"
      >
        <FaSignOutAlt /> Log out
      </button>
    </header>
  );
}





