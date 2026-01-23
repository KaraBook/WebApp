import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createPortal } from "react-dom";
import {
  Mail, Phone, Home, CalendarDays, Users, Moon, Hash, Clock
} from "lucide-react";
import { format } from "date-fns";

/* ================= DESKTOP PANEL (UNCHANGED) ================= */

function DesktopPanel({ open, onClose, booking }) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
        fixed inset-y-0 right-0 h-full w-[420px]
        rounded-none border-l bg-white shadow-xl
        overflow-y-auto p-0 pb-4
        data-[state=open]:slide-in-from-right
        data-[state=closed]:slide-out-to-right
        duration-300
      "
      >
        <Content booking={booking} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

/* ================= MOBILE DRAWER ================= */

function MobileDrawer({ open, onClose, booking }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  if (!open || !booking) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return createPortal(
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* drawer */}
      <div className="fixed inset-0 z-[9999] flex items-end">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
          w-full bg-white rounded-t-2xl shadow-xl
          transform transition-transform duration-300
          ${visible ? "translate-y-0" : "translate-y-full"}
        `}
        >
          <div className="mx-auto mt-2 mb-1 w-12 h-1.5 rounded-full bg-gray-300" />
          <Content booking={booking} onClose={handleClose} />
        </div>
      </div>
    </>,
    document.body
  );
}

/* ================= SHARED CONTENT ================= */

function Content({ booking, onClose }) {
  const checkIn = booking.checkIn || booking.startDate;
  const checkOut = booking.checkOut || booking.endDate;

  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
  );

  return (
    <>
      {/* HEADER */}
      <div className="relative px-4 pt-4 pb-3 border-b">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-black hover:text-red-700"
        >
          ✕
        </button>

        <p className="text-[16px] font-semibold">
          {booking.user?.name || "Traveller"}
        </p>
        <p className="text-[14px] text-gray-500">
          {booking.user?.email || "—"}
        </p>
      </div>

      {/* BODY */}
      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <Info icon={Home} label="Property" value={booking.property?.name} />
        <Info icon={CalendarDays} label="Check-in" value={fmt(checkIn)} />
        <Info icon={CalendarDays} label="Check-out" value={fmt(checkOut)} />
        <Info icon={Moon} label="Nights" value={nights} />
        <Info icon={Users} label="Guests" value={booking.guests} />
        <Info icon={Mail} label="Email" value={booking.user?.email} />
        <Info icon={Phone} label="Phone" value={booking.user?.phone} />
        <Info icon={Hash} label="Order ID" value={booking.orderId} />

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} />
          Created {fmt(booking.createdAt)}
        </div>
      </div>
    </>
  );
}

/* ================= MAIN SWITCHER ================= */

export default function BookingDetailsDialog({
  open,
  onOpenChange,
  booking,
}) {
  const isMobile = window.innerWidth < 768;

  return isMobile ? (
    <MobileDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      booking={booking}
    />
  ) : (
    <DesktopPanel
      open={open}
      onClose={onOpenChange}
      booking={booking}
    />
  );
}

/* ================= UTIL ================= */

const fmt = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon size={18} className="text-gray-400 mt-0.5" />
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  </div>
);
