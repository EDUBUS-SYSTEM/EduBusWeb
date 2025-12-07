// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useEffect, useLayoutEffect } from "react";
import {
  FaHome,
  FaUsers,
  FaUserCircle,
  FaFileAlt,
  FaMapMarkedAlt,
  FaList,
  FaBus,
  FaClock,
  FaCalendarAlt,
  FaUserCheck,
  FaRoute,
  FaDollarSign,
  FaReceipt,
  FaUserCog,
  FaSchool,
  FaMapMarkerAlt,
  FaKey
} from "react-icons/fa";

const SIDEBAR_SCROLL_KEY = 'sidebar_scroll_position';

export default function Sidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const isRestoringRef = useRef(false);

  const links = [
    { href: "/admin", label: "Admin Dashboard", icon: <FaHome /> },
    {
      href: "/admin/dashboard",
      label: "Personal Profile",
      icon: <FaUserCircle />,
    },
    { href: "/admin/change-password", label: "Change Password", icon: <FaKey /> },
    { href: "/admin/users", label: "User Management", icon: <FaUsers /> },
    { href: "/admin/driver-requests", label: "Driver's Requests", icon: <FaFileAlt /> },
    { href: "/admin/parent-requests", label: "Parent Requests", icon: <FaUserCheck /> },
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
    { href: "/admin/driver-vehicles", label: "Driver/Supervisor Assignments", icon: <FaUserCog /> },
    { href: "/admin/routes", label: "Route Management", icon: <FaRoute /> },
    { href: "/admin/unit-price", label: "Unit Price Management", icon: <FaDollarSign /> },
    { href: "/admin/parent-transactions", label: "Parent Transactions", icon: <FaReceipt /> },
    { href: "/admin/pickup-point-management", label: "Pickup Points", icon: <FaMapMarkerAlt /> },
    { href: "/admin/school", label: "School Management", icon: <FaSchool /> },
  ];

  // Save scroll position when scrolling (but not when we're restoring)
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      if (typeof window !== 'undefined' && !isRestoringRef.current) {
        sessionStorage.setItem(SIDEBAR_SCROLL_KEY, nav.scrollTop.toString());
      }
    };

    nav.addEventListener('scroll', handleScroll);
    return () => nav.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after navigation - use useLayoutEffect to prevent flickering
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof window === 'undefined') return;

    const savedScrollPosition = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (savedScrollPosition) {
      const scrollPosition = parseInt(savedScrollPosition, 10);
      // Set flag to prevent saving scroll during restoration
      isRestoringRef.current = true;
      // Set immediately without animation to prevent jumping
      nav.scrollTop = scrollPosition;
      // Reset flag after a short delay
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    }
  }, [pathname]);

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
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto mt-2 text-[#463B3B] text-sm font-medium pr-1"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            className={`px-5 py-4 flex items-center gap-3 transition-colors duration-200 block
              ${pathname === link.href
                ? "bg-[#fad23c] font-semibold"
                : "hover:bg-[#FFF085]"
              }`}
            onClick={() => {
              // Save current scroll position before navigation
              if (navRef.current && typeof window !== 'undefined') {
                sessionStorage.setItem(SIDEBAR_SCROLL_KEY, navRef.current.scrollTop.toString());
              }
            }}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
