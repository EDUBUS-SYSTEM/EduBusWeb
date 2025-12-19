"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaRoute, FaUsers, FaCheckCircle, FaBus } from "react-icons/fa";
import { RouteStatisticsDto } from "@/services/dashboardService";

interface RouteStatisticsTableProps {
    data: RouteStatisticsDto[] | null;
    loading?: boolean;
}

export default function RouteStatisticsTable({ data, loading }: RouteStatisticsTableProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-soft"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-soft border-2 border-dashed border-gray-300 text-center"
            >
                <FaRoute className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold text-gray-600">No Route Statistics</p>
            </motion.div>
        );
    }

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
                        Route Statistics
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-600"
                    >
                        Performance by route (Last 30 days)
                    </motion.p>
                </div>
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#FDC700] p-3 rounded-xl"
                >
                    <FaRoute className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Route</th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                                <FaRoute className="inline mr-1" />
                                Trips
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                                <FaUsers className="inline mr-1" />
                                Students
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                                <FaCheckCircle className="inline mr-1" />
                                Attendance
                            </th>

                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">
                                <FaBus className="inline mr-1" />
                                Vehicles
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((route, index) => (
                            <motion.tr
                                key={route.routeId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#FEFCE8] hover:to-[#FFF6D8] transition-colors"
                            >
                                <td className="py-4 px-4">
                                    <p className="text-sm font-semibold text-[#463B3B]">{route.routeName}</p>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 bg-[#FEF3C7] rounded-lg text-sm font-bold text-[#92400E]">
                                        {route.totalTrips}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="text-sm font-semibold text-[#463B3B]">{route.totalStudents}</span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-sm font-bold ${route.attendanceRate >= 95 ? 'text-green-600' :
                                            route.attendanceRate >= 85 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                            {route.attendanceRate.toFixed(1)}%
                                        </span>
                                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${route.attendanceRate}%` }}
                                                transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                                                className={`h-full rounded-full ${route.attendanceRate >= 95 ? 'bg-green-500' :
                                                    route.attendanceRate >= 85 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 px-4 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-[#FEF3C7] rounded-lg text-xs font-bold text-[#92400E]">
                                        {route.activeVehicles}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            {data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                >
                    <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-600">Total Routes</p>
                            <p className="text-lg font-bold text-[#463B3B]">{data.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Trips</p>
                            <p className="text-lg font-bold text-[#463B3B]">
                                {data.reduce((sum, r) => sum + r.totalTrips, 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Total Students</p>
                            <p className="text-lg font-bold text-[#463B3B]">
                                {data.reduce((sum, r) => sum + r.totalStudents, 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Avg Attendance</p>
                            <p className="text-lg font-bold text-[#463B3B]">
                                {data.length > 0
                                    ? (data.reduce((sum, r) => sum + r.attendanceRate, 0) / data.length).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

