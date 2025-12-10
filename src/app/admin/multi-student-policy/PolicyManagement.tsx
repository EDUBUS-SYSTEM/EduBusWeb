"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPercent, FaCalendarAlt, FaTag, FaClock, FaUser, FaEye } from "react-icons/fa";
import { multiStudentPolicyService } from "@/services/multiStudentPolicyService";
import { MultiStudentPolicyResponseDto } from "@/types/multiStudentPolicy";
import CreatePolicyModal from "./CreatePolicyModal";
import EditPolicyModal from "./EditPolicyModal";
import PolicyDetailModal from "./PolicyDetailModal";

export default function PolicyManagement() {
  const [policies, setPolicies] = useState<MultiStudentPolicyResponseDto[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<MultiStudentPolicyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<MultiStudentPolicyResponseDto | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [minEffectiveFromDate, setMinEffectiveFromDate] = useState<string>("");

  // Load policies
  useEffect(() => {
    loadPolicies();
  }, [refreshTrigger]);

  // Filter policies
  useEffect(() => {
    if (!policies || !Array.isArray(policies)) {
      setFilteredPolicies([]);
      return;
    }

    let filtered = policies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(policy =>
        policy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.byAdminName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Active filter
    if (filterActive !== null) {
      filtered = filtered.filter(policy => policy.isActive === filterActive);
    }

    setFilteredPolicies(filtered);
  }, [policies, searchTerm, filterActive]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await multiStudentPolicyService.getAllPolicies();
      setPolicies(response || []);

      // Determine minimum effective from date based on latest policy end
      if (response && response.length > 0) {
        let latest = new Date(0);
        response.forEach((p) => {
          const end = p.effectiveTo ? new Date(p.effectiveTo) : new Date(p.effectiveFrom);
          if (end > latest) latest = end;
        });
        const nextDay = new Date(latest);
        nextDay.setDate(nextDay.getDate() + 1);
        setMinEffectiveFromDate(nextDay.toISOString().split("T")[0]);
      } else {
        setMinEffectiveFromDate(new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error loading policies:", error);
      setPolicies([]);
      setMinEffectiveFromDate(new Date().toISOString().split("T")[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedPolicy(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleView = (policy: MultiStudentPolicyResponseDto) => {
    setSelectedPolicy(policy);
    setShowDetailModal(true);
  };

  const handleEdit = (policy: MultiStudentPolicyResponseDto) => {
    setSelectedPolicy(policy);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (globalThis.confirm("Are you sure you want to delete this policy? This action cannot be undone.")) {
      try {
        await multiStudentPolicyService.deletePolicy(id);
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Error deleting policy:", error);
        alert("Failed to delete policy");
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await multiStudentPolicyService.deactivatePolicy(id);
      } else {
        await multiStudentPolicyService.activatePolicy(id);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error toggling policy status:", error);
      alert("Failed to update policy status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPolicyEffective = (policy: MultiStudentPolicyResponseDto) => {
    const now = new Date();
    const effectiveFrom = new Date(policy.effectiveFrom);
    const effectiveTo = policy.effectiveTo ? new Date(policy.effectiveTo) : null;
    
    return policy.isActive &&
           effectiveFrom <= now &&
           (effectiveTo === null || effectiveTo >= now);
  };

  const getHeaderGradient = (policy: MultiStudentPolicyResponseDto) => {
    if (isPolicyEffective(policy)) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (policy.isActive) return "bg-gradient-to-r from-[#FDC700] to-[#D08700]";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fad23c] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading policies...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4"
      >
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, description, or admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Active Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterActive === null
                  ? "bg-[#fad23c] text-[#463B3B] shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive(true)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterActive === true
                  ? "bg-[#fad23c] text-[#463B3B] shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive(false)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filterActive === false
                  ? "bg-[#fad23c] text-[#463B3B] shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#FDC700] text-[#463B3B] rounded-full font-semibold hover:shadow-md transition-all duration-300 flex items-center gap-2 whitespace-nowrap border border-[#FDC700]"
          >
            <FaPlus className="w-4 h-4" />
            Create Policy
          </motion.button>
        </div>
      </motion.div>

      {/* Policies List */}
      <AnimatePresence mode="wait">
        {filteredPolicies.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-2xl shadow-lg border-2 border-dashed border-[#FDC700]/30 p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-[#FDC700]/20 rounded-full mb-6"
            >
              <FaPercent className="w-10 h-10 text-[#D08700]" />
            </motion.div>
            <h3 className="text-xl font-bold text-[#463B3B] mb-2">No Policies Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterActive !== null
                ? "Try adjusting your search or filter criteria"
                : "Create your first multi-student policy to get started"}
            </p>
            {!searchTerm && filterActive === null && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#FDC700] to-[#D08700] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Create Your First Policy
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6"
          >
            {filteredPolicies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Card Header with Gradient */}
                <div className={`relative overflow-hidden ${getHeaderGradient(policy)} p-4 text-white`}>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl"
                        >
                          <FaTag className="w-4 h-4" />
                        </motion.div>
                        <h3 className="text-xl font-bold">{policy.name}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {isPolicyEffective(policy) && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/30"
                          >
                            ⚡ Currently Effective
                          </motion.span>
                        )}
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                          policy.isActive
                            ? "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                            : "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20"
                        }`}>
                          {policy.isActive ? "✓ Active" : "○ Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(policy)}
                        className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                        title="Edit Policy"
                      >
                        <FaEdit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleStatus(policy.id, policy.isActive)}
                        className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                        title={policy.isActive ? "Deactivate" : "Activate"}
                      >
                        {policy.isActive ? (
                          <FaToggleOn className="w-5 h-5" />
                        ) : (
                          <FaToggleOff className="w-5 h-5" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(policy.id)}
                        className="p-2 bg-red-500/30 backdrop-blur-sm hover:bg-red-500/40 rounded-lg transition-colors"
                        title="Delete Policy"
                      >
                        <FaTrash className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {policy.description && (
                    <p className="text-gray-700 text-sm mb-5 line-clamp-2 leading-relaxed">{policy.description}</p>
                  )}

                  {/* Info Grid - 3 equal columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-lg p-3 border border-[#FDC700]/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-[#D08700] w-4 h-4" />
                        <p className="text-xs font-medium text-gray-600">Effective From</p>
                      </div>
                      <p className="text-sm font-semibold text-[#463B3B]">{formatDate(policy.effectiveFrom)}</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-lg p-3 border border-[#FDC700]/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-[#D08700] w-4 h-4" />
                        <p className="text-xs font-medium text-gray-600">Effective To</p>
                      </div>
                      <p className="text-sm font-semibold text-[#463B3B]">
                        {policy.effectiveTo ? formatDate(policy.effectiveTo) : "No limit"}
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="bg-gradient-to-br from-[#FEFCE8] to-[#FFF6D8] rounded-lg p-3 border border-[#FDC700]/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FaPercent className="text-[#D08700] w-4 h-4" />
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Policy Tiers</p>
                      </div>
                      {policy.tiers && policy.tiers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {[...policy.tiers]
                            .sort((a, b) => a.priority - b.priority)
                            .slice(0, 4)
                            .map((tier) => (
                              <motion.div
                                key={tier.id || `tier-${tier.minStudentCount}-${tier.reductionPercentage}`}
                                whileHover={{ scale: 1.03, y: -1 }}
                                className="px-3 py-2 bg-white border border-[#FDC700]/25 rounded-md hover:border-[#FDC700]/50 transition-all duration-300 text-[12px]"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="bg-[#FDC700] p-1 rounded-md">
                                    <FaPercent className="w-3 h-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-[#463B3B]">
                                      {tier.minStudentCount}
                                      {tier.maxStudentCount ? `-${tier.maxStudentCount}` : "+"} students
                                    </p>
                                    <p className="text-[11px] font-semibold text-[#D08700]">{tier.reductionPercentage}% discount</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          {policy.tiers.length > 4 && (
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-[12px] font-semibold text-gray-600"
                            >
                              <span>+{policy.tiers.length - 4} more</span>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[12px] text-gray-500">No tiers configured</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaUser className="w-3 h-3" />
                      <span>{formatDate(policy.createdAt)}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleView(policy)}
                      className="text-xs font-semibold text-[#D08700] hover:text-[#FDC700] transition-colors flex items-center gap-1"
                    >
                      View Details
                      <FaEye className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showCreateModal && (
        <CreatePolicyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          minEffectiveFromDate={minEffectiveFromDate}
        />
      )}
      {showEditModal && selectedPolicy && (
        <EditPolicyModal
          policy={selectedPolicy}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPolicy(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
      {showDetailModal && selectedPolicy && (
        <PolicyDetailModal
          policyId={selectedPolicy.id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}
    </div>
  );
}
