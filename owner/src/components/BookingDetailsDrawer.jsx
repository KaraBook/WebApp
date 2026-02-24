import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Home, Calendar, Moon, Users, Mail, Phone, Clock, X } from "lucide-react";


function normalizeBookingStatus(b) {
    if (b?.cancelled === true) return "cancelled";

    if (
        b?.paymentStatus === "paid" ||
        b?.paymentStatus === "captured" ||
        b?.status === "confirmed" ||
        b?.status === "paid" ||
        b?.paymentId
    ) {
        return "confirmed";
    }

    return "pending";
}


const safeFormatDate = (d) => {
    if (!d) return "—";

    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatCurrency = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN")}`;
};


export default function BookingDetailsDrawer({ open, booking, onClose }) {
    const [isMobile, setIsMobile] = useState(
        window.matchMedia("(max-width: 767px)").matches
    );

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

    if (!booking) return null;

    const cleanNumber = (v) => {
        const n = Number(v);
        return isNaN(n) ? 0 : n;
    };

    const safeBooking = {
        ...booking,
        totalAmount: cleanNumber(booking?.totalAmount),
        taxAmount: cleanNumber(booking?.taxAmount),
        grandTotal: cleanNumber(booking?.grandTotal),
        refundAmount: cleanNumber(booking?.refundAmount),
        ownerRefundPercent: cleanNumber(booking?.ownerRefundPercent),
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
    } = safeBooking;

    const uiStatus = normalizeBookingStatus(booking);
    const refundPercent = booking?.ownerRefundPercent ?? 0;
    const refundAmount = booking?.refundAmount ?? 0;
    const isCancelled = booking?.cancelled === true;

    const adults = guests?.adults || 0;
    const children = guests?.children || 0;

    const veg = booking?.meals?.veg || 0;
    const nonVeg = booking?.meals?.nonVeg || 0;

    const userName =
        `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim() || "Guest";

    const userEmail =
        userId?.email || contactEmail || "—";

    const userPhone =
        contactNumber || userId?.mobile || "—";

    const safeTax =
        typeof taxAmount === "number"
            ? taxAmount
            : Math.round((totalAmount || 0) * 0.1);

    const safeGrandTotal =
        typeof grandTotal === "number"
            ? grandTotal
            : (totalAmount || 0) + safeTax;


    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
                <DrawerOverlay className="bg-black/40" />

                <DrawerContent className="h-[75vh] rounded-t-2xl">
                    {/* Drag Handle */}

                    <Header
                        userName={userName}
                        createdAt={createdAt}
                        uiStatus={uiStatus}
                        formatDate={safeFormatDate}
                        onClose={onClose}
                    />

                    <Body
                        propertyId={propertyId}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        totalNights={totalNights}
                        adults={adults}
                        children={children}
                        veg={veg}
                        nonVeg={nonVeg}
                        userEmail={userEmail}
                        userPhone={userPhone}
                        paymentMethod={paymentMethod}
                        totalAmount={totalAmount}
                        safeTax={safeTax}
                        safeGrandTotal={safeGrandTotal}
                        orderId={orderId}
                        formatDate={safeFormatDate}
                        isCancelled={isCancelled}
                        refundPercent={refundPercent}
                        refundAmount={refundAmount}
                    />
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <>
            <div
                onClick={onClose}
                className={`
fixed inset-0 z-[9998]
bg-black/40 backdrop-blur-sm
${open ? "opacity-100" : "opacity-0 pointer-events-none"}
`}
            />


            <div
                className={`
fixed z-[9999]
inset-0 md:inset-auto
md:top-1/2 md:left-1/2
md:-translate-x-1/2 md:-translate-y-1/2

w-full md:w-[420px]
h-full md:max-h-[90vh]

bg-white shadow-2xl md:rounded-xl
transition-all duration-300

${open
                        ? "translate-x-0 opacity-100"
                        : "translate-x-full md:translate-x-0 opacity-0 pointer-events-none"
                    }
`}
            >
                <div className="flex flex-col h-full">
                    <Header
                        userName={userName}
                        createdAt={createdAt}
                        uiStatus={uiStatus}
                        formatDate={safeFormatDate}
                        onClose={onClose}
                    />
                    <div className="flex-1 overflow-y-auto">
                        <Body
                            propertyId={propertyId}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            totalNights={totalNights}
                            adults={adults}
                            children={children}
                            veg={veg}
                            nonVeg={nonVeg}
                            userEmail={userEmail}
                            userPhone={userPhone}
                            paymentMethod={paymentMethod}
                            totalAmount={totalAmount}
                            safeTax={safeTax}
                            safeGrandTotal={safeGrandTotal}
                            orderId={orderId}
                            formatDate={safeFormatDate}
                            isCancelled={isCancelled}
                            refundPercent={refundPercent}
                            refundAmount={refundAmount}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}


function Header({ userName, createdAt, uiStatus, formatDate, onClose }) {
    return (
        <div className="px-3 py-3 border-b relative">
            <h2 className="text-[17px] font-semibold">{userName}</h2>

            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={14} />
                    Booking created on {formatDate(createdAt)}
                </div>

                <span
                    className={`
            px-3 py-1 rounded-full text-xs font-medium capitalize
            ${uiStatus === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : uiStatus === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"}
          `}
                >
                    {uiStatus}
                </span>
            </div>

            <button
                onClick={onClose}
                className="absolute top-2 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function Body(props) {
    const {
        propertyId,
        checkIn,
        checkOut,
        totalNights,
        adults,
        veg,
        nonVeg,
        children,
        userEmail,
        userPhone,
        paymentMethod,
        totalAmount,
        safeTax,
        safeGrandTotal,
        orderId,
        formatDate,
        isCancelled,
        refundPercent,
        refundAmount,
    } = props;

    return (
        <div className="px-4 py-4 space-y-3 text-sm overflow-y-auto">

            <BookingSummaryBlock
                checkIn={checkIn}
                checkOut={checkOut}
                totalNights={totalNights}
                adults={adults}
                children={children}
                veg={veg}
                nonVeg={nonVeg}
                formatDate={safeFormatDate}
            />
            <Separator />

            <Section title="Contact Information">
                <Row
                    icon={<Mail size={14} />}
                    text={
                        <a
                            href={`mailto:${userEmail}`}
                        >
                            {userEmail}
                        </a>
                    }
                />

                <Row
                    icon={<Phone size={14} />}
                    text={
                        <a
                            href={`tel:${userPhone}`}
                        >
                            {userPhone}
                        </a>
                    }
                />
            </Section>

            <Separator />

            <Section title="Payment Information">
                <Key label="Amount" value={formatCurrency(totalAmount)} />
                <Key label="Tax" value={formatCurrency(safeTax)} />
                <Key label="Grand Total" value={formatCurrency(safeGrandTotal)} bold />

                {isCancelled && (
                    <>
                        <Separator />
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Refund Percentage</span>
                                <span className="font-semibold text-red-600">
                                    {refundPercent}%
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Refund Amount</span>
                                <span className="font-semibold text-green-600">
                                    {formatCurrency(refundAmount)}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                <Key label="Order ID" value={orderId?.toUpperCase()} mono />
            </Section>
        </div>
    );
}


function Section({ title, children }) {
    return (
        <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
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

function BookingSummaryBlock({
    checkIn,
    checkOut,
    totalNights,
    adults,
    children,
    veg,
    nonVeg,
    formatDate,
}) {
    const totalGuests = adults + children;

    return (
        <div className="rounded-xl border bg-gray-50 px-4 py-3 space-y-2">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                Check-in – Check-out
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3">
                <Calendar size={18} className="mt-0.5 text-muted-foreground" />
                <div>
                    <p className="font-medium">
                        {formatDate(checkIn)} – {formatDate(checkOut)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {totalNights} night(s)
                    </p>
                </div>
            </div>

            {/* Guests + Meals */}
            <div className="flex items-start justify-between">
                {/* Left: Guests */}
                <div className="flex items-start gap-3">
                    <Users size={18} className="mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{totalGuests} Guests</p>
                        <p className="text-xs text-muted-foreground">
                            Adults: {adults} · Children: {children}
                        </p>
                    </div>
                </div>

                {/* Right: Meals */}
                {veg + nonVeg > 0 && (
                    <div className="text-left">
                        <p className="font-medium">Meals</p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                                <span>Veg: {veg}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
                                <span>Non-veg: {nonVeg}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


