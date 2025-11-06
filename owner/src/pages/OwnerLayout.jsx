import { NavLink, Outlet } from "react-router-dom";
import {
  LogOut, LayoutDashboard, Building2, ClipboardList, Calendar, Menu, X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";


export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const fullName =
    (user?.firstName || user?.lastName)
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.name || user?.mobile || "KaraBook Owner";

  const navItems = [
    { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { name: "My Property", path: "properties", icon: Building2 },
    { name: "Bookings", path: "bookings", icon: ClipboardList },
    { name: "Calendar", path: "calendar", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-sm flex flex-col justify-between transform transition-transform duration-200`}>
        <div>
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-lg font-semibold text-emerald-700 tracking-tight truncate">
              {fullName}
            </h1>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-4">
            {navItems.map(({ name, path, icon: Icon }) => {
              const isPropertiesNav = path === "properties";
              return (
                <NavLink
                  key={name}
                  to={path}
                  end={!isPropertiesNav} 
                  className={({ isActive, location }) => {
                    const active =
                      isActive ||
                      (isPropertiesNav &&
                        location.pathname.includes("/view-property"));

                    return `flex items-center gap-3 px-4 py-2.5 mx-3 my-1.5 text-sm rounded-lg transition-all duration-150 ${active
                        ? "bg-gray-100 text-gray-900 font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                      }`;
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{name}</span>
                </NavLink>
              );
            })}
          </nav>

        </div>

        <div className="p-4 border-t mt-4">
          <Button onClick={logout} variant="outline" className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-gray-100 font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-700 hover:text-emerald-700">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Owner Dashboard</h2>
          <div />
        </header>

        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
