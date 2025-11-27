import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Menu,
  X,
  CalendarCheck,
  Heart,
  User as UserIcon,
  Star,
  LifeBuoy,
  LogOut
} from "lucide-react";

export default function Header({ onLoginClick }) {
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2" aria-label="Go to home">
          <img src="/KarabookLogo.png" alt="BookMyStay" className="h-8 w-auto md:h-10" />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-6">
          <Link to="/properties" className="tracking-[2px] uppercase text-sm font-medium">Explore</Link>
          <Link to="/top-places" className="tracking-[2px] uppercase text-sm font-medium">Top Places</Link>
          <Link to="/contact" className="tracking-[2px] uppercase text-sm font-medium">Contact</Link>
        </nav>

        {/* RIGHT SECTION DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <AccountMenu user={user} clearAuth={clearAuth} />
          ) : (
            <Button onClick={onLoginClick} className="text-sm rounded-none tracking-[3px]">
              SIGN IN <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* MOBILE RIGHT SECTION */}
        <div className="md:hidden flex items-center gap-3">

          {/* MOBILE LOGIN ICON (when NOT logged in) */}
          {!user && (
            <button
              onClick={onLoginClick}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-200 transition"
            >
              <UserIcon className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {/* MOBILE USER AVATAR (when logged in) */}
          {user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full"
            >
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{(user?.name?.[0] || "U").toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
          )}

          {/* HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 rounded-md bg-primary text-white transition"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b shadow-sm animate-slideDown">
          <nav className="flex flex-col px-4 py-3 space-y-4 text-[15px]">
            <Link onClick={() => setMobileOpen(false)} to="/properties">Explore</Link>
            <Link onClick={() => setMobileOpen(false)} to="/top-places">Top Places</Link>
            <Link onClick={() => setMobileOpen(false)} to="/contact">Contact</Link>

            {/* IF USER LOGGED IN SHOW USER PANEL */}
            {user && (
              <div className="border-t pt-3">
                <MobileUserPanel
                  user={user}
                  clearAuth={clearAuth}
                  closeMenu={() => setMobileOpen(false)}
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ------------------------- DESKTOP ACCOUNT MENU ------------------------ */
function AccountMenu({ user, clearAuth }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full gap-2 px-2 py-1 hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{(user?.name?.[0] || "U").toUpperCase()}</AvatarFallback>
          </Avatar>
          <Menu className="h-8 w-8 text-gray-700 p-2 rounded-full bg-gray-100" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-0 shadow-2xl border border-gray-100">
        <div className="px-4 py-3 border-b">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-xs text-gray-500">Manage your account</p>
        </div>

        <MenuItem to="/account/bookings" icon={<CalendarCheck />} label="My Bookings" />
        <MenuItem to="/account/wishlist" icon={<Heart />} label="Wishlist" />
        <MenuItem to="/account/profile" icon={<UserIcon />} label="My Profile" />
        <MenuItem to="/account/ratings" icon={<Star />} label="My Ratings" />
        <MenuItem to="/account/support" icon={<LifeBuoy />} label="Support / Help" />

        <DropdownMenuItem
          onClick={clearAuth}
          className="px-4 py-3 cursor-pointer hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium"
        >
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuItem({ to, icon, label }) {
  return (
    <DropdownMenuItem asChild className="px-4 py-2 cursor-pointer hover:bg-gray-100">
      <Link to={to} className="flex items-center gap-3">
        {icon} <span>{label}</span>
      </Link>
    </DropdownMenuItem>
  );
}

/* ------------------------- MOBILE USER PANEL ------------------------- */
function MobileUserPanel({ user, clearAuth, closeMenu }) {
  return (
    <div className="space-y-3">
      <p className="font-semibold">{user?.name}</p>

      <Link onClick={closeMenu} to="/account/bookings" className="flex items-center gap-3">
        <CalendarCheck className="h-4 w-4" /> My Bookings
      </Link>
      <Link onClick={closeMenu} to="/account/wishlist" className="flex items-center gap-3">
        <Heart className="h-4 w-4" /> Wishlist
      </Link>
      <Link onClick={closeMenu} to="/account/profile" className="flex items-center gap-3">
        <UserIcon className="h-4 w-4" /> My Profile
      </Link>
      <Link onClick={closeMenu} to="/account/ratings" className="flex items-center gap-3">
        <Star className="h-4 w-4" /> My Ratings
      </Link>
      <Link onClick={closeMenu} to="/account/support" className="flex items-center gap-3">
        <LifeBuoy className="h-4 w-4" /> Support / Help
      </Link>

      <button
        onClick={() => {
          clearAuth();
          closeMenu();
        }}
        className="flex items-center gap-3 text-red-600 mt-2"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}

/* ------------------------- ANIMATION ------------------------- */
const style = document.createElement("style");
style.innerHTML = `
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slideDown { animation: slideDown 0.25s ease-out; }
`;
document.head.appendChild(style);
