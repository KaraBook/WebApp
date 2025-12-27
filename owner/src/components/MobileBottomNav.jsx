import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
} from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();

  const items = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Properties",
      path: "/properties",
      icon: Home,
    },
    {
      label: "Bookings",
      path: "/bookings",
      icon: Calendar,
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around items-center h-14 pb-safe">
        {items.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);

          return (
            <NavLink
              key={label}
              to={path}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs transition ${
                active ? "text-black font-medium" : "text-gray-500"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
