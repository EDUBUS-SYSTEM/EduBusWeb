'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StartPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email không hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem('parentEmail', email.trim());
      router.push('/verify-otp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
      >
        <div className="flex items-center space-x-3">
          <motion.img
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            src="/edubus_logo.png"
            alt="EduBus Logo"
            width={60}
            height={60}
            className="drop-shadow-lg"
          />
          <span className="text-2xl font-bold text-[#D08700]">EduBus</span>
        </div>
      </motion.header>

      <div className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#FEFCE8] rounded-3xl p-10 shadow-soft-lg min-h-[440px]"
          >
            <div className="flex flex-col gap-6 h-full justify-start max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 text-center">Parent Verification</h1>
              <p className="text-gray-700 text-center">
                Please enter the <span className="font-semibold">parent email</span>. 
                <span className="font-semibold"> Email must match</span> the email registered in the 
                <span className="font-semibold"> student list</span>.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., parent@example.com"
                    className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-100 border border-red-300 rounded-2xl p-3 text-red-600 text-center">{error}</div>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className="w-full bg-[#FDC700] text-black px-8 py-4 rounded-3xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Continue'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


