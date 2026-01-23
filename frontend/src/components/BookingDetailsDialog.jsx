import { useEffect, useState } from "react";
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

/* ---------- helpers (unchanged) ---------- */

const Badge = ({ children, tone = "green" }) => {
  const styles =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "yellow"
        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
        : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`inline-flex md:mr-[25px] hidden md:block items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
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
  const s = status?.toLowerCase();
  if (s === "confirmed") return "green";
  if (s === "pending") return "yellow";
  if (s === "cancelled") return "red";
  return "yellow";
}

function calcNights(checkIn, checkOut, fallbackNights) {
  if (typeof fallbackNights === "number") return fallbackNights;
  try {
    const s = new Date(checkIn);
    const e = new Date(checkOut);
    const diff = Math.round((e - s) / 86400000);
    return Math.max(1, diff);
  } catch {
    return "—";
  }
}

function guestsText(guests) {
  if (!guests) return "—";
  if (typeof guests === "number") return `${guests} Guests`;
  return `${guests.adults ?? 0} Adults, ${guests.children ?? 0} Children`;
}

function money(n) {
  if (typeof n !== "number") return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function normalizeStatus(booking) {
  if (booking?.status === "cancelled") return "cancelled";
  if (
    booking?.paymentStatus === "paid" ||
    booking?.status === "paid" ||
    booking?.status === "confirmed" ||
    booking?.paymentId
  ) {
    return "confirmed";
  }
  return "pending";
}

/* ---------- MAIN ---------- */

export default function BookingDetailsDialog({ open, onOpenChange, booking }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!booking) return null;

  const userName =
    booking?.user?.firstName || booking?.user?.lastName
      ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim()
      : booking?.user?.name || "Traveller";

  const email = booking?.user?.email || booking?.contactEmail || "—";
  const phone = booking?.user?.mobile || booking?.contactPhone || "—";

  const propertyName =
    booking?.property?.propertyName ||
    booking?.property?.name ||
    "—";

  const checkIn = booking?.checkIn || booking?.startDate;
  const checkOut = booking?.checkOut || booking?.endDate;
  const nights = calcNights(checkIn, checkOut, booking?.totalNights);

  const amount = booking?.amount ?? booking?.totalAmount ?? 0;
  const tax = booking?.tax ?? Math.round(amount * 0.1);
  const grandTotal = booking?.grandTotal ?? amount + tax;

  const status = normalizeStatus(booking);
  const paymentMethod =
    booking?.paymentProvider || booking?.paymentMethod || "—";
  const orderId =
    booking?.orderId || booking?.razorpayOrderId || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`
          fixed z-[9999999] bg-white shadow-xl overflow-y-auto p-0 pb-4

          /* DESKTOP → RIGHT PANEL */
          md:inset-y-0 md:right-0 md:h-full md:w-[420px] md:rounded-none md:border-l
          md:data-[state=open]:slide-in-from-right
          md:data-[state=closed]:slide-out-to-right

          /* MOBILE → BOTTOM DRAWER */
          inset-x-0 bottom-0 h-[90vh] rounded-t-2xl
          data-[state=open]:slide-in-from-bottom
          data-[state=closed]:slide-out-to-bottom
          duration-300
        `}
      >
        {/* mobile drag bar */}
        <div className="md:hidden mx-auto mt-2 mb-1 w-12 h-1.5 rounded-full bg-gray-300" />

        {/* HEADER */}
        <div className="relative px-4 pt-4 pb-3 border-b">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 text-black hover:text-red-700"
          >
            ✕
          </button>

          <div className="flex items-start md:justify-between gap-4">
            <div>
              <p className="text-[16px] font-semibold text-gray-900">
                {userName}
              </p>
              <p className="text-[14px] text-gray-500">{email}</p>
            </div>

            <Badge tone={getStatusTone(status)}>
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* BODY (unchanged content) */}
        <div className="p-4 space-y-4">
          {/* Property */}
          <div className="rounded-xl border p-3">
            <div className="flex items-start gap-2">
              <Home className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-[14px] text-gray-500">Property</p>
                <p className="text-[16px] font-medium">{propertyName}</p>
              </div>
            </div>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-2 gap-3">
            <Box icon={CalendarDays} label="Check-in" value={checkIn ? format(new Date(checkIn), "dd MMM, yyyy") : "—"} />
            <Box icon={CalendarDays} label="Check-out" value={checkOut ? format(new Date(checkOut), "dd MMM, yyyy") : "—"} />
            <Box icon={Moon} label="Nights" value={nights} />
            <Box icon={Users} label="Guests" value={guestsText(booking?.guests)} />
          </div>

          {/* Contact */}
          <Section title="Contact Information">
            <InfoLine icon={Mail} text={email} />
            <InfoLine icon={Phone} text={phone} />
          </Section>

          {/* Payment */}
          <Section title="Payment Information">
            <div className="rounded-xl border">
              <div className="px-3 py-2 flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <Badge tone={getStatusTone(status)}>
                  {status.toUpperCase()}
                </Badge>
              </div>

              <div className="border-t" />

              <div className="px-3">
                <Row label="Payment Method" value={paymentMethod} />
                <Row label="Amount" value={money(amount)} />
                <Row label="Tax" value={money(tax)} />
              </div>

              <div className="bg-gray-50 px-3 py-2 border-t flex justify-between">
                <span className="text-gray-500">Grand Total</span>
                <span className="font-semibold">{money(grandTotal)}</span>
              </div>

              <div className="border-t px-3 py-2 flex justify-between text-[12px]">
                <span className="text-gray-500 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Order ID
                </span>
                <span className="font-medium">{orderId}</span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
              <Clock className="w-4 h-4" />
              Booking created on{" "}
              {booking?.createdAt
                ? format(new Date(booking.createdAt), "dd MMM, yyyy")
                : "—"}
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* small helpers */

const Box = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border bg-neutral-50 p-3">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400" />
      <p className="text-[14px] text-gray-500">{label}</p>
    </div>
    <p className="text-[16px] font-medium mt-1">{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <p className="text-[11px] font-semibold text-gray-500 uppercase mb-2">
      {title}
    </p>
    <div className="space-y-2">{children}</div>
  </div>
);
