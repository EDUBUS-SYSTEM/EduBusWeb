"use client";

import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface DeactivateStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    studentName: string;
}

export default function DeactivateStudentModal({
    isOpen,
    onClose,
    onConfirm,
    studentName,
}: DeactivateStudentModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            setError('Deactivation reason is required');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(reason);
            setReason('');
            setError('');
        } catch (error) {
            console.error("Error deactivating student:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Deactivate Student</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-gray-700 mb-4">
                        Please provide a reason for deactivating <span className="font-semibold">{studentName}</span>:
                    </p>

                    <div>
                        <label
                            htmlFor="reason"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Reason *
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none ${error ? "border-red-500" : "border-gray-300"
                                }`}
                            placeholder="Enter the reason for deactivation..."
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium border border-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaExclamationTriangle className="w-4 h-4" />
                                    Deactivate
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
