"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, ActiveSemesterDto } from "@/services/dashboardService";

interface SemesterSelectorProps {
    value: string;
    onChange: (semester: ActiveSemesterDto | null) => void;
    className?: string;
}

export default function SemesterSelector({ value, onChange, className = "" }: SemesterSelectorProps) {
    const { data: semesters, isLoading } = useQuery({
        queryKey: ["semesters"],
        queryFn: () => dashboardService.getSemesters(),
    });

    const { data: currentSemester } = useQuery({
        queryKey: ["currentSemester"],
        queryFn: () => dashboardService.getCurrentSemester(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = e.target.value;



        const selectedSemester = semesters?.find(s => s.semesterCode === selectedCode);
        if (selectedSemester) {
            onChange(selectedSemester);
        }
    };

    if (isLoading) {
        return (
            <div className={`h-10 min-w-[280px] bg-gray-200 rounded-lg animate-pulse ${className}`} />
        );
    }

    return (
        <select
            value={value}
            onChange={handleChange}
            className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent bg-white text-[#463B3B] min-w-[280px] ${className}`}
        >

            {semesters?.map((semester) => {
                const isCurrent = semester.semesterCode === currentSemester?.semesterCode;
                return (
                    <option key={semester.semesterCode} value={semester.semesterCode}>
                        {semester.semesterName} - {semester.academicYear}
                        {isCurrent ? " (Current)" : ""}
                    </option>
                );
            })}
        </select>
    );
}
