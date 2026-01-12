import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Calendar,
  Moon,
  Users,
  Mail,
  Phone,
  Clock,
  X,
} from "lucide-react";

export default function BookingDetailsDialog({ open, booking, onClose }) {
  if (!booking) return null;

  const {
    createdAt,
    userId,
    propertyId,
    checkIn,
    checkOut,
    guests,
    totalNights,
    totalAmount,
    taxAmount,
    grandTotal,
    paymentStatus,
    paymentMethod,
    orderId,
    contactNumber,
  } = booking;

  const adults = guests?.adults || 0;
  const children = guests?.children || 0;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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
          duration-300
        "
      >
        {/* ================= HEADER ================= */}
        <DialogHeader className="px-6 py-5 border-b relative">
          <DialogTitle className="text-[17px] font-semibold">
            {userId?.firstName} {userId?.lastName}
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            {userId?.email}
          </p>

          <span
            className={`mt-2 w-fit px-3 py-1 rounded-full text-xs font-medium capitalize
              ${
                paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            {paymentStatus}
          </span>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-red-500 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-sm">

          {/* PROPERTY */}
          <div className="rounded-xl border bg-white px-4 py-3 flex items-center gap-3">
            <Home size={16} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Property</p>
              <p className="font-medium text-gray-900">
                {propertyId?.propertyName}
              </p>
            </div>
          </div>

          {/* CHECK-IN / CHECK-OUT */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              icon={<Calendar size={16} />}
              label="Check-in"
              value={formatDate(checkIn)}
            />
            <InfoCard
              icon={<Calendar size={16} />}
              label="Check-out"
              value={formatDate(checkOut)}
            />
          </div>

          {/* NIGHTS / GUESTS */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              icon={<Moon size={16} />}
              label="Nights"
              value={totalNights}
            />
            <InfoCard
              icon={<Users size={16} />}
              label="Guests"
              value={`${adults} Adults, ${children} Children`}
            />
          </div>

          <Separator />

          {/* CONTACT */}
          <Section title="Contact Information">
            <Row icon={<Mail size={14} />} text={userId?.email} />
            <Row
              icon={<Phone size={14} />}
              text={contactNumber || userId?.mobile}
            />
          </Section>

          <Separator />

          {/* PAYMENT */}
          <Section title="Payment Information">
            <KeyValue label="Payment Status">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                Paid
              </span>
            </KeyValue>

            <KeyValue
              label="Payment Method"
              value={paymentMethod}
            />

            <KeyValue
              label="Amount"
              value={`₹${totalAmount?.toLocaleString("en-IN")}`}
            />

            <KeyValue
              label="Tax"
              value={`₹${taxAmount?.toLocaleString("en-IN")}`}
            />

            <div className="bg-muted/40 rounded-lg px-3 py-2">
              <KeyValue
                label="Grand Total"
                value={`₹${grandTotal?.toLocaleString("en-IN")}`}
                bold
              />
            </div>

            <KeyValue
              label="Order ID"
              value={orderId}
              mono
            />
          </Section>

          <Row
            icon={<Clock size={14} />}
            text={`Booking created on ${formatDate(createdAt)}`}
            muted
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= SMALL COMPONENTS (SAME AS ADMIN) ================= */

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-medium text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon, text, muted }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className={`text-sm ${muted ? "text-muted-foreground" : ""}`}>
        {text}
      </span>
    </div>
  );
}

function KeyValue({ label, value, bold, mono, children }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-sm">{label}</span>
      {children || (
        <span
          className={`text-sm ${
            bold ? "font-semibold" : "font-medium"
          } ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
