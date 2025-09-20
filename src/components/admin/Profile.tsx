"use client";
import Image from "next/image";
import { useUserAccount } from "@/hooks/useUserAccount";
import { getUserIdFromToken } from "@/lib/jwt";

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
    { label: "Date of Birth", value: user.dateOfBirth?.split("T")[0] || "", type: "date" },
  ];

  return (
    <div className="lg:ml-64 mt-20 lg:mt-28 px-4 md:px-6 lg:px-8 flex flex-col items-center">
      <h2 className="text-xl md:text-2xl lg:text-2xl font-bold mb-6 lg:mb-10 text-[#463B3B]">Personal Profile</h2>

      <div className="flex flex-col md:flex-row lg:flex-row gap-6 md:gap-8 lg:gap-12 justify-center items-center w-full max-w-4xl">
        {/* Avatar + name */}
        <div className="flex flex-col items-center w-full md:w-auto lg:w-[220px]">
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#fde535] flex items-center justify-center shadow-md">
            <Image
              src="/images/admin_avt_default.png"
              alt="avatar"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>
          <h3 className="mt-4 text-sm md:text-base lg:text-base font-semibold text-[#463B3B] text-center">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-xs md:text-sm lg:text-sm text-[#d97706] text-center">{user.email}</p>
        </div>

        {/* Information Form */}
        <form className="bg-[#FEFCE8] p-4 md:p-5 lg:p-5 rounded-lg shadow-md w-full md:w-[500px] lg:w-[550px]">
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
                  className="w-full border rounded p-2 md:p-2.5 lg:p-2.5 text-xs md:text-sm lg:text-sm bg-gray-100"
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              type="button"
              className="bg-[#388E3C] hover:bg-[#206924] text-white px-4 md:px-5 lg:px-5 py-1.5 rounded-md text-xs w-20 md:w-24 lg:w-24"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-[#D32F2F] hover:bg-[#a82020] text-white px-4 md:px-5 lg:px-5 py-1.5 rounded-md text-xs w-20 md:w-24 lg:w-24"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
