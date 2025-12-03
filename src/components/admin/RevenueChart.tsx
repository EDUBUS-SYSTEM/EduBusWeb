"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaDollarSign, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

interface RevenueData {
    total: number;
    completed: number;
    pending: number;
    failed: number;
}

interface RevenueChartProps {
    data: RevenueData | null;
    loading?: boolean;
    currency?: string;
}

export default function RevenueChart({ data, loading, currency = "VND" }: RevenueChartProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FDC700] to-[#F59E0B] rounded-2xl p-6 shadow-[0_8px_20px_rgba(253,199,0,0.2)]"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
                    <div className="h-16 w-full bg-white/20 rounded-lg animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (!data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FDC700] to-[#F59E0B] rounded-2xl p-6 shadow-[0_8px_20px_rgba(253,199,0,0.2)] text-white text-center"
            >
                <FaDollarSign className="w-12 h-12 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-semibold">No Revenue Data</p>
            </motion.div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const completedPercent = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    const pendingPercent = data.total > 0 ? (data.pending / data.total) * 100 : 0;
    const failedPercent = data.total > 0 ? (data.failed / data.total) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
            className="bg-gradient-to-br from-[#FDC700] to-[#F59E0B] rounded-2xl p-6 shadow-[0_8px_20px_rgba(253,199,0,0.2)] hover:shadow-lg transition-all duration-300 text-white relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl font-bold mb-1"
                        >
                            Revenue Statistics
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/80 text-xs"
                        >
                            Current Semester
                        </motion.p>
                    </div>
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"
                    >
                        <FaDollarSign className="w-6 h-6" />
                    </motion.div>
                </div>

                {/* Total Revenue */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                    className="mb-6"
                >
                    <p className="text-white/80 text-xs mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(data.total)}</p>
                </motion.div>

                {/* Breakdown */}
                <div className="space-y-3">
                    {/* Completed */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-white text-sm" />
                                <span className="text-xs font-medium">Completed</span>
                            </div>
                            <span className="text-xs font-bold">{formatCurrency(data.completed)}</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completedPercent}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Pending */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-yellow-200 text-sm" />
                                <span className="text-xs font-medium">Pending</span>
                            </div>
                            <span className="text-xs font-bold">{formatCurrency(data.pending)}</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pendingPercent}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="h-full bg-yellow-200 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Failed */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaTimesCircle className="text-red-200 text-sm" />
                                <span className="text-xs font-medium">Failed</span>
                            </div>
                            <span className="text-xs font-bold">{formatCurrency(data.failed)}</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${failedPercent}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="h-full bg-red-200 rounded-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
