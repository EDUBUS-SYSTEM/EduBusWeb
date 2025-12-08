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
import { enrollmentSemesterSettingsService } from "@/services/api/enrollmentSemesterSettingsService";
import { unitPriceService } from "@/services/unitPriceService";
import { userAccountService } from "@/services/userAccountService/userAccountService.api";
import { studentService } from "@/services/studentService/studentService.api";
import { vehicleService } from "@/services/vehicleService";
import { tripService } from "@/services/tripService";
import { transactionService } from "@/services/transactionService";
import { TransactionStatus } from "@/types/transaction";
import { formatDate } from "@/utils/dateUtils";

export default function AdminDashboard() {
    // Fetch active semester
    const { data: semesterData, isLoading: semesterLoading } = useQuery({
        queryKey: ["activeSemester"],
        queryFn: () => enrollmentSemesterSettingsService.getActiveSettings(),
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
        queryKey: ["trips", semesterData?.id],
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

    // Fetch revenue statistics
    const { data: transactionsData } = useQuery({
        queryKey: ["transactions", semesterData?.id],
        queryFn: async () => {
            if (!semesterData) return null;

            const [completed, pending, failed] = await Promise.all([
                transactionService.getTransactionList({
                    status: TransactionStatus.Paid,
                    from: semesterData.semesterStartDate,
                    to: semesterData.semesterEndDate,
                    page: 1,
                    pageSize: 1000,
                }),
                transactionService.getTransactionList({
                    status: TransactionStatus.Pending,
                    from: semesterData.semesterStartDate,
                    to: semesterData.semesterEndDate,
                    page: 1,
                    pageSize: 1000,
                }),
                transactionService.getTransactionList({
                    status: TransactionStatus.Failed,
                    from: semesterData.semesterStartDate,
                    to: semesterData.semesterEndDate,
                    page: 1,
                    pageSize: 1000,
                }),
            ]);

            const completedTotal = completed.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
            const pendingTotal = pending.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
            const failedTotal = failed.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

            return {
                total: completedTotal + pendingTotal + failedTotal,
                completed: completedTotal,
                pending: pendingTotal,
                failed: failedTotal,
            };
        },
        enabled: !!semesterData,
    });

    const totalUsers = (parentData?.totalCount || 0) + (driverData?.totalCount || 0) + (supervisorData?.totalCount || 0);

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
                    className="bg-gradient-to-br from-[#FDC700] to-[#D08700] rounded-2xl p-6 shadow-[0_8px_20px_rgba(253,199,0,0.2)] hover:shadow-lg transition-all duration-300 text-white"
                >
                    <div className="relative z-10">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 backdrop-blur-sm"
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

            {/* Revenue Statistics */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl font-bold text-[#463B3B] mb-4"
                >
                    Financial Overview
                </motion.h2>

                <RevenueChart data={transactionsData || null} loading={!semesterData} />
            </div>
        </div>
    );
}
