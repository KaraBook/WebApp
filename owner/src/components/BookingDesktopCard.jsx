import { MoreVertical, Calendar, Moon, Users, Phone} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import PaymentChip from "@/components/PaymentChip";

export default function BookingDesktopCard({
  booking,
  onOpen,
  onViewInvoice,
  onCopyEmail,
  onCopyPhone,
  onWhatsapp,
  onResend,
}) {
  const b = booking;

  const name = `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim();
  const phone = b.userId?.mobile;
  const property = b.propertyId?.propertyName;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      onClick={() => onOpen(b)}
      className="
        bg-white border rounded-xl p-4
        flex items-center justify-between
        shadow-sm hover:shadow-md
        transition cursor-pointer
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-700 
                        flex items-center justify-center font-semibold">
          {name?.[0] || "G"}
        </div>

        <div className="space-y-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {name || "Guest"}
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} /> {phone}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
            📍 {property}
          </div>
        </div>
      </div>

      {/* MIDDLE */}
      <div className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
        </div>

        <div className="flex items-center gap-1">
          <Moon size={14} />
          {b.totalNights} Nights
        </div>

        <div className="flex items-center gap-1">
          <Users size={14} />
          {typeof b.guests === "object"
            ? b.guests.adults + b.guests.children
            : b.guests} Guests
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="flex items-center gap-4"
        onClick={(e) => e.stopPropagation()} // important
      >
        <div className="text-sm font-semibold text-gray-900">
          ₹{b.totalAmount?.toLocaleString("en-IN")}
        </div>

        <PaymentChip status={b.paymentStatus} />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="text-gray-400 cursor-pointer" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-48">
            <DropdownMenuItem onSelect={() => onOpen(b)}>
              View Booking
            </DropdownMenuItem>

            {b.paymentStatus === "paid" ? (
              <DropdownMenuItem onSelect={() => onViewInvoice(b)}>
                View Invoice
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-gray-400 italic">
                Invoice available after payment
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onSelect={() => onCopyEmail(b)}>
              Copy Email
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onCopyPhone(b)}>
              Copy Phone
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onWhatsapp(b)}>
              WhatsApp Chat
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => onResend(b)}>
              Resend Links (WA + Email)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}