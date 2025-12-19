"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { User, LoginCredentials } from "@/types";
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

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.replace("/");
  }, [router]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            setUser({
              id: "",
              email: "",
              createdAt: "",
              updatedAt: "",
              name: "Admin User", 
              role: "admin",
            });
          }
        } catch {
          logout();
        }
      } else {
        const publicPages = ["/", "/start", "/verify-otp", "/student-selection", "/map"];
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.startsWith("/admin") || currentPath.startsWith("/create-account");
        
        if (isAdminPage && currentPath !== "/login") {
          router.replace("/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [logout, router]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && e.newValue === null) {
        setUser(null);
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.startsWith("/admin") || currentPath.startsWith("/create-account");
        
        if (isAdminPage && currentPath !== "/login") {
          router.replace("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.post<{
        success: boolean;
        data: {
          accessToken: string;
          refreshToken: string;
          fullName: string;
          role: string;
        };
      }>("/auth/login", credentials);
      const success = response?.success === true;
      const payload = response?.data;
      if (!success || !payload) {
        throw Error("Login failed");
      }
      if (payload?.role?.toLocaleLowerCase() != "admin") {
        throw Error("You dont have permissions to access the system");
      }
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
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
