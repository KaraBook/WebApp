import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const fullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    user?.name ||
    "Owner";

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const avatarInitial = getInitials(fullName);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Property", path: "/view-property/:id" },
    { label: "Bookings", path: "/bookings" },
    { label: "Calendar", path: "/calendar" },
    { label: "Customize", path: "/customize" },
  ];

  const isPropertyActive =
    location.pathname.startsWith("/view-property") ||
    location.pathname.startsWith("/edit-property");

  return (
    <header className="w-full bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      {/* LOGO */}
      <img src="/KarabookLogo.png" alt="logo" className="h-auto w-[150px]" />

      {/* NAV */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const isActive =
            item.label === "Property"
              ? isPropertyActive
              : location.pathname === item.path;

          const targetPath =
            item.label === "Property"
              ? `/view-property/${user?.propertyId ?? ""}`
              : item.path;

          return (
            <NavLink
              key={item.path}
              to={targetPath}
              className={`text-[14px] px-3 py-3 rounded-[8px] transition ${
                isActive
                  ? "font-semibold text-gray-900 bg-gray-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* PROFILE DROPDOWN */}
      <div className="relative flex items-center gap-3">
        <div
          onClick={() => setDropdownOpen((p) => !p)}
          className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm cursor-pointer border"
        >
          {avatarInitial}
        </div>

        <span
          onClick={() => setDropdownOpen((p) => !p)}
          className="text-gray-800 font-medium text-[14px] cursor-pointer"
        >
          {fullName}
        </span>

        {dropdownOpen && (
          <div className="absolute right-0 top-11 bg-white border border-gray-200 shadow-lg rounded-xl w-44 py-2 z-50">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-[14px] w-full text-left text-gray-700">
              <User size={16} /> My Profile
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-[14px] text-red-600 w-full text-left"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
