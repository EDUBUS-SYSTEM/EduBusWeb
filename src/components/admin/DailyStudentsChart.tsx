"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { DailyStudentsDto } from "@/services/dashboardService";
import { formatDate } from "@/utils/dateUtils";

interface DailyStudentsChartProps {
    data: DailyStudentsDto | null;
    loading?: boolean;
}

export default function DailyStudentsChart({ data, loading }: DailyStudentsChartProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-soft"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (!data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-soft border-2 border-dashed border-gray-300 text-center"
            >
                <FaUsers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold text-gray-600">No Student Data</p>
            </motion.div>
        );
    }

    const maxCount = Math.max(
        ...data.last7Days.map(d => d.count),
        data.today,
        data.yesterday
    );
    const todayChange = data.yesterday > 0
        ? ((data.today - data.yesterday) / data.yesterday) * 100
        : 0;
    const isPositive = todayChange >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-[#463B3B] mb-1"
                    >
                        Daily Students
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-600"
                    >
                        Last 7 days overview
                    </motion.p>
                </div>
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#FDC700] p-3 rounded-xl"
                >
                    <FaUsers className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <p className="text-xs text-gray-600 mb-1">Today</p>
                    <p className="text-2xl font-bold text-[#92400E]">{data.today}</p>
                    {data.yesterday > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                            {isPositive ? (
                                <FaArrowUp className="text-green-600 text-xs" />
                            ) : (
                                <FaArrowDown className="text-red-600 text-xs" />
                            )}
                            <span className={`text-[10px] font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(todayChange).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <p className="text-xs text-gray-600 mb-1">Yesterday</p>
                    <p className="text-2xl font-bold text-[#92400E]">{data.yesterday}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <p className="text-xs text-gray-600 mb-1">Week Avg</p>
                    <p className="text-2xl font-bold text-[#92400E]">{data.thisWeek}</p>
                </motion.div>
            </div>

            {/* Chart */}
            <div className="space-y-4">
                <p className="text-xs font-medium text-gray-600">Last 7 Days Trend</p>
                <div className="flex items-end justify-between gap-2 h-64">
                    {data.last7Days.map((day, index) => {
                        const maxBaseline = Math.max(maxCount, 50); // Minimum scale of 50
                        const percentage = maxBaseline > 0 ? (day.count / maxBaseline) * 100 : 0;
                        const isToday = new Date(day.date).toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={day.date}
                                className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                            >
                                <div className="relative w-full flex-1 flex items-end justify-center group">
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: `${percentage}%`, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                        className={`w-full rounded-t-lg relative ${isToday
                                            ? 'bg-gradient-to-t from-[#FDC700] to-[#F59E0B]'
                                            : 'bg-gradient-to-t from-[#FEF3C7] to-[#FDE68A] group-hover:from-[#FDE68A] group-hover:to-[#FDC700]'
                                            } transition-colors duration-300 ${isToday ? 'ring-2 ring-[#FDC700] ring-offset-2' : ''}`}
                                    >
                                        {/* Tooltip on Hover */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                                            {day.count} Students
                                        </div>

                                        {isToday && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.5 }}
                                                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#FDC700] text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
                                            >
                                                Today
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                                <div className="text-center h-10 flex flex-col justify-start">
                                    <p className="text-[10px] font-bold text-[#463B3B]">{day.count}</p>
                                    <p className="text-[9px] text-gray-500">
                                        {formatDate(day.date).split(',')[0]}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

