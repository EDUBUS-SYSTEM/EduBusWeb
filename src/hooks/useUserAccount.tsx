"use client";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { userAccountService } from "@/services/userAccountService";
import { UserAccount } from "@/types";

export function useUserAccount(userId?: string) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await userAccountService.getById(userId);
        setUser(data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch user"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}
