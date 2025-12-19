import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import {
  CalendarCheck,
  Heart,
  User as UserIcon,
  Star,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/account/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/profile", label: "My Profile", icon: UserIcon },
  { to: "/account/ratings", label: "My Ratings", icon: Star },
  { to: "/account/support", label: "Support / Help", icon: LifeBuoy },
];

export default function Sidebar({ onNavigate, className }) {
  const [collapsed, setCollapsed] = useState(false);
  const { clearAuth, user } = useAuthStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-[#f7f7f7] border-r border-gray-200 h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* USER BOX */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gray-200 flex items-center rounded-[8px] justify-center text-gray-700 text-lg font-semibold">
            {user?.name?.[0] || "U"}
          </div>

          {!collapsed && (
            <div>
              <p className="text-gray-900 font-semibold text-base leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Manage Account
              </p>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* MENU TITLE */}
      {!collapsed && (
        <div className="px-6 py-3 text-xs font-semibold text-gray-500 tracking-wide border-b border-gray-200">
          MENU
        </div>
      )}

      {/* LINKS */}
      <nav className="flex-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-6 py-3 text-sm text-gray-700 transition-colors border-l-4",
                isActive
                  ? "bg-[#ededed] border-black text-black"
                  : "border-transparent hover:bg-gray-50"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="border-t border-gray-200 px-6 py-3">
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 text-sm text-gray-700 hover:text-black hover:bg-gray-50 w-full px-2 py-2 transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* FOOTER */}
      {!collapsed && (
        <div className="border-t border-gray-200 px-6 py-3 text-xs text-gray-500">
          © 2025 KaraBook
        </div>
      )}
    </aside>
  );
}
