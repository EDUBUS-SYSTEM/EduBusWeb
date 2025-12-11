"use client";

import { useEffect, useState } from "react";
import { formatDateForInput } from "@/utils/dateUtils";

interface EditAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignmentType: "driver" | "supervisor";
    assignmentData: {
        id: string;
        name: string;
        startTime: string;
        endTime?: string;
    } | null;
    onSave: (id: string, startTime: string, endTime?: string) => Promise<void>;
}

export default function EditAssignmentModal({
    isOpen,
    onClose,
    assignmentType,
    assignmentData,
    onSave,
}: EditAssignmentModalProps) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Initialize dates when modal opens
    useEffect(() => {
        if (isOpen && assignmentData) {
            // Convert UTC to local date for input (YYYY-MM-DD format) using centralized utility
            setStartDate(formatDateForInput(assignmentData.startTime));

            if (assignmentData.endTime) {
                setEndDate(formatDateForInput(assignmentData.endTime));
            } else {
                setEndDate("");
            }
            setError("");
        }
    }, [isOpen, assignmentData]);

    const handleSave = async () => {
        if (!assignmentData) return;

        // Validation
        if (!startDate) {
            setError("Start date is required");
            return;
        }

        if (endDate && new Date(endDate) < new Date(startDate)) {
            setError("End date must be after start date");
            return;
        }

        setSaving(true);
        setError("");

        try {
            // Convert to UTC ISO string
            const startTimeUtc = new Date(startDate + "T00:00:00").toISOString();
            const endTimeUtc = endDate ? new Date(endDate + "T23:59:59").toISOString() : undefined;

            await onSave(assignmentData.id, startTimeUtc, endTimeUtc);
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update assignment";
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !assignmentData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-[#463B3B] mb-4">
                    Edit {assignmentType === "driver" ? "Driver" : "Supervisor"} Assignment
                </h2>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                        {assignmentType === "driver" ? "Driver" : "Supervisor"}:
                    </p>
                    <p className="font-semibold text-gray-900">{assignmentData.name}</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fad23c] focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing assignment</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-[#fad23c] text-[#463B3B] font-semibold rounded-lg hover:bg-[#f5c518] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
