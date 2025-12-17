"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaDollarSign, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueData {
    totalRevenue: number;
    pendingAmount: number;
    failedAmount: number;
    currency?: string;
    paidTransactionCount?: number;
    pendingTransactionCount?: number;
    failedTransactionCount?: number;
    timeline?: { date: string; amount: number; count: number }[];
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
                className="bg-gradient-to-br from-white to-[#FFF4DB] rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)]"
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
                className="bg-gradient-to-br from-white to-[#FFF4DB] rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)] text-center text-[#463B3B]"
            >
                <FaDollarSign className="w-12 h-12 mx-auto mb-4 text-[#B57300] opacity-70" />
                <p className="text-lg font-semibold">No Revenue Data</p>
            </motion.div>
        );
    }

    const effectiveCurrency = data.currency || currency;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: effectiveCurrency,
        }).format(amount);
    };

    const totalVolume = data.totalRevenue + data.pendingAmount + data.failedAmount;
    const denominator = totalVolume > 0 ? totalVolume : 1;

    const completedPercent = (data.totalRevenue / denominator) * 100;
    const pendingPercent = (data.pendingAmount / denominator) * 100;
    const failedPercent = (data.failedAmount / denominator) * 100;

    const chartData =
        data.timeline?.map((p) => ({
            date: new Date(p.date).toLocaleDateString("vi-VN"),
            amount: p.amount,
        })) || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
            className="bg-gradient-to-br from-white to-[#FFF4DB] rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 text-[#463B3B] relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5D565]/25 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F5D565]/25 rounded-full -ml-12 -mb-12" />

            <div className="relative z-10">
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
                            className="text-gray-600 text-xs"
                        >
                            Current Semester
                        </motion.p>
                    </div>
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#F5D565]/40 p-3 rounded-xl backdrop-blur-sm text-[#B57300]"
                    >
                        <FaDollarSign className="w-6 h-6" />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                    className="mb-6"
                >
                    <p className="text-gray-600 text-xs mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-[#B57300]">{formatCurrency(data.totalRevenue)}</p>
                </motion.div>

                <div className="bg-[#F5D565]/20 rounded-xl p-3 mb-6 border border-[#F5D565]/30">
                    {chartData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B57300" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#B57300" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(181,115,0,0.2)" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fill: "#463B3B", fontSize: 10 }} 
                                        axisLine={{ stroke: "#B57300", strokeWidth: 1 }}
                                    />
                                    <YAxis 
                                        tick={{ fill: "#463B3B", fontSize: 10 }} 
                                        tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}m`}
                                        axisLine={{ stroke: "#B57300", strokeWidth: 1 }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelStyle={{ color: "#111" }}
                                        contentStyle={{ 
                                            borderRadius: "12px",
                                            backgroundColor: "#fff",
                                            border: "1px solid #F5D565"
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#B57300" 
                                        fill="url(#colorRevenue)" 
                                        strokeWidth={2} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-[#463B3B]/80 text-xs text-center py-8">No timeline data</p>
                    )}
                </div>

                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-[#34A853] text-sm" />
                                <span className="text-xs font-medium text-[#2C2C2C]">Paid</span>
                            </div>
                            <span className="text-xs font-bold text-[#2C2C2C]">{formatCurrency(data.totalRevenue)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completedPercent}%` }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="h-full bg-[#34A853] rounded-full"
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
                                <FaClock className="text-[#D08700] text-sm" />
                                <span className="text-xs font-medium text-[#2C2C2C]">Pending</span>
                            </div>
                            <span className="text-xs font-bold text-[#2C2C2C]">{formatCurrency(data.pendingAmount)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pendingPercent}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                                className="h-full bg-[#D08700] rounded-full"
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
                                <FaTimesCircle className="text-[#C62828] text-sm" />
                                <span className="text-xs font-medium text-[#2C2C2C]">Failed</span>
                            </div>
                            <span className="text-xs font-bold text-[#2C2C2C]">{formatCurrency(data.failedAmount)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${failedPercent}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="h-full bg-[#C62828] rounded-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
