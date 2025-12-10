// Multi-Student Policy Types
export interface PolicyTierResponseDto {
  id: string;
  policyId: string;
  minStudentCount: number;
  maxStudentCount?: number;
  reductionPercentage: number;
  description: string;
  priority: number;
  createdAt: string;
}

export interface MultiStudentPolicyResponseDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  tiers: PolicyTierResponseDto[];
  byAdminId: string;
  byAdminName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePolicyTierDto {
  minStudentCount: number;
  maxStudentCount?: number;
  reductionPercentage: number;
  description: string;
  priority: number;
}

export interface CreateMultiStudentPolicyDto {
  name: string;
  description: string;
  effectiveFrom: string;
  effectiveTo?: string;
  tiers: CreatePolicyTierDto[];
  byAdminId?: string;
  byAdminName?: string;
}

export interface UpdatePolicyTierDto {
  id?: string;
  minStudentCount: number;
  maxStudentCount?: number;
  reductionPercentage: number;
  description: string;
  priority: number;
}

export interface UpdateMultiStudentPolicyDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  tiers: UpdatePolicyTierDto[];
  byAdminId?: string;
  byAdminName?: string;
}

export interface PolicyCalculationResult {
  reductionAmount: number;
  reductionPercentage: number;
  description: string;
  appliedTierId?: string;
}

export interface CalculatePolicyRequest {
  studentCount: number;
  originalFee: number;
}

