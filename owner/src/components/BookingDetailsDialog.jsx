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
} from "lucide-react";

export default function BookingDetailsDialog({ open, onOpenChange, booking }) {
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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          fixed right-0 top-0 h-screen w-[420px] max-w-[95vw]
          p-0 rounded-none border-l bg-white shadow-xl
          data-[state=open]:slide-in-from-right
          data-[state=closed]:slide-out-to-right
        "
      >
        {/* ================= HEADER ================= */}
        <DialogHeader className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[18px] font-semibold leading-tight">
                {userId?.firstName} {userId?.lastName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {userId?.email}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                ${
                  paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : paymentStatus === "confirmed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {paymentStatus}
            </span>
          </div>
        </DialogHeader>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-sm">

          {/* ROOM */}
          <InfoCard
            icon={<Home size={18} />}
            label="Room"
            value={propertyId?.propertyName || "—"}
          />

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              icon={<Calendar size={18} />}
              label="Check-in"
              value={formatDate(checkIn)}
            />
            <InfoCard
              icon={<Calendar size={18} />}
              label="Check-out"
              value={formatDate(checkOut)}
            />
          </div>

          {/* META */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              icon={<Moon size={18} />}
              label="Nights"
              value={totalNights}
            />
            <InfoCard
              icon={<Users size={18} />}
              label="Guests"
              value={`${guests?.adults || 0} Adults`}
            />
          </div>

          <Separator />

          {/* CONTACT */}
          <Section title="Contact Information">
            <Row icon={<Mail size={16} />} text={userId?.email} />
            <Row icon={<Phone size={16} />} text={contactNumber || userId?.mobile} />
            <Row
              icon={<Clock size={16} />}
              text={`Booking created on ${formatDate(createdAt)}`}
              muted
            />
          </Section>

          <Separator />

          {/* PAYMENT */}
          <Section title="Payment Details">
            <KeyValue label="Room Amount" value={`₹${totalAmount?.toLocaleString("en-IN")}`} />
            <KeyValue label="Tax" value={`₹${taxAmount?.toLocaleString("en-IN")}`} />
            <KeyValue
              label="Grand Total"
              value={`₹${grandTotal?.toLocaleString("en-IN")}`}
              bold
            />
            <KeyValue label="Payment Method" value={paymentMethod} />
            <KeyValue label="Order ID" value={orderId} mono />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================= SMALL UI BUILDING BLOCKS ================= */

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-medium text-[15px] text-gray-900">
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
      <div className="space-y-3">{children}</div>
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

function KeyValue({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={`text-sm text-right ${
          bold ? "font-semibold" : "font-medium"
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
