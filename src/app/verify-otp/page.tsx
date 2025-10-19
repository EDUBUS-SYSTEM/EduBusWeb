'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { pickupPointService } from '@/services/pickupPointService';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('parentEmail') || '';
    setEmail(savedEmail);
    if (!savedEmail) {
      router.replace('/start');
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setSubmitting(true);
    setError('');
    
    try {
      const result = await pickupPointService.verifyOtp({
        email: email,
        otp: code
      });
      
      if (result.verified) {
        console.log('✅ OTP verification successful');
        console.log('📧 Email:', email);
        console.log('👥 Students:', result.students);
        console.log('📧 Email exists:', result.emailExists);
        
        // Store students and emailExists for student selection page
        sessionStorage.setItem('parentStudents', JSON.stringify(result.students));
        sessionStorage.setItem('parentEmailExists', String(result.emailExists));
        
        console.log('💾 Data saved to sessionStorage:');
        console.log('  - parentStudents:', sessionStorage.getItem('parentStudents'));
        console.log('  - parentEmailExists:', sessionStorage.getItem('parentEmailExists'));
        
        // Redirect to student selection page with data
        const studentsParam = encodeURIComponent(JSON.stringify(result.students));
        console.log('🔄 Redirecting to student-selection page...');
        router.replace(`/student-selection?students=${studentsParam}&email=${encodeURIComponent(email)}`);
      } else {
        setError(result.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { title?: string; detail?: string; message?: string } } }).response?.data;
      setError(message?.detail || message?.message || 'OTP verification failed. Please try again.');
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
            className="bg-[#FEFCE8] rounded-3xl p-10 shadow-soft-lg min-h-[480px]"
          >
            <div className="flex flex-col gap-6 h-full justify-start max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 text-center">Enter OTP</h1>
              <p className="text-gray-700 text-center">
                OTP has been sent to: <span className="font-semibold">{email || '...'}</span>
              </p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-14 h-16 text-center text-2xl rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] bg-white"
                    />
                  ))}
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
                  {submitting ? 'Verifying...' : 'Confirm'}
                </motion.button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.replace('/start')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Re-enter email
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


