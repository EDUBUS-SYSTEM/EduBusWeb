"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCalendarAlt, FaUser, FaPercent, FaTag, FaClock } from "react-icons/fa";
import { multiStudentPolicyService } from "@/services/multiStudentPolicyService";
import { MultiStudentPolicyResponseDto } from "@/types/multiStudentPolicy";

interface PolicyDetailModalProps {
  readonly policyId: string;
  readonly onClose: () => void;
}

export default function PolicyDetailModal({ policyId, onClose }: PolicyDetailModalProps) {
  const [policy, setPolicy] = useState<MultiStudentPolicyResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicyDetail();
  }, [policyId]);

  const loadPolicyDetail = async () => {
    try {
      setLoading(true);
      const data = await multiStudentPolicyService.getPolicyById(policyId);
      if (data) {
        setPolicy(data);
      }
    } catch (error) {
      console.error("Error loading policy detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fad23c]"></div>
            <p className="text-gray-600 text-sm">Loading policy details...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md"
        >
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4 font-semibold">Policy not found</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-2 bg-[#fad23c] text-[#463B3B] rounded-lg font-medium hover:bg-[#FFF085] transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isEffective = () => {
    const now = new Date();
    const effectiveFrom = new Date(policy.effectiveFrom);
    const effectiveTo = policy.effectiveTo ? new Date(policy.effectiveTo) : null;
    
    return policy.isActive &&
           effectiveFrom <= now &&
           (effectiveTo === null || effectiveTo >= now);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden"
      >
        {/* Header with Gradient */}
        <div className={`relative overflow-hidden ${
          isEffective()
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : (policy.isActive
              ? "bg-gradient-to-r from-[#FDC700] to-[#D08700]"
              : "bg-gradient-to-r from-gray-400 to-gray-500")
        } p-6 text-white`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/20 backdrop-blur-sm p-3 rounded-xl"
                >
                  <FaTag className="w-6 h-6" />
                </motion.div>
                <h2 className="text-3xl font-bold">{policy.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isEffective() && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full border border-white/30"
                  >
                    ⚡ Currently Effective
                  </motion.span>
                )}
                <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${
                  policy.isActive
                    ? "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                    : "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20"
                }`}>
                  {policy.isActive ? "✓ Active" : "○ Inactive"}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Description */}
          {policy.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-xl p-4 border border-[#FDC700]/20"
            >
              <p className="text-gray-700 leading-relaxed">{policy.description}</p>
            </motion.div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-xl p-5 border border-[#FDC700]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FDC700] p-2.5 rounded-lg">
                  <FaCalendarAlt className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Effective From</p>
                  <p className="text-base font-bold text-[#463B3B]">{formatDate(policy.effectiveFrom)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-xl p-5 border border-[#FDC700]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FDC700] p-2.5 rounded-lg">
                  <FaClock className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Effective To</p>
                  <p className="text-base font-bold text-[#463B3B]">
                    {policy.effectiveTo ? formatDate(policy.effectiveTo) : "No limit"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-xl p-5 border border-[#FDC700]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FDC700] p-2.5 rounded-lg">
                  <FaUser className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created By</p>
                  <p className="text-base font-bold text-[#463B3B]">{policy.byAdminName}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-xl p-5 border border-[#FDC700]/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FDC700] p-2.5 rounded-lg">
                  <FaCalendarAlt className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Created At</p>
                  <p className="text-base font-bold text-[#463B3B]">{formatDateTime(policy.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tiers Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FDC700] p-2 rounded-lg">
                <FaPercent className="text-white w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-[#463B3B]">
                Policy Tiers ({policy.tiers?.length || 0})
              </h4>
            </div>

            {policy.tiers && policy.tiers.length > 0 ? (
              <div className="space-y-3">
                {[...policy.tiers]
                  .sort((a, b) => a.priority - b.priority)
                  .map((tier, index) => (
                    <motion.div
                      key={tier.id || `tier-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#FDC700]/50 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gradient-to-br from-[#FDC700] to-[#D08700] px-4 py-2 rounded-lg">
                              <span className="text-white font-bold text-sm">Tier {tier.priority}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#463B3B]">
                                {tier.minStudentCount}
                                {tier.maxStudentCount ? ` - ${tier.maxStudentCount}` : "+"} students
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Discount</p>
                              <p className="text-2xl font-bold text-[#D08700]">{tier.reductionPercentage}%</p>
                            </div>
                            {tier.description && (
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <p className="text-sm text-gray-700 font-medium">{tier.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
              >
                <FaPercent className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tiers configured</p>
              </motion.div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-[#FDC700] to-[#D08700] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
