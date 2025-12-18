"use client";

import React, { useState, useEffect } from "react";
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
    FaDownload,
} from "react-icons/fa";
import StatCard from "./StatCard";
import TimelineCard from "./TimelineCard";
import RevenueChart from "./RevenueChart";
import AttendanceRateCard from "./AttendanceRateCard";
import DailyStudentsChart from "./DailyStudentsChart";
import VehicleRuntimeCard from "./VehicleRuntimeCard";
import RouteStatisticsTable from "./RouteStatisticsTable";
import SemesterSelector from "./SemesterSelector";
import { unitPriceService } from "@/services/unitPriceService";
import { userAccountService } from "@/services/userAccountService/userAccountService.api";
import { studentService } from "@/services/studentService/studentService.api";
import { vehicleService } from "@/services/vehicleService";
import { tripService } from "@/services/tripService";
import { dashboardService, ActiveSemesterDto } from "@/services/dashboardService";
import { formatDate } from "@/utils/dateUtils";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

export default function AdminDashboard() {
    const [selectedSemester, setSelectedSemester] = useState<ActiveSemesterDto | null>(null);

    const { data: semesterData, isLoading: semesterLoading } = useQuery({
        queryKey: ["currentSemester"],
        queryFn: () => dashboardService.getCurrentSemester(),
    });

    useEffect(() => {
        if (semesterData && !selectedSemester) {
            setSelectedSemester(semesterData);
        }
    }, [semesterData, selectedSemester]);

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
        queryKey: ["trips", selectedSemester?.semesterCode],
        queryFn: () => {
            if (!selectedSemester) return null;
            return tripService.getAllTrips({
                startDate: selectedSemester.semesterStartDate,
                endDate: selectedSemester.semesterEndDate,
                perPage: 1,
            });
        },
        enabled: !!selectedSemester,
    });

    // Fetch revenue statistics based on paid transactions
    const { data: revenueStatistics, isLoading: revenueLoading } = useQuery({
        queryKey: ["revenue", selectedSemester?.semesterCode],
        queryFn: () => {
            if (!selectedSemester) return null;
            return dashboardService.getRevenueStatistics(
                selectedSemester.registrationStartDate || selectedSemester.semesterStartDate,
                selectedSemester.registrationEndDate || selectedSemester.semesterEndDate
            );
        },
        enabled: !!selectedSemester,
        refetchInterval: 30000,
    });

    // Fetch revenue timeline
    const { data: revenueTimeline } = useQuery({
        queryKey: ["revenueTimeline", selectedSemester?.semesterCode],
        queryFn: () => {
            if (!selectedSemester) return [];
            return dashboardService.getRevenueTimeline(
                selectedSemester.registrationStartDate || selectedSemester.semesterStartDate,
                selectedSemester.registrationEndDate || selectedSemester.semesterEndDate
            );
        },
        enabled: !!selectedSemester,
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
                    Effective from {formatDate(unitPriceData.effectiveFrom)}
                </p>
                {unitPriceData.description && (
                    <p className="text-gray-600 text-[10px] mt-2 italic">{unitPriceData.description}</p>
                )}
            </>
        );
    } else {
        unitPriceContent = <p className="text-gray-700">No active unit price</p>;
    }

    const attendanceExport = attendanceRate || dashboardStats?.attendanceRate || null;
    const dailyStudentsExport = dailyStudents || dashboardStats?.dailyStudents || null;
    const vehicleRuntimeExport = vehicleRuntime || dashboardStats?.vehicleRuntime || null;
    const routeStatisticsExport = routeStatistics || dashboardStats?.routeStatistics || null;

    const buildSheet = (
        workbook: XLSX.WorkBook,
        data: Record<string, unknown>[],
        name: string,
        options?: { numberFormats?: Record<string, string> }
    ) => {
        const safeData = data.length > 0 ? data : [{ Note: "No data" }];
        const worksheet = XLSX.utils.json_to_sheet(safeData);

        // Auto width
        const colWidths =
            safeData.length > 0
                ? Object.keys(safeData[0]).map((key) => ({
                    wch: Math.max(key.length, ...safeData.map((row) => String(row[key] ?? "").length)) + 2,
                }))
                : [{ wch: 10 }];
        (worksheet as XLSX.WorkSheet)["!cols"] = colWidths;

        // Number formatting by header
        if (options?.numberFormats && safeData.length > 0 && worksheet["!ref"]) {
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            const headers = Object.keys(safeData[0]);
            headers.forEach((header, idx) => {
                const fmt = options.numberFormats?.[header];
                if (!fmt) return;
                for (let r = 1; r <= range.e.r; r++) {
                    const cellAddr = XLSX.utils.encode_cell({ r, c: idx });
                    const cell = worksheet[cellAddr];
                    if (cell && typeof cell.v !== "undefined") {
                        cell.z = fmt;
                    }
                }
            });
        }

        // Autofilter for quick scan
        if (worksheet["!ref"]) {
            worksheet["!autofilter"] = { ref: worksheet["!ref"] };
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, name);
    };

    const handleExport = () => {
        try {
            const workbook = XLSX.utils.book_new();
            const todayIso = new Date().toISOString().slice(0, 10);
            const semesterCode = semesterData?.semesterCode || "na";

            // Summary sheet
            buildSheet(workbook, [
                {
                    GeneratedAt: new Date().toISOString(),
                    SemesterCode: semesterCode,
                },
                {
                    Semester: semesterData?.semesterName ?? "N/A",
                    AcademicYear: semesterData?.academicYear ?? "N/A",
                    SemesterStart: semesterData?.semesterStartDate ?? "N/A",
                    SemesterEnd: semesterData?.semesterEndDate ?? "N/A",
                    UnitPriceVNDPerKm: unitPriceData?.pricePerKm ?? "N/A",
                    UnitPriceEffectiveFrom: unitPriceData?.effectiveFrom ?? "N/A",
                    UnitPriceNote: unitPriceData?.description ?? "",
                    TotalUsers: totalUsers,
                    Parents: parentData?.totalCount ?? 0,
                    Drivers: driverData?.totalCount ?? 0,
                    Supervisors: supervisorData?.totalCount ?? 0,
                    Students: studentsData?.length ?? 0,
                    ActiveStudents: activeStudents?.length ?? 0,
                    InactiveStudents: inactiveStudents?.length ?? 0,
                    Vehicles: vehiclesData?.totalCount ?? 0,
                    Trips: tripsData?.total ?? 0,
                    RevenuePaid: revenueStatistics?.totalRevenue ?? 0,
                    RevenuePending: revenueStatistics?.pendingAmount ?? 0,
                    RevenueFailed: revenueStatistics?.failedAmount ?? 0,
                    Currency: revenueStatistics?.currency ?? "VND",
                },
            ], "Summary");

            // Attendance sheet
            buildSheet(workbook, attendanceExport ? [
                {
                    TodayRate: attendanceExport.todayRate,
                    WeekRate: attendanceExport.weekRate,
                    MonthRate: attendanceExport.monthRate,
                    TotalStudents: attendanceExport.totalStudents,
                    Present: attendanceExport.totalPresent,
                    Late: attendanceExport.totalLate,
                    Absent: attendanceExport.totalAbsent,
                    Excused: attendanceExport.totalExcused,
                    Pending: attendanceExport.totalPending,
                },
            ] : [], "Attendance");

            // Daily students sheet
            buildSheet(workbook, dailyStudentsExport ? [
                {
                    Today: dailyStudentsExport.today,
                    Yesterday: dailyStudentsExport.yesterday,
                    ThisWeek: dailyStudentsExport.thisWeek,
                    ThisMonth: dailyStudentsExport.thisMonth,
                },
                ...dailyStudentsExport.last7Days.map((d) => ({
                    Date: d.date,
                    Count: d.count,
                })),
            ] : [], "Daily Students");

            // Vehicle runtime sheet
            buildSheet(workbook, vehicleRuntimeExport ? [
                {
                    TotalHoursToday: vehicleRuntimeExport.totalHoursToday,
                    AverageHoursPerTrip: vehicleRuntimeExport.averageHoursPerTrip,
                    TotalTripsToday: vehicleRuntimeExport.totalTripsToday,
                },
                ...(vehicleRuntimeExport.topVehicles ?? []).map((v, idx) => ({
                    Rank: idx + 1,
                    LicensePlate: v.licensePlate,
                    TotalHours: v.totalHours,
                    TripCount: v.tripCount,
                })),
            ] : [], "Vehicle Runtime");

            // Route statistics sheet
            buildSheet(
                workbook,
                routeStatisticsExport
                    ? [
                        ...routeStatisticsExport.map((r) => ({
                            RouteName: r.routeName,
                            TotalTrips: r.totalTrips,
                            TotalStudents: r.totalStudents,
                            AttendanceRate: r.attendanceRate / 100,
                            AttendanceColor:
                                r.attendanceRate >= 95
                                    ? "Green"
                                    : r.attendanceRate >= 85
                                        ? "Yellow"
                                        : "Red",
                            AverageRuntimeHours: r.averageRuntime,
                            ActiveVehicles: r.activeVehicles,
                        })),
                        {
                            RouteName: "Totals",
                            TotalTrips: routeStatisticsExport.reduce((sum, r) => sum + r.totalTrips, 0),
                            TotalStudents: routeStatisticsExport.reduce((sum, r) => sum + r.totalStudents, 0),
                            AttendanceRate:
                                routeStatisticsExport.length > 0
                                    ? routeStatisticsExport.reduce((sum, r) => sum + r.attendanceRate, 0) /
                                    routeStatisticsExport.length /
                                    100
                                    : 0,
                            AttendanceColor: "Summary",
                            AverageRuntimeHours:
                                routeStatisticsExport.length > 0
                                    ? routeStatisticsExport.reduce((sum, r) => sum + r.averageRuntime, 0) /
                                    routeStatisticsExport.length
                                    : 0,
                            ActiveVehicles: routeStatisticsExport.reduce((sum, r) => sum + r.activeVehicles, 0),
                        },
                    ]
                    : [],
                "Route Stats",
                { numberFormats: { AttendanceRate: "0.0%", AverageRuntimeHours: "0.0", TotalTrips: "0", TotalStudents: "0", ActiveVehicles: "0" } }
            );

            // Revenue timeline sheet
            buildSheet(
                workbook,
                revenueStatistics
                    ? [
                        {
                            TotalRevenue: revenueStatistics.totalRevenue,
                            PendingAmount: revenueStatistics.pendingAmount,
                            FailedAmount: revenueStatistics.failedAmount,
                            PaidTransactionCount: revenueStatistics.paidTransactionCount ?? "",
                            PendingTransactionCount: revenueStatistics.pendingTransactionCount ?? "",
                            FailedTransactionCount: revenueStatistics.failedTransactionCount ?? "",
                            Currency: revenueStatistics.currency ?? "VND",
                        },
                        ...(revenueTimeline ?? []).map((p) => ({
                            Date: p.date,
                            Amount: p.amount,
                            Count: p.count,
                            AmountColor: p.amount >= 0 ? "Green" : "Red",
                        })),
                        {
                            Date: "Totals",
                            Amount:
                                revenueTimeline?.reduce((sum, p) => sum + p.amount, 0) ??
                                revenueStatistics.totalRevenue +
                                (revenueStatistics.pendingAmount ?? 0) +
                                (revenueStatistics.failedAmount ?? 0),
                            Count: revenueTimeline?.reduce((sum, p) => sum + p.count, 0) ?? "",
                            AmountColor: "Summary",
                        },
                    ]
                    : [],
                "Revenue",
                {
                    numberFormats: {
                        TotalRevenue: '#,##0" VND"',
                        PendingAmount: '#,##0" VND"',
                        FailedAmount: '#,##0" VND"',
                        Amount: '#,##0" VND"',
                    },
                }
            );

            // Charts data sheet (prepared series for quick charting)
            const chartsRows: Record<string, unknown>[] = [];
            chartsRows.push({ Section: "Revenue Timeline", Note: "Use Date vs Amount" });
            (revenueTimeline ?? []).forEach((p) =>
                chartsRows.push({
                    Date: p.date,
                    Amount: p.amount,
                    Transactions: p.count,
                })
            );
            chartsRows.push({});
            chartsRows.push({ Section: "Daily Students (7 days)", Note: "Use Date vs Count" });
            (dailyStudentsExport?.last7Days ?? []).forEach((d) =>
                chartsRows.push({
                    Date: d.date,
                    Count: d.count,
                })
            );
            chartsRows.push({});
            chartsRows.push({ Section: "Attendance Rate", Note: "Use Today/Week/Month" });
            if (attendanceExport) {
                chartsRows.push({
                    TodayRate: attendanceExport.todayRate / 100,
                    WeekRate: attendanceExport.weekRate / 100,
                    MonthRate: attendanceExport.monthRate / 100,
                });
            }
            chartsRows.push({});
            chartsRows.push({ Section: "Route Attendance", Note: "RouteName vs AttendanceRate" });
            (routeStatisticsExport ?? []).forEach((r) =>
                chartsRows.push({
                    RouteName: r.routeName,
                    AttendanceRate: r.attendanceRate / 100,
                    TotalTrips: r.totalTrips,
                    TotalStudents: r.totalStudents,
                })
            );
            buildSheet(
                workbook,
                chartsRows,
                "Charts Data",
                { numberFormats: { Amount: '#,##0" VND"', TodayRate: "0.0%", WeekRate: "0.0%", MonthRate: "0.0%", AttendanceRate: "0.0%" } }
            );

            const filename = `dashboard-export-${semesterCode}-${todayIso}.xlsx`;
            XLSX.writeFile(workbook, filename);
            toast.success("Đã xuất Excel cho Dashboard");
        } catch (error) {
            console.error("Export dashboard failed", error);
            toast.error("Xuất Excel thất bại");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#463B3B] mb-1">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your school shuttle system.</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <SemesterSelector
                            value={selectedSemester?.semesterCode || ""}
                            onChange={(semester) => setSelectedSemester(semester)}
                        />
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5D565] text-[#463B3B] font-semibold rounded-lg shadow hover:bg-[#fad23c] transition whitespace-nowrap"
                        >
                            <FaDownload /> Export
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Timeline and Unit Price Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <TimelineCard semesterData={selectedSemester || null} loading={semesterLoading} />
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

                        {unitPriceLoading ? (
                            <div className="h-10 w-28 bg-white/20 rounded-lg animate-pulse" />
                        ) : unitPriceData ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="text-3xl font-bold mb-1"
                                >
                                    {unitPriceData.pricePerKm.toLocaleString()} VND/km
                                </motion.div>
                                <p className="text-white/80 text-xs">
                                    Effective from {formatDate(unitPriceData.effectiveFrom)}
                                </p>
                                {unitPriceData.description && (
                                    <p className="text-white/70 text-[10px] mt-2 italic">{unitPriceData.description}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-white/80">No active unit price</p>
                        )}
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
