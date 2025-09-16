// src/components/account/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { CalendarCheck, Heart, User as UserIcon, Star, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/account/bookings",  label: "My Bookings", icon: CalendarCheck },
  { to: "/account/wishlist",  label: "Wishlist",    icon: Heart },
  { to: "/account/profile",   label: "My Profile",  icon: UserIcon },
  { to: "/account/ratings",   label: "My Ratings",  icon: Star },
  { to: "/account/support",   label: "Support / Help", icon: LifeBuoy },
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r bg-card/30">
      <nav className="p-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )
            }
            onClick={onNavigate}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
