import { NavLink, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  Heart,
  User,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    to: "/account/bookings",
    label: "Bookings",
    icon: CalendarCheck,
  },
  {
    to: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    to: "/account/profile",
    label: "Profile",
    icon: User,
  },
  {
    to: "/account/ratings",
    label: "Ratings",
    icon: Star,
  },
];

export default function MobileAccountBottomNav() {
  const location = useLocation();

  // ✅ show ONLY on account pages
  if (!location.pathname.startsWith("/account")) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-[9999]
        bg-white border-t border-gray-200
        md:hidden
      "
    >
      <div className="grid grid-cols-4 h-14">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition",
                isActive
                  ? "text-black font-semibold"
                  : "text-gray-500"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-black" : "text-gray-400"
                )}
              />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
