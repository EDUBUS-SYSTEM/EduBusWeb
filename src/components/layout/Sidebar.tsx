// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaUserCircle,
  FaClipboardList,
  FaChartBar,
  FaCommentDots,
  FaFileAlt,
  FaLock,
  FaMapMarkedAlt,
  FaList,
  FaBus,
  FaClock,
  FaCalendarAlt,
  FaUserCheck,
  FaRoute,
  FaDollarSign,
  FaReceipt
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Admin Dashboard", icon: <FaHome /> },
    {
      href: "/admin/dashboard",
      label: "Personal Profile",
      icon: <FaUserCircle />,
    },
    { href: "/admin/users", label: "User Management", icon: <FaUsers /> },
    { href: "/admin/shuttle", label: "Shuttle Register", icon: <FaClipboardList /> },
    { href: "/admin/revenue", label: "Revenue Statistic", icon: <FaChartBar /> },
    { href: "/admin/complaints", label: "Parent Complaint", icon: <FaCommentDots /> },
    { href: "/admin/driver-requests", label: "Driver's Requests", icon: <FaFileAlt /> },
    { href: "/admin/parent-requests", label: "Parent Requests", icon: <FaUserCheck /> },
    { href: "/admin/password", label: "Change Password", icon: <FaLock /> },
    {
      href: "/admin/trips",
      label: "Trip Management",
      icon: <FaMapMarkedAlt />,
    },
    { href: "/admin/students", label: "Students List", icon: <FaList /> },
    {
      href: "/admin/schedules",
      label: "Schedule Management",
      icon: <FaClock />,
    },
    {
      href: "/admin/academic-calendar",
      label: "Academic Calendar",
      icon: <FaCalendarAlt />,
    },
    { href: "/admin/vehicle", label: "Vehicles", icon: <FaBus /> },
    { href: "/admin/routes", label: "Route Management", icon: <FaRoute /> },
    { href: "/admin/unit-price", label: "Unit Price Management", icon: <FaDollarSign /> },
    { href: "/admin/parent-transactions", label: "Parent Transactions", icon: <FaReceipt /> },
  ];

  return (
    <aside className="bg-[#FEFCE8] w-64 h-screen flex flex-col fixed left-0 top-0 shadow-md">
      {/* Header admin avatar */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#fad23c]">
        <Image
          src="/images/admin_avt_default.png"
          alt="avatar"
          width={40}
          height={40}
          className="rounded-full"
        />
        <h1 className="text-xl font-bold text-[#463B3B]">Admin</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-2 text-[#463B3B] text-sm font-medium pr-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-5 py-4 flex items-center gap-3 transition 
              ${pathname === link.href
                ? "bg-[#fad23c] font-semibold"
                : "hover:bg-[#FFF085]"
              }`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
