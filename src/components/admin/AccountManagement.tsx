"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaLock,
  FaUnlock,
  FaSearch,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import {
  userAccountService,
  GetUsersParams,
} from "@/services/userAccountService/userAccountService.api";
import {
  UserAccount,
  LockUserRequest,
} from "@/services/userAccountService/userAccountService.type";

export default function AccountManagement() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [lockFormData, setLockFormData] = useState({
    lockedUntil: "",
    reason: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Validation state
  const [lockValidationError, setLockValidationError] = useState<string | null>(
    null
  );
  const [reasonValidationError, setReasonValidationError] = useState<
    string | null
  >(null);

  // Removed unused searchTimeoutRef

  // Helper function to determine user role based on email pattern
  const getUserRole = (user: UserAccount): "admin" | "parent" | "driver" => {
    const email = user.email.toLowerCase();
    if (email.includes("admin")) return "admin";
    if (email.includes("driver")) return "driver";
    if (email.includes("parent")) return "parent";
    // Default fallback - could be improved with actual role data
    return "parent";
  };

  // Helper function to check if user is locked
  const isUserLocked = (user: UserAccount): boolean => {
    return Boolean(
      user.lockedUntil && new Date(user.lockedUntil + "Z") > new Date()
    );
  };

  // Client-side filtering function
  const filterUsers = useCallback((users: UserAccount[]) => {
    let filtered = [...users];

    // Apply search filter (only if there's a search term)
    if (debouncedSearch && debouncedSearch.trim() !== "") {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => getUserRole(user) === roleFilter);
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === "isNotLocked") {
        filtered = filtered.filter(user => !isUserLocked(user));
      } else if (statusFilter === "isLocked") {
        filtered = filtered.filter(user => isUserLocked(user));
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === "firstName") {
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortBy === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a[sortBy as keyof UserAccount] as string;
        bValue = b[sortBy as keyof UserAccount] as string;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [debouncedSearch, roleFilter, statusFilter, sortBy, sortOrder]);

  // Pagination for filtered results (fixed 20 items per page)
  const perPage = 20;
  const paginatedUsers = useMemo(() => {
    const filtered = filterUsers(allUsers);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filtered.slice(start, end);
  }, [filterUsers, allUsers, currentPage, perPage]);

  const totalFilteredCount = useMemo(() => {
    return filterUsers(allUsers).length;
  }, [filterUsers, allUsers]);

  const totalFilteredPages = useMemo(() => {
    return Math.ceil(totalFilteredCount / perPage);
  }, [totalFilteredCount, perPage]);

  // Fetch all users (for client-side filtering)
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all users without pagination
      const params: GetUsersParams = {
        page: 1,
        perPage: 1000, // Large number to get all users
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const response = await userAccountService.getUsers(params);
      setAllUsers(response.users);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users when dependencies change (except searchTerm)
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1); // reset to first page
    }
  };

  const getLockStatus = (user: UserAccount) => {
    if (user.isDeleted)
      return { status: "Deleted", color: "bg-gray-100 text-gray-800" };
    if (isUserLocked(user))
      return { status: "Locked", color: "bg-red-100 text-red-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  // Validation functions
  const validateLockUntil = (dateTimeString: string): string | null => {
    if (!dateTimeString) return null; // Optional field

    const selectedDate = new Date(dateTimeString);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour

    if (selectedDate <= oneHourFromNow) {
      return "Lock until date must be at least 1 hour from now";
    }

    return null;
  };

  const validateReason = (reason: string): string | null => {
    if (reason.length > 300) {
      return "Reason must be 300 characters or less";
    }
    return null;
  };

  // Update the lock form data change handler
  const handleLockFormChange = (field: string, value: string) => {
    setLockFormData((prev) => ({ ...prev, [field]: value }));

    // Validate based on field
    if (field === "lockedUntil") {
      const error = validateLockUntil(value);
      setLockValidationError(error);
    } else if (field === "reason") {
      const error = validateReason(value);
      setReasonValidationError(error);
    }
  };

  // --- Lock/Unlock Handlers ---
  const handleLockUser = async (userId: string) => {
    // Check validation before proceeding
    if (lockValidationError || reasonValidationError) {
      setError("Please fix validation errors before proceeding");
      return;
    }

    try {
      // Convert local datetime to UTC before sending
      let lockedUntilUtc: string | undefined = undefined;
      if (lockFormData.lockedUntil) {
        const localDate = new Date(lockFormData.lockedUntil);
        lockedUntilUtc = localDate.toISOString(); // Converts to UTC
      }

      const req: LockUserRequest = {
        lockedUntil: lockedUntilUtc,
        reason: lockFormData.reason || "Locked by admin",
      };
      await userAccountService.lockUser(userId, req);
      setSuccessMessage("User locked successfully");
      setShowLockModal(false);
      setSelectedUserId(null);
      setLockFormData({ lockedUntil: "", reason: "" });
      setLockValidationError(null);
      setReasonValidationError(null);
      fetchAllUsers();
    } catch {
      setError("Failed to lock user");
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await userAccountService.unlockUser(userId);
      setSuccessMessage("User unlocked successfully");
      fetchAllUsers();
    } catch {
      setError("Failed to unlock user");
    }
  };


  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Debounce searchTerm -> debouncedSearch 
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-[#fdc600bd] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#463B3B] mb-1">User Management</h1>
            <p className="text-[#463B3B] text-sm opacity-80">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Create Account Button */}
            <button
              onClick={() => router.push('/create-account')}
              className="bg-white hover:bg-gray-50 text-[#463B3B] p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Create Account"
            >
              <FaPlus className="w-5 h-5" />
            </button>
            {/* Total Users Counter */}
            <div className="bg-white rounded-xl p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg font-bold text-[#463B3B]">{totalFilteredCount}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <FaInfoCircle className="text-red-500 text-xl" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <FaInfoCircle className="text-green-500 text-xl" />
            <div className="flex-1">
              <p className="text-green-700 font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-500 hover:text-green-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Search and Filter Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onKeyDown={handleSearchKeyDown}
                  onChange={handleSearchChange}
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 w-80"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">All Status</option>
                <option value="isNotLocked">Active</option>
                <option value="isLocked">Locked</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fad23c] focus:border-transparent transition-all duration-300 bg-white"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="parent">Parent</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => handleSort("firstName")}
                className={`px-4 py-2 text-sm rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                  sortBy === "firstName"
                    ? "bg-[#fad23c] border-[#fad23c] text-[#463B3B] shadow-md"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Name
                {sortBy === "firstName" && (
                  <span className="text-xs font-bold">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSort("createdAt")}
                className={`px-4 py-2 text-sm rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                  sortBy === "createdAt"
                    ? "bg-[#fad23c] border-[#fad23c] text-[#463B3B] shadow-md"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Created Date
                {sortBy === "createdAt" && (
                  <span className="text-xs font-bold">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Account Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedUsers.map((user) => {
                const locked = isUserLocked(user);
                const lockStatus = getLockStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
                    {/* User Information */}
                    <td className="px-6 py-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#fad23c] to-[#FFF085] flex items-center justify-center">
                            <span className="text-[#463B3B] font-bold text-lg">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Contact Details */}
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                      </div>
                    </td>
                    
                    {/* Role & Status */}
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                          {getUserRole(user).charAt(0).toUpperCase() + getUserRole(user).slice(1)}
                        </span>
                        <div>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${lockStatus.color}`}>
                            {lockStatus.status}
                          </span>
                        </div>
                        {locked && user.lockedUntil && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="text-red-500" />
                            Until: {new Date(user.lockedUntil + "Z").toLocaleDateString()}
                          </div>
                        )}
                        {user.lockReason && (
                          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            Reason: {user.lockReason}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Account Info */}
                    <td className="px-6 py-6">
                      <div className="text-sm text-gray-900">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.updatedAt && (
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(user.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setLockFormData({ lockedUntil: "", reason: "" });
                            setSelectedUserId(user.id);
                            setShowLockModal(true);
                          }}
                          disabled={locked}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="Lock User"
                        >
                          <FaLock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUnlockUser(user.id)}
                          disabled={!locked}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="Unlock User"
                        >
                          <FaUnlock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedUsers.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{(currentPage - 1) * perPage + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * perPage, totalFilteredCount)}
                </span>{" "}
                of <span className="font-semibold">{totalFilteredCount}</span> users
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalFilteredPages}
                onPageChange={handlePageChange}
                totalItems={totalFilteredCount}
                itemsPerPage={perPage}
                showInfo={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <FaLock className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Lock User Account
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lock Until (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={lockFormData.lockedUntil}
                    min={new Date(Date.now() + 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)} // 1 hour from now
                    onChange={(e) =>
                      handleLockFormChange("lockedUntil", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 ${
                      lockValidationError ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {lockValidationError && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      {lockValidationError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty for permanent lock (minimum 1 hour from now)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason (Optional)
                    <span className="text-gray-500 font-normal ml-2">
                      ({lockFormData.reason.length}/300)
                    </span>
                  </label>
                  <textarea
                    value={lockFormData.reason}
                    onChange={(e) =>
                      handleLockFormChange("reason", e.target.value)
                    }
                    placeholder="Enter reason for locking this user account..."
                    maxLength={300}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 ${
                      reasonValidationError ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    rows={4}
                  />
                  {reasonValidationError && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      {reasonValidationError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum 300 characters
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowLockModal(false);
                    setSelectedUserId(null);
                    setLockFormData({ lockedUntil: "", reason: "" });
                    setLockValidationError(null);
                    setReasonValidationError(null);
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedUserId && handleLockUser(selectedUserId)}
                  disabled={
                    lockValidationError !== null || reasonValidationError !== null || !selectedUserId
                  }
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    lockValidationError || reasonValidationError || !selectedUserId
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  Lock User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
