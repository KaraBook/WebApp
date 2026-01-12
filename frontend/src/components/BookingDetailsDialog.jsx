import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  Home,
  CalendarDays,
  Users,
  Moon,
  IndianRupee,
  Receipt,
  Hash,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

const Badge = ({ children, tone = "green" }) => {
  const styles =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`inline-flex md:mr-[25px] items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
      {children}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-[13px] py-2">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium text-right break-all">{value}</span>
  </div>
);

const InfoLine = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-[13px] text-gray-800">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="break-all">{text}</span>
  </div>
);

function getStatusTone(status) {
  if (!status) return "yellow";
  const s = status.toLowerCase();
  if (s === "paid" || s === "confirmed") return "green";
  if (s === "pending") return "yellow";
  return "red";
}

function calcNights(checkIn, checkOut, fallbackNights) {
  if (typeof fallbackNights === "number") return fallbackNights;

  try {
    const s = new Date(checkIn);
    const e = new Date(checkOut);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  } catch {
    return "—";
  }
}

function guestsText(guests) {
  // supports both number & object
  if (!guests) return "—";
  if (typeof guests === "number") return `${guests} Guests`;

  const a = guests.adults ?? 0;
  const c = guests.children ?? 0;
  return `${a} Adults, ${c} Children`;
}

function money(n) {
  if (typeof n !== "number") return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
}) {
  if (!booking) return null;

  const userName =
    booking?.user?.firstName || booking?.user?.lastName
      ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim()
      : booking?.user?.name || "Traveller";

  const email = booking?.user?.email || booking?.contactEmail || "—";
  const phone = booking?.user?.mobile || booking?.contactPhone || "—";

  const propertyName = booking?.property?.propertyName || booking?.property?.name || "—";

  const checkIn = booking?.checkIn || booking?.startDate;
  const checkOut = booking?.checkOut || booking?.endDate;

  const nights = calcNights(checkIn, checkOut, booking?.totalNights);

  // If your backend already returns these, use them:
  const amount = booking?.amount ?? booking?.totalAmount ?? 0;
  const tax = booking?.tax ?? booking?.taxAmount ?? Math.round(amount * 0.1);
  const grandTotal = booking?.grandTotal ?? amount + tax;

  const status = booking?.paymentStatus || booking?.status || "pending";
  const paymentMethod = booking?.paymentProvider || booking?.paymentMethod || "—";
  const orderId = booking?.orderId || booking?.razorpayOrderId || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="z-[9999999]">
      <DialogContent
        className="
           fixed
    inset-y-0
    right-0
    z-[9999999]
    h-full
    w-[420px]
    max-w-[90vw]
    p-0
    pb-4
    rounded-none
    border-l
    bg-white
    shadow-xl
    overflow-y-auto

    !translate-x-0
    !translate-y-0
    !left-auto
    !top-0

    data-[state=open]:animate-in
    data-[state=open]:slide-in-from-right
    data-[state=closed]:animate-out
    data-[state=closed]:slide-out-to-right
    duration-300"
      >
        {/* HEADER */}
        <div className="relative px-4 pt-4 pb-3 border-b">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 text-black hover:text-red-700"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex items-start md:justify-between justify-start gap-4">
            <div>
              <p className="text-[16px] font-semibold text-gray-900 leading-tight">
                {userName}
              </p>
              <p className="text-[14px] text-gray-500 mt-0.5">{email}</p>
            </div>

            <Badge tone={getStatusTone(status)}>{String(status).toUpperCase()}</Badge>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4">
          {/* Property */}
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-[14px] text-gray-500">Property</p>
                <p className="text-[16px] font-medium text-gray-900 mt-0.5">
                  {propertyName}
                </p>
              </div>
            </div>
          </div>

          {/* Dates + Nights + Guests (2x2) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-neutral-50 border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <p className="text-[14px] text-gray-500">Check-in</p>
              </div>
              <p className="text-[16px] font-medium text-gray-900 mt-1">
                {checkIn ? format(new Date(checkIn), "dd MMM, yyyy") : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-neutral-50 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <p className="text-[14px] text-gray-500">Check-out</p>
              </div>
              <p className="text-[16px] font-medium text-gray-900 mt-1">
                {checkOut ? format(new Date(checkOut), "dd MMM, yyyy") : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-neutral-50 p-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-gray-400" />
                <p className="text-[14px] text-gray-500">Nights</p>
              </div>
              <p className="text-[16px] font-medium text-gray-900 mt-1">{nights}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-neutral-50 p-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <p className="text-[14px] text-gray-500">Guests</p>
              </div>
              <p className="text-[16px] font-medium text-gray-900 mt-1">
                {guestsText(booking?.guests)}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contact Information
            </p>
            <div className="space-y-2">
              <InfoLine icon={Mail} text={email} />
              <InfoLine icon={Phone} text={phone} />
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Payment Information
            </p>

            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="px-3">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[13px] text-gray-500">Payment Status</span>
                  <Badge tone={getStatusTone(status)}>{String(status).toUpperCase()}</Badge>
                </div>
              </div>

              <div className="border-t" />

              <div className="px-3">
                <Row label="Payment Method" value={String(paymentMethod)} />
                <Row label="Amount" value={money(amount)} />
                <Row label="Tax" value={money(tax)} />
              </div>

              <div className="bg-gray-50 px-3 py-2 border-t flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Grand Total</span>
                <span className="text-[13px] font-semibold text-gray-900">{money(grandTotal)}</span>
              </div>

              <div className="border-t" />

              <div className="px-3 py-2 flex items-center justify-between text-[12px]">
                <span className="text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  Order ID
                </span>
                <span className="text-gray-800 font-medium break-all text-right">{orderId}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                Booking created on{" "}
                {booking?.createdAt
                  ? format(new Date(booking.createdAt), "dd MMM, yyyy")
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
