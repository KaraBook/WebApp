import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronRight } from "lucide-react";
import { CalendarCheck, Heart, User as UserIcon, Star, LifeBuoy, LogOut, Menu, Icon } from "lucide-react";

export default function Header({ onLoginClick }) {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Go to home">
          <img
            src="/KarabookLogo.png"
            alt="BookMyStay"
            className="h-6 w-auto md:h-10"
          />
        </Link>

        <div className="flex gap-5">
          <Link to="/properties" className="tracking-[2px] uppercase md:text-[14px] font-medium">
            Explore
          </Link>
          <Link to="/top-places" className="tracking-[2px] uppercase md:text-[14px] font-medium">
            Top Places
          </Link>
          <Link to="/contact" className="tracking-[2px] uppercase md:text-[14px] font-medium">
            Contact
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 shadow-sm">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>
                      {(user?.name?.[0] || user?.mobile?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <Menu
                    className="h-9 w-9 text-gray-700 shadow-sm p-2 rounded-full bg-gray-100"
                    strokeWidth={2}
                  />
                </button>
              </DropdownMenuTrigger>

              {/* DROPDOWN PANEL */}
              <DropdownMenuContent
                align="end"
                className="w-60 p-0 shadow-2xl border border-gray-100 rounded-xl overflow-hidden"
              >
                {/* Account Name */}
                <div className="px-4 py-3 border-b">
                  <p className="text-[15px] font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 -mt-0.5">Manage your account</p>
                </div>

                {/* MENU ITEMS */}
                <div className="py-2">

                  {/* Item Component */}
                  {[
                    {
                      label: "My Bookings",
                      icon: <CalendarCheck className="h-4 w-4" />,
                      to: "/account/bookings",
                      bg: "bg-[#D7F9F2]",
                      iconColor: "text-[#00A685]"
                    },
                    {
                      label: "Wishlist",
                      icon: <Heart className="h-4 w-4" />,
                      to: "/account/wishlist",
                      bg: "bg-[#FFDCE5]",
                      iconColor: "text-[#FF3B6A]"
                    },
                    {
                      label: "My Profile",
                      icon: <UserIcon className="h-4 w-4" />,
                      to: "/account/profile",
                      bg: "bg-[#E8F0FE]",
                      iconColor: "text-[#3B6CFF]"
                    },
                    {
                      label: "My Ratings",
                      icon: <Star className="h-4 w-4" />,
                      to: "/account/ratings",
                      bg: "bg-[#FFF4CC]",
                      iconColor: "text-[#F4B000]"
                    },
                    {
                      label: "Support / Help",
                      icon: <LifeBuoy className="h-4 w-4" />,
                      to: "/account/support",
                      bg: "bg-[#E5F4FF]",
                      iconColor: "text-[#0090FF]"
                    },
                  ].map((item, i) => (
                    <DropdownMenuItem
                      key={i}
                      asChild
                      className="px-4 py-2.5 cursor-pointer group hover:bg-gray-100 rounded-none"
                    >
                      <Link to={item.to} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.bg}`}>
                            <span className={item.iconColor}>{item.icon}</span>
                          </div>
                          <span className="text-[15px] text-gray-700">{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition" />
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={clearAuth}
                    className="px-4 py-3 cursor-pointer hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium"
                  >
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLoginClick} className="text-sm rounded-none tracking-[3px]">
              SIGN IN <ChevronRight className="w-4 h-4" />
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}
