import { NavLink, Outlet } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  ClipboardList,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function OwnerLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Properties", path: "/owner/properties", icon: Building2 },
    { name: "Bookings", path: "/owner/bookings", icon: ClipboardList },
    { name: "Calendar", path: "/owner/calendar", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-sm flex flex-col justify-between transform transition-transform duration-200`}
      >
        <div>
          {/* Logo / Title */}
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-lg font-semibold text-emerald-700 tracking-tight">
              KaraBook Owner
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-3 my-1.5 text-sm rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t mt-4">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-gray-100 font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-700 hover:text-emerald-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            Owner Dashboard
          </h2>
          <div></div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
