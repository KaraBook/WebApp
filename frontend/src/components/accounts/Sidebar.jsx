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
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/"; 
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-[#00919e] text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        "h-screen sticky top-0 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        {!collapsed && <h2 className="text-lg font-semibold">Account</h2>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-[#007481]/60 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-[#007481] text-white" : "hover:bg-[#007481]/70"
              )
            }
            onClick={onNavigate}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={clearAuth}
          className="flex items-center gap-2 w-full text-sm text-white px-3 py-2 rounded-md hover:bg-[#007481]/70 transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-xs text-white/70">
        {!collapsed && <p>© 2025 KaraBook</p>}
      </div>
    </aside>
  );
}
