'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { User, LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse } from '@/types';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
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
      const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      if (response?.data?.role.toLocaleLowerCase() != 'admin'){
        throw Error("You dont have permissions to access the system");
      }
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser({
        id: "",
        email: "",
        createdAt: "",
        updatedAt: "",
        name: response.data.fullName,
        role: response.data.role.toLowerCase() as 'admin' | 'user' | 'moderator',
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser({
        id: "",
        email: "",
        createdAt: "",
        updatedAt: "",
        name: response.data.fullName,
        role: response.data.role.toLowerCase() as 'admin' | 'user' | 'moderator',
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.replace('/');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
