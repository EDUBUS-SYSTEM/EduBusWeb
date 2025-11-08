"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCE8] to-white">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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

      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-6 py-10">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-10 shadow-2xl border-2 border-[#FDC700]"
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="bg-[#FEFCE8] rounded-2xl p-6 border border-[#FDC700]">
                  <h2 className="text-xl font-semibold text-[#D08700] mb-3">
                    How to Register
                  </h2>
                  <p className="text-gray-700 mb-4">
                    To register your child for the EduBus transportation
                    service, please contact your school administration.
                  </p>
                  <div className="text-left space-y-2">
                    <p className="text-gray-600">
                      <span className="font-semibold text-[#D08700]">
                        📧 Step 1:
                      </span>{" "}
                      Contact the school office
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold text-[#D08700]">
                        📝 Step 2:
                      </span>{" "}
                      School admin will create your account
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold text-[#D08700]">
                        🚌 Step 3:
                      </span>{" "}
                      School admin will set up your pickup point
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold text-[#D08700]">
                        💳 Step 4:
                      </span>{" "}
                      Complete payment to activate service
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Back to Home Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="mt-4 bg-[#FDC700] hover:bg-[#D08700] text-white px-8 py-4 rounded-3xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
