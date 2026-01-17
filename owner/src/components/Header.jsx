import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

export default function Header() {
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isManager = user?.role === "manager";

  /* ================= FETCH PROPERTY ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        if (res.data?.data?.length > 0) {
          setPropertyId(res.data.data[0]._id);
        }
      } catch {
        console.log("Failed to load property id");
      }
    })();
  }, []);

  /* ================= CLOSE PROFILE DROPDOWN ================= */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= USER NAME ================= */
  const fullName = isManager
    ? `${user?.firstName} (Manager)`
    : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
      user?.name ||
      "Owner";

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const avatarInitial = getInitials(fullName);

  /* ================= NAV ITEMS ================= */
  const navItems = isManager
    ? [
        { label: "Dashboard", path: "/manager/dashboard" },
        { label: "Bookings", path: "/bookings" },
        { label: "Calendar", path: "/calendar" },
        { label: "Users", path: "/users" },
      ]
    : [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Property", path: `/view-property/${propertyId ?? ""}` },
        { label: "Bookings", path: "/bookings" },
        { label: "Calendar", path: "/calendar" },
        {
          label: "Customize",
          path: propertyId ? `/offline-booking/${propertyId}` : null,
        },
        { label: "Users", path: "/users" },
      ];

  const isPropertyActive =
    location.pathname.startsWith("/view-property") ||
    location.pathname.startsWith("/edit-property");

  const handlePropertyClick = (e) => {
    if (!propertyId) {
      e.preventDefault();
      return;
    }
    navigate(`/view-property/${propertyId}`);
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between">

        {/* LOGO */}
        <img src="/KarabookLogo.png" alt="logo" className="h-auto w-[150px]" />

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active =
              item.label === "Property"
                ? isPropertyActive
                : location.pathname === item.path;

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

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* DESKTOP PROFILE */}
          <div
            className="relative hidden md:flex items-center gap-3"
            ref={dropdownRef}
          >
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
                <Link
                  to="/my-profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-[14px]"
                >
                  <User size={16} /> My Profile
                </Link>

                {!isManager && (
                  <Link
                    to="/manager/create"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-[14px]"
                  >
                    ➕ Add Manager
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-[14px] text-red-600 w-full text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* SIDEBAR */}
          <aside className="absolute left-0 top-0 h-full w-[78%] max-w-[280px] bg-[#6b1f2c] text-white flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
              <span className="text-lg font-semibold">
                {propertyId ? "Gulposh" : "Menu"}
              </span>

              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* NAV LINKS */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navItems
                .filter((i) => i.path)
                .map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-xl text-[15px] transition ${
                        isActive
                          ? "bg-white/20 font-semibold"
                          : "hover:bg-white/10"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>

            {/* FOOTER */}
            <div className="px-4 py-4 border-t border-white/20 space-y-2">
              <NavLink
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl hover:bg-white/10"
              >
                ⚙ Settings
              </NavLink>

              <button
                onClick={logout}
                className="block px-4 py-3 rounded-xl text-red-300 hover:bg-white/10 w-full text-left"
              >
                🚪 Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
