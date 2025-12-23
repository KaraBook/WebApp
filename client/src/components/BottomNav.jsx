import { Link, useLocation } from "react-router-dom";
import { Home, CalendarCheck, Users, Building2 } from "lucide-react";

const NAV = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Properties", path: "/properties", icon: Building2 },
  { label: "Bookings", path: "/bookings", icon: CalendarCheck },
  { label: "Users", path: "/users", icon: Users },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
      <div className="grid grid-cols-4 h-16">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className={`flex flex-col items-center justify-center text-xs ${
                active ? "text-primary font-medium" : "text-neutral-500"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
