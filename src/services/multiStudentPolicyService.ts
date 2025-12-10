import { apiService } from '@/lib/api';
import {
  MultiStudentPolicyResponseDto,
  CreateMultiStudentPolicyDto,
  UpdateMultiStudentPolicyDto,
  PolicyCalculationResult,
  CalculatePolicyRequest
} from '@/types/multiStudentPolicy';

// Re-export types for convenience
export type {
  MultiStudentPolicyResponseDto,
  CreateMultiStudentPolicyDto,
  UpdateMultiStudentPolicyDto,
  PolicyTierResponseDto,
  PolicyCalculationResult,
  CalculatePolicyRequest
} from '@/types/multiStudentPolicy';

export const multiStudentPolicyService = {
  // Get all policies (admin only)
  getAllPolicies: async () => {
    const response = await apiService.get<unknown>('/MultiStudentPolicy');
    // Handle both formats: {success, data, error} or direct array
    if (Array.isArray(response)) {
      return response as MultiStudentPolicyResponseDto[];
    }
    if (response && typeof response === 'object' && 'data' in response) {
      const resp = response as { success?: boolean; data?: unknown };
      if (resp.success) {
        return (resp.data || []) as MultiStudentPolicyResponseDto[];
      }
    }
    return [];
  },

  // Get all policies including deleted (admin only)
  getAllIncludingDeleted: async () => {
    const response = await apiService.get<unknown>('/MultiStudentPolicy/all-including-deleted');
    if (Array.isArray(response)) {
      return response as MultiStudentPolicyResponseDto[];
    }
    if (response && typeof response === 'object' && 'data' in response) {
      const resp = response as { success?: boolean; data?: unknown };
      if (resp.success) {
        return (resp.data || []) as MultiStudentPolicyResponseDto[];
      }
    }
    return [];
  },

  // Get policy by ID (admin only)
  getPolicyById: async (id: string) => {
    const response = await apiService.get<unknown>(`/MultiStudentPolicy/${id}`);
    if (response && typeof response === 'object') {
      if ('data' in response) {
        const resp = response as { success?: boolean; data?: unknown };
        if (resp.success) {
          return resp.data as MultiStudentPolicyResponseDto | null;
        }
      }
      // If response is direct policy object (no wrapper)
      if ('id' in response && 'name' in response) {
        return response as MultiStudentPolicyResponseDto;
      }
    }
    return null;
  },

  // Get current active policy (public)
  getCurrentActivePolicy: async () => {
    const response = await apiService.get<unknown>('/MultiStudentPolicy/current-active');
    if (response && typeof response === 'object') {
      if ('data' in response) {
        const resp = response as { success?: boolean; data?: unknown };
        if (resp.success) {
          return resp.data as MultiStudentPolicyResponseDto | null;
        }
      }
      // If response is direct policy object (no wrapper)
      if ('id' in response && 'name' in response) {
        return response as MultiStudentPolicyResponseDto;
      }
    }
    return null;
  },

  // Calculate policy reduction (public)
  calculatePolicy: async (request: CalculatePolicyRequest) => {
    const response = await apiService.post<unknown>('/MultiStudentPolicy/calculate', request);
    if (response && typeof response === 'object') {
      if ('data' in response) {
        const resp = response as { success?: boolean; data?: unknown };
        if (resp.success) {
          return resp.data as PolicyCalculationResult;
        }
      }
      // If response is direct result object
      if ('reductionAmount' in response) {
        return response as PolicyCalculationResult;
      }
    }
    return { reductionAmount: 0, reductionPercentage: 0, description: "Error calculating policy", appliedTierId: null };
  },

  // Create policy (admin only)
  createPolicy: async (data: CreateMultiStudentPolicyDto) => {
    const response = await apiService.post<unknown>('/MultiStudentPolicy', data);
    if (response && typeof response === 'object') {
      if ('data' in response) {
        const resp = response as { success?: boolean; data?: unknown; error?: unknown };
        if (resp.success) {
          return resp.data as MultiStudentPolicyResponseDto;
        }
        // If error, throw
        throw new Error(resp.error ? JSON.stringify(resp.error) : "Failed to create policy");
      }
      // If response is direct policy object
      if ('id' in response && 'name' in response) {
        return response as MultiStudentPolicyResponseDto;
      }
    }
    throw new Error("Failed to create policy");
  },

  // Update policy (admin only)
  updatePolicy: async (data: UpdateMultiStudentPolicyDto) => {
    const response = await apiService.put<unknown>('/MultiStudentPolicy', data);
    if (response && typeof response === 'object') {
      if ('data' in response) {
        const resp = response as { success?: boolean; data?: unknown; error?: unknown };
        if (resp.success) {
          return resp.data as MultiStudentPolicyResponseDto | null;
        }
        // If error, throw
        throw new Error(resp.error ? JSON.stringify(resp.error) : "Failed to update policy");
      }
      // If response is direct policy object
      if ('id' in response && 'name' in response) {
        return response as MultiStudentPolicyResponseDto;
      }
    }
    throw new Error("Failed to update policy");
  },

  // Delete policy (admin only)
  deletePolicy: (id: string) =>
    apiService.delete(`/MultiStudentPolicy/${id}`),

  // Activate policy (admin only)
  activatePolicy: (id: string) =>
    apiService.post(`/MultiStudentPolicy/${id}/activate`),

  // Deactivate policy (admin only)
  deactivatePolicy: (id: string) =>
    apiService.post(`/MultiStudentPolicy/${id}/deactivate`),
};

