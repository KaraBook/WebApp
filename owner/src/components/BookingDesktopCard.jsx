import { MoreVertical, Calendar, Moon, Users, Phone, Mail, MailCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PaymentChip from "@/components/PaymentChip";


function normalizeBookingStatus(b) {
  if (b?.cancelled === true) return "cancelled";

  if (
    b?.paymentStatus === "paid" ||
    b?.paymentStatus === "captured" ||
    b?.status === "confirmed" ||
    b?.status === "paid" ||
    b?.paymentId
  ) {
    return "confirmed";
  }
  return "pending";
}


export default function BookingDesktopCard({
  booking,
  onOpen,
  onViewInvoice,
  onCopyEmail,
  onCopyPhone,
  onWhatsapp,
  onResend,
  onCancelBooking,
}) {
  const b = booking;

  const name = `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim();
  const phone = b.userId?.mobile;
  const email = b.userId?.email;
  const property = b.propertyId?.propertyName;
  const bookingStatus = normalizeBookingStatus(b);

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
        bg-white border border-emerald-200/60
        rounded-2xl px-6 py-4
        flex items-center justify-between
        shadow-sm
        hover:shadow-md
        transition cursor-pointer
      "
    >
      {/* LEFT */}
      <div className="flex w-[30%] items-center gap-4 min-w-0">
        <div className="
          h-10 w-10 rounded-full
          bg-emerald-100 text-emerald-700
          flex items-center justify-center
          text-sm font-semibold
        ">
          {name?.[0] || "G"}
        </div>

        <div className="min-w-0 space-y-[2px]">
          <p className="font-semibold text-[14px] text-gray-900 truncate">
            {name || "Guest"}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Phone size={12} /> {phone}
          </div>

          <div className="flex items-center gap-2 text-[12px] text-gray-500 truncate">
            <Mail size={12} /> {email}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="hidden lg:block h-12 w-px bg-gray-200" />

      {/* MIDDLE */}
      <div className="hidden w-[60%] lg:flex items-center gap-4 text-[12px] flex-wrap text-gray-600">
        <div className="flex w-[54%] items-center gap-1 text-[14px] font-[700]">
          <Calendar size={14} />
          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
        </div>

        <div className="flex w-[30%] items-center gap-1 text-[14px]">
          <Moon size={14} />
          {b.totalNights} Nights
        </div>

        <div className="flex bg-[#0080001f] p-[5px] flex items-center justify-center rounded-full w-[26%] items-center gap-1">
          <Users size={14} />
          {typeof b.guests === "object"
            ? b.guests.adults + b.guests.children
            : b.guests} Guests
        </div>

        <div className="text-[14px] w-[26%] font-semibold text-gray-900">
          ₹{b.totalAmount?.toLocaleString("en-IN")}
        </div>

        <div className="w-[26%]">
          <PaymentChip booking={b} />
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="flex items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="
              h-8 w-8 rounded-full
              flex items-center justify-center
              hover:bg-emerald-50
            ">
              <MoreVertical className="text-emerald-600" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-48">
            <DropdownMenuItem onSelect={() => onOpen(b)}>
              View Booking
            </DropdownMenuItem>

            {/* Invoice logic */}
            {bookingStatus === "confirmed" ? (
              <DropdownMenuItem onSelect={() => onViewInvoice(b)}>
                View Invoice
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-gray-400 italic">
                Invoice available after payment
              </DropdownMenuItem>
            )}

            {/* Cancel logic */}
            {bookingStatus === "cancelled" ? (
              <DropdownMenuItem disabled className="text-red-500 italic">
                Cancelled
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-red-600 font-medium"
                onSelect={() => onCancelBooking(b)}
              >
                Cancel Booking
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