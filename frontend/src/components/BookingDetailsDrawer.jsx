import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerOverlay } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Home, Calendar, Moon, Users, Mail, Phone, Clock, X, MapPin, Star, PhoneCall, MoveRight } from "lucide-react";
import { getStateName } from "@/utils/locationUtils";
import { getBookingStatus, getStatusLabel, getStatusColors } from "@/utils/bookingStatus";


const toTitleCase = (text = "") =>
    text
        .toLowerCase()
        .split(" ")
        .map(word =>
            word ? word[0].toUpperCase() + word.slice(1) : ""
        )
        .join(" ");

const formatAddress = (property) => {
    if (!property) return "—";

    const stateFull = getStateName(property.state);

    const parts = [
        property.addressLine1,
        property.area,
        property.city,
        stateFull,
        property.pinCode,
    ];

    return parts
        .filter(Boolean)
        .map(p => toTitleCase(String(p)))
        .join(", ");
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

    if (!open || !booking) return null;

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
        refundAmount = 0,
    } = booking;

    const status = getBookingStatus(booking);
    const statusLabel = getStatusLabel(status);
    const statusColors = getStatusColors(status);

    const adults = guests?.adults || 0;
    const children = guests?.children || 0;

    const toTitleCase = (text = "") =>
        text
            .toLowerCase()
            .split(" ")
            .map(word =>
                word ? word[0].toUpperCase() + word.slice(1) : ""
            )
            .join(" ");

    const userName =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.name ||
        "Traveller";

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

    const finalPaid = safeGrandTotal - (refundAmount || 0);


    const host =
        property?.ownerUserId ||
        property?.resortOwner ||
        null;

    const hostName = host
        ? `${host.firstName || ""} ${host.lastName || ""}`.trim()
        : "Host";

    const hostPhone = host?.mobile || property?.contactNumber || "—";
    const hostEmail = host?.email || property?.resortOwner?.email || "—";

    /* ================= MOBILE DRAWER ================= */
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
                <DrawerOverlay className="bg-black/40" />

                <DrawerContent className="h-[65vh] rounded-t-2xl flex flex-col">

                    {/* Header stays fixed */}
                    <div className="shrink-0">
                        <Header
                            bookingId={booking?._id}
                            booking={booking}
                            createdAt={createdAt}
                            formatDate={formatDate}
                            onClose={onClose}
                        />
                    </div>

                    {/* Only this scrolls */}
                    <div className="flex-1 overflow-y-auto">
                        <Body
                            property={property}
                            propertyName={property?.propertyName}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            totalNights={totalNights}
                            adults={adults}
                            children={children}
                            paymentMethod={paymentMethod}
                            totalAmount={totalAmount}
                            safeTax={safeTax}
                            safeGrandTotal={safeGrandTotal}
                            orderId={orderId}
                            formatDate={formatDate}
                            hostName={hostName}
                            hostPhone={hostPhone}
                            hostEmail={hostEmail}
                            refundAmount={refundAmount}
                            finalPaid={finalPaid}
                            cancelled={cancelled}
                        />
                    </div>

                </DrawerContent>
            </Drawer>
        );
    }

    /* ================= DESKTOP RIGHT PANEL ================= */
    return (
        <>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={`
fixed inset-0 z-[9999999]
bg-black/50 backdrop-blur-[2px]
transition-opacity duration-300
${open ? "opacity-100" : "opacity-0 pointer-events-none"}
`}
            />

            <div
                className={`
fixed z-[9999999]
left-1/2 top-1/2
w-[480px] max-w-[620px]
max-h-[90vh]
bg-white rounded-2xl shadow-2xl
transition-all duration-300
overflow-hidden
${open
                        ? "opacity-100 scale-100 -translate-x-1/2 -translate-y-1/2"
                        : "opacity-0 scale-95 -translate-x-1/2 -translate-y-[40%] pointer-events-none"
                    }
`}
            >
                <div className="flex flex-col max-h-[90vh]">
                    <Header
                        bookingId={booking?._id}
                        booking={booking}
                        createdAt={createdAt}
                        formatDate={formatDate}
                        onClose={onClose}
                    />

                    <div className="flex-1 overflow-y-auto p-1">
                        <Body
                            property={property}
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
                            hostName={hostName}
                            hostPhone={hostPhone}
                            hostEmail={hostEmail}
                            refundAmount={refundAmount}
                            finalPaid={finalPaid}
                            cancelled={cancelled}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}


