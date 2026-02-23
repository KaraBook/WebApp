import { Mail, Phone, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function MobileUserCard({ user, onView }) {
  if (!user) return null;

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  const roleLabel =
    user.role === "traveller"
      ? "Traveller"
      : user.role === "resortOwner"
      ? "Owner"
      : user.role;

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      onClick={() => onView(user)}   
      className="
        md:hidden
        bg-white border rounded-xl p-4 shadow-sm
        flex items-start justify-between
        cursor-pointer
        active:bg-neutral-50
      "
    >
      {/* LEFT */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-900">
              {user.firstName} {user.lastName}
            </span>

          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <Phone className="w-3.5 h-3.5" />
            {user.mobile || "—"}
            <span className="text-neutral-400">·</span>
            <span className="font-bold">
              {user.bookingCount || 0} bookings
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT MENU */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()} // ❗ STOP CARD CLICK
            className="p-1 rounded-full hover:bg-neutral-100"
          >
            <MoreVertical className="w-4 h-4 text-neutral-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 py-2">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onView(user);
            }}
          >
            View
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              copy(user.email, "Email");
            }}
          >
            Copy Email
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              copy(user.mobile, "Mobile");
            }}
          >
            Copy Mobile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
