"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { EnrollmentSemesterSettingsDto } from "@/services/api/enrollmentSemesterSettingsService";

interface TimelineCardProps {
    semesterData: EnrollmentSemesterSettingsDto | null;
    loading?: boolean;
}

export default function TimelineCard({ semesterData, loading }: TimelineCardProps) {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft"
            >
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </motion.div>
        );
    }

    if (!semesterData) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft border-2 border-dashed border-[#FDC700]"
            >
                <div className="text-center text-gray-500">
                    <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-[#D08700]" />
                    <p className="text-lg font-semibold">No Active Semester</p>
                    <p className="text-sm mt-2">Please configure a semester in settings</p>
                </div>
            </motion.div>
        );
    }

    const startDate = new Date(semesterData.semesterStartDate);
    const endDate = new Date(semesterData.semesterEndDate);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.005 }}
            className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-[#FDC700]/20"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-[#463B3B] mb-1"
                    >
                        {semesterData.semesterName}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-base text-[#D08700] font-semibold"
                    >
                        {semesterData.academicYear}
                    </motion.p>
                </div>
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#FDC700] p-3 rounded-xl"
                >
                    <FaCalendarAlt className="w-6 h-6 text-white" />
                </motion.div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-3"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <FaClock className="text-[#D08700] text-sm" />
                        <span className="text-xs font-medium text-gray-600">Semester Period</span>
                    </div>
                    <p className="text-xs font-semibold text-[#463B3B]">
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" → "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/60 backdrop-blur-sm rounded-xl p-3"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <FaClock className="text-[#D08700] text-sm" />
                        <span className="text-xs font-medium text-gray-600">Registration Period</span>
                    </div>
                    <p className="text-xs font-semibold text-[#463B3B]">
                        {new Date(semesterData.registrationStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" → "}
                        {new Date(semesterData.registrationEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-gray-600">Semester Progress</span>
                    <span className="font-bold text-[#D08700]">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#FDC700] to-[#D08700] rounded-full"
                    />
                </div>
                <p className="text-[10px] text-gray-500 text-center">
                    {daysPassed} of {totalDays} days completed
                </p>
            </div>

            {/* Description */}
            {semesterData.description && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-3 p-3 bg-white/40 rounded-lg"
                >
                    <p className="text-xs text-gray-600 italic">{semesterData.description}</p>
                </motion.div>
            )}
        </motion.div>
    );
}
