"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: IconType;
    color: "yellow" | "orange" | "green" | "blue" | "purple";
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    subtitle?: string;
}

const colorSchemes = {
    yellow: {
        bg: "from-white to-[#FFF4DB]",
        textColor: "text-[#463B3B]",
        iconBg: "bg-[#F5D565]",
        iconColor: "text-[#B57300]",
        shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        subtitleColor: "text-[#6B5C5C]",
    },
    orange: {
        bg: "from-white to-[#FFEFD9]",
        textColor: "text-[#463B3B]",
        iconBg: "bg-[#F7C385]",
        iconColor: "text-[#B15B00]",
        shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        subtitleColor: "text-[#6B5C5C]",
    },
    green: {
        bg: "from-white to-[#E9F7EF]",
        textColor: "text-[#2E4B3A]",
        iconBg: "bg-[#8ED1A5]",
        iconColor: "text-[#1E6B3D]",
        shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        subtitleColor: "text-[#3F5A4C]",
    },
    blue: {
        bg: "from-white to-[#E9F2FF]",
        textColor: "text-[#304562]",
        iconBg: "bg-[#A7C4F5]",
        iconColor: "text-[#1F4E8C]",
        shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        subtitleColor: "text-[#4A5C74]",
    },
    purple: {
        bg: "from-white to-[#F4EAFE]",
        textColor: "text-[#4C3D65]",
        iconBg: "bg-[#D6B5F5]",
        iconColor: "text-[#5E2F9A]",
        shadow: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        subtitleColor: "text-[#615273]",
    },
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    loading,
    subtitle,
}: StatCardProps) {
    const scheme = colorSchemes[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -2, scale: 1.005 }}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${scheme.bg} p-4 ${scheme.shadow} hover:shadow-md transition-all duration-300`}
        >

            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

            <div className="relative z-10">

                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-10 h-10 ${scheme.iconBg} rounded-lg mb-2`}
                >
                    <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                </motion.div>


                <h3 className={`${scheme.textColor} text-[11px] font-medium mb-1.5`}>{title}</h3>


                {loading ? (
                    <div className="h-7 w-16 bg-black/10 rounded-lg animate-pulse" />
                ) : (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={`text-2xl font-bold ${scheme.textColor} mb-1`}
                    >
                        {typeof value === "number" ? value.toLocaleString() : value}
                    </motion.div>
                )}


                {subtitle && (
                    <p className={`${scheme.subtitleColor} text-[9px] leading-tight`}>{subtitle}</p>
                )}


                {trend && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <span
                            className={`text-[10px] font-semibold ${scheme.textColor}`}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                        <span className={`${scheme.subtitleColor} text-[9px]`}>vs last period</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
