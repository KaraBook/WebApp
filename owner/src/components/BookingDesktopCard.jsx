import { MoreVertical, Calendar, Moon, Users, Phone, Mail, MailCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PaymentChip from "@/components/PaymentChip";
import { buildBookingWhatsappMessage, buildCancelledWhatsappMessage } from "@/utils/whatsappMessage";
import { getBookingStatus, getStatusMeta, BOOKING_STATUS } from "@/utils/bookingStatus";

const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
};

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
  const bookingStatus = getBookingStatus(b);
  const statusMeta = getStatusMeta(b) || {
    chip: "",
    label: "",
  };

  const handleWhatsapp = () => {
    const phone = b.userId?.mobile;
    if (!phone) return;

    let message;

    if (bookingStatus === BOOKING_STATUS.CANCELLED) {
      message = buildCancelledWhatsappMessage(b);

    } else if (bookingStatus === BOOKING_STATUS.CONFIRMED) {
      message = buildBookingWhatsappMessage(b);

    } else if (bookingStatus === BOOKING_STATUS.COMPLETED) {
      message = `Hello ${name || "Guest"},

Thank you for staying with us at *${property}* 😊

We hope you had a wonderful experience.  
We would really appreciate your feedback and would love to host you again!

Safe travels ✨`;

    } else {
      message = `Hello ${name || "Guest"},

We noticed your booking request for *${property}* is pending.

If you need any help completing your booking or payment, feel free to reply here 😊`;
    }

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/91${phone}?text=${encoded}`;
    window.open(url, "_blank");
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={() => onOpen?.(b)}
      className="bg-white border rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:shadow-md transition cursor-pointer"
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
          {formatCurrency(b.totalAmount)}
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
            {[BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED].includes(bookingStatus) ? (
              <DropdownMenuItem onSelect={() => onViewInvoice(b)}>
                View Invoice
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-gray-400 italic">
                Invoice available after payment
              </DropdownMenuItem>
            )}

            {/* Cancel logic */}
            {bookingStatus === BOOKING_STATUS.CANCELLED && (
              <DropdownMenuItem disabled className="text-gray-400 italic">
                Cancelled
              </DropdownMenuItem>
            )}

            {bookingStatus === BOOKING_STATUS.CONFIRMED && (
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

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleWhatsapp();
              }}
            >
              {bookingStatus === BOOKING_STATUS.CANCELLED
                ? "Message Cancelled Guest"
                : bookingStatus === BOOKING_STATUS.CONFIRMED
                  ? "Send Welcome Message"
                  : "Send Thank You Message"}
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}