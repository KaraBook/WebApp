import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ⭐ Fetch owner property id automatically
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        if (res.data?.data?.length > 0) {
          setPropertyId(res.data.data[0]._id);
        }
      } catch (err) {
        console.log("Failed to load property id");
      }
    })();
  }, []);

  // Name / initials
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

  // ⭐ ACTIVE STATE DETECTOR FOR PROPERTY PAGE
  const isPropertyActive =
    location.pathname.startsWith("/view-property") ||
    location.pathname.startsWith("/edit-property");

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Property", path: `/view-property/${propertyId ?? ""}` },
    { label: "Bookings", path: "/bookings" },
    { label: "Calendar", path: "/calendar" },
    { label: "Customize", path: "/offline-booking/:id" },
  ];

  const handlePropertyClick = (e) => {
    if (!propertyId) {
      e.preventDefault();
      return;
    }
    navigate(`/view-property/${propertyId}`);
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      
      {/* LOGO */}
      <img src="/KarabookLogo.png" alt="logo" className="h-auto w-[150px]" />

      {/* NAVIGATION */}
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const active =
            item.label === "Property"
              ? isPropertyActive
              : location.pathname === item.path;

          // Special handling for Property item
          if (item.label === "Property") {
            return (
              <button
                key={item.label}
                onClick={handlePropertyClick}
                className={`text-[14px] px-3 py-2.5 rounded-[8px] transition ${
                  active
                    ? "font-semibold text-gray-900 bg-gray-100 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Property
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`text-[14px] px-3 py-2.5 rounded-[8px] transition ${
                active
                  ? "font-semibold text-gray-900 bg-gray-100 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* PROFILE */}
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
