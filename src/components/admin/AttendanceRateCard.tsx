"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaClock, FaUserCheck, FaExclamationCircle } from "react-icons/fa";
import { AttendanceRateDto } from "@/services/dashboardService";

interface AttendanceRateCardProps {
    data: AttendanceRateDto | null;
    loading?: boolean;
}

export default function AttendanceRateCard({ data, loading }: AttendanceRateCardProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-16 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (!data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft border-2 border-dashed border-[#FDC700] text-center"
            >
                <FaUserCheck className="w-12 h-12 mx-auto mb-4 text-[#D08700]" />
                <p className="text-lg font-semibold text-gray-600">No Attendance Data</p>
            </motion.div>
        );
    }

    const total = data.totalStudents;
    const presentPercent = total > 0 ? (data.totalPresent / total) * 100 : 0;
    const absentPercent = total > 0 ? (data.totalAbsent / total) * 100 : 0;
    const latePercent = total > 0 ? (data.totalLate / total) * 100 : 0;
    const excusedPercent = total > 0 ? (data.totalExcused / total) * 100 : 0;
    const pendingPercent = total > 0 ? (data.totalPending / total) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
            className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-[#FDC700]/20 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDC700]/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FDC700]/10 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold text-[#463B3B] mb-1"
                        >
                            Attendance Rate
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-gray-600"
                        >
                            Today: {data.todayRate.toFixed(1)}% | Week: {data.weekRate.toFixed(1)}% | Month: {data.monthRate.toFixed(1)}%
                        </motion.p>
                    </div>
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#FDC700] p-3 rounded-xl"
                    >
                        <FaUserCheck className="w-6 h-6 text-white" />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                    className="mb-6 text-center"
                >
                    <p className="text-4xl font-bold text-[#D08700] mb-1">{data.todayRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">Today&apos;s Attendance Rate</p>
                </motion.div>

                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 text-sm" />
                                <span className="text-xs font-medium text-gray-700">Present</span>
                            </div>
                            <span className="text-xs font-bold text-[#463B3B]">
                                {data.totalPresent} ({presentPercent.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${presentPercent}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="h-full bg-green-500 rounded-full"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-yellow-600 text-sm" />
                                <span className="text-xs font-medium text-gray-700">Late</span>
                            </div>
                            <span className="text-xs font-bold text-[#463B3B]">
                                {data.totalLate} ({latePercent.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${latePercent}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="h-full bg-yellow-500 rounded-full"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaTimesCircle className="text-red-600 text-sm" />
                                <span className="text-xs font-medium text-gray-700">Absent</span>
                            </div>
                            <span className="text-xs font-bold text-[#463B3B]">
                                {data.totalAbsent} ({absentPercent.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${absentPercent}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="h-full bg-red-500 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {data.totalExcused > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <FaExclamationCircle className="text-blue-600 text-sm" />
                                    <span className="text-xs font-medium text-gray-700">Excused</span>
                                </div>
                                <span className="text-xs font-bold text-[#463B3B]">
                                    {data.totalExcused} ({excusedPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${excusedPercent}%` }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                    className="h-full bg-blue-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}

                    {data.totalPending > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-500 text-sm" />
                                    <span className="text-xs font-medium text-gray-700">Pending</span>
                                </div>
                                <span className="text-xs font-bold text-[#463B3B]">
                                    {data.totalPending} ({pendingPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pendingPercent}%` }}
                                    transition={{ duration: 1, delay: 1.0 }}
                                    className="h-full bg-gray-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                >
                    <p className="text-center text-xs text-gray-600">
                        Total Students: <span className="font-bold text-[#463B3B]">{data.totalStudents}</span>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}

