import { useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Home, Calendar, Moon, Users, Mail, Phone, Clock, X } from "lucide-react";

export default function BookingDetailsDrawer({ open, booking, onClose }) {
    if (!booking) return null;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const startY = useRef(0);
    const onHeaderTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
    };
    const onHeaderTouchMove = (e) => {
        const diff = e.touches[0].clientY - startY.current;
        if (diff > 80) {
            onClose();
        }
    };

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
        contactEmail,
    } = booking;

    const normalizePaymentStatus = (status) => {
        if (status === "paid") return "confirmed";
        if (status === "cancelled") return "cancelled";
        return "pending";
    };

    const uiStatus = normalizePaymentStatus(paymentStatus);

    const adults = guests?.adults || 0;
    const children = guests?.children || 0;

    const userName = `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim();

    const userEmail =
        userId?.email || contactEmail || booking?.email || "—";

    const userPhone =
        contactNumber || userId?.mobile || "—";

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overscrollBehavior = "none";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overscrollBehavior = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overscrollBehavior = "";
        };
    }, [open]);


    const safeTax =
        typeof taxAmount === "number"
            ? taxAmount
            : Math.round((totalAmount || 0) * 0.1);

    const safeGrandTotal =
        typeof grandTotal === "number"
            ? grandTotal
            : (totalAmount || 0) + safeTax;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`
          fixed inset-0 z-[9998]
          bg-black/40 backdrop-blur-sm
          transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
            />

            {/* Drawer / Panel */}
            <div
                className={`
          fixed z-[9999] bg-white shadow-2xl
          transition-transform duration-300 ease-in-out

          /* Mobile (bottom drawer) */
          bottom-0 left-0 right-0
          h-[70vh]
          rounded-t-2xl
          overscroll-contain
          overflow-hidden

          /* Desktop (right panel) */
          md:top-0 md:bottom-0 md:right-0 md:left-auto
          md:h-full md:w-[420px]
          md:rounded-none

          ${open
                        ? "translate-y-0 md:translate-x-0 md:translate-y-0"
                        : "translate-y-full md:translate-x-full md:translate-y-0"}
        `}
            >
                {/* ================= HEADER ================= */}
                <div
                    className="px-4 py-4 border-b relative"
                    onTouchStart={isMobile ? onHeaderTouchStart : undefined}
                    onTouchMove={isMobile ? onHeaderTouchMove : undefined}
                >

                    {isMobile && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-gray-300" />
                    )}
                    <h2 className="text-[17px] font-semibold">
                        {userName || "Guest"}
                    </h2>

                    <div className="flex items-center justify-between">
                        <Row
                            icon={<Clock size={14} />}
                            text={`Booking created on ${formatDate(createdAt)}`}
                            muted
                        />
                        <span
                            className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium capitalize
              ${uiStatus === "confirmed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : uiStatus === "cancelled"
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-yellow-100 text-yellow-700"}
            `}
                        >
                            {uiStatus}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ================= BODY ================= */}
                <div
                    className="
    px-4 py-4 space-y-5 text-sm
    overflow-y-auto
    flex-1
    overscroll-contain
    [-webkit-overflow-scrolling:touch]
  "
                >

                    <InfoCardBlock
                        icon={<Home size={16} />}
                        label="Property"
                        value={propertyId?.propertyName || "—"}
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
                        <Row
                            icon={<Mail size={14} />}
                            text={
                                userEmail !== "—" ? (
                                    <a
                                        href={`mailto:${userEmail}`}
                                        className="hover:opacity-80 hover:underline"
                                    >
                                        {userEmail}
                                    </a>
                                ) : (
                                    "—"
                                )
                            }
                        />

                        <Row
                            icon={<Phone size={14} />}
                            text={
                                userPhone !== "—" ? (
                                    <a
                                        href={`tel:${userPhone}`}
                                        className="hover:underline hover:opacity-80"
                                    >
                                        {userPhone}
                                    </a>
                                ) : (
                                    "—"
                                )
                            }
                        />
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
            </div>
        </>
    );
}

/* ================= UI BLOCKS ================= */

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon} {label}
            </div>
            <div className="mt-1 font-medium text-gray-900">{value}</div>
        </div>
    );
}

function InfoCardBlock({ icon, label, value }) {
    return (
        <div className="rounded-xl border bg-white px-4 py-3 flex items-center gap-3">
            {icon}
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="pb-4">
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
            {icon}
            <span className={`text-sm ${muted ? "text-muted-foreground" : ""}`}>
                {text}
            </span>
        </div>
    );
}

function Key({ label, value, bold, mono }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span
                className={`text-sm ${bold ? "font-semibold" : "font-medium"} ${mono ? "font-mono text-xs" : ""}`}
            >
                {value}
            </span>
        </div>
    );
}