import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, LogOut } from "lucide-react";
import sidebarMenu from "../config/sidebarMenu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { successToast } from "../utils/toastHelper";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    successToast("Logged out successfully");
    navigate("/admin/login");
  };

  return (
    <aside
      className={`h-screen bg-[#f9f9f9] border-r border-zinc-800 transition-all sticky top-0 ${collapsed ? "w-16" : "w-64"} overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        {!collapsed && <span className="text-xl font-semibold text-primary">Logo</span>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-primary hover:bg-hoverbg/80">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-2">
        {sidebarMenu.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div key={index}>
              {item.children ? (
                <SubMenu item={item} collapsed={collapsed} location={location} />
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 text-primary py-2 rounded-md hover:bg-hoverbg/80 text-sm font-medium transition-colors ${
                    isActive ? "bg-hoverbg/80 text-primary" : "text-primary hover:text-primary"
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <Separator className="my-2 bg-zinc-800" />

      {/* Logout */}
      <div className={`p-2 ${collapsed ? "w-16" : "w-64"}`}>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-primary hover:bg-hoverbg/80 justify-start"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

function SubMenu({ item, collapsed, location }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const isActive = item.children.some((c) => location.pathname === c.path);

  return (
    <div>
      <button
        className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-hoverbg/80 transition-colors ${
          isActive ? "bg-hoverbg/80 text-primary" : "text-primary hover:text-primary"
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          {!collapsed && <span>{item.label}</span>}
        </div>
        {!collapsed && (open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)}
      </button>

      {open && !collapsed && (
        <ul className="pl-8 mt-1 space-y-1">
          {item.children.map((sub, idx) => {
            const isActive = location.pathname === sub.path;
            return (
              <li key={idx}>
                <Link
                  to={sub.path}
                  className={`block px-2 py-1 text-sm rounded-md hover:bg-hoverbg/80 transition-colors ${
                    isActive ? "bg-hoverbg/80 text-primary" : "text-primary hover:text-primary"
                  }`}
                >
                  {sub.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Sidebar;
