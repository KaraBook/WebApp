import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  ChevronRight, CalendarCheck, Heart, User as UserIcon, Star,
  LifeBuoy, LogOut, Menu, X, Home, Search, Settings, LucideMenu
} from "lucide-react";

export default function Header({ onLoginClick }) {
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[9999999] w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        <Link to="/" className="flex items-center gap-2">
          <img
            src="/KarabookLogo.png"
            alt="BookMyStay"
            className="h-8 w-auto md:h-10"
          />
        </Link>

        <div className="hidden md:flex gap-5">
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

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <AccountDropdown user={user} clearAuth={clearAuth} />
          ) : (
            <Button
              onClick={onLoginClick}
              className="
    text-sm
    rounded-[10px]
    tracking-[3px]
    transition-all
    duration-300
    ease-out
    transform
    hover:-translate-y-[2px]
    hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)]
    active:translate-y-0
    active:shadow-md
  "
            >
              SIGN IN <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-3">

          {!user && (
            <button
              onClick={onLoginClick}
              className="p-2 rounded-full bg-gray-200"
            >
              <UserIcon className="h-5 w-5 text-gray-800" />
            </button>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Avatar className="h-9 w-9 shadow-sm">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{(user?.name?.[0] || "U").toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <AccountDropdownPanel user={user} clearAuth={clearAuth} />
            </DropdownMenu>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 text-black hover:bg-gray-100 rounded-md"
          >
            {mobileOpen ? <span className="px-[6px]">X</span> : <LucideMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE SIDE DRAWER ================= */}
      <div
        className={`
    fixed inset-0 z-[999999]
    md:hidden
    transition-opacity duration-300
    ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}
  `}
      >
        {/* BACKDROP */}
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/40"
        />

        {/* DRAWER */}
        <div
          className={`
      absolute left-0 top-0 h-full w-[75vw]
      bg-white shadow-2xl
      transition-transform duration-300 ease-out
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
    `}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                K
              </div>
              <div>
                <p className="text-sm font-semibold">KaraBook</p>
                <p className="text-xs text-gray-500">
                  {user ? user.name : "Guest User"}
                </p>
              </div>
            </div>

            <button onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* MENU */}
          <div className="px-3 py-4 space-y-1">
            <MobileItem icon={<Home />} label="Home" to="/" setMobileOpen={setMobileOpen} />
            <MobileItem icon={<Search />} label="Explore" to="/properties" setMobileOpen={setMobileOpen} />
            <MobileItem icon={<Heart />} label="Favorites" to="/account/wishlist" setMobileOpen={setMobileOpen} />
            <MobileItem icon={<UserIcon />} label="Profile" to="/account/profile" setMobileOpen={setMobileOpen} />
            <MobileItem icon={<Settings />} label="Settings" to="/account/settings" setMobileOpen={setMobileOpen} />
            <MobileItem icon={<LifeBuoy />} label="Help & Support" to="/account/support" setMobileOpen={setMobileOpen} />
          </div>

          {/* FOOTER */}
          <div className="absolute bottom-0 w-full border-t px-4 py-4">
            {user ? (
              <button
                onClick={() => {
                  clearAuth();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 py-5 text-[16px] text-red-600 font-medium"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            ) : (
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  onLoginClick();
                }}
                className="w-full rounded-[8px] py-5 text-[16px]"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}


function AccountDropdown({ user, clearAuth }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center rounded-full gap-2 px-2 py-1 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8 md:h-9 md:w-9 shadow-sm">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary text-white">
                {(user?.name?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Menu className="h-9 w-9 text-gray-700 shadow-sm p-2 rounded-full bg-gray-100" strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>

        <AccountDropdownPanel user={user} clearAuth={clearAuth} />
      </DropdownMenu>
    </>
  );
}

function AccountDropdownPanel({ user, clearAuth }) {

  const items = [
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
  ];

  return (
    <DropdownMenuContent
      align="end"
      className="w-60 p-0 shadow-2xl rounded-[10px] z-[9999999] border border-gray-100 overflow-hidden"
    >
      <div className="px-4 py-3 mt-2 border-b">
        <p className="text-[15px] font-semibold truncate">{user?.name}</p>
        <p className="text-xs text-gray-500 -mt-0.5">Manage your account</p>
      </div>

      {items.map((item, i) => (
        <DropdownMenuItem
          key={i}
          asChild
          className="px-4 py-2.5 cursor-pointer group hover:bg-gray-100"
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

      <DropdownMenuItem
        onClick={clearAuth}
        className="px-4 py-3 cursor-pointer hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium"
      >
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <LogOut className="h-4 w-4" />
        </div>
        Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

const style = document.createElement("style");
style.innerHTML = `
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px);}
  to { opacity: 1; transform: translateY(0);}
}
.animate-slideDown { animation: slideDown 0.25s ease-out; }
`;
document.head.appendChild(style);



function MobileItem({ icon, label, to, setMobileOpen }) {
  return (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-100 transition"
    >
      <div className="h-8 w-8 p-2 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
        {icon}
      </div>
      <span className="text-[15px] font-medium text-gray-800">
        {label}
      </span>
    </Link>
  );
}
