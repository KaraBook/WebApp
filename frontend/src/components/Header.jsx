import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  CalendarCheck,
  Heart,
  User as UserIcon,
  Star,
  LifeBuoy,
  LogOut,
} from "lucide-react";

export default function Header({ onLoginClick }) {
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/KarabookLogo.png"
            alt="BookMyStay"
            className="h-10 w-auto md:h-14"
          />
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-muted transition-colors"
                  aria-label="Open user menu"
                >
                  <Avatar className="h-8 w-8 md:h-9 md:w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>
                      {(user?.name?.[0] || user?.mobile?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Hide name on very small screens */}
                  <span className="hidden sm:inline-block text-sm font-medium max-w-[160px] truncate">
                    {user?.name || user?.mobile}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user?.name || "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/bookings" className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ratings" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    My Ratings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support" className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    Support / Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearAuth}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
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
