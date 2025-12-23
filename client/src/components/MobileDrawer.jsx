import { Link, useLocation, useNavigate } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import sidebarMenu from "../config/sidebarMenu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!open) return null;

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-lg">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        <nav className="space-y-2">
          {sidebarMenu.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  location.pathname === item.path
                    ? "bg-hoverbg/80"
                    : ""
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
