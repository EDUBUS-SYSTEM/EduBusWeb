import { apiService } from "@/lib/api";
import { UserAccount } from "@/types";

export const userAccountService = {
  getById: async (id: string): Promise<UserAccount> => {
    return await apiService.get<UserAccount>(`/UserAccount/${id}`);
  },
};
