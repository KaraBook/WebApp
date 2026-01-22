import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Phone,
  Home,
  CalendarDays,
  Users,
  Moon,
  Hash,
  Clock,
  X,
} from "lucide-react";
import { format } from "date-fns";

export default function BookingDetailsDrawer({ open, booking, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open || !booking) return null;

  const handleClose = () => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      onClose();
    } else {
      setVisible(false);
      setTimeout(onClose, 300);
    }
  };

  const userName =
    booking?.user?.firstName || booking?.user?.lastName
      ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim()
      : booking?.user?.name || "Traveller";

  const email = booking?.user?.email || booking?.contactEmail || "—";
  const phone = booking?.user?.mobile || booking?.contactPhone || "—";
  const propertyName =
    booking?.property?.propertyName || booking?.property?.name || "—";

  const checkIn = booking?.checkIn || booking?.startDate;
  const checkOut = booking?.checkOut || booking?.endDate;

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
  );

  const amount = booking?.amount ?? booking?.totalAmount ?? 0;
  const tax = Math.round(amount * 0.1);
  const grandTotal = amount + tax;

  return createPortal(
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${visible ? "opacity-100" : "opacity-0"}
        `}
        onClick={handleClose}
      />

      {/* WRAPPER */}
      <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
        {/* SHEET */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            w-full md:w-[420px]
            bg-white shadow-xl
            rounded-t-3xl md:rounded-2xl
            transform transition-transform duration-500 ease-out
            ${visible ? "translate-y-0" : "translate-y-full"}
            md:translate-y-0
          `}
        >
          {/* MOBILE HANDLE */}
          <div
            className="md:hidden flex justify-center py-3 cursor-pointer"
            onClick={handleClose}
          >
            <div className="w-12 h-1.5 rounded-full bg-gray-400" />
          </div>

          {/* HEADER */}
          <div className="relative px-4 pb-3 border-b">
            <button
              onClick={handleClose}
              className="absolute right-3 top-0 h-8 w-8 rounded-full border flex items-center justify-center"
            >
              <X size={14} />
            </button>

            <p className="text-[16px] font-semibold">{userName}</p>
            <p className="text-[13px] text-gray-500">{email}</p>
          </div>

          {/* BODY */}
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
            <Section icon={Home} label="Property" value={propertyName} />

            <Grid>
              <Card icon={CalendarDays} label="Check-in" value={fmt(checkIn)} />
              <Card icon={CalendarDays} label="Check-out" value={fmt(checkOut)} />
              <Card icon={Moon} label="Nights" value={nights} />
              <Card
                icon={Users}
                label="Guests"
                value={
                  typeof booking.guests === "number"
                    ? `${booking.guests} Guests`
                    : `${booking.guests.adults} Adults, ${booking.guests.children} Children`
                }
              />
            </Grid>

            <Section icon={Mail} label="Email" value={email} />
            <Section icon={Phone} label="Phone" value={phone} />

            <Divider />

            <Row label="Amount" value={`₹${amount}`} />
            <Row label="Tax" value={`₹${tax}`} />
            <Row bold label="Grand Total" value={`₹${grandTotal}`} />

            <Divider />

            <Section icon={Hash} label="Order ID" value={booking.orderId || "—"} />
            <Section
              icon={Clock}
              label="Created"
              value={fmt(booking.createdAt)}
            />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ---------- helpers ---------- */

const fmt = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-gray-200" />;
}

function Section({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Card({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon size={14} />
        {label}
      </div>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}
