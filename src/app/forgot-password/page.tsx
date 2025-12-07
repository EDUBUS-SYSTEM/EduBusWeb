'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { authService } from '@/services/authService';
import Image from 'next/image';
import Link from 'next/link';

type ForgotStep = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<ForgotStep>('email');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.sendOtp(email);
            if (response.success) {
                setStep('otp');
            } else {
                setError(response.error?.message || 'Failed to send OTP');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error?.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP (just move to next step)
    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || otpCode.length < 4) {
            setError('Please enter the OTP code');
            return;
        }
        setError('');
        setStep('newPassword');
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await authService.verifyOtpReset({
                email: email,
                otpCode: otpCode,
                newPassword: newPassword,
            });
            if (response.success) {
                setStep('success');
            } else {
                setError(response.error?.message || 'Failed to reset password');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: { message?: string } } } };
            setError(error?.response?.data?.error?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Eye icon
    const EyeIcon = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#D08700] hover:text-[#B87500] transition-colors"
        >
            {show ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
        </button>
    );

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FEFCE8]">
            <div className="relative max-w-md w-full">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2">
                    <Image
                        src="/edubus_logo.png"
                        alt="EduBus Logo"
                        width={260}
                        height={180}
                        className="mx-auto drop-shadow-lg"
                    />
                </div>

                <div className="bg-gradient-to-b from-[#EDE091] to-[#F2ECBD] rounded-3xl shadow-soft-lg p-8 pt-40">

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <>
                            <h2 className="text-3xl font-bold text-[#000000] mb-2 text-center">
                                Forgot Password?
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                Enter your email to receive a verification code
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 mb-4">
                                    <p className="text-red-600 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-[#D08700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-3 rounded-3xl border-2 border-[#FDC700] bg-white focus:outline-none focus:ring-2 focus:ring-[#FDC700] placeholder:text-[#99A1AF]"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-6 rounded-3xl bg-[#FDC700] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <>
                            <h2 className="text-3xl font-bold text-[#000000] mb-2 text-center">
                                Enter OTP Code
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                We sent a code to <strong>{email}</strong>
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 mb-4">
                                    <p className="text-red-600 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        className="w-full px-4 py-3 rounded-3xl border-2 border-[#FDC700] bg-white focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-center tracking-widest placeholder:text-[#99A1AF]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 rounded-3xl bg-[#FDC700] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:brightness-95 shadow-lg"
                                >
                                    Verify OTP
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'newPassword' && (
                        <>
                            <h2 className="text-3xl font-bold text-[#000000] mb-2 text-center">
                                Create New Password
                            </h2>
                            <p className="text-gray-600 text-center mb-6">
                                Your new password must be at least 8 characters
                            </p>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-3xl p-4 mb-4">
                                    <p className="text-red-600 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-[#D08700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-12 pr-12 py-3 rounded-3xl border-2 border-[#FDC700] bg-white focus:outline-none focus:ring-2 focus:ring-[#FDC700] placeholder:text-[#99A1AF]"
                                        />
                                        <EyeIcon show={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <svg className="w-5 h-5 text-[#D08700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full pl-12 pr-12 py-3 rounded-3xl border-2 border-[#FDC700] bg-white focus:outline-none focus:ring-2 focus:ring-[#FDC700] placeholder:text-[#99A1AF]"
                                        />
                                        <EyeIcon show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-6 rounded-3xl bg-[#FDC700] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[#000000] mb-2">
                                Password Reset!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your password has been reset successfully.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-3 px-6 rounded-3xl bg-[#FDC700] text-white font-semibold text-xl transition-all duration-300 hover:scale-105 hover:brightness-95 shadow-lg"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}

                    {/* Back to login link (except success step) */}
                    {step !== 'success' && (
                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-[#D08700] hover:text-[#B87500] hover:underline transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
