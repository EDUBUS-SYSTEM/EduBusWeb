"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaBus, FaClock, FaRoute } from "react-icons/fa";
import { VehicleRuntimeDto } from "@/services/dashboardService";

interface VehicleRuntimeCardProps {
    data: VehicleRuntimeDto | null;
    loading?: boolean;
}

export default function VehicleRuntimeCard({ data, loading }: VehicleRuntimeCardProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-soft"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-32 w-full bg-gray-200 rounded-lg animate-pulse" />
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
                <FaBus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold text-gray-600">No Vehicle Data</p>
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
                        Vehicle Runtime
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-600"
                    >
                        Today&apos;s vehicle activity
                    </motion.p>
                </div>
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#FDC700] p-3 rounded-xl"
                >
                    <FaBus className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-[#92400E] text-sm" />
                        <p className="text-xs text-gray-600">Total Hours</p>
                    </div>
                    <p className="text-2xl font-bold text-[#92400E]">{data.totalHoursToday.toFixed(1)}</p>
                    <p className="text-[10px] text-gray-500 mt-1">hours today</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FaRoute className="text-[#92400E] text-sm" />
                        <p className="text-xs text-gray-600">Avg/Trip</p>
                    </div>
                    <p className="text-2xl font-bold text-[#92400E]">{data.averageHoursPerTrip.toFixed(1)}</p>
                    <p className="text-[10px] text-gray-500 mt-1">hours per trip</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FaBus className="text-[#92400E] text-sm" />
                        <p className="text-xs text-gray-600">Total Trips</p>
                    </div>
                    <p className="text-2xl font-bold text-[#92400E]">{data.totalTripsToday}</p>
                    <p className="text-[10px] text-gray-500 mt-1">trips today</p>
                </motion.div>
            </div>

            {/* Top Vehicles */}
            {data.topVehicles && data.topVehicles.length > 0 && (
                <div className="space-y-2">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-xs font-medium text-gray-600 mb-3"
                    >
                        Top 5 Active Vehicles
                    </motion.p>
                    <div className="space-y-2">
                        {data.topVehicles.map((vehicle, index) => (
                            <motion.div
                                key={vehicle.vehicleId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-[#FEFCE8] to-[#FFF6D8] rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#FDC700] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#463B3B]">{vehicle.licensePlate}</p>
                                        <p className="text-[10px] text-gray-500">{vehicle.tripCount} trips</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#D08700]">{vehicle.totalHours.toFixed(1)}h</p>
                                    <p className="text-[10px] text-gray-500">runtime</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

