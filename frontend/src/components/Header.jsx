import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { ChevronRight, CalendarCheck, Heart, User as UserIcon, Star,
  LifeBuoy, LogOut, Menu, X} from "lucide-react";

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
            <Button onClick={onLoginClick} className="text-sm rounded-none tracking-[3px]">
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
            className="p-1 text-white rounded-md bg-primary"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-sm animate-slideDown">
          <div className="flex flex-col gap-4 px-4 py-4">

            <Link to="/properties" onClick={() => setMobileOpen(false)}>
              Explore
            </Link>
            <Link to="/top-places" onClick={() => setMobileOpen(false)}>
              Top Places
            </Link>
            <Link to="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>

          </div>
        </div>
      )}
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
      className="w-60 p-0 shadow-2xl rounded-[0] border border-gray-100 overflow-hidden"
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
