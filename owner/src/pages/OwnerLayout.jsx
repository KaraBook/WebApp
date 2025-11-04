import { NavLink, Outlet } from "react-router-dom";
import { LogOut, LayoutDashboard, Home, Calendar, Building2, ClipboardList } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function OwnerLayout() {
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Properties", path: "/owner/properties", icon: Building2 },
    { name: "Bookings", path: "/owner/bookings", icon: ClipboardList },
    { name: "Calendar", path: "/owner/calendar", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between">
        <div>
          <div className="p-4 text-xl font-semibold border-b text-gray-800">
            KaraBook Owner
          </div>
          <nav className="mt-2">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 ${
                    isActive
                      ? "bg-gray-100 border-l-4 border-emerald-500 font-medium"
                      : "text-gray-700"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <Button
            onClick={logout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
