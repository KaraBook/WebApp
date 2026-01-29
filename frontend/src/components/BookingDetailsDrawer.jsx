import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from "@/components/ui/drawer";
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


export default function BookingDetailsDrawer({ open, booking, onClose }) {
  if (!booking) return null;

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  const {
    createdAt,
    user,
    property,
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
    contactPhone,
    contactEmail,
    cancelled,
    paymentId,
  } = booking;

  useEffect(() => {
    if (!isMobile && open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

  const uiStatus =
    cancelled
      ? "cancelled"
      : paymentStatus === "paid" ||
        paymentStatus === "confirmed" ||
        paymentId
      ? "confirmed"
      : "pending";

  const adults = guests?.adults || 0;
  const children = guests?.children || 0;

  const userName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.name ||
    "Guest";

  const userEmail =
    user?.email || contactEmail || "—";

  const userPhone =
    contactPhone || user?.mobile || "—";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const safeTax =
    typeof taxAmount === "number"
      ? taxAmount
      : Math.round((totalAmount || 0) * 0.1);

  const safeGrandTotal =
    typeof grandTotal === "number"
      ? grandTotal
      : (totalAmount || 0) + safeTax;

  /* ================= MOBILE DRAWER ================= */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerOverlay className="bg-black/40" />

        <DrawerContent className="h-[75vh] rounded-t-2xl">
          <Header
            userName={userName}
            createdAt={createdAt}
            uiStatus={uiStatus}
            formatDate={formatDate}
            onClose={onClose}
          />

          <Body
            propertyName={property?.propertyName}
            checkIn={checkIn}
            checkOut={checkOut}
            totalNights={totalNights}
            adults={adults}
            children={children}
            userEmail={userEmail}
            userPhone={userPhone}
            paymentMethod={paymentMethod}
            totalAmount={totalAmount}
            safeTax={safeTax}
            safeGrandTotal={safeGrandTotal}
            orderId={orderId}
            formatDate={formatDate}
          />
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
fixed inset-0 z-[9999999]
bg-black/40 backdrop-blur-sm
${open ? "opacity-100" : "opacity-0 pointer-events-none"}
`}
      />

      <div
        className={`
fixed z-[9999999] top-0 right-0 h-full w-[420px]
bg-white shadow-2xl
transition-transform duration-300
${open ? "translate-x-0" : "translate-x-full"}
`}
      >
        <div className="flex flex-col h-full">
          <Header
            userName={userName}
            createdAt={createdAt}
            uiStatus={uiStatus}
            formatDate={formatDate}
            onClose={onClose}
          />

          <div className="flex-1 overflow-y-auto">
            <Body
              propertyName={property?.propertyName}
              checkIn={checkIn}
              checkOut={checkOut}
              totalNights={totalNights}
              adults={adults}
              children={children}
              userEmail={userEmail}
              userPhone={userPhone}
              paymentMethod={paymentMethod}
              totalAmount={totalAmount}
              safeTax={safeTax}
              safeGrandTotal={safeGrandTotal}
              orderId={orderId}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= SHARED UI (SAME AS OWNER) ================= */

function Header({ userName, createdAt, uiStatus, formatDate, onClose }) {
  return (
    <div className="px-4 py-4 border-b relative">
      <h2 className="text-[17px] font-semibold">{userName}</h2>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} />
          Booking created on {formatDate(createdAt)}
        </div>

        <span
          className={`
px-3 py-1 rounded-full text-xs font-medium capitalize
${
  uiStatus === "confirmed"
    ? "bg-emerald-100 text-emerald-700"
    : uiStatus === "cancelled"
    ? "bg-gray-100 text-gray-600"
    : "bg-yellow-100 text-yellow-700"
}
`}
        >
          {uiStatus}
        </span>
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
      >
        <span>X</span>
      </button>
    </div>
  );
}

function Body(props) {
  const {
    propertyName,
    checkIn,
    checkOut,
    totalNights,
    adults,
    children,
    userEmail,
    userPhone,
    paymentMethod,
    totalAmount,
    safeTax,
    safeGrandTotal,
    orderId,
    formatDate,
  } = props;

  return (
    <div className="px-4 py-4 space-y-5 text-sm overflow-y-auto">
      <InfoCardBlock
        icon={<Home size={16} />}
        label="Property"
        value={propertyName || "—"}
      />

      <div className="grid grid-cols-2 gap-4">
        <InfoCard icon={<Calendar size={16} />} label="Check-in" value={formatDate(checkIn)} />
        <InfoCard icon={<Calendar size={16} />} label="Check-out" value={formatDate(checkOut)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard icon={<Moon size={16} />} label="Nights" value={totalNights} />
        <InfoCard icon={<Users size={16} />} label="Guests" value={`${adults} Adults, ${children} Children`} />
      </div>

      <Separator />

      <Section title="Contact Information">
        <Row icon={<Mail size={14} />} text={userEmail} />
        <Row icon={<Phone size={14} />} text={userPhone} />
      </Section>

      <Separator />

      <Section title="Payment Information">
        <Key label="Payment Method" value={paymentMethod} />
        <Key label="Amount" value={`₹${totalAmount?.toLocaleString("en-IN")}`} />
        <Key label="Tax" value={`₹${safeTax.toLocaleString("en-IN")}`} />
        <Key label="Grand Total" value={`₹${safeGrandTotal.toLocaleString("en-IN")}`} bold />
        <Key label="Order ID" value={orderId} mono />
      </Section>
    </div>
  );
}

/* ================= SMALL UI BLOCKS ================= */

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function InfoCardBlock({ icon, label, value }) {
  return (
    <div className="rounded-xl border px-4 py-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
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

function Row({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm">{text}</span>
    </div>
  );
}

function Key({ label, value, bold, mono }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm ${bold ? "font-semibold" : "font-medium"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}