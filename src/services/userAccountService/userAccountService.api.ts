import { apiService } from "@/lib/api";
import { UserAccount, BasicSuccessResponse } from "@/types";
import { LockUserRequest, LockMultipleUsersRequest, UnlockMultipleUsersRequest} from "./userAccountService.type"

// Add the UserListResponse interface
export interface UserListResponse {
  users: UserAccount[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface GetUsersParams {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  perPage?: number;
}

export const userAccountService = {
  getById: async (id: string): Promise<UserAccount> => {
    return await apiService.get<UserAccount>(`/UserAccount/${id}`);
  },
  
  // Get all users with pagination support
  getUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/UserAccount?${queryString}` : '/UserAccount';
    
    return await apiService.get<UserListResponse>(url);
  },

  // Lock a single user
  lockUser: async (userId: string, request: LockUserRequest): Promise<BasicSuccessResponse> => {
    return await apiService.post<BasicSuccessResponse>(`/UserAccount/${userId}/lock`, request);
  },

  // Unlock a single user
  unlockUser: async (userId: string): Promise<BasicSuccessResponse> => {
    return await apiService.post<BasicSuccessResponse>(`/UserAccount/${userId}/unlock`);
  },

  // Lock multiple users
  lockMultipleUsers: async (request: LockMultipleUsersRequest): Promise<BasicSuccessResponse> => {
    return await apiService.post<BasicSuccessResponse>("/UserAccount/lock-multiple", request);
  },

  // Unlock multiple users
  unlockMultipleUsers: async (request: UnlockMultipleUsersRequest): Promise<BasicSuccessResponse> => {
    return await apiService.post<BasicSuccessResponse>("/UserAccount/unlock-multiple", request);
  },
};