// services/authService.ts
import { apiService } from "@/lib/api";

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    data: {
        message: string;
    } | null;
    error: {
        code: string;
        message: string;
    } | null;
}

export interface SendOtpRequest {
    email: string;
}

export interface VerifyOtpResetRequest {
    email: string;
    otpCode: string;
    newPassword: string;
}

export const authService = {
    changePassword: async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
        return await apiService.post<ChangePasswordResponse>("/auth/change-password", request);
    },

    sendOtp: async (email: string): Promise<ChangePasswordResponse> => {
        return await apiService.post<ChangePasswordResponse>("/auth/send-otp", { email });
    },

    verifyOtpReset: async (request: VerifyOtpResetRequest): Promise<ChangePasswordResponse> => {
        return await apiService.post<ChangePasswordResponse>("/auth/verify-otp-reset", request);
    },
};
