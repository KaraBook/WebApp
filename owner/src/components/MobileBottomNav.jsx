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
                            className={`flex flex-col items-center justify-center gap-0 text-xs transition ${active ? "text-black font-medium" : "text-gray-500"
                                }`}
                        >
                            {/* ICON WRAPPER */}
                            <div
                                className={`flex items-center justify-center rounded-[6px] transition
      ${active
                                        ? "bg-[#028ea1] w-8 h-8 p-[7px]"
                                        : "w-8 h-6"
                                    }`}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.2 : 1.8}
                                    className={active ? "text-white" : ""}
                                />
                            </div>

                            <span>{label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
