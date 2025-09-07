"use client";

import React, { useEffect, useState } from "react";
import {
  FaLock,
  FaUnlock,
  FaSearch,
  FaSort,
  FaCalendarAlt,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { userAccountService, GetUsersParams } from "@/services/userAccountService/userAccountService.api";
import {
  UserAccount,
  LockUserRequest,
  LockMultipleUsersRequest,
  UnlockMultipleUsersRequest,
} from "@/services/userAccountService/userAccountService.type";

export default function AccountManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockUserId, setUnlockUserId] = useState<string | null>(null);
  const [lockFormData, setLockFormData] = useState({ lockedUntil: "", reason: "" });
  const [showBulkUnlockModal, setShowBulkUnlockModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Validation state
  const [lockValidationError, setLockValidationError] = useState<string | null>(null);
  const [reasonValidationError, setReasonValidationError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: GetUsersParams = {
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        search: searchTerm || undefined,
      };

      const response = await userAccountService.getUsers(params);
      setUsers(response.users);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setSelectedUsers([]); // Clear selection when filters change
  }, [currentPage, perPage, sortBy, sortOrder, statusFilter, roleFilter]);

  const isUserLocked = (user: UserAccount): boolean => {
    return Boolean(user.lockedUntil && new Date(user.lockedUntil + "Z") > new Date());
  };

  const getLockStatus = (user: UserAccount) => {
    if (user.isDeleted) return { status: "Deleted", color: "bg-gray-100 text-gray-800" };
    if (isUserLocked(user)) return { status: "Locked", color: "bg-red-100 text-red-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  // Check if user is admin
  const isAdminUser = (user: UserAccount): boolean => {
    return user.role === "admin";
  };

  // Check if any selected users are admins
  const hasAdminInSelection = (): boolean => {
    return selectedUsers.some((userId) => {
      const user = users.find((u) => u.id === userId);
      return user && isAdminUser(user);
    });
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
    // Check if user is admin
    const user = users.find((u) => u.id === userId);
    if (user && isAdminUser(user)) {
      setError("Cannot lock admin accounts");
      return;
    }

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
      fetchUsers();
    } catch {
      setError("Failed to lock user");
    }
  };

  const handleUnlockUser = async (userId: string) => {
    // Check if user is admin
    const user = users.find((u) => u.id === userId);
    if (user && isAdminUser(user)) {
      setError("Cannot unlock admin accounts");
      return;
    }

    try {
      await userAccountService.unlockUser(userId);
      setSuccessMessage("User unlocked successfully");
      setShowUnlockModal(false);
      setUnlockUserId(null);
      fetchUsers();
    } catch {
      setError("Failed to unlock user");
    }
  };

  const handleBulkLock = async () => {
    // Check if any selected users are admins
    if (hasAdminInSelection()) {
      setError("Cannot lock admin accounts");
      return;
    }

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
      fetchUsers();
    } catch {
      setError("Failed to lock users");
    }
  };

  const handleBulkUnlock = async () => {
    // Check if any selected users are admins
    if (hasAdminInSelection()) {
      setError("Cannot unlock admin accounts");
      return;
    }

    try {
      const req: UnlockMultipleUsersRequest = { userIds: selectedUsers };
      await userAccountService.unlockMultipleUsers(req);
      setSuccessMessage(`${selectedUsers.length} users unlocked successfully`);
      setSelectedUsers([]);
      setShowBulkUnlockModal(false);
      fetchUsers();
    } catch {
      setError("Failed to unlock users");
    }
  };

  // Only allow multi-select if status filter is set to active/inactive
  const multiSelectEnabled = statusFilter === "isNotLocked" || statusFilter === "isLocked";

  const toggleUserSelection = (userId: string) => {
    if (!multiSelectEnabled) return;
    const user = users.find((u) => u.id === userId);
    // Don't allow selecting admin users
    if (user && isAdminUser(user)) {
      return;
    }

    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (!multiSelectEnabled) return;
    // Only select non-admin users
    const nonAdminUsers = users.filter((user) => !isAdminUser(user));
    setSelectedUsers(nonAdminUsers.map((user) => user.id));
  };

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === 'Enter') {
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers(); 
   }
  };
  const handleResetFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setSearchTerm("");
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#463B3B]">User Management</h1>
        <div className="flex gap-2">
          {multiSelectEnabled && selectedUsers.length > 0 && (() => {
            const selected = users.filter((u) => selectedUsers.includes(u.id));
            const allLocked = selected.every((u) => isUserLocked(u));
            const allActive = selected.every((u) => !isUserLocked(u));

            if (allLocked) {
                return (
                <button
                    onClick={() => setShowBulkUnlockModal(true)}
                    className="bg-[#388E3C] text-white px-4 py-2 rounded-lg hover:bg-[#206924] flex items-center gap-2"
                >
                    <FaUnlock /> Unlock Selected ({selectedUsers.length})
                </button>
                );
            }

            if (allActive) {
                return (
                <button
                    onClick={() => setShowLockModal(true)}
                    className="bg-[#D32F2F] text-white px-4 py-2 rounded-lg hover:bg-[#a82020] flex items-center gap-2"
                >
                    <FaLock /> Lock Selected ({selectedUsers.length})
                </button>
                );
            }

            // Mixed selection → optional: show nothing or both
            return null;
            })()}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <FaInfoCircle />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <FaInfoCircle />
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-500 hover:text-green-700">×</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  key={'123'}
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
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
                <option value="driver">Driver</option>
                <option value="parent">Parent</option>
                <option value="student">Student</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="ml-2 text-gray-500 hover:text-red-600"
                title="Reset filters"
              >
                <FaTimesCircle size={20} />
              </button>
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
                <button onClick={selectAllUsers} disabled={!multiSelectEnabled} className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">Select All</button>
                <button onClick={clearSelection} className="text-sm text-gray-600 hover:text-gray-800">Clear Selection</button>
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
                      multiSelectEnabled &&
                      selectedUsers.length === users.filter((u) => !isAdminUser(u)).length &&
                      users.filter((u) => !isAdminUser(u)).length > 0
                    }
                    onChange={
                      multiSelectEnabled
                        ? selectedUsers.length === users.filter((u) => !isAdminUser(u)).length
                          ? clearSelection
                          : selectAllUsers
                        : undefined
                    }
                    disabled={!multiSelectEnabled}
                    className="rounded border-gray-300 disabled:opacity-50"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("firstName")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Name <FaSort />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Created <FaSort />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const locked = isUserLocked(user);
                const lockStatus = getLockStatus(user);
                const isAdmin = isAdminUser(user);
                return (
                  <tr key={user.id} className={`hover:bg-gray-50 ${isAdmin ? "bg-blue-50" : ""}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        disabled={!multiSelectEnabled || isAdmin}
                        className="rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {isAdmin && (
                          <FaShieldAlt className="text-blue-600 text-xs" title="Admin Account" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "driver"
                            ? "bg-yellow-100 text-yellow-800"
                            : user.role === "parent"
                            ? "bg-green-100 text-green-800"
                            : user.role === "student"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                          Until: {new Date(user.lockedUntil + "Z").toLocaleString()}
                        </div>
                      )}
                      {locked && user.lockReason && (
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
                          disabled={locked || isAdmin}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isAdmin ? "Cannot lock admin accounts" : "Lock User"}
                        >
                          <FaLock />
                        </button>
                        <button
                          onClick={() => {
                            setUnlockUserId(user.id);
                            setShowUnlockModal(true);
                          }}
                          disabled={!locked || isAdmin}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isAdmin ? "Cannot unlock admin accounts" : "Unlock User"}
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
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * perPage, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? "z-10 bg-yellow-50 border-yellow-500 text-yellow-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Lock User{selectedUsers.length > 1 ? "s" : ""}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lock Until (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={lockFormData.lockedUntil}
                  min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 hour from now
                  onChange={(e) => handleLockFormChange("lockedUntil", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                    lockValidationError ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {lockValidationError && (
                  <p className="text-xs text-red-500 mt-1">{lockValidationError}</p>
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
                  onChange={(e) => handleLockFormChange("reason", e.target.value)}
                  placeholder="Enter reason for locking..."
                  maxLength={300}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
                    reasonValidationError ? "border-red-300" : "border-gray-300"
                  }`}
                  rows={3}
                />
                {reasonValidationError && (
                  <p className="text-xs text-red-500 mt-1">{reasonValidationError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum 300 characters</p>
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
                disabled={lockValidationError !== null || reasonValidationError !== null}
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

      {/* Unlock Confirmation Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Unlock</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unlock this user? This will restore their access to the system.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockUserId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => unlockUserId && handleUnlockUser(unlockUserId)}
                className="px-4 py-2 bg-[#388E3C] text-white rounded-lg hover:bg-[#206924]"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Unlock Confirmation Modal */}
      {showBulkUnlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Unlock</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unlock <b>{selectedUsers.length}</b> users? This will restore their access to the system.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkUnlockModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUnlock}
                className="px-4 py-2 bg-[#388E3C] text-white rounded-lg hover:bg-[#206924]"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}