function Header({ bookingId, createdAt, booking, formatDate, onClose }) {

    const shortId = bookingId
        ? bookingId.toString().slice(-6).toUpperCase()
        : "—";

    const status = getBookingStatus(booking);
    const label = getStatusLabel(status);
    const colors = getStatusColors(status);

    return (
        <div className="border-b">

            {/* TOP ROW */}
            <div className="px-4 pt-4 pb-0 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold">
                    Booking Details
                </h2>

                <button
                    onClick={onClose}
                    className="px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100 transition"
                >
                    <span className="text-[14px]">X</span>
                </button>
            </div>

            {/* META ROW */}
            <div className="px-4 pb-4 flex items-center flex-wrap gap-2 text-sm text-muted-foreground">

                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>
                        Booking created on{" "}
                        <b className="text-gray-800">
                            {formatDate(createdAt)}
                        </b>
                    </span>
                </div>

                <span className="text-gray-300">•</span>

                <span>
                    #KB-<b className="text-gray-800">{shortId}</b>
                </span>

                <span className="text-gray-300">|</span>

                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${colors.chip}`}
                >
                    {label}
                </span>

            </div>
        </div>
    );
}

function Body(props) {
    const {
        property,
        propertyName,
        checkIn,
        checkOut,
        totalNights,
        adults,
        children,
        paymentMethod,
        totalAmount,
        safeTax,
        safeGrandTotal,
        orderId,
        formatDate,
        hostName,
        hostPhone,
        hostEmail,
        cancelled
    } = props;

    return (
        <div className="px-4 py-3 space-y-4 text-sm">
            {/* ================= PROPERTY ================= */}
            <div className="space-y-2">

                <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-gray-500 uppercase">
                    <Home size={15} />
                    PROPERTY
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="text-[16px] font-semibold text-gray-900">
                        {propertyName}
                    </p>

                    <div className="flex items-start gap-2 text-gray-500 text-[13px] mt-1 leading-snug">
                        <MapPin className="w-4 h-4 mt-[2px] text-gray-400 shrink-0" />

                        <div className="flex flex-col gap-1 w-full">
                            <span>
                                {formatAddress(property)}
                            </span>

                            {property?.locationLink && (
                                <a
                                    href={property.locationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                inline-flex items-center gap-2
                w-fit
                text-sm font-medium
                text-primary
                hover:text-primary/80
                transition
            "
                                >
                                    Get directions <MoveRight className="bg-primary/10 p-1 rounded" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

            </div>


            {/* ================= STAY DETAILS ================= */}
            <div className="space-y-2">

                <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-gray-500 uppercase">
                    <Calendar size={15} />
                    STAY DETAILS
                </div>

                <div className="grid grid-cols-2 gap-2">

                    <SoftInfo
                        icon={<Calendar size={16} />}
                        label="Check-in"
                        value={formatDate(checkIn)}
                    />

                    <SoftInfo
                        icon={<Calendar size={16} />}
                        label="Check-out"
                        value={formatDate(checkOut)}
                    />

                    <SoftInfo
                        icon={<Moon size={16} />}
                        label="Nights"
                        value={totalNights}
                    />

                    <SoftInfo
                        icon={<Users size={16} />}
                        label="Guests"
                        value={`${adults} Adult${adults > 1 ? "s" : ""}${children ? `, ${children} Child` : ""}`}
                    />

                </div>

            </div>


            {/* ================= HOST CONTACT ================= */}
            <div className="space-y-2">

                <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-gray-500 uppercase">
                    <Star size={15} />
                    HOST CONTACT
                </div>

                <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">

                    {/* Name */}
                    <p className="text-[16px] font-semibold text-gray-900 mb-1">
                        {hostName}
                    </p>

                    {/* Phone */}
                    <div className="flex items-center gap-3 text-[14px] text-gray-700 mb-1">
                        <PhoneCall className="text-primary" size={16} />
                        <span>+91 {hostPhone}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 text-[14px] text-gray-700">
                        <Mail className="text-primary" size={16} />
                        <span>{hostEmail}</span>
                    </div>

                </div>

            </div>

            <Separator />

            <div className="pb-14 md:pb-0">
                <Section title="Payment Information">

                    <Key label="Payment Method" value={paymentMethod} />

                    <Key
                        label="Amount"
                        value={`₹${totalAmount?.toLocaleString("en-IN")}`}
                    />

                    <Key
                        label="Tax"
                        value={`₹${safeTax.toLocaleString("en-IN")}`}
                    />

                    <Key
                        label="Grand Total"
                        value={`₹${safeGrandTotal.toLocaleString("en-IN")}`}
                    />

                    {cancelled && refundAmount > 0 && (
                        <Key
                            label="Refund Amount"
                            value={`- ₹${refundAmount.toLocaleString("en-IN")}`}
                        />
                    )}

                    {cancelled && (
                        <Key
                            label="Final Paid"
                            value={`₹${finalPaid.toLocaleString("en-IN")}`}
                            bold
                        />
                    )}

                    <Key label="Order ID" value={orderId} mono />

                </Section>
            </div>
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


function SoftInfo({ icon, label, value }) {
    return (
        <div className="
            rounded-xl
            border border-gray-200
            bg-white
            px-3 py-3
            flex items-center gap-3
            hover:bg-gray-50
            transition
        ">
            {/* Icon container */}
            <div className="
                w-10 h-10
                rounded-xl
                bg-primary/10
                flex items-center justify-center
                shrink-0
            ">
                <div className="text-primary">
                    {icon}
                </div>
            </div>

            {/* Text */}
            <div className="leading-tight">
                <div className="text-[12px] text-gray-500">
                    {label}
                </div>

                <div className="text-[15px] font-semibold text-gray-900 mt-[2px]">
                    {value}
                </div>
            </div>
        </div>
    );
}