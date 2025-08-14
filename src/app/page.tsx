'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { AxiosError } from 'axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData);
      router.push('/dashboard');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      setErrors({
        general: axiosError.response?.data?.message || 'Login failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-100 to-white">
      <div className="max-w-md w-full">
        {/* Login Card with Logo Inside */}
        <div className="bg-white rounded-3xl shadow-soft-lg border border-orange-100 p-8">
          {/* Logo Section Inside Card */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Image
                  src="/bus.png"
                  alt="EduBus Logo"
                  width={120}
                  height={120}
                  className="mx-auto"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Hello, Sign in !
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{ backgroundColor: 'white' }}
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-3xl border bg-white
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-orange-200
                    placeholder:text-gray-400
                    ${errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900' 
                      : 'border-orange-200 focus:border-orange-400 text-gray-900 hover:border-orange-300'
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm ml-2">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{ backgroundColor: 'white' }}
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-3xl border bg-white
                    transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-orange-200
                    placeholder:text-gray-400
                    ${errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200 text-red-900' 
                      : 'border-orange-200 focus:border-orange-400 text-gray-900 hover:border-orange-300'
                    }
                  `}
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm ml-2">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-4 px-6 rounded-3xl
                bg-gradient-to-r from-yellow-400 to-orange-500
                hover:from-yellow-500 hover:to-orange-600
                text-white font-semibold text-lg
                transition-all duration-300 ease-in-out
                transform hover:scale-105
                focus:outline-none focus:ring-4 focus:ring-orange-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl
              "
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
