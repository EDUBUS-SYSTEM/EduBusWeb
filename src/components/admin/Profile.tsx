"use client";
import { useUserAccount } from "@/hooks/useUserAccount";
import { getUserIdFromToken } from "@/lib/jwt";
import { UserAvatarImage } from "./UserAvatarImage";
import { formatDateForInput } from "@/utils/dateUtils";

export default function Profile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = token ? getUserIdFromToken(token) : null;
  const { user, loading, error } = useUserAccount(userId || "");

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!user) return <p>User not found</p>;

  const userInfo = [
    { label: "Email", value: `${user.email} (Read only)`, type: "email" },
    { label: "Full Name", value: `${user.firstName} ${user.lastName}`, type: "text" },
    { label: "Phone Number", value: user.phoneNumber, type: "text" },
    { label: "Date of Birth", value: formatDateForInput(user.dateOfBirth), type: "date" },
  ];

  return (
    <div className="ml-64 mt-28 px-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-10 text-[#463B3B]">Personal Profile</h2>

      <div className="flex gap-12 justify-center items-center">
        {/* Avatar + name */}
        <div className="flex flex-col items-center w-[220px]">
          <UserAvatarImage
            userId={user.id}
            firstName={user.firstName}
            lastName={user.lastName}
            size={112}
            className="shadow-md"
          />
          <h3 className="mt-4 text-base font-semibold text-[#463B3B] text-center">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-[#d97706] text-center">{user.email}</p>
        </div>

        {/* Information Form */}
        <form className="bg-[#FEFCE8] p-5 rounded-lg shadow-md w-[550px]">
          <h4 className="font-semibold mb-3 text-center text-[#463B3B] text-sm">
            Information detail
          </h4>

          <div className="flex flex-col gap-2">
            {userInfo.map(({ label, value, type }) => (
              <div key={label}>
                <label className="block text-xs mb-1 text-[#463B3B]">{label}</label>
                <input
                  type={type}
                  value={value}
                  readOnly
                  className="w-full border rounded p-2.5 text-sm bg-gray-100"
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              type="button"
              className="bg-[#388E3C] hover:bg-[#206924] text-white px-5 py-1.5 rounded-md text-xs w-24"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-[#D32F2F] hover:bg-[#a82020] text-white px-5 py-1.5 rounded-md text-xs w-24"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
