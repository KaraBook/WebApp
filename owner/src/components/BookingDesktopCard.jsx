import {
  MoreVertical,
  Calendar,
  Moon,
  Users,
  Phone,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
        bg-white
        border border-emerald-200/60
        rounded-2xl px-6 py-4
        flex items-center justify-between
        shadow-[0_6px_18px_rgba(0,0,0,0.06)]
        hover:shadow-[0_10px_26px_rgba(0,0,0,0.08)]
        transition cursor-pointer
      "
    >
      {/* LEFT: Avatar + Name */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="
          h-10 w-10 rounded-full
          bg-emerald-100 text-emerald-700
          flex items-center justify-center
          text-sm font-bold
        ">
          {name?.[0] || "G"}
        </div>

        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">
            {name || "Guest"}
          </p>

          <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-[2px]">
            <Phone size={12} /> {phone}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block h-10 w-px bg-gray-200" />

      {/* CENTER: Property + Dates + Meta */}
      <div className="hidden lg:flex items-center gap-6 text-[13px] text-gray-600">
        <div className="flex items-center gap-1 max-w-[220px] truncate">
          <MapPin size={14} />
          <span className="truncate">{property}</span>
        </div>

        <div className="flex items-center gap-1 font-semibold text-gray-800">
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

      {/* RIGHT: Amount + Status + Menu */}
      <div
        className="flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[15px] font-bold text-gray-900">
          ₹{b.totalAmount?.toLocaleString("en-IN")}
        </div>

        <PaymentChip status={b.paymentStatus} />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="
              h-9 w-9 rounded-full
              flex items-center justify-center
              bg-emerald-50
              hover:bg-emerald-100
            ">
              <MoreVertical className="text-emerald-600" />
            </div>
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