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
        bg: "from-[#FEF3C7] to-[#FDE68A]",
        textColor: "text-[#92400E]",
        iconBg: "bg-[#FBBF24]",
        iconColor: "text-white",
        shadow: "shadow-[0_4px_12px_rgba(251,191,36,0.15)]",
        subtitleColor: "text-[#92400E]/70",
    },
    orange: {
        bg: "from-[#FDE68A] to-[#FCD34D]",
        textColor: "text-[#78350F]",
        iconBg: "bg-[#F59E0B]",
        iconColor: "text-white",
        shadow: "shadow-[0_4px_12px_rgba(245,158,11,0.15)]",
        subtitleColor: "text-[#78350F]/70",
    },
    green: {
        bg: "from-[#FBBF24] to-[#F59E0B]",
        textColor: "text-white",
        iconBg: "bg-white/20",
        iconColor: "text-white",
        shadow: "shadow-[0_4px_12px_rgba(245,158,11,0.2)]",
        subtitleColor: "text-white/80",
    },
    blue: {
        bg: "from-[#FEF3C7] to-[#FDE68A]",
        textColor: "text-[#92400E]",
        iconBg: "bg-[#FBBF24]",
        iconColor: "text-white",
        shadow: "shadow-[0_4px_12px_rgba(251,191,36,0.15)]",
        subtitleColor: "text-[#92400E]/70",
    },
    purple: {
        bg: "from-[#F59E0B] to-[#D97706]",
        textColor: "text-white",
        iconBg: "bg-white/20",
        iconColor: "text-white",
        shadow: "shadow-[0_4px_12px_rgba(217,119,6,0.2)]",
        subtitleColor: "text-white/80",
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
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />

            <div className="relative z-10">
                {/* Icon */}
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-10 h-10 ${scheme.iconBg} rounded-lg mb-2`}
                >
                    <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                </motion.div>

                {/* Title */}
                <h3 className={`${scheme.textColor} text-[11px] font-medium mb-1.5`}>{title}</h3>

                {/* Value */}
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

                {/* Subtitle */}
                {subtitle && (
                    <p className={`${scheme.subtitleColor} text-[9px] leading-tight`}>{subtitle}</p>
                )}

                {/* Trend indicator */}
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
