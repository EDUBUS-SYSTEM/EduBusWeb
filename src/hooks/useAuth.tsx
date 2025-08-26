"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { User, LoginCredentials, AuthResponse, ApiResponse } from "@/types";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check token when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          //Place holder to fetch user info
        } catch {
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.post<any>(
        "/auth/login",
        credentials
      );
      const success = response?.success === true;
      const payload = response?.data;
      if (!success || !payload) {
        throw Error("Login failed");
      }
      if (payload?.role?.toLocaleLowerCase() != "admin") {
        throw Error("You dont have permissions to access the system");
      }
      localStorage.setItem("token", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
      setUser({
        id: "",
        email: "",
        createdAt: "",
        updatedAt: "",
        name: payload.fullName,
        role: payload.role.toLowerCase() as "admin",
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.replace("/");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
