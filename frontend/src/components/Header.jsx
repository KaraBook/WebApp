import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CalendarCheck, Heart, User as UserIcon, Star, LifeBuoy, LogOut, Menu } from "lucide-react";

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

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 shadow-sm">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>
                      {(user?.name?.[0] || user?.mobile?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <Menu
                    className="h-9 w-9 text-gray-700 shadow-sm p-2 rounded-full bg-gray-100 "
                    strokeWidth={2}
                  />
                </button>
              </DropdownMenuTrigger>

              {/* Dropdown */}
              <DropdownMenuContent align="end" className="w-56 shadow-xl border border-gray-100">
                <DropdownMenuLabel className="truncate">
                  {user?.name || "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/account/bookings" className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" /> My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/wishlist" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/ratings" className="flex items-center gap-2">
                    <Star className="h-4 w-4" /> My Ratings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/support" className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4" /> Support / Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearAuth}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLoginClick} className="text-sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
