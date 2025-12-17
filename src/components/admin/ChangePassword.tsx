"use client";
import React, { useState } from "react";
import { authService } from "@/services/authService";

export default function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage(null);
    };

    const togglePassword = (field: "current" | "new" | "confirm") => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: "error", text: "Please fill in all fields" });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: "error", text: "New password must be at least 8 characters" });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });

            if (response.success) {
                setMessage({ type: "success", text: "Password changed successfully!" });
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMessage({ type: "error", text: response.error?.message || "Failed to change password" });
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: { message?: string } } } };
            setMessage({
                type: "error",
                text: err?.response?.data?.error?.message || "An error occurred while changing password",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const EyeIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    const EyeOffIcon = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
    );

    return (
        <div className="ml-64 mt-10 pt-24 px-6 flex justify-center">
            <div className="bg-[#FFFDF5] rounded-2xl shadow-lg p-8 w-[420px] border border-[#f5e6a3]">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
                    Change Password
                </h1>

                {message && (
                    <div
                        className={`p-3 rounded-lg mb-5 text-sm text-center ${message.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-600 mb-2">
                            Old Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                                className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg bg-white focus:border-[#fad23c] focus:ring-0 outline-none transition-all placeholder:text-gray-400 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword("current")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#D08700] hover:text-[#B87500] transition-colors"
                            >
                                {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password (min 8 characters)"
                                className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg bg-white focus:border-[#fad23c] focus:ring-0 outline-none transition-all placeholder:text-gray-400 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword("new")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#D08700] hover:text-[#B87500] transition-colors"
                            >
                                {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg bg-white focus:border-[#fad23c] focus:ring-0 outline-none transition-all placeholder:text-gray-400 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword("confirm")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#D08700] hover:text-[#B87500] transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2.5 rounded-full font-medium transition-all ${isLoading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#fad23c] text-gray-800 hover:bg-[#f5c825] hover:shadow-md"
                                }`}
                        >
                            {isLoading ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
