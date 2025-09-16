'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { pickupPointService, type Gender } from '@/services/pickupPointService';

export default function StartPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>(1);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter first name and last name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter phone number.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter address.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please select date of birth.');
      return;
    }

    // Validate age (must be at least 18 years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      setError('Parent must be at least 18 years old.');
      return;
    }
    
    if (age > 100) {
      setError('Please enter a valid birth date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        dateOfBirth: dateOfBirth, // yyyy-MM-dd
        gender: gender,
      };

      const res = await pickupPointService.registerParent(payload);

      // Check if email exists in system
      if (!res.emailExists) {
        setError(res.message || 'The provided email is not associated with any student in the system. Please verify or contact the school.');
        return;
      }

      // Persist email for next steps
      sessionStorage.setItem('parentEmail', res.email || payload.email);
      sessionStorage.setItem('parentEmailExists', String(!!res.emailExists));

      router.push('/verify-otp');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { title?: string; detail?: string; message?: string } } }).response?.data;
      setError(message?.detail || message?.message || 'Registration failed. Please try again.');
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
                Please enter the <span className="font-semibold">parent information</span> to receive an OTP for verification.
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g., An"
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g., Nguyen"
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., 0901234567"
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your home address"
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(Number(e.target.value) as Gender)}
                      className="w-full px-5 py-4 rounded-3xl border-2 border-[#FDC700] focus:outline-none focus:ring-2 focus:ring-[#FDC700] text-lg bg-white"
                      required
                    >
                      <option value={1}>Male</option>
                      <option value={2}>Female</option>
                      <option value={3}>Other</option>
                    </select>
                  </div>
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


