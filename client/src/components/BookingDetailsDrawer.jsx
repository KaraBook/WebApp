import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay} from "@/components/ui/drawer";
import { X, Home, Calendar, Moon, Users, Mail, Phone, Clock} from "lucide-react";
import { format } from "date-fns";


const formatDate = (d) =>
  d ? format(new Date(d), "dd MMM, yyyy") : "—";

function normalizeStatus(b) {
  if (b?.cancelled) return "cancelled";
  if (
    b?.paymentStatus === "paid" ||
    b?.status === "confirmed" ||
    b?.paymentId
  ) return "confirmed";
  return "pending";
}


export default function BookingDetailsDrawer({ open, booking, onClose }) {
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open || !booking) return null;

  const traveller =
    `${booking?.userId?.firstName || ""} ${booking?.userId?.lastName || ""}`.trim();

  const guestLabel = (() => {
    const adults = booking.guests?.adults ?? 0;
    const children = booking.guests?.children ?? 0;
    const infants = booking.guests?.infants ?? 0;

    const parts = [
      `${adults} Adult${adults !== 1 ? "s" : ""}`,
      `${children} Child${children !== 1 ? "ren" : ""}`,
    ];

    if (infants > 0) {
      parts.push(`${infants} Infant${infants !== 1 ? "s" : ""}`);
    }

    return parts.join(", ");
  })();

  const uiStatus = normalizeStatus(booking);

  const Content = (
    <>
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b bg-white px-5 py-4 flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-base">{traveller}</h2>
          <p className="text-sm text-neutral-500">
            {booking?.userId?.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={uiStatus} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-3 space-y-4 overflow-y-auto">
        <InfoCard
          icon={Home}
          label="Property"
          value={booking?.propertyId?.propertyName}
        />

        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            muted
            icon={Calendar}
            label="Check-in"
            value={formatDate(booking.checkIn)}
          />
          <InfoCard
            muted
            icon={Calendar}
            label="Check-out"
            value={formatDate(booking.checkOut)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoCard
            muted
            icon={Moon}
            label="Nights"
            value={booking.totalNights}
          />
          <InfoCard
            muted
            icon={Users}
            label="Guests"
            value={guestLabel}
          />
        </div>

        <Section title="Contact Information">
          <InfoRow icon={Mail} value={booking?.userId?.email} />
          <InfoRow icon={Phone} value={booking?.userId?.mobile} />
        </Section>

        <Section title="Payment Information">
          <PaymentRow
            label="Status"
            value={<StatusPill status={uiStatus} />}
          />
          <PaymentRow
            label="Method"
            value={booking.paymentMethod || "—"}
          />
          <PaymentRow
            label="Amount"
            value={`₹${Number(booking.totalAmount || 0).toLocaleString("en-IN")}`}
          />
          <PaymentRow
            label="Tax"
            value={`₹${Number(booking.taxAmount || 0).toLocaleString("en-IN")}`}
          />
          <PaymentRow
            label="Grand Total"
            value={`₹${Number(booking.grandTotal || 0).toLocaleString("en-IN")}`}
            highlight
          />
        </Section>

        <div className="pt-2 pb-4 text-xs text-neutral-500 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Booking created on {formatDate(booking.createdAt)}
        </div>
      </div>
    </>
  );

  /* ================= MOBILE DRAWER ================= */

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerOverlay className="bg-black/40" />
        <DrawerContent className="h-[65vh] rounded-t-2xl">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  /* ================= DESKTOP RIGHT PANEL ================= */

  return (
    <>
      <div
        onClick={onClose}
        className={`
fixed inset-0 z-[9998]
bg-black/40 backdrop-blur-sm !mt-0
${open ? "opacity-100" : "opacity-0 pointer-events-none"}
`}
      />

      <div
        className={`
fixed z-[9999] top-0 right-0 h-full w-[420px]
bg-white shadow-2xl
transition-transform duration-300 !mt-0
${open ? "translate-x-0" : "translate-x-full"}
`}
      >
        <div
          className="flex flex-col h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {Content}
        </div>
      </div>
    </>
  );
}

/* ---------------- Small UI ---------------- */

function InfoCard({ icon: Icon, label, value, muted = false }) {
  return (
    <div className={`rounded-xl border p-3 ${muted ? "bg-neutral-50" : "bg-white"}`}>
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-1 font-medium">{value || "—"}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-neutral-500 mb-2">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-neutral-400" />
      {value || "—"}
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    pending: "border-orange-400 text-orange-500 bg-orange-50",
    confirmed: "border-green-400 text-green-600 bg-green-50",
    cancelled: "border-red-400 text-red-500 bg-red-50",
  };

  return (
    <span className={`px-3 py-[2px] text-xs rounded-full border capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function PaymentRow({ label, value, highlight = false }) {
  return (
    <div className={`flex justify-between px-2 py-1 rounded ${highlight ? "bg-neutral-100" : ""}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
