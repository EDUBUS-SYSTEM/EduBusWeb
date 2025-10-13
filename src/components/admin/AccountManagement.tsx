"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaLock,
  FaUnlock,
  FaSearch,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";
import Pagination from "@/components/ui/Pagination";
import {
  userAccountService,
  GetUsersParams,
} from "@/services/userAccountService/userAccountService.api";
import {
  UserAccount,
  LockUserRequest,
  LockMultipleUsersRequest,
  UnlockMultipleUsersRequest,
} from "@/services/userAccountService/userAccountService.type";

export default function AccountManagement() {
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockFormData, setLockFormData] = useState({
    lockedUntil: "",
    reason: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
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

  // Pagination for filtered results
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

  const handleBulkLock = async () => {
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

      const req: LockMultipleUsersRequest = {
        userIds: selectedUsers,
        lockedUntil: lockedUntilUtc,
        reason: lockFormData.reason || "Bulk locked by admin",
      };
      await userAccountService.lockMultipleUsers(req);
      setSuccessMessage(`${selectedUsers.length} users locked successfully`);
      setSelectedUsers([]);
      setShowLockModal(false);
      setLockFormData({ lockedUntil: "", reason: "" });
      setLockValidationError(null);
      setReasonValidationError(null);
      fetchAllUsers();
    } catch {
      setError("Failed to lock users");
    }
  };

  const handleBulkUnlock = async () => {
    try {
      const req: UnlockMultipleUsersRequest = { userIds: selectedUsers };
      await userAccountService.unlockMultipleUsers(req);
      setSuccessMessage(`${selectedUsers.length} users unlocked successfully`);
      setSelectedUsers([]);
      fetchAllUsers();
    } catch {
      setError("Failed to unlock users");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => setSelectedUsers(paginatedUsers.map((user) => user.id));
  const clearSelection = () => setSelectedUsers([]);

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
    setSelectedUsers([]); // Clear selection when changing pages
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
    setSelectedUsers([]); // Clear selection
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
    setSelectedUsers([]); // Clear selection
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when filtering
    setSelectedUsers([]); // Clear selection
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#463B3B]">User Management</h1>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <>
              <button
                onClick={() => setShowLockModal(true)}
                className="bg-[#D32F2F] text-white px-4 py-2 rounded-lg hover:bg-[#a82020] flex items-center gap-2"
              >
                <FaLock /> Lock Selected ({selectedUsers.length})
              </button>
              <button
                onClick={handleBulkUnlock}
                className="bg-[#388E3C] text-white px-4 py-2 rounded-lg hover:bg-[#206924] flex items-center gap-2"
              >
                <FaUnlock /> Unlock Selected ({selectedUsers.length})
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <FaInfoCircle />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <FaInfoCircle />
          {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onKeyDown={handleSearchKeyDown}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="isNotLocked">Active</option>
                <option value="isLocked">Locked</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="parent">Parent</option>
                <option value="driver">Driver</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <button
                  onClick={() => handleSort("firstName")}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                    sortBy === "firstName"
                      ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Name
                  {sortBy === "firstName" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleSort("createdAt")}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                    sortBy === "createdAt"
                      ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Created Date
                  {sortBy === "createdAt" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Per page:</label>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={1}>1</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0
                    }
                    onChange={
                      selectedUsers.length === paginatedUsers.length
                        ? clearSelection
                        : selectAllUsers
                    }
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => {
                const locked = isUserLocked(user);
                const lockStatus = getLockStatus(user);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getUserRole(user).charAt(0).toUpperCase() + getUserRole(user).slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${lockStatus.color}`}
                      >
                        {lockStatus.status}
                      </span>
                      {locked && user.lockedUntil && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FaCalendarAlt />
                          Until:{" "}
                          {new Date(user.lockedUntil + "Z").toLocaleString()}
                        </div>
                      )}
                      {user.lockReason && (
                        <div className="text-xs text-gray-500 mt-1">
                          Reason: {user.lockReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setLockFormData({ lockedUntil: "", reason: "" });
                            setSelectedUsers([user.id]);
                            setShowLockModal(true);
                          }}
                          disabled={locked}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Lock User"
                        >
                          <FaLock />
                        </button>
                        <button
                          onClick={() => handleUnlockUser(user.id)}
                          disabled={!locked}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Unlock User"
                        >
                          <FaUnlock />
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
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalFilteredPages}
              onPageChange={handlePageChange}
              totalItems={totalFilteredCount}
              itemsPerPage={perPage}
              showInfo={false}
            />
          </div>
        )}
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Lock User{selectedUsers.length > 1 ? "s" : ""}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                    lockValidationError ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {lockValidationError && (
                  <p className="text-xs text-red-500 mt-1">
                    {lockValidationError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for permanent lock (minimum 1 hour from now)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                  <span className="text-gray-500 font-normal ml-1">
                    ({lockFormData.reason.length}/300)
                  </span>
                </label>
                <textarea
                  value={lockFormData.reason}
                  onChange={(e) =>
                    handleLockFormChange("reason", e.target.value)
                  }
                  placeholder="Enter reason for locking..."
                  maxLength={300}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                    reasonValidationError ? "border-red-300" : "border-gray-300"
                  }`}
                  rows={3}
                />
                {reasonValidationError && (
                  <p className="text-xs text-red-500 mt-1">
                    {reasonValidationError}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 300 characters
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setLockFormData({ lockedUntil: "", reason: "" });
                  setLockValidationError(null);
                  setReasonValidationError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={
                  selectedUsers.length > 1
                    ? handleBulkLock
                    : () => handleLockUser(selectedUsers[0])
                }
                disabled={
                  lockValidationError !== null || reasonValidationError !== null
                }
                className={`px-4 py-2 rounded-lg ${
                  lockValidationError || reasonValidationError
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-[#D32F2F] text-white hover:bg-[#a82020]"
                }`}
              >
                Lock User{selectedUsers.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
