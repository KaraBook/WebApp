import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Home,
  Calendar,
  Moon,
  Users,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@radix-ui/react-dropdown-menu";

const formatDate = (d) =>
  d ? format(new Date(d), "dd MMM, yyyy") : "—";

export default function BookingDetailsDialog({ open, booking, onClose }) {
  if (!booking) return null;

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


  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="
           fixed
    inset-y-0
    right-0
    z-50
    h-full
    w-[420px]
    max-w-[90vw]
    p-0
    pb-4
    rounded-none
    border-l
    bg-white
    shadow-xl

    !translate-x-0
    !translate-y-0
    !left-auto
    !top-0

    data-[state=open]:animate-in
    data-[state=open]:slide-in-from-right
    data-[state=closed]:animate-out
    data-[state=closed]:slide-out-to-right
    duration-300
  "
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 border-b rounded bg-white px-5 py-4 flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-base">{traveller}</h2>
            <p className="text-sm text-neutral-500">
              {booking?.userId?.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill status={booking.paymentStatus} />

            <button
              onClick={onClose}
              className="p-1 rounded-md text-red-500 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3 space-y-4 overflow-y-auto -mt-2 h-[calc(100vh-72px)]">
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
            <hr className="border-t w-full mb-1" />
            <InfoRow icon={Mail} value={booking?.userId?.email} />
            <InfoRow icon={Phone} value={booking?.userId?.mobile} />
          </Section>

          {booking?.notes && (
            <Section title="Notes">
              <div className="rounded-lg bg-neutral-50 p-3 text-sm">
                {booking.notes}
              </div>
            </Section>
          )}


          <Section title="Payment Information">
            <hr className="border-t w-full" />
            <div className="space-y-2 pt-2 text-sm">

              <PaymentRow
                label="Payment Status"
                value={<StatusPill status={booking.paymentStatus} />}
              />

              <PaymentRow
                label="Payment Method"
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
                value={
                  <span className="font-semibold text-neutral-900">
                    ₹{Number(booking.grandTotal || 0).toLocaleString("en-IN")}
                  </span>
                }
                highlight
              />

              {booking.orderId && (
                <PaymentRow
                  label="Order ID"
                  value={booking.orderId}
                  mono
                />
              )}

            </div>
          </Section>

          <div className="pt-2 pb-4 text-xs text-neutral-500 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Booking created on {formatDate(booking.createdAt)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function InfoCard({ icon: Icon, label, value, muted = false }) {
  return (
    <div
      className={`
        rounded-xl border p-3
        ${muted ? "bg-neutral-50 " : "bg-white"}
      `}
    >
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Icon className="h-4 w-4 text-neutral-600" />
        {label}
      </div>
      <div className="mt-1 font-medium text-neutral-900">
        {value || "—"}
      </div>
    </div>
  );
}


function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-neutral-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center px-2 gap-3 text-sm py-1">
      <Icon className="h-4 w-4 text-neutral-400" />
      {value || "—"}
    </div>
  );
}


function StatusPill({ status }) {
  // normalize backend statuses for UI
  const normalizedStatus =
    status === "initiated" ? "pending" : status;

  const styles = {
    pending:
      "border-orange-400 text-orange-500 bg-[rgba(245,159,10,0.12)]",
    confirmed:
      "border-green-400 text-green-600 bg-green-50",
    paid:
      "border-green-400 text-green-600 bg-green-50",
    failed:
      "border-red-400 text-red-500 bg-red-50",
  };

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-[2px]
        text-xs font-medium
        rounded-full
        border
        capitalize
        ${styles[normalizedStatus] || "border-neutral-300 text-neutral-600"}
      `}
    >
      {normalizedStatus}
    </span>
  );
}


function PaymentRow({ label, value, highlight = false, mono = false }) {
  return (
    <div
      className={`
        flex items-center justify-between
        rounded-lg px-2 py-1
        ${highlight ? "bg-neutral-100" : "bg-white"}
      `}
    >
      <span className="text-neutral-500">
        {label}
      </span>

      <span
        className={`
          ${mono ? "font-mono text-xs" : "font-medium"}
          text-right
        `}
      >
        {value || "—"}
      </span>
    </div>
  );
}
