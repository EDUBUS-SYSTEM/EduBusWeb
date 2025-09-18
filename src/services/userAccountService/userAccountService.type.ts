export interface LockUserRequest {
  lockedUntil?: string;
  reason?: string;
}

export interface LockMultipleUsersRequest {
  userIds: string[];
  lockedUntil?: string;
  reason?: string;
}

export interface UnlockMultipleUsersRequest {
  userIds: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth?: string; // ISO string from backend
  gender?: number;
  role: "admin";
  userPhotoFileId?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  
  // Lock information
  lockedUntil?: string;
  lockReason?: string;
  lockedAt?: string;
  isLocked?: boolean;
}