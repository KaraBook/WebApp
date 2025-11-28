import { useState } from "react";
import { NavLink } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.name ||
    "Owner";

  // 🟦 Extract initials if no image
  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const avatarInitial = getInitials(fullName);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Property", path: "/properties" },
    { label: "Bookings", path: "/bookings" },
    { label: "Calendar", path: "/calendar" },
    { label: "Customize", path: "/customize" },
  ];

  return (
    <header className="w-full bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
      {/* LEFT — LOGO */}
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="logo"
          className="h-8 w-8 object-cover"
        />
        <span className="font-semibold text-[18px] text-gray-800">KaraBook</span>
      </div>

      {/* CENTER — NAVIGATION */}
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `text-[15px] transition ${
                isActive
                  ? "font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg"
                  : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* RIGHT — USER PROFILE */}
      <div className="relative flex items-center gap-3">
        {/* AVATAR */}
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt="profile"
            className="h-9 w-9 rounded-full border object-cover cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        ) : (
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold cursor-pointer"
          >
            {avatarInitial}
          </div>
        )}

        {/* NAME */}
        <span
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="text-gray-800 font-medium text-[15px] cursor-pointer"
        >
          {fullName}
        </span>

        {/* DROPDOWN */}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 bg-white border shadow-lg rounded-xl w-44 py-2 z-50">
            <button
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-[14px] w-full text-left"
            >
              <User size={16} /> My Profile
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-[14px] text-red-600 w-full text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
