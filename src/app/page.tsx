"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  // removed unused: fadeInRight

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // removed unused: scaleIn

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-between px-6 py-4 bg-[#FEFCE8] shadow-soft"
      >
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
          <Image
            src="/edubus_logo.png"
            alt="EduBus Logo"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </motion.div>
          <span className="text-2xl font-bold text-[#D08700]">EduBus</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="bg-[#FDC700] text-black px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Login
        </motion.button>
      </motion.header>

      {/* Hero Section */}
      <section className="px-6 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight"
                >
                  Safe School Rides with{' '}
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-[#D08700]"
                  >
                    EduBus
                  </motion.span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-lg text-gray-600 leading-relaxed max-w-2xl"
                >
                  The mission of the student shuttle service is to provide safe, reliable, and comfortable transportation for students every day. Our top priority is protecting each child&apos;s safety from the moment they step onto the bus until they arrive at school or home. We are committed to strict safety standards, well-trained drivers, and modern vehicles equipped with essential safety features.
                </motion.p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/start')}
                className="bg-[#FDC700] text-black px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </motion.button>
            </motion.div>

            {/* Right Content - Bus Image */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src="/images/bus1.jpg"
                  alt="School Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                />
              </motion.div>
              {/* Carousel dots */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center space-x-2 mt-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 bg-[#D08700] rounded-full cursor-pointer"
                ></motion.div>
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 bg-[#FDC700] rounded-full cursor-pointer"
                ></motion.div>
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-3 h-3 bg-[#FDC700] rounded-full cursor-pointer"
                ></motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose EduBus Section */}
      <section className="px-6 py-16 bg-[#FEFCE8]">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center text-gray-800 mb-12"
          >
            Why Parents Should choose EduBus
          </motion.h2>
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: false, amount: 0.3 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Feature Cards */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 shadow-soft-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-[#FDC700] rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Registration</h3>
              <p className="text-gray-600">Sign up in minutes</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 shadow-soft-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-[#FDC700] rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Live GPS Tracking</h3>
              <p className="text-gray-600">See your child&apos;s journey</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 shadow-soft-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-[#FDC700] rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Safety First</h3>
              <p className="text-gray-600">Verified drivers & instant alerts</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-6 shadow-soft-lg hover:shadow-xl transition-all duration-300"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-[#FDC700] rounded-2xl flex items-center justify-center mb-4"
              >
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

                  </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Parent Community</h3>
              <p className="text-gray-600">Stay connected with others</p>
            </motion.div>
          </motion.div>
                </div>
      </section>

      {/* Stay Connected Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src="/images/bus2.jpg"
                  alt="Children with Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                />
              </motion.div>
            </motion.div>

            {/* Right - Content */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FDC700] rounded-3xl p-8 text-black shadow-soft-lg"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src="/edubus_logo.png"
                      alt="EduBus Logo"
                      width={50}
                      height={50}
                      className="drop-shadow-lg"
                    />
                  </motion.div>
                  <h2 className="text-3xl font-bold">Stay Connected Anytime</h2>
                </motion.div>
                <motion.ul 
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: false, amount: 0.3 }}
                  variants={staggerContainer}
                  className="space-y-4 text-lg"
                >
                  <motion.li 
                    variants={fadeInLeft}
                    className="flex items-center space-x-3"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-black rounded-full"
                    ></motion.div>
                    <span>Real-time alerts</span>
                  </motion.li>
                  <motion.li 
                    variants={fadeInLeft}
                    className="flex items-center space-x-3"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-black rounded-full"
                    ></motion.div>
                    <span>Friendly, trained drivers</span>
                  </motion.li>
                  <motion.li 
                    variants={fadeInLeft}
                    className="flex items-center space-x-3"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-black rounded-full"
                    ></motion.div>
                    <span>24/7 support team</span>
                  </motion.li>
                  <motion.li 
                    variants={fadeInLeft}
                    className="flex items-center space-x-3"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 bg-black rounded-full"
                    ></motion.div>
                    <span>UI-Friendly with parent</span>
                  </motion.li>
                </motion.ul>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-6 bg-black/10 rounded-2xl p-4"
                >
                  <p className="text-black/80">
                    With EduBus, you&apos;ll receive real-time notifications, updates on bus location, and peace of mind knowing your child is in safe hands.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Features Section */}
      <section className="px-6 py-16 bg-[#FEFCE8]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl p-8 shadow-soft-lg"
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl font-bold text-gray-800 mb-6"
              >
                Our Feature
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-gray-700 leading-relaxed"
              >
                The student shuttle service is equipped with modern features such as real-time GPS tracking and automatic check-in and check-out for every ride. With GPS, parents and schools can easily monitor the bus&apos;s location, ensuring timely and safe transportation. The check-in and check-out system records when each child gets on and off the bus, giving parents instant updates and peace of mind. These smart tools not only enhance safety but also create a transparent, reliable, and trustworthy service for families and schools.
              </motion.p>
            </motion.div>

            {/* Right - Image */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEFCE8] rounded-3xl p-8 shadow-soft-lg"
              >
                <Image
                  src="/images/bus3.webp"
                  alt="Children in Bus"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-2xl shadow-lg object-cover"
                />
              </motion.div>
            </motion.div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#D08700] text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.h3 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl font-bold"
          >
            Keeping your child safe is our mission
          </motion.h3>
        </div>
      </motion.footer>
    </div>
  );
}