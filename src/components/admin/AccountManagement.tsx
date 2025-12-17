"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import {
  FaLock,
  FaUnlock,
  FaSearch,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  userAccountService,
  GetUsersParams,
  UserListResponse,
} from "@/services/userAccountService/userAccountService.api";
import { UserAvatarImage } from "./UserAvatarImage";
import {
  UserAccount,
  LockUserRequest,
} from "@/services/userAccountService/userAccountService.type";
import { formatDate } from "@/utils/dateUtils";

const UserRow = memo(({
  user,
  onLockClick,
  onUnlockClick
}: {
  user: UserAccount;
  onLockClick: (userId: string) => void;
  onUnlockClick: (userId: string) => void;
}) => {
  const getUserRole = (user: UserAccount): UserAccount["role"] => {
    return user.role;
  };

  const isUserLocked = (user: UserAccount): boolean => {
    return Boolean(
      user.lockedUntil && new Date(user.lockedUntil + "Z") > new Date()
    );
  };

  const getLockStatus = (user: UserAccount) => {
    if (user.isDeleted)
      return { status: "Deleted", color: "bg-gray-100 text-gray-800" };
    if (isUserLocked(user))
      return { status: "Locked", color: "bg-red-100 text-red-800" };
    return { status: "Active", color: "bg-green-100 text-green-800" };
  };

  const locked = isUserLocked(user);
  const lockStatus = getLockStatus(user);
  const role = getUserRole(user);

  return (
    <tr className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200">
      <td className="px-6 py-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 relative">
            {user.userPhotoFileId ? (
              <UserAvatarImage
                userId={user.id}
                firstName={user.firstName}
                lastName={user.lastName}
                size={48}
                className="h-12 w-12"
                userPhotoFileId={user.userPhotoFileId}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#fad23c] to-[#FFF085] flex items-center justify-center">
                <span className="text-[#463B3B] font-bold text-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-6">
        <div className="space-y-1">
          <div className="text-sm text-gray-900 font-medium">{user.email}</div>
          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
        </div>
      </td>

      <td className="px-6 py-6">
        <div className="space-y-2">
          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
          <div>
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${lockStatus.color}`}>
              {lockStatus.status}
            </span>
          </div>
          {locked && user.lockedUntil && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FaCalendarAlt className="text-red-500" />
              Until: {formatDate(user.lockedUntil)}
            </div>
          )}
          {user.lockReason && (
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              Reason: {user.lockReason}
            </div>
          )}
        </div>
      </td>

      <td className="px-6 py-6">
        <div className="text-sm text-gray-900">
          Created: {formatDate(user.createdAt)}
        </div>
        {user.updatedAt && (
          <div className="text-xs text-gray-500">
            Updated: {formatDate(user.updatedAt)}
          </div>
        )}
      </td>

      <td className="px-6 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLockClick(user.id)}
            disabled={locked}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Lock User"
          >
            <FaLock className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUnlockClick(user.id)}
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
});

UserRow.displayName = 'UserRow';

export default function AccountManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [lockFormData, setLockFormData] = useState({
    lockedUntil: "",
    reason: "",
  });

  const [lockValidationError, setLockValidationError] = useState<string | null>(null);
  const [reasonValidationError, setReasonValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, roleFilter, sortBy, sortOrder]);

  const queryParams = useMemo<GetUsersParams>(() => ({
    page: currentPage,
    perPage: 20,
    sortBy,
    sortOrder,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
  }), [currentPage, sortBy, sortOrder, debouncedSearch, statusFilter, roleFilter]);

  const { data, isLoading, isFetching, error: queryError } = useQuery<UserListResponse, Error>({
    queryKey: ['users', queryParams],
    queryFn: () => userAccountService.getUsers(queryParams),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
  });

  const lockMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: LockUserRequest }) =>
      userAccountService.lockUser(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage("User locked successfully");
      setShowLockModal(false);
      setSelectedUserId(null);
      setLockFormData({ lockedUntil: "", reason: "" });
      setLockValidationError(null);
      setReasonValidationError(null);
    },
    onError: () => {
      setError("Failed to lock user");
    },
  });

  const unlockMutation = useMutation({
    mutationFn: (userId: string) => userAccountService.unlockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage("User unlocked successfully");
    },
    onError: () => {
      setError("Failed to unlock user");
    },
  });

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
    }
  };

  const validateLockUntil = (dateTimeString: string): string | null => {
    if (!dateTimeString) return null;
    const selectedDate = new Date(dateTimeString);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
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

  const handleLockFormChange = (field: string, value: string) => {
    setLockFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "lockedUntil") {
      const error = validateLockUntil(value);
      setLockValidationError(error);
    } else if (field === "reason") {
      const error = validateReason(value);
      setReasonValidationError(error);
    }
  };

  const handleLockUser = async (userId: string) => {
    if (lockValidationError || reasonValidationError) {
      setError("Please fix validation errors before proceeding");
      return;
    }

    let lockedUntilUtc: string | undefined = undefined;
    if (lockFormData.lockedUntil) {
      const localDate = new Date(lockFormData.lockedUntil);
      lockedUntilUtc = localDate.toISOString();
    }

    const req: LockUserRequest = {
      lockedUntil: lockedUntilUtc,
      reason: lockFormData.reason || "Locked by admin",
    };

    lockMutation.mutate({ userId, request: req });
  };

  const handleUnlockUser = useCallback((userId: string) => {
    unlockMutation.mutate(userId);
  }, [unlockMutation]);

  const handleLockClick = useCallback((userId: string) => {
    setLockFormData({ lockedUntil: "", reason: "" });
    setSelectedUserId(userId);
    setShowLockModal(true);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (queryError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load users. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="bg-[#fdc600bd] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#463B3B] mb-1">User Management</h1>
            <p className="text-[#463B3B] text-sm opacity-80">Manage user accounts and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/create-account')}
              className="bg-white hover:bg-gray-50 text-[#463B3B] p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Create Account"
            >
              <FaPlus className="w-5 h-5" />
            </button>
            <div className="bg-white rounded-xl p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg font-bold text-[#463B3B]">{totalCount}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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


      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <button
                onClick={() => handleSort("firstName")}
                className={`px-4 py-2 text-sm rounded-xl border transition-all duration-300 flex items-center gap-2 ${sortBy === "firstName"
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
                className={`px-4 py-2 text-sm rounded-xl border transition-all duration-300 flex items-center gap-2 ${sortBy === "createdAt"
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

        <div className="overflow-x-auto">
          {isLoading && users.length === 0 ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
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
                {users.map((user: UserAccount) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onLockClick={handleLockClick}
                    onUnlockClick={handleUnlockUser}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isFetching && !isLoading && (
          <div className="absolute inset-x-0 top-0 flex justify-end p-3 pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1 text-xs text-gray-500 shadow-sm">
              <span className="animate-spin">⏳</span>
              <span>Updating...</span>
            </div>
          </div>
        )}

        {users.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{(currentPage - 1) * 20 + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * 20, totalCount)}
                </span>{" "}
                of <span className="font-semibold">{totalCount}</span> users
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalCount}
                itemsPerPage={20}
                showInfo={false}
              />
            </div>
          </div>
        )}
      </div>

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
                      .slice(0, 16)}
                    onChange={(e) =>
                      handleLockFormChange("lockedUntil", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 ${lockValidationError ? "border-red-300 bg-red-50" : "border-gray-300"
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
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-200 ${reasonValidationError ? "border-red-300 bg-red-50" : "border-gray-300"
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
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${lockValidationError || reasonValidationError || !selectedUserId
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
