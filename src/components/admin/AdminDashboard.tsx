"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FaUsers,
    FaUserTie,
    FaCar,
    FaGraduationCap,
    FaBus,
    FaRoute,
    FaDollarSign,
} from "react-icons/fa";
import StatCard from "./StatCard";
import TimelineCard from "./TimelineCard";
import RevenueChart from "./RevenueChart";
import AttendanceRateCard from "./AttendanceRateCard";
import DailyStudentsChart from "./DailyStudentsChart";
import VehicleRuntimeCard from "./VehicleRuntimeCard";
import RouteStatisticsTable from "./RouteStatisticsTable";
import { unitPriceService } from "@/services/unitPriceService";
import { userAccountService } from "@/services/userAccountService/userAccountService.api";
import { studentService } from "@/services/studentService/studentService.api";
import { vehicleService } from "@/services/vehicleService";
import { tripService } from "@/services/tripService";
import { dashboardService } from "@/services/dashboardService";

export default function AdminDashboard() {
    // Fetch current semester (from dashboard-specific API)
    const { data: semesterData, isLoading: semesterLoading } = useQuery({
        queryKey: ["currentSemester"],
        queryFn: () => dashboardService.getCurrentSemester(),
    });

    // Fetch current unit price
    const { data: unitPriceData, isLoading: unitPriceLoading } = useQuery({
        queryKey: ["currentUnitPrice"],
        queryFn: () => unitPriceService.getCurrentEffective(),
    });

    // Fetch user counts by role
    const { data: parentData } = useQuery({
        queryKey: ["users", "parent"],
        queryFn: () => userAccountService.getUsers({ role: "Parent", perPage: 1 }),
    });

    const { data: driverData } = useQuery({
        queryKey: ["users", "driver"],
        queryFn: () => userAccountService.getUsers({ role: "Driver", perPage: 1 }),
    });

    const { data: supervisorData } = useQuery({
        queryKey: ["users", "supervisor"],
        queryFn: () => userAccountService.getUsers({ role: "Supervisor", perPage: 1 }),
    });

    // Fetch students count
    const { data: studentsData } = useQuery({
        queryKey: ["students"],
        queryFn: () => studentService.getAll(),
    });

    // Fetch active students
    const { data: activeStudents } = useQuery({
        queryKey: ["students", "active"],
        queryFn: () => studentService.getByStatus(2), // Active = 2
    });

    // Fetch inactive students  
    const { data: inactiveStudents } = useQuery({
        queryKey: ["students", "inactive"],
        queryFn: () => studentService.getByStatus(3), // Inactive = 3
    });

    // Fetch vehicles count
    const { data: vehiclesData } = useQuery({
        queryKey: ["vehicles"],
        queryFn: () => vehicleService.getVehicles({ page: 1, perPage: 1 }),
    });

    // Fetch trips for current semester
    const { data: tripsData } = useQuery({
        queryKey: ["trips", semesterData?.semesterCode],
        queryFn: () => {
            if (!semesterData) return null;
            return tripService.getAllTrips({
                startDate: semesterData.semesterStartDate,
                endDate: semesterData.semesterEndDate,
                perPage: 1,
            });
        },
        enabled: !!semesterData,
    });

    // Fetch revenue statistics based on paid transactions
    const { data: revenueStatistics, isLoading: revenueLoading } = useQuery({
        queryKey: ["revenue", semesterData?.semesterCode],
        queryFn: () => {
            if (!semesterData) return null;
            return dashboardService.getRevenueStatistics(
                semesterData.semesterStartDate,
                semesterData.semesterEndDate
            );
        },
        enabled: !!semesterData,
        refetchInterval: 30000,
    });

    // Fetch revenue timeline
    const { data: revenueTimeline } = useQuery({
        queryKey: ["revenueTimeline", semesterData?.semesterCode],
        queryFn: () => {
            if (!semesterData) return [];
            return dashboardService.getRevenueTimeline(
                semesterData.semesterStartDate,
                semesterData.semesterEndDate
            );
        },
        enabled: !!semesterData,
        refetchInterval: 30000,
    });

    // Fetch Dashboard Statistics
    const { data: dashboardStats, isLoading: dashboardLoading } = useQuery({
        queryKey: ["dashboardStatistics"],
        queryFn: () => dashboardService.getDashboardStatistics(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Fetch Daily Students
    const { data: dailyStudents, isLoading: dailyStudentsLoading } = useQuery({
        queryKey: ["dailyStudents"],
        queryFn: () => dashboardService.getDailyStudents(),
        refetchInterval: 30000,
    });

    // Fetch Attendance Rate
    const { data: attendanceRate, isLoading: attendanceRateLoading } = useQuery({
        queryKey: ["attendanceRate"],
        queryFn: () => dashboardService.getAttendanceRate("today"),
        refetchInterval: 30000,
    });

    // Fetch Vehicle Runtime
    const { data: vehicleRuntime, isLoading: vehicleRuntimeLoading } = useQuery({
        queryKey: ["vehicleRuntime"],
        queryFn: () => dashboardService.getVehicleRuntime(),
        refetchInterval: 30000,
    });

    // Fetch Route Statistics
    const { data: routeStatistics, isLoading: routeStatisticsLoading } = useQuery({
        queryKey: ["routeStatistics"],
        queryFn: () => dashboardService.getRouteStatistics(),
        refetchInterval: 60000, // Refetch every minute
    });

    const totalUsers = (parentData?.totalCount || 0) + (driverData?.totalCount || 0) + (supervisorData?.totalCount || 0);

    let unitPriceContent: React.ReactNode;
    if (unitPriceLoading) {
        unitPriceContent = <div className="h-10 w-28 bg-[#F5D565]/30 rounded-lg animate-pulse" />;
    } else if (unitPriceData) {
        unitPriceContent = (
            <>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="text-3xl font-bold mb-1 text-[#B57300]"
                >
                    {unitPriceData.pricePerKm.toLocaleString()} VND/km
                </motion.div>
                <p className="text-gray-700 text-xs">
                    Effective from {new Date(unitPriceData.effectiveFrom).toLocaleDateString()}
                </p>
                {unitPriceData.description && (
                    <p className="text-gray-600 text-[10px] mt-2 italic">{unitPriceData.description}</p>
                )}
            </>
        );
    } else {
        unitPriceContent = <p className="text-gray-700">No active unit price</p>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-[#463B3B] mb-1">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your school shuttle system.</p>
            </motion.div>

            {/* Timeline and Unit Price Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <TimelineCard semesterData={semesterData || null} loading={semesterLoading} />
                </div>

                {/* Unit Price Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-white to-[#FFF4DB] rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 text-[#463B3B] border border-[#F5D565]"
                >
                    <div className="relative z-10">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center justify-center w-12 h-12 bg-[#F5D565]/30 rounded-xl mb-3 backdrop-blur-sm text-[#B57300]"
                        >
                            <FaDollarSign className="w-6 h-6" />
                        </motion.div>

                        <h3 className="text-lg font-bold mb-3">Current Unit Price</h3>

                        {unitPriceContent}
                    </div>
                </motion.div>
            </div>

            {/* Statistics Cards */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-[#463B3B] mb-4"
                >
                    System Statistics
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Users"
                        value={totalUsers}
                        icon={FaUsers}
                        color="blue"
                        subtitle={`${parentData?.totalCount || 0} Parents, ${driverData?.totalCount || 0} Drivers, ${supervisorData?.totalCount || 0} Supervisors`}
                    />

                    <StatCard
                        title="Total Students"
                        value={studentsData?.length || 0}
                        icon={FaGraduationCap}
                        color="purple"
                        subtitle={`${activeStudents?.length || 0} Active, ${inactiveStudents?.length || 0} Inactive`}
                    />

                    <StatCard
                        title="Total Vehicles"
                        value={vehiclesData?.totalCount || 0}
                        icon={FaBus}
                        color="orange"
                        subtitle="Active fleet"
                    />

                    <StatCard
                        title="Total Trips"
                        value={tripsData?.total || 0}
                        icon={FaRoute}
                        color="yellow"
                        subtitle="Current semester"
                    />
                </div>
            </div>

            {/* User Breakdown */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl font-bold text-[#463B3B] mb-4"
                >
                    User Breakdown
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Parents"
                        value={parentData?.totalCount || 0}
                        icon={FaUsers}
                        color="green"
                        subtitle="Registered parents"
                    />

                    <StatCard
                        title="Drivers"
                        value={driverData?.totalCount || 0}
                        icon={FaUserTie}
                        color="blue"
                        subtitle="Active drivers"
                    />

                    <StatCard
                        title="Supervisors"
                        value={supervisorData?.totalCount || 0}
                        icon={FaCar}
                        color="purple"
                        subtitle="Active supervisors"
                    />
                </div>
            </div>

            {/* Dashboard Analytics Section */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl font-bold text-[#463B3B] mb-4"
                >
                    Analytics & Insights
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Attendance Rate Card */}
                    <AttendanceRateCard 
                        data={attendanceRate || dashboardStats?.attendanceRate || null} 
                        loading={attendanceRateLoading || dashboardLoading} 
                    />

                    {/* Daily Students Chart */}
                    <DailyStudentsChart 
                        data={dailyStudents || dashboardStats?.dailyStudents || null} 
                        loading={dailyStudentsLoading || dashboardLoading} 
                    />
                </div>

                {/* Vehicle Runtime Card */}
                <div className="mb-6">
                    <VehicleRuntimeCard 
                        data={vehicleRuntime || dashboardStats?.vehicleRuntime || null} 
                        loading={vehicleRuntimeLoading || dashboardLoading} 
                    />
                </div>

                {/* Route Statistics Table */}
                <div className="mb-6">
                    <RouteStatisticsTable 
                        data={routeStatistics || dashboardStats?.routeStatistics || null} 
                        loading={routeStatisticsLoading || dashboardLoading} 
                    />
                </div>
            </div>

            {/* Revenue Statistics */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl font-bold text-[#463B3B] mb-4"
                >
                    Financial Overview
                </motion.h2>

                <RevenueChart
                    data={
                        revenueStatistics
                            ? { ...revenueStatistics, timeline: revenueTimeline || [] }
                            : null
                    }
                    loading={revenueLoading || !semesterData}
                />
            </div>
        </div>
    );
}
