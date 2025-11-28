import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        
        <Link to="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.png"
            className="h-8 w-8 rounded-full object-cover"
            alt="logo"
          />
        </Link>

        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link to="/dashboard" className="hover:text-[#0a5870]">Dashboard</Link>
          <Link to="/property" className="hover:text-[#0a5870]">Property</Link>
          <Link to="/bookings" className="hover:text-[#0a5870]">Bookings</Link>
          <Link to="/calendar" className="hover:text-[#0a5870]">Calendar</Link>
          <Link to="/customize" className="hover:text-[#0a5870]">Customize</Link>
        </nav>

        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-3"
          >
            <img
              src="/owner.png"
              className="h-9 w-9 rounded-full object-cover border"
            />
            <span className="font-medium text-gray-800 hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 bg-white border rounded-xl shadow-lg w-40 py-2">
              <Link
                to="/profile"
                className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-gray-700"
              >
                <User size={16} /> My Profile
              </Link>

              <button
                onClick={logout}
                className="px-4 py-2 w-full text-left flex items-center gap-2 hover:bg-gray-50 text-red-600"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 py-3 bg-white shadow border-t space-y-2">
          <Link to="/dashboard" className="block">Dashboard</Link>
          <Link to="/property" className="block">Property</Link>
          <Link to="/bookings" className="block">Bookings</Link>
          <Link to="/calendar" className="block">Calendar</Link>
          <Link to="/customize" className="block">Customize</Link>
        </div>
      )}
    </header>
  );
}
