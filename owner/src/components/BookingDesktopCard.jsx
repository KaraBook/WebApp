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
        rounded-2xl
        px-6 py-4
        flex items-center
        gap-6
        shadow-[0_6px_18px_rgba(0,0,0,0.06)]
        hover:shadow-[0_10px_26px_rgba(0,0,0,0.08)]
        transition cursor-pointer
      "
    >
      {/* AVATAR */}
      <div className="
        h-10 w-10 rounded-full
        bg-emerald-100 text-emerald-700
        flex items-center justify-center
        text-sm font-bold shrink-0
      ">
        {name?.[0] || "G"}
      </div>

      {/* NAME + PHONE */}
      <div className="min-w-[160px]">
        <p className="text-[15px] font-semibold text-gray-900 leading-tight">
          {name}
        </p>
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-[2px]">
          <Phone size={12} /> {phone}
        </div>
      </div>

      {/* PROPERTY */}
      <div className="flex items-center gap-2 text-[13px] text-gray-600 max-w-[200px] truncate">
        <MapPin size={14} className="shrink-0" />
        <span className="truncate">{property}</span>
      </div>

      {/* DATES */}
      <div className="flex items-center gap-2 text-[13px] text-gray-800 font-semibold">
        <Calendar size={14} />
        {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
      </div>

      {/* NIGHTS */}
      <div className="flex items-center gap-2 text-[13px] text-gray-600">
        <Moon size={14} />
        {b.totalNights} Nights
      </div>

      {/* GUESTS */}
      <div className="flex items-center gap-2 text-[13px] text-gray-600">
        <Users size={14} />
        {typeof b.guests === "object"
          ? b.guests.adults + b.guests.children
          : b.guests} Guests
      </div>

      {/* AMOUNT */}
      <div className="ml-auto text-[15px] font-bold text-gray-900">
        ₹{b.totalAmount?.toLocaleString("en-IN")}
      </div>

      {/* STATUS */}
      <PaymentChip status={b.paymentStatus} />

      {/* MENU */}
      <div onClick={(e) => e.stopPropagation()}>
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